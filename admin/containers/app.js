import React from 'react'

import Header from './header'
import Client from './client'

import style from '../style.scss'

export default class App extends React.Component {
  render() {
    return <div className={style.app}>
      <Header />
      <Client render={this.props.render}/>
    </div>
  }
}
