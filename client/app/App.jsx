import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import Menu from 'material-ui/Menu'
import MenuItem from 'material-ui/MenuItem'
import { browserHistory } from 'react-router'
import classNames from 'classnames'

class App extends React.Component {
  constructor(props) {
    super(props)
  }

  exit() {
    localStorage.removeItem('token')
    browserHistory.push('/login')
  }

  render() {
    return (
      <div>
        <header className="header">
          <h1 onClick={() => browserHistory.push('/')}>ArtVision</h1>

          <p>{this.props.state.auth.userRole && (
            this.props.state.auth.userRole.login
          )}</p>
          <button className="button" onClick={this.exit.bind(this)}>Выйти</button>
        </header>

        {this.props.children}
      </div>
    )
  }
}

export default connect(state => ({
  state: state,
}))(App)
