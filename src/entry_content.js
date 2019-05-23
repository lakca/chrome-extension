const { setClipboard, mention, internalEventTarget } = require('./common')
const { internalRequest } = require('./message')
const { Remover } = require('./helper')
const prune = require('./prune')

let isCopySelected = false
const handler = {}

function mdLink(obj) {
  return ['[', obj.title, ']', '(', obj.url, ')'].join('')
}

function getText(element) {
  let text = element.innerText
  || element.getAttribute('title')
  || element.getAttribute('alt')
  || element.getAttribute('label')
  text = text ? text.trim() : ''
  text = '**' + window.location.hostname.split('.', 1)[0]
    .replace(/^./, x => x.toUpperCase())
    + '**: ' + text
  return text
}

handler.copyLink = function(type) {
  history.kdjf = true
  let title, msg
  switch (type) {
    case 'title':
      title = document.title
      msg = '复制成功！'
      break
    case 'description': {
      let dom = document.getElementsByTagName('meta')
      if (dom) dom = dom.description
      if (dom) title = dom.content
      if (title) msg = '复制成功！'
      else msg = '没有描述条目！'
    }
      break
    case 'douban':
      title = (
        document.querySelectorAll('table.infobox')[0]
        || document.querySelectorAll('.group-desc h1')[0]
        || document.querySelectorAll('#content h1')[0]
      ).innerText.trim()
      msg = '复制成功！'
      break
    case 'self':
      isCopySelected = true
      msg = '点选需要作为标题的文本块'
      return
    default:
  }
  setClipboard(mdLink({
    title: title,
    url: window.location.href
  }))
  mention(msg)
}

function unshadowQuora() {
  // remove sign dialog
  const dialog = document.querySelector('._DialogSignupForm')
  if (dialog) dialog.parentNode.removeChild(dialog)
  // remove blur effect
  const wrapper = document.querySelector('.ContentWrapper')
  const style = wrapper.getAttribute('style') || ''
  if (!/[\s;]filter[\s:]/.test(style)) wrapper.setAttribute('style', style + ';filter:none')
  // remove hidden body class
  document.body.setAttribute('class', document.body.getAttribute('class').replace('signup_wall_prevent_scroll', ''))
}

handler.unshadow = function() {
  if (window.location.host === 'www.quora.com')
    unshadowQuora()
  mention('Cover移除成功')
}

handler.permalink = function() {
  const origin = window.location.origin
  const current = window.location.href
  let n = 0
  Array.prototype.forEach.call(document.querySelectorAll('a'), e => {
    let href = e.getAttribute('href')
    if (!href)
      return
    href = href.trim()
    if (href[0] === '#')
      return
    if (/^[a-z]+:\/\//i.test(href))
      return
    ++n
    if (href[0] === '/')
      return e.setAttribute('href', origin + href)
    return e.setAttribute('href', current + href)
  })
  mention('共转换' + n + '个链接！')
}

handler.prune = function() {
  const r = new Remover()
  prune.default(r)
  const fn = prune[window.location.host]
  if (fn) {
    fn(r)
    mention('共清理' + r.n + '个区块！')
  } else {
    // mention.warn('未定义清理流程！')
  }
}

document.addEventListener('click', function (e) {
  if (isCopySelected) {
    e.preventDefault()
    setClipboard(mdLink({
      title: getText(e.target),
      url: window.location.href
    }))
    isCopySelected = false
  }
})

chrome.runtime.onMessage.addListener(function(message, sender, reply) {
  console.debug('onmessage:', message)
  reply('received by entry_content.js.')
  if (message.mention)
    mention(message.mention)
  if(handler[message.action])
    handler[message.action](message.value)
})

function _ready() {
  internalRequest.request('config', function (message) {
    if (message.prune) handler.prune()
  })
}
const ready = () => setTimeout(_ready, 0)

window.addEventListener('load', ready)
ready()

internalEventTarget.addEventListener('_pushStateCalled', function() {
  console.debug('_pushStateCalled')
  ready()
})