const mention = function() {
  const eleId = 'extension-' + Date.now()
  const head = document.getElementsByTagName('head')[0]
  const styleEle = document.createElement('style')
  let mentionTimer
  styleEle.innerHTML = `
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
      // transform: translate(-50%, 50px);
      transition: .2s;
      opacity: 0;
    }

    #${eleId}.active {
      opacity: 1;
      z-index: 99999999999999;
    }
  `
  head.appendChild(styleEle)

  function objStyle(obj) {
    const items = []
    for (const name in obj) {
      items.push(name + ':' + obj[name])
    }
    return items.join(';')
  }

  function getTargetDOM() {
    if (!document.getElementById(eleId)) {
      const div = document.createElement('div')
      div.id = eleId
      document.body.appendChild(div)
    }
    return document.getElementById(eleId)
  }

  function showMention(options) {
    const ele = getTargetDOM()
    ele.setAttribute('class', 'active')
    clearTimeout(mentionTimer)
    mentionTimer = setTimeout(function () {
      ele.setAttribute('class', '')
      options.onClose && options.onClose()
    }, options.interval || 500)
  }

  function mention(options) {
    if (typeof options !== 'object') {
      options = {message: options}
    }
    const ele = getTargetDOM()
    ele.innerHTML = options.message
    showMention({
      interval: options.interval,
      onClose: options.onClose
    })
  }

  internalRequest.onMessage('mention', message => {
    mention(message)
  })

  return mention
}()

const setClipboard = function() {
  let COPY_TEXT

  function onCopy(e) {
    if (COPY_TEXT) {
      e.preventDefault()
      e.clipboardData.setData('text/plain', COPY_TEXT)
      COPY_TEXT = null
      mention('copied!')
    }
  }

  function setClipboard(text) {
    COPY_TEXT = text
    document.execCommand('copy')
    return text
  }

  document.addEventListener('copy', onCopy)

  return setClipboard
}()
