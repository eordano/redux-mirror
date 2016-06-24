import socketIO from 'socket.io-client'

const constants = {
  newClient    : 'newClient',
  state        : 'state',
  resizeWindow : 'resizeWindow',
  action       : 'action',
  mouseMovement: 'mouseMovement',
  scroll       : 'scroll',
}

const makeAction = payload => makeMessage(constants.action, payload || {})

const makeMessage = (type, payload) => {
  return JSON.stringify(Object.assign({ type }, payload))
}

const getWindowSize = () => {
  const width = window.innerWidth,
        height = window.innerHeight
  return { width, height }
}

const getScroll = () => {
  /**
   * Taken out of Stack Overflow. Source:
   * http://stackoverflow.com/a/14384091/182855
   */
  const top  = window.pageYOffset || document.documentElement.scrollTop,
        left = window.pageXOffset || document.documentElement.scrollLeft
  return { left, top }
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
    send(makeMessage(constants.mouseMovement, { x: ev.clientX, y: ev.clientY }))
  }
  window.addEventListener('mousemove', mouseListener)

  scrollListener = ev => {
    send(makeMessage(constants.scroll, getScroll()))
  }
  window.addEventListener('scroll', scrollListener)

  resizeListener = ev => {
    send(makeMessage(constants.resizeWindow, getWindowSize()))
  }
  window.addEventListener('resize', resizeListener)
}

const currentState = (store) => ({
  windowSize: getWindowSize(),
  scroll: getScroll(),
  state: store.getState()
})

const mirror = config => store => {

  const socket = new socketIO(config.serverEndpoint)
  const queue = []
  let connected = true

  socket.on('connect', () => {
    while (queue.length) {
      const headMessage = queue.shift(1)
      socket.send(headMessage)
    }
    connected = true
  })

  socket.on('disconnect', () => {
    connected = false
    send(makeMessage(constants.disconnected))
  })

  socket.on('stateQuery', () => {
    send(makeMessage(constants.state, currentState(store)))
  })

  const send = (message) => {
    if (!connected) {
      return queue.push(message)
    }
    return socket.send(message)
  }

  send(makeMessage(constants.newClient, currentState(store)))

  hookToWindowEvents(send)

  return next => action => {
    let result = next(action)
    send(makeAction({ newState: store.getState(), action }))
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
