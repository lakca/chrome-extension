const { internalRequest } = require('./message')

const mention =
exports.mention = function() {
  const eleId = 'extension-' + Date.now()
  let mentionTimer
  const styles = `
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

  function createVN() {
    const div = document.createElement('div')
    const style = document.createElement('style')
    const container = document.createElement('div')
    div.id = eleId
    style.innerHTML = styles
    div.appendChild(style)
    div.appendChild(container)
    return div
  }
  let vn = createVN()
  if (document.body) {
    document.body.appendChild(vn)
  } else {
    document.addEventListener('readystatechange', () => {
      if (['interactive', 'complete'].indexOf(document.readyState) > -1) {
        document.body.appendChild(vn)
      }
    })
  }

  function getTargetDOM() {
    if (document.body && !document.getElementById(eleId))
      document.body.appendChild(vn = createVN())
    return vn.children[1]
  }

  function isString(str) {
    return typeof str === 'string'
  }

  function showMention(options) {
    const e = getTargetDOM()
    e.parentNode.setAttribute('class', ['active', options.type].join(' '))
    clearTimeout(mentionTimer)
    mentionTimer = setTimeout(function () {
      mentionTimer = null
      e.parentNode.setAttribute('class', '')
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
  if (history[changeId])
    return

  const pushState = history.pushState
  history.pushState = function () {
    internalEventTarget.dispatchEvent(new CustomEvent('_pushStateCalled', {detail: arguments}))
    pushState.apply(history, arguments)
  }

  Object.defineProperty(history, changeId, {
    get() { return true }
  })
  Object.freeze(history)
  return internalEventTarget
}()