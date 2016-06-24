import _ from 'lodash'

export const actionTypes = {
  socketConnecting : 'connecting to server',
  socketConnected  : 'server connected',
  socketDisconnect : 'server disconnected',

  setUsers         : 'list received from server',
  selectClient     : 'selected client',
  clearClient      : 'clear client',

  newClient        : 'user joined',
  action           : 'user action',
  state            : 'user state report',
  resizeWindow     : 'user resized window',
  mouseMovement    : 'user mouse move',
  scroll           : 'user scrolled',
  disconnected     : 'user disconnected',
}

export const actions = _.fromPairs(
  _.keys(actionTypes).map(type => [type, (payload) => ({ type: actionTypes[type], payload })])
)

export default {
  actionTypes, actions
}
