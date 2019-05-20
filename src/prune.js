
exports.default = function(r) {
  /* google ad */
  r.remove(document.querySelectorAll('[data-ad-client].adsbygoogle'))
}

exports['juejin.im'] = function (r) {
  r.remove(document.querySelectorAll('.sidebar-bd-entry'))
  r.remove(document.querySelectorAll('.index-book-collect'))
  r.remove(document.querySelectorAll('.article-suspended-panel'))
  r.remove(document.querySelectorAll('.ad-entry-list'))
  r.remove(document.querySelectorAll('.meiqia-btn'))
  r.remove(document.getElementById('blockbyte-bs-sidebar'))
}

exports['www.baidu.com'] = function (r) {
  const left = document.getElementById('content_left')
  const right = document.getElementById('content_right')
  right && [...right.children].forEach(e => {
    if (e.tagName.toLowerCase() !== 'table')
      r.remove(e)
  })
  left && [...left.children].forEach(e => {
    if ([...e.classList].indexOf('result') < -1)
      r.remove(e)
    if (e.querySelector('.f13 .tuNLfk'))
      r.remove(e)
  })
  Array.from(document.querySelectorAll('.ad-block')).forEach(e => r.remove(e))
}

exports['baike.baidu.com'] = function(r) {
  r.remove(document.querySelectorAll('.unionAd'))
  r.remove(document.getElementById('fc_guess_like_new'))
}

exports['zhidao.baidu.com'] = function(r) {
  // ads in search result.
  r.remove(document.getElementById('ec_zwd_ctner'))
  // baidu injection(iframe)
  r.remove(document.getElementById('union-aspLU'))
}

exports['blog.csdn.net'] = function (r) {
  r.remove(document.querySelector('.pulllog-box'))
  const aside = document.querySelector('#mainBox > aside')
  Array.from(aside.children).forEach(e => {
    if (!e.id)
      r.remove(e)
  })
  Array.from(document.querySelectorAll('[data-pid]')).forEach(e => {
    if (/^kp_box/.test(e.id))
      r.remove(e)
  })
  document.getElementById('btn-readmore').click()
}

exports['segmentfault.com'] = function(r) {
  r.remove(document.getElementById('loginBanner'))
}

exports['www.jianshu.com'] = function(r) {
  r.remove(document.getElementById('fixed-ad-container'))
  r.remove(document.querySelectorAll('.youdao-recommended-ad'))
}

exports['www.v2ex.com'] = function(r) {
  Array.from(document.querySelectorAll('#Rightbar > .box')).forEach(e => {
    if (e.querySelector('.sidebar_compliance')) {
      r.remove(e)
    }
  })
}