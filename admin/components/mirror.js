import React, { PropTypes } from 'react'
import { createStore } from 'redux'
import { Provider, connect } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import { createMemoryHistory } from 'history'

import style from '../style.scss'
import Loading from './loading'

const ROUTER_CHANGE = '@@router/LOCATION_CHANGE'

export default class Mirror extends React.Component {

  constructor(props, context, extra) {
    super(props, context, extra)
    this.state = this.setupNewStateAndHistory(props.info)
  }

  componentWillReceiveProps(newProps) {
    if (newProps.clientId !== this.props.clientId) {
      this.setState(setupNewStateAndHistory(info))
    } else {
      this.state.store.dispatch({ type: 'REPLACE', payload: newProps.info.state })
    }
  }

  setupNewStateAndHistory(info) {
    const state = info.state
    const store = createStore((prevState, action) => action.payload || state)
    let history = createMemoryHistory()
    history.push(state.routing.path)
    history = syncHistoryWithStore(history, store)

    return { store, history }
  }

  buildApp() {
    if (!this.state.store) {
      return <Loading />
    }
    return <Provider store={this.state.store}>
      <Router history={this.state.history}>
        { this.props.render }
      </Router>
    </Provider>
  }

  mouse() {
    const position = this.props.info.mouse || {
      x: 0,
      y: 0
    }
    const scroll = this.props.info.scroll || {
      top: 0,
      left: 0
    }
    return <div className={style.mouse} style={{
      top: position.y + scroll.top,
      left: position.x + scroll.left
    }}>
    </div>
  }

  render() {
    const info = this.props.info
    console.log(info.scroll)
    return <div className={style.mirror}>
      <div className={style.frameContainer}>
        <div className={style.frame} style={{
            width: info.windowSize.width,
            height: info.windowSize.height
          }}>
          <div className={style.scrolled} style={{
            top: -info.scroll.top,
            left: -info.scroll.left
          }}>
            { this.buildApp() }
            { this.mouse() }
          </div>
        </div>
      </div>
    </div>
  }
}
