
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
        msg = 'copied!'
        break
      case 'description': {
        let dom = document.getElementsByTagName('meta')
        if (dom) dom = dom.description
        if (dom) title = dom.content
        if (title) msg = 'copied!'
        else msg = 'no description!'
      }
        break
      case 'douban':
        title = (
          document.querySelectorAll('table.infobox')[0]
          || document.querySelectorAll('.group-desc h1')[0]
          || document.querySelectorAll('#content h1')[0]
        ).innerText.trim()
        msg = 'copied!'
        break
      case 'self':
        isCopySelected = true
        msg = 'click to select element which title copy from'
        return
      default:
    }
    setClipboard(mdLink({
      title: title,
      url: window.location.href
    }))
    mention(msg)
  }

  chrome.runtime.onMessage.addListener(function (message) {
    console.log(message)
    if (message.mention)
      mention(message.mention)
    switch (message.action) {
      case 'copyTabLink':
        copyTabLink(message.type)
        break
      default:
    }
  })
}()