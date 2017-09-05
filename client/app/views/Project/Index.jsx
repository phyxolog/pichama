import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import classNames from 'classnames'
import { Link } from 'react-router'
import axios from 'axios'
import { authChangeState } from 'actions/auth'

import 'styles/project'

class Project extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      project: undefined
    }
  }

  componentDidMount() {
    var token = localStorage.getItem('token');
    if (token) {
      axios.get(`/api/user/${token}`).then((response) => {
        this.props.dispatch(authChangeState('userRole', response.data))
        this.props.dispatch(authChangeState('isAuth', true))
      })

      axios.get(`/api/project.get?projectId=${this.props.params.id}`).then((resp) => this.setState({project: resp.data}))
    } else {
      browserHistory.push('/login')
    }
  }

  deleteProject() {
    var id = this.props.params.id, userRole = this.props.state.auth.userRole

    axios.post('/api/project.delete', {
      token: this.props.state.auth.userRole.token,
      id: this.props.params.id
    }).then((response) => {
      userRole.projects = userRole.projects.filter((project) => project._id !== id)
      this.props.dispatch(authChangeState('userRole', userRole))
      browserHistory.push('/')
    })
  }

  render() {
    if (this.props.state.auth.userRole === undefined)
      return <div></div>

    if (this.props.state.auth.userRole.isAdmin) {
      var project = this.props.state.auth.userRole.projects.filter((project) => {
        return project._id === this.props.params.id
      })[0]
    } else {
      var project = this.state.project
    }

    var isAdmin = this.props.state.auth.userRole.isAdmin

    if (project === undefined)
      return <div></div>

    return (
      <div className="project">
        <h1>Проект: {project.title} {isAdmin && (<a onClick={this.deleteProject.bind(this)}>удалить</a>)}</h1>

        <Link className="project-to" to={`/project/path/edit/${this.props.params.id}?version=desktopplus`}>Desktop+</Link>
        <Link className="project-to" to={`/project/path/edit/${this.props.params.id}?version=desktop`}>Desktop</Link>
        <Link className="project-to" to={`/project/path/edit/${this.props.params.id}?version=tablet`}>Tablet</Link>
        <Link className="project-to" to={`/project/path/edit/${this.props.params.id}?version=mobile`}>Mobile</Link>
      </div>
    )
  }
}

export default connect(state => ({
  state: state,
}))(Project)
