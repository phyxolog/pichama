import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { browserHistory } from 'react-router'
import classNames from 'classnames'
import { Link } from 'react-router'
import axios from 'axios'
import { authChangeState } from 'actions/auth'
import {Cropper} from 'react-image-cropper'
import { cloneDeep } from 'lodash'
import request from 'superagent'

import 'styles/layout'
import 'styles/path'

class Layout extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      currentLayoutActive: -1,
      addLink: false,
      addComment: false,
      comment: '',
      addImage: false,
      image: undefined,
      imgLoaded: false,
      project: undefined,
      comments: undefined
    }
  }

  componentDidMount() {
    var token = localStorage.getItem('token');
    if (token) {
      axios.get(`/api/user/${token}`).then((response) => {
        this.props.dispatch(authChangeState('userRole', response.data))
        this.props.dispatch(authChangeState('isAuth', true))
      })

      axios.get(`/api/project.get?projectId=${this.props.params.project}`).then((resp) => {
        this.setState({project: resp.data})
        var project = resp.data
        var id = project.path[this.props.params.version].filter((proj) => proj.path === `${this.props.params.path}.${this.props.params.ext}`)[0]._id
        axios.get(`/api/project.comments?id=${id}`).then((response) => this.setState({comments: response.data}))
      })

    } else {
      browserHistory.push('/login')
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.project === this.props.params.object) {
      return
    }

    axios.get(`/api/project.get?projectId=${this.props.params.project}`).then((resp) => {
      this.setState({project: resp.data})
      var project = resp.data
      var id = project.path[this.props.params.version].filter((proj) => proj.path === `${this.props.params.path}.${this.props.params.ext}`)[0]._id
      axios.get(`/api/project.comments?id=${id}`).then((response) => this.setState({comments: response.data}))
    })
  }

  getRelativePath() {
    return `/assets/layouts/${this.props.params.project}/${this.props.params.version}/${this.props.params.path}.${this.props.params.ext}`
  }

  getRelativePath2(file) {
    return `/assets/layouts/${this.props.params.project}/${this.props.params.version}/${file}`
  }

  addLink() {
    var project = this.props.state.auth.userRole.projects.filter((project) => {
      return project._id === this.props.params.project
    })[0]

    var values = this.refs.cropper.values()
    var projDup = project.path[this.props.params.version].filter((layout) => layout.path !== `${this.props.params.path}.${this.props.params.ext}`)
    var layout = projDup[this.state.currentLayoutActive]

    if (layout === undefined) {
      alert('Выберите макет')
      return
    }

    var img = this.refs.cropper.refs.cloneImg
    values.imgWidth = img.width
    values.imgHeight = img.height

    axios.post('/api/link.add', {
      values: values,
      id: project._id,
      lid: layout._id,
      path: `${this.props.params.path}.${this.props.params.ext}`,
      token: this.props.state.auth.userRole.token,
      version: this.props.params.version
    }).then((response) => location.reload())
  }

  addComment() {
    var values = this.refs.cropper.values()
    var img = this.refs.cropper.refs.cloneImg
    values.imgWidth = img.width
    values.imgHeight = img.height

    if (this.props.state.auth.userRole.isAdmin) {
      var project = this.props.state.auth.userRole.projects.filter((project) => {
        return project._id === this.props.params.project
      })[0]

      axios.post('/api/comment.add', {
        text: this.state.comment,
        values: values,
        id: project._id,
        path: `${this.props.params.path}.${this.props.params.ext}`,
        token: this.props.state.auth.userRole.token,
        version: this.props.params.version
      }).then((response) => location.reload())
    } else {
      var project = this.state.project
      var path = `${this.props.params.path}.${this.props.params.ext}`
      var id = project.path[this.props.params.version].filter((proj) => proj.path === `${this.props.params.path}.${this.props.params.ext}`)[0]._id

      axios.post('/api/user.comment.add', {
        text: this.state.comment,
        values: values,
        id: id,
        path: `${this.props.params.path}.${this.props.params.ext}`,
        token: this.props.state.auth.userRole.token,
        version: this.props.params.version
      }).then((response) => location.reload())
    }
  }

  addImage() {
    var values = this.refs.cropper.values()
    var img = this.refs.cropper.refs.cloneImg
    var image = this.state.image[0]
    values.imgWidth = img.width
    values.imgHeight = img.height

    var project = this.props.state.auth.userRole.projects.filter((project) => {
      return project._id === this.props.params.project
    })[0]

    var data = new FormData()

    Object.keys(values).map((objectKey, index) => {
      data.append(objectKey, values[objectKey])
    })

    data.append('image', image)
    data.append('id', project._id)
    data.append('path', `${this.props.params.path}.${this.props.params.ext}`)
    data.append('token', this.props.state.auth.userRole.token)
    data.append('version', this.props.params.version)

    var req = request
            .post('/api/image.add')
            .send(data)
            .end((err, response) => {
              location.reload()
            })
  }

  render() {
    var version = this.props.params.version

    if (this.props.state.auth.userRole === undefined)
      return <div></div>

    var isAdmin = this.props.state.auth.userRole.isAdmin

    if (isAdmin) {
      var project = this.props.state.auth.userRole.projects.filter((project) => {
        return project._id === this.props.params.project
      })[0]
    } else {
      var project = this.state.project
    }

    if (project === undefined)
      return <div></div>

    var listOfProjects = project.path[version].filter((layout) => layout.path !== `${this.props.params.path}.${this.props.params.ext}`)
    var thisProject = project.path[version].filter((layout) => layout.path === `${this.props.params.path}.${this.props.params.ext}`)[0]

    var comments = this.state.comments

    if (comments === undefined)
      comments = []

    return (
      <div className="layout">
        <div className="btn-layout">
          {isAdmin && <button className="button" onClick={() => this.setState({addLink: true})}>Добавить ссылку на другой макет</button>}
          <button className="button" onClick={() => this.setState({addComment: true})}>Добавить комментарий</button>
          {isAdmin && <button className="button" onClick={() => this.setState({addImage: true})}>Добавить изображение</button>}
        </div>

        {this.state.addLink && (
          <div className="select-project">
            <h1>Выберите макет</h1>

            {project.path !== null && (
              <div>
                <div className="projects">
                  {listOfProjects.map((layout, i) => {
                    var ext = layout.path.substring(layout.path.lastIndexOf(".") + 1)
                    var filename = layout.path.split(".").shift()

                    return (
                      <section onClick={() => this.setState({currentLayoutActive: i})} className={classNames({'active': this.state.currentLayoutActive === i})} key={i}>
                        <div style={{backgroundImage: `url("${this.getRelativePath2(layout.path)}")`}}></div>
                      </section>)
                  })}
                </div>
              </div>
            )}

            <div className="btn-success-wrapper">
              <button className="button btn-success" onClick={this.addLink.bind(this)}>Готово</button>
            </div>
          </div>
        )}

        {this.state.addComment && (
          <div className="select-project">
            <h1>Выберите область и введите комментарий</h1>

            <textarea onChange={(e) => this.setState({comment: e.target.value})}></textarea>

            <div className="btn-success-wrapper">
              <button className="button btn-success" onClick={this.addComment.bind(this)}>Готово</button>
            </div>
          </div>
        )}

        {this.state.addImage && (
          <div className="select-project">
            <h1>Выберите область и загрузите изображение</h1>

            <input type="file" onChange={(e) => this.setState({image: e.target.files})} />

            <div className="btn-success-wrapper">
              <button className="button btn-success" onClick={this.addImage.bind(this)}>Готово</button>
            </div>
          </div>
        )}

        {this.state.addLink || this.state.addComment || this.state.addImage ? <div className="img-wrap2">
          <Cropper fixedRatio={false} src={this.getRelativePath()} ref="cropper"/>
        </div> : <div className="img-wrap"><img onLoad={() => {
          this.setState({imgLoaded: true})
        }} ref="img" src={this.getRelativePath()} /></div>}

        {this.state.imgLoaded && this.refs.img && !this.state.addLink && !this.state.addComment && !this.state.addImage && (
          <div>
            {thisProject.images.map((image, i) => {
              var imgCoord = this.refs.img.getBoundingClientRect()

              if ('width' in image.coord) {
                var x = image.coord.x * (imgCoord.width / image.coord.imgWidth) + imgCoord.left
                var y = image.coord.y * (imgCoord.height / image.coord.imgHeight) + imgCoord.top
                var width = image.coord.width * (imgCoord.width / image.coord.imgWidth)
                var height = image.coord.height * (imgCoord.height / image.coord.imgHeight)

                return <div
                style={{position: 'absolute',
                  top: y,
                  left: x,
                  width: width,
                  height: height,
                  cursor: 'pointer',
                  zIndex: 999,
                  backgroundColor: 'rgba(0, 0, 0, 0.03)'}} key={i}
                  onClick={(e) => {
                    if (e.target.innerHTML.length === 0) {
                      var img = document.createElement("img")
                      var target = e.target
                      img.src = `/${image.image}`.replace('public', 'assets')
                      img.style.position = 'relative'
                      img.style.top = height + 'px'
                      img.style.webkitUserSelect = 'none'
                      img.style.mozUserSelect = 'none'
                      img.style.msUserSelect = 'none'
                      img.onload = (eimg) => {
                        // img.style.left = '-' + eimg.target.width * 2 + 'px'
                        img.style.left = x
                        target.appendChild(img)
                      }
                    } else {
                      e.target.innerHTML = ''
                    }
                  }}></div>
              }
            })}

            {thisProject.comments.map((comment, i) => {
              var imgCoord = this.refs.img.getBoundingClientRect()

              var x = comment.coord.x * (imgCoord.width / comment.coord.imgWidth) + imgCoord.left
              var y = comment.coord.y * (imgCoord.height / comment.coord.imgHeight) + imgCoord.top
              var width = comment.coord.width * (imgCoord.width / comment.coord.imgWidth)
              var height = comment.coord.height * (imgCoord.height / comment.coord.imgHeight)

              return <div
              style={{position: 'absolute',
                top: y,
                left: x,
                width: width,
                height: height,
                color: '#fff',
                backgroundColor: 'rgba(0, 0, 0, 0.03)'}} key={i}>{comment.body}</div>
            })}

            {comments.map((comment, i) => {
              var imgCoord = this.refs.img.getBoundingClientRect()

              var x = comment.coord.x * (imgCoord.width / comment.coord.imgWidth) + imgCoord.left
              var y = comment.coord.y * (imgCoord.height / comment.coord.imgHeight) + imgCoord.top
              var width = comment.coord.width * (imgCoord.width / comment.coord.imgWidth)
              var height = comment.coord.height * (imgCoord.height / comment.coord.imgHeight)

              return <div
              style={{position: 'absolute',
                top: y,
                left: x,
                width: width,
                height: height,
                color: '#fff',
                backgroundColor: 'rgba(15, 21, 78, 0.03)'}} key={i}>{comment.body}</div>
            })}

            {thisProject.links.map((link, i) => {
              var imgCoord = this.refs.img.getBoundingClientRect()

              var x = link.coord.x * (imgCoord.width / link.coord.imgWidth) + imgCoord.left
              var y = link.coord.y * (imgCoord.height / link.coord.imgHeight) + imgCoord.top
              var width = link.coord.width * (imgCoord.width / link.coord.imgWidth)
              var height = link.coord.height * (imgCoord.height / link.coord.imgHeight)

              return <div
                onClick={() => {
                  var pathIdx = -1
                  listOfProjects.forEach((layout, i) => {
                    if (layout._id === link.targetId) {
                      pathIdx = i
                      return
                    }
                  })
                  var layout = listOfProjects[pathIdx]
                  var ext = layout.path.substring(layout.path.lastIndexOf(".") + 1)
                  var filename = layout.path.split(".").shift()
                  browserHistory.push(`/layout/${this.props.params.project}/${version}/${filename}/${ext}`)
                }}
                style={{position: 'absolute',
                  top: y,
                  left: x,
                  width: width,
                  height: height,
                  cursor: 'pointer',
                  opacity: 0.03,
                  backgroundColor: '#123'}} key={i}></div>
            })}
          </div>
        )}
      </div>
    )
  }
}

export default connect(state => ({
  state: state,
}))(Layout)
