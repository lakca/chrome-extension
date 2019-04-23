
const InternalRequest = function() {

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
      console.log('on', sender, message)
      // this is a async response
      if (message.asyncId) {
        const cb = this.asyncResponseListeners.get(message.asyncId)
        cb && cb(message.content)
        this.asyncResponseListeners.delete(message.asyncId)
        sendRes()
      }
      // normal listener
      else if (message.action) {
        const listener = this.listeners.get(message.action)
        if (listener) {
          const res = listener(sender, message.content)
          console.log('sync response:', res)
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
    console.log('tab removed:', tabId)
    if (!this.interactiveTabs.has(tabId))
      return
    const asyncIds = this.interactiveTabs.get(tabId)
    for (const id of asyncIds)
      this.asyncResponseListeners.delete(id)
    this.interactiveTabs.delete(tabId)
  }

  InternalRequest.prototype.saveAsyncHandler = function(asyncId, handler, tabId) {
    this.asyncResponseListeners.set(asyncId, handler)
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
    const that = this
    return requestTab({
      action: action,
      content: content
    }, cb && function(tab, r) { // sync response
      console.log('sync receive:', r)
      // async
      if (r && r.asyncId) {
        that.saveAsyncHandler(r.asyncId, cb, tab.id)
      }
      // sync
      else {
        cb(r && r.content)
      }
    } || noop)
  }

  InternalRequest.prototype.onMessage = function (action, cb) {
    this.listeners.set(action, function(sender, content) {
      return {
        content: cb(content) // raw response from user
      }
    })
  }

  InternalRequest.prototype.onMessageAsync = function (action, cb) {
    this.listeners.set(action, function (sender, content) {
      const id = uid()
      cb(content, function(resMessage) {
        console.log('clicked:', sender, resMessage)
        const msg = {
          asyncId: id,
          content: resMessage
        }
        // async request
        if (sender && sender.tab) {
          chrome.tabs.sendMessage(sender.tab.id, msg)
        } else {
          chrome.runtime.sendMessage(msg, console.error)
        }
      })
      // sync response
      return {
        asyncId: id
      }
    })
  }

  Object.assign(InternalRequest, { requestTab })

  return InternalRequest
}()

const internalRequest = new InternalRequest()