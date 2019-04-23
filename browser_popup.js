// /* scripts in extension */
// const listeners = new Map()
// function addListener(ele, name, cb) {
//   let a = listeners.get(ele)
//   if (!a) {
//     a = new Map()
//     listeners.set(ele, a)
//   }
//   let b = a.get(name)
//   if (!b) {
//     b = new Set()
//     function mainCb (e) {
//       b.forEach((fn, i) => i && fn(e))
//     }
//     b.add(mainCb)
//     ele.addEventListener(name, mainCb)
//   }
//   b.add(cb)
// }

function onClick(e) {
  switch (e.target.id) {
    case 'save-douban-link':
      InternalRequest.requestTab({
        action: 'copyDoubanLink',
        mention: 'copying'
      })
      break
    case 'copy-tab-link':
      InternalRequest.requestTab({
        action: 'copyTabLink',
        mention: 'click to select element which title copy from'
      })
      break
    default:
  }
}

document.addEventListener('click', onClick)
