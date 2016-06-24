import _ from 'lodash'
import { actionTypes as actions } from './actions'

function update(a, b) {
  return Object.assign({}, a, b)
}

const updateClientPartial = (state, clientId, prop, newValue) => {
  return update(state, {
    clients: update(state.clients, {
      [clientId]: update(state.clients[clientId], { [prop]: newValue })
    })
  })
}

const initialClientStatus = (state, users) => {
  return _.fromPairs(users.map(clientId => [clientId, {
    initialized: null
  }]))
}

const appendClient = (list, client) => {
  if (list.indexOf(client) === -1) {
    return list.concat([client])
  }
  return list
}

const removeClientFromList = (list, client) => {
  return list.filter(e => e !== client)
}

const removeClientFromMap = (map, client) => {
  return _.omit(map, client)
}

export default (state, action) => {

  const clientId = action.payload ? action.payload.clientId : null

  switch (action.type) {

    case actions.socketConnecting:
    case actions.socketDisconnect:
      return update(state, { connected: false })
    case actions.socketConnected:
      return update(state, { connected: true })

    case actions.selectClient:
      return update(state, { currentClient: action.payload })
    case actions.clearClient:
      return update(state, { currentClient: null })
    case actions.setUsers:
      return update(state, {
        clientList: action.payload,
        clients: initialClientStatus(state, action.payload)
      })

    case actions.newClient:
    case actions.state:
      return update(state, {
        clientList: appendClient(state.clientList, clientId),
        clients: update(state.clients, {
          [clientId]: update(action.payload, { initialized: true })
        })
      })
    case actions.action:
      return update(state, {
        clients: update(state.clients, {
          [clientId]: update(state.clients[clientId], {
            lastAction: action.payload.action,
            state: action.payload.newState
          })
        })
      })
    case actions.resizeWindow:
      return updateClientPartial(state, clientId, 'windowSize', action.payload.windowSize)
    case actions.scroll:
      return updateClientPartial(state, clientId, 'scroll', action.payload.scroll)
    case actions.mouseMovement:
      return updateClientPartial(state, clientId, 'mouse', action.payload.mouse)

    case actions.disconnected:
      return update(state, {
        clientList: removeClientFromList(state.clientList, clientId),
        clients: removeClientFromMap(state.clients, clientId)
      })
    default:
      return state || {}
  }
}
