import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { Auth, Storage } from 'aws-amplify'

import store from './store.js'
import { parseJSON } from '../utils.js'

const cognito = new CognitoIdentityServiceProvider({
  region: 'us-west-2',
  accessKeyId: 'AKIAIRGJBHTLFGNYSQVA',
  secretAccessKey: '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'
})

async function createApiAction (type, url, error, { body, method }) {
  try {
    let res = await fetch(url, {
      method: method || 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        Authorization: (await Auth.currentSession()).idToken.jwtToken
      }
    })

    if (!res.ok) throw new Error(`Error code ${res.status}.`)

    return { type, payload: parseJSON(await res.text()) }
  } catch (err) {
    return {
      type,
      payload: new Error(`${error} ${err.message || err}`),
      error: true
    }
  }
}

export async function fetchJobs () {
  return createApiAction ('FETCH_JOBS', '/api/job/search', 'Unable to retrieve jobs.', { body: store.getState().filter })
}

export async function updateJob (body) {
  return createApiAction ('UPDATE_JOB', '/api/job/' + (body._id || ''), 'Unable to update job.', { body })
}

export async function deleteJob (id) {
  let action = await createApiAction ('DELETE_JOB', '/api/job/' + id, 'Unable to delete job.', { method: 'DELETE' })
  if (action.error) return action

  return fetchJobs()
}

export async function send (body) {
  return createApiAction ('SEND', '/api/send', 'Unable to send email.', { body })
}

export async function fetchClients () {
  return createApiAction('FETCH_CLIENTS', '/api/client', 'Unable to retrieve clients.', { method: 'GET' })
}

export async function updateClient (body) {
  return createApiAction('UPDATE_CLIENT', '/api/client/' + (body._id || ''), 'Unable to update client.', { body })
}

export async function fetchFiles () {
  try {
    let res = await Storage.list('')
    let payload = res.reduce((files, file) => {
      let parts = file.key.split('/')
      if (!files[parts[0]]) files[parts[0]] = {}
      if (!files[parts[0]][parts[1]]) files[parts[0]][parts[1]] = []

      files[parts[0]][parts[1]].push({
        key: file.key,
        name: decodeURIComponent(parts[2])
      })

      return files
    }, {})
    return { type: 'FETCH_FILES', payload }
  } catch (err) {
    return {
      type: 'FETCH_FILES',
      payload: new Error('Unable to fetch files. ' + (err.message || err)),
      error: true
    }
  }
}

export function uploadFiles (files, path) {
  return Promise.all(Array.from(files).map(file =>
      Storage.put(`${path}/${encodeURIComponent(file.name)}`, file, { contentType: file.type })
    ))
    .then(fetchFiles)
    .catch(err => ({
      type: 'UPLOAD_FILES',
      payload: new Error('Unable to upload file. ' + (err.message || err)),
      error: true
    }))
}

export function deleteFiles (files) {
  return Promise.all(files.map(key => Storage.remove(key)))
    .then(fetchFiles)
    .catch(err => ({
      type: 'DELETE_FILES',
      payload: new Error('Unable to delete file. ' + (err.message || err)),
      error: true
    }))
}

export function fetchSalesmen () {
  return (new Promise((resolve, reject) =>
    cognito.listUsersInGroup({
      GroupName: 'Salesmen',
      UserPoolId: 'us-west-2_dQ6iTiYI4'
    }, (err, res) => {
      if (err) return reject({
        type: 'FETCH_SALESMEN',
        payload: err,
        error: true
      })

      let payload = {}
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

        payload[user.Username] = salesman
      }

      resolve({ type: 'FETCH_SALESMEN', payload })
    })
  )).catch(err => ({
    type: 'FETCH_SALESMEN',
    payload: new Error('Unable to retrieve salesmen. ' + (err.message || err)),
    error: true
  }))
}

export function updateFilter (payload) {
  return { type: 'UPDATE_FILTER', payload }
}

export function clearError () {
  return { type: 'CLEAR_ERROR' }
}
