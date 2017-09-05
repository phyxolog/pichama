import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import classNames from 'classnames'
import { Link } from 'react-router'
import axios from 'axios'

import 'styles/index'

class Index extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      newProjectShow: false,
      newUser: false,
      addUserProject: false,
      projectName: undefined,
      userName: undefined,
      password: undefined,
      selectProjectId: undefined,
      selectUserId: undefined,
      userList: undefined,
      projects: [],
    }
  }

  componentDidMount() {
    if (!this.props.state.auth.isAuth) {
      browserHistory.push('/login')
    }

    axios.get('/api/user.list').then((resp) => this.setState({userList: resp.data}))
  }

  createProject() {
    axios.post('/api/project.add', {
      name: this.state.projectName,
      token: this.props.state.auth.userRole.token
    }).then((response) => {
      location.reload()
    })
  }

  createUser() {
    axios.post('/api/user.add', {
      login: this.state.userName,
      password: this.state.password
    }).then((response) => location.reload())
  }

  bindUser() {
    axios.post('/api/project.bind', {
      userId: this.state.selectUserId,
      projectId: this.state.selectProjectId
    }).then((resp) => location.reload())
  }

  loadProjects(userProjects) {
    var projectsList = userProjects.map((proj) => proj.targetId)
    var joinList = projectsList.join(',')


    axios.get(`/api/projects.get.by.ids?list=${joinList}`).then((resp) => {
      var projects = resp.data
      var p = []
      projects.forEach((user) => p.push(user.projects))
      this.setState({projects: p[0]})
    })
  }

  render() {
    var projects = this.props.state.auth.userRole ? this.props.state.auth.userRole.projects : []
    var isAdmin = this.props.state.auth.userRole ? this.props.state.auth.userRole.isAdmin : false

    if (this.props.state.auth.userRole === undefined)
      return <div></div>

    if (this.state.projects.length <= 0) {
      if (projects.length === 0 && !isAdmin && this.props.state.auth.userRole) {
        this.loadProjects.bind(this)(this.props.state.auth.userRole.userProjects)
        projects = this.state.projects
      }
    } else {
      projects = this.state.projects
    }

    return (
      <div>
        <section>
          {isAdmin && <button className="button new-project" onClick={() => this.setState({newUser: !this.state.newUser, newProjectShow: false})}>Добавить пользователя</button>}
          {isAdmin && <button className="button new-project" onClick={() => this.setState({addUserProject: !this.state.addUserProject})}>Подвязать проект к пользователю</button>}
          {projects.length > 0 && (
            <div>
              <h1 className="main-title">Ваши проекты</h1>
              {isAdmin && <button className="button new-project" onClick={() => this.setState({newProjectShow: !this.state.newProjectShow, newUser: false})}>Создать новый проект</button>}

              <div className="projects">
                {projects.map((project, i) => {
                  return (
                    <Link to={`/project/${project._id}`} key={i}>
                      {project.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {projects.length == 0 && (
            <div>
              {isAdmin && <h1 className="main-title">У Вас нет ни одного проекта</h1>}
              {!isAdmin && <h1 className="main-title">Вам не добавили ни одного проекта</h1>}
              {isAdmin && <button className="button new-project" onClick={() => this.setState({newProjectShow: !this.state.newProjectShow})}>Создать новый проект</button>}
            </div>
          )}
        </section>

        <div className={classNames('user-add-wrapper', {'new-project-wrapper': true, 'hidden': !this.state.newUser})}>
          <p>Создание пользователя</p>
          <input placeholder="Введите имя пользователя" onChange={(e) => this.setState({userName: e.target.value})} />
          <input placeholder="Введите пароль" onChange={(e) => this.setState({password: e.target.value})} />
          <button className="button" onClick={this.createUser.bind(this)}>Создать</button>
        </div>

        <div className={classNames({'new-project-wrapper': true, 'hidden': !this.state.newProjectShow})}>
          <p>Название проекта</p>
          <input placeholder="Введите название проекта" onChange={(e) => this.setState({projectName: e.target.value})} />
          <button className="button" onClick={this.createProject.bind(this)}>Создать</button>
        </div>

        <div className={classNames('user-add-wrapper', {'new-project-wrapper': true, 'hidden': !this.state.addUserProject})}>
          <p>Название проекта</p>
          <select onChange={(e) => this.setState({selectProjectId: e.target.value})}>
            <option value="none">Выберите проект...</option>
            {projects.map((project, i) => {
              return (
                <option value={project._id} key={i}>
                  {project.title}
                </option>
              )
            })}
          </select>

          {this.state.userList &&
            <select onChange={(e) => this.setState({selectUserId: e.target.value})}>
              <option value="none">Выберите пользователя...</option>
              {this.state.userList.map((user, i) => {
                return (
                  <option value={user._id} key={i}>
                    {user.login}
                  </option>
                )
              })}
            </select>
          }
          <button className="button" onClick={this.bindUser.bind(this)}>Подвязать</button>
        </div>
      </div>
    )
  }
}

export default connect(state => ({
  state: state,
}))(Index)
