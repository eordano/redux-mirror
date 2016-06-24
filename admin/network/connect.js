import socketIO from 'socket.io-client'

import constants, { eventTypes } from '../constants'
import { actions } from '../store/actions'

const io = socketIO()

export const requestInfo = (clientId) => {
  io.send(JSON.stringify({ type: eventTypes.stateQuery, clientId }))
}

export const connectToServer = (store) => {

  store.dispatch(actions.socketConnecting())

  io.on('connect', (socket) => {

    io.send(constants.adminSecret)
    store.dispatch(actions.socketConnected())

    io.on('disconnect', () => {
      store.dispatch(actions.socketDisconnect())
    })

    io.on(eventTypes.listClients, (ev) => {
      store.dispatch(actions.setUsers(ev.users.filter(user => user !== ev.you)))
    })

    io.on(eventTypes.newClient, (ev) => {
      store.dispatch(actions.newClient({
        clientId: ev.clientId,
        windowSize: ev.windowSize,
        scroll: ev.scroll,
        state: ev.state
      }))
    })

    io.on(eventTypes.stateReport, (ev) => {
      store.dispatch(actions.state({
        clientId: ev.clientId,
        windowSize: ev.windowSize,
        scroll: ev.scroll,
        state: ev.state
      }))
    })

    io.on(eventTypes.resizeWindow, (ev) => {
      store.dispatch(actions.resizeWindow({
        clientId: ev.clientId,
        windowSize: { width: ev.width, height: ev.height }
      }))
    })

    io.on(eventTypes.action, (ev) => {
      store.dispatch(actions.action({
        clientId: ev.clientId,
        action: ev.action,
        newState: ev.newState
      }))
    })

    io.on(eventTypes.mouseMovement, (ev) => {
      store.dispatch(actions.mouseMovement({
        clientId: ev.clientId,
        mouse: { x: ev.x, y: ev.y }
      }))
    })

    io.on(eventTypes.scroll, (ev) => {
      store.dispatch(actions.scroll({
        clientId: ev.clientId,
        scroll: { top: ev.top, left: ev.left }
      }))
    })

    io.on(eventTypes.disconnected, (ev) => {
      store.dispatch(actions.disconnected({
        clientId: ev.clientId
      }))
    })
  })
}

export default { connectToServer, requestInfo }
