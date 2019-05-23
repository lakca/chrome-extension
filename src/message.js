function noop() {}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36)
}

// request current tab from extension.
function requestTab(message, cb) {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    const tab = tabs[0]
    if (tab) {
      chrome.tabs.sendMessage(tab.id, message, cb && function(resMsg) {
        cb(tab, resMsg)
      } || noop)
    }
  })
}

function InternalRequest() {
  // { action: asyncHandler }
  this.listeners = new Map()
  // { asyncId: asyncHandler }
  this.asyncResponseListeners = new Map()
  // { tabId: asyncIdSet }
  this.interactiveTabs = new Map()

  chrome.runtime.onMessage.addListener((message, sender, sendRes) => {
    console.debug('receive message: %o\nfrom %o', message, sender)
    // this is a async response
    if (message._async_id) {
      const cb = this.asyncResponseListeners.get(message._async_id)
      cb && cb(message)
      this.asyncResponseListeners.delete(message._async_id)
      sendRes('received by message.js')
    }
    // normal listener
    else if (message.action) {
      const listener = this.listeners.get(message.action)
      if (listener) {
        const res = listener(sender, message)
        console.debug('sync response to send: %o', res)
        sendRes(res)
      }
    }
  })

  if (chrome.tabs) {
    chrome.tabs.onRemoved.addListener(tabId => this._firedOnTabRemoved(tabId))
    chrome.tabs.onReplaced.addListener((added ,tabId) => this._firedOnTabRemoved(tabId))
  }
}

InternalRequest.prototype._firedOnTabRemoved = function (tabId) {
  console.debug('tab [%s] removed:', tabId)
  if (!this.interactiveTabs.has(tabId))
    return
  const asyncIds = this.interactiveTabs.get(tabId)
  for (const id of asyncIds)
    this.asyncResponseListeners.delete(id)
  this.interactiveTabs.delete(tabId)
}

InternalRequest.prototype._saveAsyncHandler = function(asyncId, handler, tabId) {
  this.asyncResponseListeners.set(asyncId, handler)
  if (!tabId) return
  let asyncIdSet
  if (!this.interactiveTabs.has(tabId)) {
    asyncIdSet = new Set()
    this.interactiveTabs.set(tabId, asyncIdSet)
  } else {
    this.interactiveTabs.get(tabId)
  }
  asyncIdSet.add(asyncId)
}

InternalRequest.prototype.requestTab = function(action, content, cb) {
  if (typeof content === 'function') {
    cb = content
    content = {}
  }
  return requestTab(Object.assign({}, content, {action}), cb &&
  ((tab, r) => { // sync response
    console.debug('sync response has been received: %o', r)
    // async
    if (r && r._async_id) {
      this._saveAsyncHandler(r._async_id, cb, tab.id)
    } else {
      cb(r)
    }
  }) || noop)
}

InternalRequest.prototype.request = function(action, content, cb) {
  if (typeof content === 'function') {
    cb = content
    content = {}
  }
  chrome.runtime.sendMessage(Object.assign({}, content, {action}), cb &&
  (r => {
    if (r && r._async_id) {
      this._saveAsyncHandler(r._async_id, cb)
    } else {
      cb(r)
    }
  })
  || noop)
}

InternalRequest.prototype.onMessage = function (action, cb) {
  this.listeners.set(action, function(sender, message) {
    return cb(message) // raw response from user
  })
}

InternalRequest.prototype.onMessageAsync = function (action, cb) {
  this.listeners.set(action, function (sender, message) {
    const id = uid()
    cb(message, function(resMessage) {
      console.log('clicked:', sender, resMessage)
      const msg = Object.assign({}, resMessage, {
        _async_id: id,
      })
      // async request
      if (sender && sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, msg)
      } else {
        chrome.runtime.sendMessage(msg, console.error)
      }
    })
    // sync response
    return {
      _async_id: id
    }
  })
}

Object.assign(InternalRequest, { requestTab })

exports.internalRequest = new InternalRequest()
exports.InternalRequest = InternalRequest