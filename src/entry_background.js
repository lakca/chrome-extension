const { internalRequest } = require('./message')

function noop() {}

internalRequest.onMessageAsync('config', function (message, reply) {
  touchConfig(function(cfg) {
    reply(cfg)
    return message.value
  }, !('value' in message))
})

function touchConfig(cb, noSave) {
  chrome.storage.sync.get(['config'], result => {
    const r = cb(JSON.parse(result.config || '{}'))
    if (noSave || !r) return
    chrome.storage.sync.set({ config: JSON.stringify(r) }, noop)
  })
}
/* backgroud window object can be accessed by chrome.extension.getBackgroundPage() */
window.touchConfig = touchConfig

console.log('loaded')