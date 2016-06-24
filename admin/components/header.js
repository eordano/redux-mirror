import React, { PropTypes } from 'react'

import style from '../style.scss'

export default class HeaderContainer extends React.Component {

  static propTypes = {
    connected: PropTypes.bool.isRequired,
    clientCount: PropTypes.number.isRequired,
    currentClient: PropTypes.string,
    clearClient: PropTypes.func.isRequired,
  }

  clear(ev) {
    ev.preventDefault()
    this.props.clearClient()
  }

  render() {
    return <div className={style.header}>
      <div className={style.logo}>
        redux-mirror
      </div>
      <div className={style.status}>
      {
        this.props.currentClient && <span>
          Now mirroring user
          &nbsp;
          { this.props.currentClient.substr(0, 8) }
          &nbsp;
          <a href='#' onClick={::this.clear}>(disconnect)</a>
          &nbsp;
        </span>
      }
      {
        this.props.connected
        ? <span>{ this.props.clientCount } client{ (!this.props.clientCount || this.props.clientCount > 1) && 's'} available ✓</span>
        : <span>Disconnected from server</span>
      }
      </div>
    </div>
  }
}
