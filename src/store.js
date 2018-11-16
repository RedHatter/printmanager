import { createStore, applyMiddleware } from 'redux'
import produce, { original } from "immer"
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

const reduce = produce((draft, action) => {
  if (action.error) {
    draft.errors.push(action.payload.message)
    return
  }

  switch (action.type) {
    case 'CLEAR_ERROR':
      draft.errors.shift()
      break

    case 'FETCH_JOBS':
      draft.jobs = action.payload
      break

    case 'FETCH_CLIENTS':
      draft.clients = action.payload
      break

    case 'FETCH_SALESMEN':
      draft.salesmen = action.payload
      break

    case 'FETCH_FILES':
      draft.files = action.payload
      break

    case 'FETCH_EBLASTS':
      draft.eblasts = action.payload
      break

    }
    case 'UPDATE_FILTER':
      Object.assign(draft.filter, action.payload)
      break
  }

  if (action.type == 'FETCH_JOBS' || action.type == 'FETCH_SALESMEN') {
    for (let job of draft.jobs) {
      if (job.salesman in draft.salesmen) {
        let salesman = draft.salesmen[job.salesman]
        salesman._id = job.salesman
        job.salesman = salesman
      }
    }
  }
}, initialState)

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
