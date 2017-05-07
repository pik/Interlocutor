const deepCopy = function(obj) {
  return JSON.parse(JSON.stringify(obj))
}

const deepCompare = function(x, y) {
  // Inspired by
  // http://stackoverflow.com/questions/1068834/object-comparison-in-javascript#1144249

  // Compare primitives and functions.
  // Also check if both arguments link to the same object.
  if (x === y) {
      return true
  }

  if (typeof x !== typeof y) {
      return false
  }

  // special-case NaN (since NaN !== NaN)
  if (typeof x === 'number' && isNaN(x) && isNaN(y)) {
       return true
  }

  // special-case null (since typeof null == 'object', but null.constructor
  // throws)
  if (x === null || y === null) {
      return x === y
  }

  // everything else is either an unequal primitive, or an object
  if (!(x instanceof Object)) {
      return false
  }

  // check they are the same type of object
  if (x.constructor !== y.constructor || x.prototype !== y.prototype) {
      return false
  }

  // special-casing for some special types of object
  if (x instanceof RegExp || x instanceof Date) {
      return x.toString() === y.toString()
  }

  // the object algorithm works for Array, but it's sub-optimal.
  if (x instanceof Array) {
      if (x.length !== y.length) {
          return false
      }

      for (var i = 0; i < x.length; i++) {
          if (!deepCompare(x[i], y[i])) {
              return false
          }
      }
  } else {
      // disable jshint "The body of a for in should be wrapped in an if
      // statement"
      /* jshint -W089 */

      // check that all of y's direct keys are in x
      var p;
      for (p in y) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
              return false
          }
      }

      // finally, compare each of x's keys with y
      for (p in y) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
              return false
          }
          if (!deepCompare(x[p], y[p])) {
              return false
          }
      }
  }
  /* jshint +W089 */
  return true
};

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

// Todo update filters and switch off m. namespace
const INTERLOCUTOR_EVENT_TYPE = 'm.room.comment'

class CommentTree {
  constructor() {
    this.guestClient = null
    this.userClient = null
    this.roomId = null
    this.room = null
    this.state = {}
    // TODO implement backLog processing in cases where the stream ordering
    // is not the topologically correct DAG
    this.eventBackLog = new Set()
    // Setup a bound processEventCallback to pass to the client
    this._processEventCallback = (matrixEvent, room, toStartOfTimeline) => {
      const event = matrixEvent.event
      console.log('received Room.timeline event', event.event_id, event.type, room.room_id)
      this.processEvent(event)
    }
  }

  addEvent (event) {
    // the state object contains events key'd by event_id or (room_id) for top-level
    // to Add an event add the event_id: <event> pair to state
    // and then push the event into the children array of the event it references.
    // A top level comment should supply the roomId as it's target_id
    const targetId = event.content.body.target_id
    const eventId = event.event_id
    // TODO: Find out why I'm receiving duplicate events so I don't have to guard
    if (this.state[event.event_id]) {
      console.log('Received duplicate comment event - returning..', event.user_id || event.sender, event.event_id, event.content.msgtype, event.content.body)
      return false
    } else if (this.state[targetId] === undefined) {
      // TODO: FixUpStream Matrix-JS-SDK addEventsToTimeline will allow on the "on" event function
      // to bubble and error out
      if (this.eventBackLog.add(event)) {
        console.log(`Failed to find parent comment with id: ${targetId} - added to eventBackLog.`)
      }
      return false
    } else {
      this.state[eventId] = event
    }
    // const comment = new Comment(event)
    event.flags = new Set()
    event.votes = new Set()
    event.score = 1
    event.flagged = {}
    event.voted = {}
    event.children = new NotifyArray()
    this.state[targetId].children.push(event)
    return true
  }

  processEvent (event) {
    console.log('Processing event', event.user_id || event.sender, event.event_id, event.content.msgtype, event.content.body)
    if (event.type !== INTERLOCUTOR_EVENT_TYPE) return false

    const eventContent = event.content
    if (eventContent.msgtype === 'interlocutor.comment') {
      return this.addEvent(event)
    }

    const targetId = eventContent.body.target_id
    const target = this.state[targetId]
    if (!target) {
      if (this.eventBackLog.add(event)) {
        console.log(`Failed to find target with id: ${targetId}: for: ${eventContent.msgtype}`)
      }
      return false
    }

    // Note that switch() isn't closured by default
    let element
    switch (eventContent.msgtype) {
      case 'interlocutor.vote':
        const sender = event.user_id || event.sender
        const previousVote = target.voted[sender]
        const voteValue = eventContent.body.value
        // Ignore illegal voteValues
        if ([-1, 0, 1].indexOf(voteValue) === -1) {
          console.log(`Illegal Vote Value: ${voteValue}, ignoring: ${event.event_id}.`)
          return false
        }
        // Undo the vote modifier from the previousVote if
        // there was one. Then apply the current vote.
        // Set the current value of voted[<userId>] to the current vote event.
        if (previousVote && target.votes.add(event)) {
          target.score -= previousVote.content.body.value
          target.score += voteValue
          target.voted[sender] = event
        } else if (target.votes.add(event)) {
          target.score += voteValue
          target.voted[sender] = event
        }
        element = document.getElementById(targetId)
        if (element) {
          element.notifyPath(`voted.${sender}`, voteValue)
        }
        break
      case 'interlocutor.flag':
        if (target.flags.add(event)) {
          const sender = event.user_id || event.sender
          const value = eventContent.body.value
          if ([true, false].indexOf(value) === -1) {
            console.log(`Illegal Flag value: ${value}, ignoring: ${event.event_id}.`)
            return false
          }
          target.flagged[sender] = value
          element = document.getElementById(targetId)
          if (element) {
            // Use the exact key-value pair becaues there is no option to force Notify
            // on the base value
            element.notifyPath(`flagged.${sender}`, value)
          }
        }
        break
      case 'interlocutor.edit':
        if (!(target.user_id || target.sender) === (event.user_id || event.sender)) {
          console.log(`Illegal edit attempt on: ${targetId} by: ${event.user_id || event.sender}`)
          return false
        }
        target.content.body.text = eventContent.body.text
        // Setup editedTimestamp from the edit event
        target.editedTimestamp = event.origin_server_ts
        element = document.getElementById(targetId)
        if (element) {
          // Use pathEffector because NotifyPath has no force
          element._pathEffector('comment.content.body', eventContent.body)
          element.notifyPath('comment.editedTimestamp', target.editedTimestamp)
        }
        break
    return true
    }
  }

  eventProcessingOn(client) {
    client.addListener("Room.timeline", this._processEventCallback)
  }

  eventProcessingOff(client) {
    client.removeListener("Room.timeline", this._processEventCallback)
  }
}
