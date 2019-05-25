module.exports = clean

const { Remover } = require('./helper')

function forEach(arrayLike, ...args) {
  if (!arrayLike) console.trace(arrayLike)
  Array.prototype.forEach.call(arrayLike, ...args)
}

function isArrayLike(data) {
  return 'length' in data
}

function isZero(unit) {
  return parseFloat(unit) <= 0
}

function isFunctionalNode(node) {
  return ['STYLE', 'SCRIPT'].indexOf(node.tagName) > -1
}

function isVisible(element, style) {
  style = style || window.getComputedStyle(element)
  // none display
  if (style.display === 'none')
    return false
  // hidden
  if (style.visibility === 'hidden')
    return false
  // img/background
  if (element.tagName === 'IMG' || style.backgroundImage !== 'none')
    return true
  // no size
  if (isZero(style.width) || isZero(style.height))
    return false
  // no readable content
  if (/^\s*$/.test(element.innerText))
    return false
  return true
}

function cleanDeep(element, options) {
  const r = options.r || new Remover()
  forEach(element.children, child => {
    if (isFunctionalNode(child)) return
    const style = window.getComputedStyle(child)
    if (!isVisible(child, style)) {
      return r.remove(child)
    } else {
      return cleanDeep(child, options)
    }
  })
}

function clean(options) {
  const r = new Remover()
  // const vdoc = new DOMParser().parseFromString(document.documentElement.innerHTML)
  // empty style
  forEach(document.styleSheets, e => {
    if (!e.href && !e.rules.length)
      r.remove(e.ownerNode)
  })

  if (options.script) {
    r.remove(document.scripts)
  }

  if (options.iframe) {
    r.remove(document.querySelectorAll('iframe'))
  }

  if (options.meta) {
    r.remove(document.head.meta)
  }

  if (options.emptyFunctionalElement) {
    // empty script
    if (!options.script) {
      forEach(document.scripts, e => {
        if (!e.innerHTML.trim())
          r.remove(e)
      })
    }
  }

  if (options.invisible) {
    cleanDeep(document.body, {
      r,
      invisible: true
    })
  }
  // document.documentElement.innerHTML = vdoc.innerHTML
  return r.n
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