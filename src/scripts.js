class NotifyArray extends Array {
  constructor() {
    super()
    this._push = this.push
    this._splice = this.splice
    this._listeners = new Set()
    this.push = function() {
      this._push(...arguments)
      this.notifyListeners(this.length, arguments, [])
    }
  }

  notifyListeners(index, added, removed) {
    console.log('notifyingListeners', added)
    for (let listener of this._listeners) {
      /* (array, path, index, added, removed) */
      listener.target._notifySplice(this, listener.notifyPath, index, added, [])
    }
  }

  addListener(listener, notifyPath) {
    this._listeners.add({ target: listener, notifyPath: notifyPath })
  }

  removeListener(listener, notifyPath) {
    this._listeners.delete({ target: listener, notifyPath: notifyPath })
  }
}

class NotifyObject extends Object {
  constructor() {
    super()
    this._listeners = new Set()
    this.set = function(path, value) {
      const pathArray = path.split('.')
      let target = this
      if (pathArray.length > 1) {
        for (let key of pathArray.slice(0, 1)) {
          target = this[key]
        }
      }
      target[pathArray.slice(-1)[0]] = value
      this.notifyListeners(path, value)
    }
  }

  notifyListeners(path, value) {
    console.log('notifyingListeners', path, value)
    for (let listener of this._listeners) {
      /* (array, path, index, added, removed) */
      listener.target.notifyPath(`${listener.notifyPath}.${path}`, value)
    }
  }

  addListener(listener, notifyPath) {
    this._listeners.add({ target: listener, notifyPath: notifyPath })
  }

  removeListener(listener, notifyPath) {
    this._listeners.delete({ target: listener, notifyPath: notifyPath })
  }
}
