import { createStore } from 'redux'
import io from 'socket.io-client'
import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { Storage } from 'aws-amplify'

import { parseJSON } from '../utils.js'

const initialState = {
  jobs: [],
  clients: [],
  salesmen: {},
  files: {},
  filter: { created: [ ] }
}

function reduce(state = initialState, action) {
  switch (action.type) {
    case 'REPLACE_JOBS':
      state = Object.assign({}, state, { jobs: action.data })
      break
    case 'REPLACE_CLIENTS':
      state = Object.assign({}, state, { clients: action.data })
      break
    case 'REPLACE_SALESMEN':
      state = Object.assign({}, state, { salesmen: action.data })
      break
    case 'REPLACE_FILES':
      state = Object.assign({}, state, { files: action.data })
      break
    case 'FETCH_FILES':
      fetchFiles()
      break
    case 'DELETE_FILES':
      Promise
        .all(action.data.map(key => Storage.remove(key)))
        .then(fetchFiles)
      break
    case 'UPDATE_FILTER':
      state = Object.assign({}, state, {
        filter: Object.assign({}, state.filter, action.data)
      })
      fetchJobs(state.filter)
      break
  }

  return state
}

const store = createStore(reduce)

export default store

async function fetchJobs (filter) {
  let res = await fetch('/api/job/search', {
    method: 'POST',
    body: JSON.stringify(filter),
    headers: {
      'Content-Type': 'application/json',
    }
  })
  let data = parseJSON(await res.text())
  store.dispatch({ type: 'REPLACE_JOBS', data })
}

fetchJobs(store.filter)

async function fetchFiles () {
  let res = await Storage.list('')
  let data = res.reduce((files, file) => {
    let parts = file.key.split('/')
    if (!files[parts[0]]) files[parts[0]] = {}
    if (!files[parts[0]][parts[1]]) files[parts[0]][parts[1]] = []

    files[parts[0]][parts[1]].push({
      key: file.key,
      name: decodeURIComponent(parts[2])
    })

    return files
  }, {})

  store.dispatch({ type: 'REPLACE_FILES', data })
}

async function fetchClients () {
  let res = await fetch('/api/client')
  let data = parseJSON(await res.text())
  store.dispatch({ type: 'REPLACE_CLIENTS', data })
}

fetchClients()

const socket = io()
socket.on('invalidateJobs', fetchJobs)
socket.on('invalidateClients', fetchClients)

// Retrieve salesmen from cognito
const cognito = new CognitoIdentityServiceProvider({
  region: 'us-west-2',
  accessKeyId: 'AKIAIRGJBHTLFGNYSQVA',
  secretAccessKey: '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'
})
cognito.listUsersInGroup({
  GroupName: 'Salesmen',
  UserPoolId: 'us-west-2_dQ6iTiYI4'
}, (err, res) => {
  if (err) {
    console.error(err)
    return
  }

  let data = {}
  for (let user of res.Users) {
    let salesman = {}

    for (let attr of user.Attributes) {
      switch (attr.Name) {
        case 'email':
          salesman.email = attr.Value
          break
        case 'given_name':
          salesman.name = attr.Value
          break
        case 'phone_number':
          salesman.phoneNumber = attr.Value
      }
    }

    data[user.Username] = salesman
  }

  store.dispatch({ type: 'REPLACE_SALESMEN', data })
  fetchFiles()
})
