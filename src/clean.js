function forEach(arrayLike, ...args) {
  Array.prototype.forEach.call(arrayLike, ...args)
}

function isArrayLike(data) {
  return 'length' in data
}

function remove(node) {
  if (node instanceof NodeList || node instanceof Array) {
    for (const n of node)
      node.parentNode.removeChild(n)
  } else {
    node.parentNode.removeChild(node)
  }
}

function isZero(unit) {
  return parseFloat(unit) <= 0
}

function isVisible(element, style) {
  style = style || window.getComputedStyle(element)
  if (style.display === 'none')
    return false
  if (style.visibility === 'hidden')
    return false
  if (isZero(style.width) || isZero(style.height))
    return false
  // no readable content
  if (/^\s*$/.test(element.innerText))
    return false
  return true
}

function clean(options) {

  if (options.script)
    remove(document.scripts)

  if (options.iframe)
    remove(document.querySelectorAll('iframe'))

  if (options.meta)
    remove(document.head.meta)

  if (options.emptyFunctionalElement) {
    // empty script
    if (!options.script) {
      forEach(document.scripts, e => {
        if (!e.innerHTML.trim())
          remove(e)
      })
    }
    // empty style
    if (!options.style) {
      forEach(document.styleSheets, e => {
        if (!e.href && !e.rules.length)
          remove(e.ownerNode)
      })
    }
  }

  const body = document.body
  forEach(body.children, element => {
    const style = window.getComputedStyle(child)
    if (options.invisible) {
      if (!isVisible(element, style)) {
        return remove(element)
      }
    }
  })
}

function cleanStyle() {
  document.styleSheets
}

function printObjectDoc(obj) {
  const desc = {
    function: [],
    attribute: [],
    getter: [],
    setter: [],
    inheritance: Object.getPrototypeOf(obj).constructor.name,
    toString() {

    }
  }
  const descriptor = Object.getOwnPropertyDescriptors(obj)
  Object.keys(descriptor).forEach(name => {
    const prop = descriptor[name]
    if (prop.get) {
      desc.getter.push(name)
    }
    if (prop.set) {
      desc.setter.push(name)
    }
    switch (typeof prop.value) {
      case 'function':
        desc.function.push(name)
        break
      case 'undefined':
        break
      default:
        desc.attribute.push(name)
    }
  })
  return desc
}