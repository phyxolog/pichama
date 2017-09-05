var React = require('react');
var ReactDOM = require('react-dom');
var redux = require('react-redux');
var router = require('react-router');
var routes = require('routes');

var store = routes.getStore(window.__INITIAL_STATE__);

import 'styles/main'

ReactDOM.render(
  <redux.Provider store={store}>
    {routes.createRoutes(router.browserHistory, store)}
  </redux.Provider>,

  document.getElementById('app')
)
