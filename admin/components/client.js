import React, { PropTypes } from 'react'

import Mirror from '../containers/mirror'
import Landing from './landing'
import style from '../style.scss'

export default class Client extends React.Component {
  static propTypes = {
    connected: PropTypes.bool.isRequired,
    clients: PropTypes.array,
    selectedClient: PropTypes.string,
    selectClient: PropTypes.func.isRequired,
  }
  render() {
    if (this.props.selectedClient) {
      return <Mirror render={this.props.render} />
    }
    return <Landing {...this.props} />
  }
}
