const { internalRequest } = require('./message')

const mention =
exports.mention = function() {
  const eleId = 'extension-' + Date.now()
  const head = document.getElementsByTagName('head')[0]
  const styleBlock = document.createElement('style')
  let mentionTimer
  styleBlock.innerHTML = `
    #${eleId} {
      background: rgba(22, 122, 22, 1);
      color: white;
      width: 200px;
      padding: 10px 20px;
      border-radius: 4px;
      line-height: 20px;
      font-size: 14px;
      position: fixed;
      z-index: -99999999999999;
      left: 50px;
      top: 30px;
      // transform: translate(-50%, 50px);
      transition: .2s;
      opacity: 0;
    }

    #${eleId}.active {
      opacity: 1;
      z-index: 99999999999999;
    }

    #${eleId}.warn {
      background: rgba(122, 122, 22, 1);
    }
  `
  head.appendChild(styleBlock)

  function objStyle(obj) {
    const items = []
    for (const name in obj) {
      items.push(name + ':' + obj[name])
    }
    return items.join(';')
  }

  function getTargetDOM() {
    if (!document.getElementById(eleId)) {
      const div = document.createElement('div')
      div.id = eleId
      document.body.appendChild(div)
    }
    return document.getElementById(eleId)
  }

  function isString(str) {
    return typeof str === 'string'
  }

  function showMention(options) {
    const e = getTargetDOM()
    e.setAttribute('class', ['active', options.type].join(' '))
    clearTimeout(mentionTimer)
    mentionTimer = setTimeout(function () {
      mentionTimer = null
      e.setAttribute('class', '')
      options.onClose && options.onClose()
    }, options.interval || 1000)
  }

  function mention(options) {
    isString(options) && (options = {message: options})
    const e = getTargetDOM()
    const message = options.message
    if (mentionTimer) {
      e.innerHTML += '<br/>' + message
    } else {
      e.innerHTML = message
    }
    showMention(options)
  }

  mention.warn = function(options) {
    isString(options) && mention({message: options, type: 'warn'})
    || mention(Object.assign({type: 'warn'}, options))
  }

  internalRequest.onMessage('mention', message => {
    mention(message)
  })

  return mention
}()

exports.setClipboard = function() {
  let COPY_TEXT

  function onCopy(e) {
    if (COPY_TEXT) {
      e.preventDefault()
      e.clipboardData.setData('text/plain', COPY_TEXT)
      COPY_TEXT = null
      mention('copied!')
    }
  }

  function setClipboard(text) {
    COPY_TEXT = text
    document.execCommand('copy')
    return text
  }

  document.addEventListener('copy', onCopy)

  return setClipboard
}()

exports.internalEventTarget = function() {
  const changeId = 'has_been_injected_by_extension_' + chrome.runtime.id
  const internalEventTarget = new EventTarget()

  if (window.history[changeId])
    return

  const pushState = window.history.pushState
  window.history.pushState = function () {
    internalEventTarget.dispatchEvent(new CustomEvent('_pushStateCalled', {detail: arguments}))
    pushState.call(window.history, ...arguments)
  }

  Object.defineProperty(window.history, changeId, {
    get() { return true }
  })
  console.log('reassign history.pushState: ', changeId)

  return internalEventTarget
}()