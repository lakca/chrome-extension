
void function() {
  let isCopySelected = false

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

  function copyTabLink(type) {
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

  function removeQuoraCover() {
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

  function removeCover() {
    if (window.location.host === 'www.quora.com')
      removeQuoraCover()
    mention('Cover移除成功')
  }

  function removeBaiduAd() {
    const content = document.getElementById('content_left')
    Array.prototype.forEach.call(content.children, e => {
      if (!/^\s*(\S+\s+)*result(\s+\S+)*\s*$/.test(e.getAttribute('class')))
        content.removeChild(e)
    })
    if (!content.nextElementSibling.id)
      content.parentNode.removeChild(content.nextElementSibling)
    Array.prototype.forEach.call(document.querySelectorAll('.ad-block'), e => {
      e.parentNode.removeChild(e)
    })
    mention('百度广告移除成功')
  }

  chrome.runtime.onMessage.addListener(function (message) {
    if (message.mention)
      mention(message.mention)
    switch (message.action) {
      case 'copyTabLink':
        copyTabLink(message.type)
        break
      case 'remove-cover':
        removeCover()
        break
      case 'remove-baidu-ad':
        removeBaiduAd()
        break
      default:
    }
  })
}()