import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import { requestInfo } from '../network/connect'
import Mirror from '../components/mirror'

class MirrorContainer extends React.Component {
  componentWillMount() {
    if (!this.props.initialized) {
      requestInfo(this.props.clientId)
    }
  }
  render() {
    if (this.props.initialized) {
      return <Mirror {...this.props} />
    }
    return <h1>Loading...</h1>
  }
}

export default connect(state => ({ 
  initialized: state.clients[state.currentClient]
            && state.clients[state.currentClient].initialized,
  clientId: state.currentClient,
  info: state.clients[state.currentClient]
}))(MirrorContainer)
