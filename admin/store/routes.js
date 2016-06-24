import React from 'react'
import { Route, IndexRoute } from 'react-router'

import Layout from './layout'
import Admin from './admin'

export default (
  <Route path="*" component={Layout}>
    <IndexRoute component={Admin} />
  </Route>
)
