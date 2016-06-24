import { connect } from 'react-redux'
import { actions } from '../store/actions'

import ClientView from '../components/client'

export default connect(state => ({
  connected: state.connected,
  clients: state.clientList,
  selectedClient: state.currentClient
}), { selectClient: actions.selectClient })(ClientView)
