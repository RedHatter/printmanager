import { createStore, applyMiddleware } from 'redux'
import io from 'socket.io-client'

import { fetchJobs, fetchClients } from './actions.js'

const initialState = {
  jobs: [],
  clients: [],
  salesmen: {},
  files: {},
  filter: { created: [ ] },
  errors: []
}

function reduce(state = initialState, action) {
  if (action.error) {
    return Object.assign({}, state, { errors: state.errors.concat(action.payload.message) })
  }

  switch (action.type) {
    case 'CLEAR_ERROR':
      let errors = JSON.parse(JSON.stringify(state.errors))
      errors.shift()
      state = Object.assign({}, state, { errors })
      break
    case 'FETCH_JOBS':
      state = Object.assign({}, state, { jobs: action.payload })
      break
    case 'FETCH_CLIENTS':
      state = Object.assign({}, state, { clients: action.payload })
      break
    case 'FETCH_SALESMEN':
      state = Object.assign({}, state, { salesmen: action.payload })
      break
    case 'FETCH_FILES':
      state = Object.assign({}, state, { files: action.payload })
      break
    case 'UPDATE_FILTER':
      state = Object.assign({}, state, {
        filter: Object.assign({}, state.filter, action.payload)
      })
      break
  }

  if (action.type == 'FETCH_JOBS' || action.type == 'FETCH_SALESMEN') {
    let jobs = state.jobs.map(job => {
      if (job.salesman in state.salesmen) {
        let salesman = state.salesmen[job.salesman]
        salesman._id = job.salesman
        job.salesman = salesman
      }

      return job
    })
    state = Object.assign({}, state, { jobs })
  }

  return state
}

function resolve ({ dispatch }) {
  return next => action =>
    action && typeof action.then === 'function'
      ? action.then(dispatch, dispatch)
      : Promise.resolve(next(action))
}

const store = createStore(reduce, applyMiddleware(resolve))

export default store

const socket = io()
socket.on('invalidateJobs', () => store.dispatch(fetchJobs()))
socket.on('invalidateClients', () => store.dispatch(fetchClients()))
