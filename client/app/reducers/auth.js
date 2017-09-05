"use strict"

import { assign } from 'lodash'

export default function(state = {}, action) {
  switch (action.type) {
    case 'AUTH_SET_KEY_VALUE':
      return assign({}, state, {[action.key]: action.value})
    default:
      return state
  }
}
