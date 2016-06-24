import React from 'react'
import Mirror from 'redux-mirror-server'

import App from '../frontend/app'

render(<Mirror mainComponent={App} />, document.getElementById('wrapper'))
