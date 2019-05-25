const eleId = 'extension-' + chrome.runtime.id
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
let notifyTimer

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

function getTargetDOM() {
  if (document.body && !document.getElementById(eleId)) {
    vn = createVN()
    document.body.appendChild(vn)
  }
  return vn.children[1]
}

function isString(str) {
  return typeof str === 'string'
}

function showMention(options) {
  const e = getTargetDOM()
  e.parentNode.setAttribute('class', ['active', options.type].join(' '))
  clearTimeout(notifyTimer)
  notifyTimer = setTimeout(function () {
    notifyTimer = null
    e.parentNode.setAttribute('class', '')
    options.onClose && options.onClose()
  }, options.interval || 1000)
}

function notify(options) {
  isString(options) && (options = { message: options })
  const e = getTargetDOM()
  const message = options.message
  if (notifyTimer) {
    e.innerHTML += '<br/>' + message
  } else {
    e.innerHTML = message
  }
  showMention(options)
}

notify.warn = function (options) {
  isString(options) && notify({ message: options, type: 'warn' })
    || notify(Object.assign({ type: 'warn' }, options))
}

chrome.runtime.onMessage.addListener(function(message, sender, reply) {
  if (!message) return
  if (message.action === 'notify') {
    notify(message)
    reply(true)
  }
  reply(false)
})

module.exports = notify