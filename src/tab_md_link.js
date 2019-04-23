
void function() {
  let isCopySelected = false

  function mdLink(obj) {
    return ['[', obj.title, ']', '(', obj.url, ')'].join('')
  }

  function getText(element) {
    const text = element.innerText
    || element.getAttribute('title')
    || element.getAttribute('alt')
    || element.getAttribute('label')
    return text ? text.trim() : ''
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

  function copyDoubanLink() {
    setClipboard(mdLink({
      title: (
        document.querySelectorAll('table.infobox')[0]
        || document.querySelectorAll('.group-desc h1')[0]
        || document.querySelectorAll('#content h1')[0]
      ).innerText.trim(),
      url: window.location.href
    }))
  }

  chrome.runtime.onMessage.addListener(function (message) {
    if (message.mention)
      mention(message.mention)
    switch (message.action) {
      case 'copyTabLink':
        isCopySelected = true
        break
      case 'copyDoubanLink':
        copyDoubanLink()
        break
      default:
    }
  })
}()