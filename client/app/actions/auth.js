"use strict"

export function authChangeState(key, value) {
  return (dispatch, getState) => {
    dispatch({type: 'AUTH_SET_KEY_VALUE', key, value})
  }
}
