
const { createTaskPool } = require('./helper')

let hasListenInserted, wrapper
// not use 'MutationObserver' since it is set to be null by baidu.
document.addEventListener('readystatechange', function() {
  wrapper = document.getElementById('wrapper_wrapper')
  if (wrapper && !hasListenInserted) {
    console.debug('wrapper listened.')
    wrapper.addEventListener('DOMNodeInserted', onInserted)
    hasListenInserted = true
  }
})

const pool = createTaskPool()

function callPrune() {
  console.debug('prune')
  chrome.runtime.sendMessage({
    action: 'prune',
    from: ['content', 'baidu'],
    to: 'content'
  }, function () {
    console.debug('prune receive response.')
  })
}

function onInserted(e) {
  const i = e.path.indexOf(wrapper)
  // handle internal refresh.
  if (i === 1) {
    if (e.target.id === 'container') {
      pool('#wrapper#container').set(callPrune, true)
      pool('#wrapper#container').start(1000)
    } else {
      pool('#wrapper#container').restart()
    }
  }
  else if (i === 3 && e.path[1].id === 'content_left') {
    if (pool('#wrapper#content_left@child').idle) {
      pool('#wrapper#content_left@child').set(callPrune, true)
      pool('#wrapper#content_left@child').start(1000)
    } else
      pool('#wrapper#content_left@child').restart()
  }
}
