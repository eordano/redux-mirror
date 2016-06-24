import React, { Component } from 'react'
import { render } from 'react-dom'
import { createStore, compose, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunkMiddleware from 'redux-thunk'

import { connectToServer } from './network/connect'
import App from './containers/app'
import reducers from './store/reducers'

export default class Mirror extends React.Component {

  constructor(props, context, extra) {
    super(props, context, extra)

    this.store = createStore(
      reducers,
      compose(
        applyMiddleware(thunkMiddleware),
        window.devToolsExtension ? window.devToolsExtension() : f => f
      )
    )
    connectToServer(store)
  }

  render() {
    return <Provider store={store}>
      <App render={this.props.render}/>
    </Provider>
  }
}
