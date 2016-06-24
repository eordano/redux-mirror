import React from 'react'
import { connect } from 'react-redux'
import { actions } from '../store/actions'

import Header from '../components/header'

export default connect(state => ({
  connected: state.connected,
  clientCount: state.clientList ? state.clientList.length : 0,
  currentClient: state.currentClient || null
}), { clearClient: actions.clearClient })(Header)
