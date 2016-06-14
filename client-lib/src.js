import socketIO from 'socket.io-client'

const constants = {
  newClient    : 'newClient',
  resizeWindow : 'resizeWindow',
  action       : 'action',
  mouseMovement: 'mouseMovement',
  scroll       : 'scroll',
  disconnected : 'disconnected'
}

const makeAction = payload => makeMessage(constants.action, payload || {})

const makeMessage = (type, payload) => {
  return JSON.stringify(Object.assign({ type }, payload))
}

let mouseListener, scrollListener, resizeListener

const hookToWindowEvents = send => {
  if (!window.addEventListener) {
    console.log(`User agent does not implement the addEventListener interface.
                Window events will not be logged.`)
    return
  }
  if (mouseListener || scrollListener || resizeListener) {
    console.log(`Listener hooks are already connected. Call the "removeHooks" function before
                adding new listeners to the DOM.`)
    return
  }

  mouseListener = ev => {
    send(makeMessage(constants.mouseMovement, { x: ev.screenX, y: ev.screenY }))
  }
  window.addEventListener('mousemove', mouseListener)

  scrollListener = ev => {
    /**
     * Taken out of Stack Overflow. Source:
     * http://stackoverflow.com/a/14384091/182855
     */
    const top  = window.pageYOffset || document.documentElement.scrollTop,
          left = window.pageXOffset || document.documentElement.scrollLeft
    send(makeMessage(constants.scroll, { left, top }))
  }
  window.addEventListener('scroll', scrollListener)

  resizeListener = ev => {
    const width = window.innerWidth,
          height = window.innerHeight
    send(makeMessage(constants.resizeWindow, { width, height }))
  }
  window.addEventListener('resize', resizeListener)
}

const mirror = config => store => {

  const socket = new socketIO(config.serverEndpoint)
  const queue = []
  let connected = true

  socket.on('connect', () => {
    while (queue.length) {
      const first = queue.shift(1)
      socket.send(first)
    }
    connected = true
  })

  socket.on('disconnect', () => {
    connected = false
    send(makeMessage(constants.disconnected))
  })

  const send = (message) => {
    if (!connected) {
      return queue.push(message)
    }
    return socket.send(message)
  }

  send(makeMessage(constants.newClient))

  hookToWindowEvents(send)

  return next => action => {
    let result = next(action)
    send(makeAction({ newState: result, action }))
    return result
  }
}

export const removeHooks = () => {
  if (!window.removeEventListener) {
    return
  }
  window.removeEventListener('mousemove', mouseListener)
  window.removeEventListener('scroll', scrollListener)
  window.removeEventListener('resize', resizeListener)

  mouseListener = scrollListener = resizeListener = null
}

export default mirror
