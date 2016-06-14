import socketIO from 'socket.io'
import uuid from 'uuid-v4'

import constants, { makeAlias, makeDefaultOptions } from './constants'
import errors from './errors'

export default class Mirror {

  constructor(server, options) {
    this.server = server
    this.options = makeDefaultOptions(options)
    this.io = socketIO(server)
    this.users = {}
    this.usersToAlias = {}
    this.aliasToUser = {}

    this.setupNewConnectionListener()
  }

  setupNewConnectionListener() {
    this.io.on('connection', (socket) => {
      const alias = this.newUser(socket)
      this.notifyUserConnectedToListeners(socket, alias)
      this.awaitForUserAuthAsListener(socket, alias)
      this.hookMessageListener(socket, alias)
      this.hookDisconnectListener(socket, alias)
    })
  }

  newUser(socket) {
    const user = uuid()
    const alias = makeAlias(user)
    this.users[user]        = socket
    this.usersToAlias[user] = alias
    this.aliasToUser[alias] = user
    return alias
  }

  notifyUserConnectedToListeners(socket, alias) {
    console.log('>> user "%s" connected', alias)
    socket.to(constants.adminRoom).emit(constants.newClient, { id: this.aliasToUser[alias] })
  }

  notifyUserDisconnectedToListeners(socket, alias) {
    socket.to('admin').emit(constants.disconnected, { id: alias })
  }

  awaitForUserAuthAsListener(socket, alias) {
    socket.on(this.options.adminSecret, () => { socket.join(constants.adminRoom) })
  }

  hookMessageListener(socket, alias) {
    socket.on('message', (e) => {
      const info = JSON.parse(e)
      socket.to(alias).emit(constants.action, e)
      console.log('  (%s) Received %s with data %s',
                  alias,
                  info.type,
                  JSON.stringify(info)
      )
      // TODO: Backend to process message
    })
  }

  hookDisconnectListener(socket, alias) {
    socket.on('disconnect', () => {
      this.removeUser(alias)
      this.notifyUserDisconnectedToListeners(socket, alias)
    })
  }

  removeUser(user) {
    let [ username, alias ] = this.findByUserOrAlias(user)
    delete this.users[username]
    delete this.usersToAlias[username]
    delete this.aliasToUser[alias]
  }

  findByUserOrAlias(user) {
    let username, alias
    if (this.users[user]) {
      username = user
      alias = makeAlias(user)
    } else if (this.aliasToUser[user]) {
      username = this.aliasToUser[user]
      alias = user
    } else {
      throw new errors.UserNotFound(user)
    }
    return [ username, alias ]
  }
}
