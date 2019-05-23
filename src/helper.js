
module.exports = {
  Remover,
  unicode,
  createTask,
  createTaskPool
}

function Remover() {
  this.n = 0
}

Remover.prototype.remove = function (node) {
  if (!node) return
  if (node instanceof NodeList) {
    Array.from(node).forEach(n => this.remove(n))
  } else {
    node.parentNode.removeChild(node)
    ++this.n
  }
}

Remover.prototype.isolate = function (node) {
  if (node instanceof Element) {
    const n = node.parentNode.children.length - 1
    node.parentNode.innerHTML = node.outerHTML
    this.n += n
  }
}

function unicode(str) {
  let code = ''
  for (let i = 0; i < str.length; i++) {
    code += '\\u' + str.charCodeAt(i).toString(16)
  }
  return code
}

function createTask(strict) {
  let _it,
      _task,
      _after,
      _removeAfterScheduled = false,
      _strict = !!strict,
      _interval = 1000
  function cycle() {
    _it = setTimeout(() => {
      _it = null
      if (_removeAfterScheduled) {
        setTimeout(() => {
          _task = null
          _after && _after()
        }, 0)
      }
      _task && _task()
    }, _interval)
  }
  return {
    after(cb) {
      _after = cb
    },
    get idle() {
      return !_it && !_task
    },
    set(task, removeAfterScheduled) {
      _removeAfterScheduled = !!removeAfterScheduled
      _task = task
    },
    unset() {
      _task = null
    },
    start(interval) {
      if (_it) {
        if (_strict) throw new Error('task has already been started.')
        return
      }
      if (_strict && typeof _task !== 'function')
        throw new Error('task is not set to be a function.')
      _interval = interval
      cycle()
    },
    restart() {
      if (!_it) return
      clearTimeout(_it)
      cycle()
    }
  }
}

// auto create
// auto delete if dile
function createTaskPool() {
  const tasks = Object.create(null)
  return function exclusive(id) {
    if (!tasks[id]) {
      tasks[id] = createTask()
      tasks[id].after(function() {
        delete tasks[id]
      })
    }
    // clean idle tasks
    setTimeout(() => {
      for (const id of Object.keys(tasks))
        if (tasks[id].idle)
          delete tasks[id]
    }, 0);
    return tasks[id]
  }
}