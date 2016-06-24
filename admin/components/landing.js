import React from 'react'

import style from '../style.scss'

export default class Landing extends React.Component {

  render() {

    const select = client => ev => {
      ev.preventDefault()
      this.props.selectClient(client)
    }

    return <div className={style.client}>
      <h1>Server: { this.props.connected ? 'Connected' : 'Disconnected' }</h1>
      {
        this.props.clients &&
        <div>
          <h1>Client selection</h1>
          <div className={style.select}>
            <ul>
              {
                this.props.clients.map(client => {
                  return <li key={client}>
                    <a href='#' onClick={select(client)}>{ client }</a>
                  </li>
                })
              }
            </ul>
          </div>
        </div>
      }
    </div>
  }
}
