
void function() {
  let isCopySelected = false
  const handler = {}

  const forEach = Array.prototype.forEach

  function Remover() {
    this.n = 0
  }

  Remover.prototype.remove = function(node) {
    node.parentNode.removeChild(node)
    ++this.n
  }

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
    forEach.call(document.querySelectorAll('a'), e => {
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
    const host = window.location.host
    const r = new Remover()
    if (host === 'juejin.im') {
      const nodes = [
        ...document.querySelectorAll('.sidebar-bd-entry'),
        ...document.querySelectorAll('.index-book-collect'),
        ...document.querySelectorAll('.main-header-box'),
        ...document.querySelectorAll('.article-suspended-panel'),
        ...document.querySelectorAll('.ad-entry-list'),
        ...document.querySelectorAll('.meiqia-btn'),
        document.getElementById('comment-box'),
        document.getElementById('blockbyte-bs-sidebar'),
      ]
      nodes.forEach(e => r.remove(e))
    }

    else if (host === 'www.baidu.com') {
      const left = document.getElementById('content_left')
      const right = document.getElementById('content_right')
      left && forEach.call(right.children, e => {
        if (e.tagName.toLowerCase() !== 'table')
          r.remove(e)
      })
      right && forEach.call(left.children, e => {
        if (!/^\s*(\S+\s+)*result(-op)?(\s+\S+)*\s*$/.test(e.className))
          r.remove(e)
      })
      forEach.call(document.querySelectorAll('.ad-block'), e => r.remove(e))
    }

    else {
      return mention.warn('未定义清理流程！')
    }
    mention('共清理' + r.n + '个区块！')
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

  chrome.runtime.onMessage.addListener(function (message) {
    console.log('receive runtime message:', message)
    if (message.mention)
      mention(message.mention)
    if(handler[message.action])
      handler[message.action](message.value)
  })

  console.log(document.readyState)

  if ('interactive' === document.readyState) {
    interactive()
  }
  if ('complete' === document.readyState) {
    ready()
    interactive()
  } else {
    document.addEventListener('readystatechange', event => {
      if (event.target.readyState === 'complete')
        ready()
      else if (event.target.readyState === 'interactive')
        interactive()
    });
  }

  function ready() {
    internalRequest.request('config', function(message) {
      if (message.prune) {
        handler.prune()
        mention('Prune!')
      }
    })
  }

  function interactive() {
    internalRequest.request('config', function (message) {
      if (message.prune) {
        handler.prune()
        mention('Prune!')
      }
    })
  }
}()