# redux-mirror

Monitor a remote user agent using your redux app.

## Usage

### Server side

Assuming you use express, koa, or any engine based on the `http` module, you
only need to hook a mirror instance to the server:

    import mirror from 'redux-mirror'

    const server = http.createServer(app)
    new mirror(server)
    server.listen(4000, /** ... */)

### Client side

In order to start sending usage information, add the following code to your
redux store:

    import reduxMirror from 'redux-mirror-client'
    
    const mirrorMiddleware = reduxMirror()
    const store = createStore(reducer, applyMiddleWare(mirrorMiddleWare))

Assuming you use other middleware, dev tools, or an advanced combination of reducers:

    import { compose, applyMiddleware, createStore } from 'redux'
    import reduxMirror from 'redux-mirror-client'
    
    const mirrorMiddleware = reduxMirror()

    const store = createStore(
      reducers,
      compose(
        applyMiddleware(thunkMiddleware, mirrorMiddleware),
        window.devToolsExtension ? window.devToolsExtension() : f => f
      )
    )

### Live Administration

TODO
