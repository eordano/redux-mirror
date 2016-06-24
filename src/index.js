import socketIO from 'socket.io'
import _ from 'lodash'
import uuid from 'uuid-v4'

import constants, { makeAlias, makeDefaultOptions } from './constants'
import errors from './errors'

const now = () => new Date().getTime()

export default class Mirror {

  constructor(server, options) {
    this.server = server
    this.options = makeDefaultOptions(options)
    this.io = socketIO(server)
    this.sockets = {}
    this.usersToAlias = {}
    this.aliasToUser = {}
    this.admins = {}

    this.setupNewConnectionListener()
  }

  setupNewConnectionListener() {
    this.io.on('connection', (socket) => {
      const alias = this.newUser(socket)

      this.notifyUserConnectedToAdmins(alias)
      this.awaitForUserAuthAsAdmin(socket, alias)

      this.hookMessageListener(socket, alias)
      this.hookDisconnectListener(socket, alias)
    })
  }

  newUser(socket) {
    const user = uuid()
    const alias = makeAlias(user)
    this.sockets[user]      = socket
    this.usersToAlias[user] = alias
    this.aliasToUser[alias] = user
    return alias
  }

  notifyUserConnectedToAdmins(alias) {
    console.log('>> user "%s" connected', alias)
  }

  notifyUserDisconnectedToAdmins(alias) {
    console.log('>> user "%s" disconnected', alias)
    this.io.to(constants.adminRoom).emit(constants.disconnected, {
      clientId: this.getClientId(alias), ts: now()
    })
  }

  awaitForUserAuthAsAdmin(socket, alias) {
    socket.on('message', (e) => {
      if (e === this.options.adminSecret) {
        this.makeAdmin(socket, alias)
      }
    })
  }

  makeAdmin(socket, alias) {
    const username = this.getClientId(alias)
    this.admins[username] = true

    socket.join(constants.adminRoom)
    socket.emit(constants.listClients, {
      ts: now(),
      you: username,
      users: _.keys(this.sockets)
    })

    console.log('  (%s) is now an admin', alias)
  }

  hookMessageListener(socket, alias) {
    socket.on('message', (e) => {
      try {
        const info = JSON.parse(e)

        if (this.isValidUserAction(info.type)) {
          this.notifyAdmins(alias, info)

        } else if (this.isValidStateQuery(info, alias)) {
          this.requestState(info.clientId)

        } else {
          console.log('  (%s) sent an invalid action: %s', alias, info.type)
        }

      } catch (error) {
        if (e === this.options.adminSecret) {
          return
        }
        console.log('  (%s) error parsing message: "%s"', alias, error)
      }
    })
  }

  isValidStateQuery(info, alias) {
    return info.type === constants.stateQuery && this.isAdmin(alias)
  }

  isAdmin(alias) {
    return !!this.admins[this.getClientId(alias)]
  }

  requestState(alias) {
    this.getSocket(alias).emit(constants.stateQuery)
  }

  getSocket(alias) {
    return this.sockets[this.getClientId(alias)]
  }

  isValidUserAction(type) {
    return constants.userActions.indexOf(type) !== -1
  }

  notifyAdmins(alias, info) {
    const event = Object.assign({ clientId: this.getClientId(alias), ts: now() }, info)
    this.io.to(constants.adminRoom).emit(event.type, event)
  }

  hookDisconnectListener(socket, alias) {
    socket.on('disconnect', () => {
      this.notifyUserDisconnectedToAdmins(alias)
      this.removeUser(alias)
    })
  }

  removeUser(user) {
    let [ username, alias ] = this.findByUserOrAlias(user)
    delete this.sockets[username]
    delete this.usersToAlias[username]
    delete this.aliasToUser[alias]
    delete this.admins[username]
  }

  getClientId(alias) {
    return this.findByUserOrAlias(alias)[0]
  }

  findByUserOrAlias(user) {
    let username, alias
    if (this.sockets[user]) {
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
