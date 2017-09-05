import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import classNames from 'classnames'
import { Link } from 'react-router'
import axios from 'axios'
import { authChangeState } from 'actions/auth'
import { capitalize } from 'lodash/string'
import Dropzone from 'react-dropzone'
import request from 'superagent'

import 'styles/path'

class Path extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      files: [],
      percent: 0,
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

  componentWillReceiveProps(nextProps) {
    if (this.state.project === undefined) {
      if (nextProps.state.auth.userRole.projects !== undefined) {
        var project = nextProps.state.auth.userRole.projects.filter((project) => {
          return project._id === this.props.params.id
        })[0]

        this.setState({project})
      }
    }
  }

  prepareVersion(ver) {
    if (ver === 'desktopplus') {
      return 'Desktop+'
    } else {
      return capitalize(ver)
    }
  }

  onDrop(acceptedFiles, rejectedFiles) {
    this.setState({
      files: acceptedFiles
    })

    var version = this.props.location.query.version

    var req = request.post(`/api/project.upload.layout/${this.props.state.auth.userRole.token}/${this.state.project._id}/${version}`)

    req.on('progress', (e) => {
      this.setState({percent: Math.round(e.percent)})
    })

    acceptedFiles.forEach((file) => {
      req.attach(file.name, file)
    })

    req.end((err, response) => {
      location.reload()
    })
  }

  getRelativePath(file) {
    return `/assets/layouts/${this.props.params.id}/${this.props.location.query.version}/${file}`
  }

  render() {
    var version = this.props.location.query.version

    if (this.props.state.auth.userRole === undefined)
      return <div></div>

    var isAdmin = this.props.state.auth.userRole.isAdmin

    if (this.props.state.auth.userRole.isAdmin) {
      var project = this.props.state.auth.userRole.projects.filter((project) => {
        return project._id === this.props.params.id
      })[0]
    } else {
      var project = this.state.project
    }

    if (project === undefined)
      return <div></div>

    return (
      <div className="upload-path">
        {isAdmin && (
          <Dropzone className="load-images" onDrop={this.onDrop.bind(this)}>
            <h1>Загрузить макеты для версии {this.prepareVersion(version)}</h1>

            <div className="plus-btn">+</div>
          </Dropzone>          
        )}

        {this.state.files.length > 0 ? <div className="preview-wrapper">
        <h2>Загружаем... ({this.state.percent}%)</h2>
        <div>{this.state.files.map((file, i) => <div className="preview" key={i} style={{backgroundImage: `url("${file.preview}")`}} /> )}</div>
        </div> : null}

        {!project.path && (
          <h1 className="preview-title">Здесь нет макетов</h1>
        )}

        {project.path && (
          <div>
            <h1 className="preview-title">Ваши макеты</h1>

            <div className="projects">
              {project.path[version].map((layout, i) => {
                var ext = layout.path.substring(layout.path.lastIndexOf(".") + 1)
                var filename = layout.path.split(".").shift()

                return (
                  <section onClick={() => browserHistory.push(`/layout/${project._id}/${version}/${filename}/${ext}`)} key={i}>
                    <div style={{backgroundImage: `url("${this.getRelativePath(layout.path)}")`}}></div>
                  </section>)
              })}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default connect(state => ({
  state: state,
}))(Path)
