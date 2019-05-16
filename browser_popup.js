
function onClick(e) {
  if (!e.target.id) return
  switch (e.target.id) {
    case 'copy-tab-link':
      InternalRequest.requestTab({
        action: 'copyTabLink',
        type: document.getElementById('link-select').value
      })
      break
    default:
      InternalRequest.requestTab({
        action: e.target.id
      })
  }
}

document.addEventListener('click', onClick)
