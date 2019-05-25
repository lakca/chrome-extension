
exports.setClipboard = function() {
  let COPY_TEXT

  function onCopy(e) {
    if (COPY_TEXT) {
      e.preventDefault()
      e.clipboardData.setData('text/plain', COPY_TEXT)
      COPY_TEXT = null
      chrome.runtime.sendMessage({
        action: 'notify',
        message: 'copied!'
      })
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