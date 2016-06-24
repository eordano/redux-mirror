export const listClients = 'listClients'
export const newClient = 'newClient'
export const resizeWindow = 'resizeWindow'
export const action = 'action'
export const mouseMovement = 'mouseMovement'
export const scroll = 'scroll'
export const state = 'state'
export const disconnected = 'disconnected'
export const stateQuery = 'stateQuery'

export const userActions = [
  newClient, resizeWindow, action, state, mouseMovement, scroll
]

export const adminRoom = 'admin'

export const defaultAdminSecret = '50be8fb16715080'

export const makeAlias = user => user.substr(0, 6)

export const makeDefaultOptions = (options) => {
  if (!options) {
    options = {}
  }
  options.adminSecret = options.adminSecret || defaultAdminSecret
  return options
}

export default {
  adminRoom,
  makeAlias,
  makeDefaultOptions,
  newClient, resizeWindow, action, state, mouseMovement, scroll, disconnected,
  listClients, stateQuery,
  userActions,
  actions: [
    newClient, resizeWindow, action, state, mouseMovement, scroll, disconnected, stateQuery
  ]
}
