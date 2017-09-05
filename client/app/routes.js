import React from 'react'
import thunk from 'redux-thunk'
import { Router, Route, IndexRoute } from 'react-router'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import authReducer from 'reducers/auth'

import App from './App.jsx'
import Index from 'views/Index/Index.jsx'
import Login from 'views/Login/Index.jsx'
import Project from 'views/Project/Index.jsx'
import Path from 'views/Path/Index.jsx'
import Layout from 'views/Layout/Index.jsx'

var initialState = {
  auth: {
    userRole: undefined,
    isAuth: false
  }
}
export {initialState}

export function getStore(state = initialState) {
  return createStore(
    combineReducers({
      routing: routerReducer,
      auth: authReducer
    }),
    state,
    applyMiddleware(thunk)
  )
}

export function createRoutes(history, store) {
  if (store) {
    history = syncHistoryWithStore(history, store)
  }

  var onUpdate = () => {
    window.scrollTo(0, 0)
  }

  return (
    <Router history={history} onUpdate={onUpdate}>
      <Route path='/login' component={Login} />
      <Route component={App}>
        <Route path='/' component={Index} />
        <Route path='/project/:id' component={Project} />
        <Route path='/project/path/edit/:id' component={Path} />
        <Route path='/layout/:project/:version/:path/:ext' component={Layout} />
      </Route>
    </Router>
  )
}
