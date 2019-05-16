
// chrome.runtime.onInstalled.addListener(function () {
//   chrome.storage.sync.set({ color: '#3aa757' }, function () {
//     console.log("The color is green.");
//   });
// });

function noop() {}

const requests = []

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

console.log('loaded')