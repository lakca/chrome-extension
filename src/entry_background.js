chrome.runtime.onMessage.addListener(function(message, sender, sendRes) {
  if (!message)
    return
  // repost
  if (message.action === 'notify' || (sender.tab && message.to === 'content')) {
    console.debug('repost.')
    chrome.tabs.sendMessage(sender.tab.id, message, sendRes)
    return true
  }
  if (message.action === 'config') {
    touchConfig(config => {
      sendRes(config)
    }, false)
    return true
  }
})

function touchConfig(cb, resave) {
  chrome.storage.sync.get(['config'], result => {
    const r = cb(JSON.parse(result.config || '{}'))
    if (resave)
      chrome.storage.sync.set({ config: JSON.stringify(r) })
  })
}
/* backgroud window object can be accessed by chrome.extension.getBackgroundPage() */
window.touchConfig = touchConfig

console.log('loaded')