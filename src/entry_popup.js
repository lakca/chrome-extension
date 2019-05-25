const { touchConfig } = chrome.extension.getBackgroundPage();

function touchValue(id, v) {
  const e = document.getElementById(id)
  if (!e)
    return
  const input = e.querySelector('.value')
  if (!input)
    return
  let key = 'value'
  if (input.type === 'checkbox')
    key = 'checked'

  if (arguments.length > 1) {
    input[key] = v
  } else {
    v = input[key]
    touchConfig(cfg => {
      cfg[id] = v
      return cfg
    })
    return v
  }
}

document.addEventListener('click', function(e) {
  if (!e.target.id) return
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    if (!tabs.length) return
    chrome.tabs.sendMessage(tabs[0].id, {
      action: e.target.id,
      value: touchValue(e.target.id)
    })
  })
})

window.addEventListener('load', function() {
  touchConfig(cfg => {
    Object.keys(cfg).forEach(key => {
      touchValue(key, cfg[key])
    })
  })
})