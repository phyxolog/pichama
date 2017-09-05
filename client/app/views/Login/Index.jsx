import React from 'react'
import Helmet from 'react-helmet'
import axios from 'axios'
import { browserHistory } from 'react-router'
import { connect } from 'react-redux'
import { authChangeState } from 'actions/auth'

import 'styles/login'

class Login extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      now: new Date(),
      interval: undefined,
      email: undefined,
      password: undefined
    }
  }

  componentDidMount() {
    var token = localStorage.getItem('token');
    if (token) {
      axios.get(`/api/user/${token}`).then((response) => {
        this.props.dispatch(authChangeState('userRole', response.data))
        this.props.dispatch(authChangeState('isAuth', true))
        browserHistory.push('/')
      })
    } else {
      var interval = setInterval(() => {
        var now = new Date()
        this.setState({now})
      }, 1000)

      this.setState({interval})
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.interval)
  }

  goAuth() {
    axios.post('/api/login', {
      login: this.state.email,
      password: this.state.password
    }).then((response) => {
      var token = response.data.token;
      localStorage.setItem('token', token);
      axios.get(`/api/user/${token}`).then((response) => {
        this.props.dispatch(authChangeState('userRole', response.data))
        this.props.dispatch(authChangeState('isAuth', true))
        browserHistory.push('/')
      })
    }).catch((err) => {
      alert('Введённые данные не верны!');
    })
  }

  render() {
    return (
      <div className="login-wrapper">
        <div className="timer">
          <h1>{this.state.now.toLocaleTimeString()}</h1>
          <h6>{this.state.now.toLocaleDateString('ru-RU', {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}</h6>
        </div>

        <div className="login-panel-wrapper">
          <div className="login-panel">
            <input ref="email" placeholder="Email" type="email" autoCorrect="off" autoComplete="off" onKeyUp={(e) => this.setState({email: e.target.value})} />
            <a onClick={this.goAuth.bind(this)}>Вход</a>
            <input ref="password" placeholder="Пароль" type="password" autoCorrect="off" autoComplete="off" onKeyUp={(e) => this.setState({password: e.target.value})} />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  state: state,
}))(Login)
