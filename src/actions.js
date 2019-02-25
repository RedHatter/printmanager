import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { Auth, Storage } from 'aws-amplify'

import store from './store.js'
import { parseJSON } from '../utils.js'

const cognito = new CognitoIdentityServiceProvider({
  region: 'us-west-2',
  accessKeyId: '***REMOVED***',
  secretAccessKey: '***REMOVED***'
})

async function createApiAction(type, url, error, { body, method }) {
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

export async function createEblast(file) {
  let path = encodeURIComponent(file.name.replace(/ /g, '_'))
  Storage.put(path, file, {
    contentType: file.type,
    bucket: 'dealerdigitalgroup.media'
  }).catch(err => ({
    type: 'CREATE_EBLAST',
    payload: new Error('Unable to upload e-blast. ' + (err.message || err)),
    error: true
  }))

  return createApiAction(
    'CREATE_EBLAST',
    '/api/eblast',
    'Unable to create e-blast.',
    {
      body: {
        name: file.name.substring(0, file.name.lastIndexOf('.')),
        image:
          'https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/' +
          path
      }
    }
  )
}

export async function updateEblast(body) {
  return createApiAction(
    'UPDATE_EBLAST',
    '/api/eblast/' + body._id,
    'Unable to update e-blasts.',
    { body }
  )
}

export async function deleteEblast(id) {
  return createApiAction(
    'DELETE_EBLAST',
    '/api/eblast/' + id,
    'Unable to delete e-blast.',
    { method: 'DELETE' }
  )
}

export async function fetchEblasts() {
  return createApiAction(
    'FETCH_EBLASTS',
    '/api/eblast',
    'Unable to retrieve e-blasts.',
    { method: 'GET' }
  )
}

export async function fetchJobs() {
  return createApiAction(
    'FETCH_JOBS',
    '/api/job/search',
    'Unable to retrieve jobs.',
    { body: store.getState().filter }
  )
}

export async function updateJob(body) {
  return createApiAction(
    'UPDATE_JOB',
    '/api/job/' + (body._id || ''),
    'Unable to update job.',
    { body }
  )
}

export async function deleteJob(id) {
  let action = await createApiAction(
    'DELETE_JOB',
    '/api/job/' + id,
    'Unable to delete job.',
    { method: 'DELETE' }
  )
  if (action.error) return action

  return fetchJobs()
}

export async function deleteUser(body) {
  let action = await createApiAction(
    'DELETE_USER',
    '/api/user/' + body.id,
    'Unable to create user.',
    { method: 'DELETE' }
  )
  if (action.error) return action

  return fetchUsers()
}

export async function createUser(body) {
  let action = await createApiAction(
    'CREATE_USER',
    '/api/user/',
    'Unable to create user.',
    { method: 'POST', body }
  )
  if (action.error) return action

  return fetchUsers()
}

export async function editUser(body) {
  let action = await createApiAction(
    'EDIT_USER',
    '/api/user/' + body.id,
    'Unable to create user.',
    { method: 'POST', body }
  )
  if (action.error) return action

  return fetchUsers()
}

export async function resetUserPassword(body) {
  return createApiAction(
    'RESET_USER_PASSWORD',
    `/api/user/${body.id}/reset`,
    'Unable to reset user password.',
    { method: 'GET' }
  )
}

export async function send(body) {
  try {
    if (body.attachments) {
      body.attachments = await Promise.all(
        body.attachments.map(key => Storage.get(key))
      )
    }

    return createApiAction('SEND', '/api/send', 'Unable to send email.', {
      body
    })
  } catch (err) {
    return {
      type: 'SEND',
      payload: new Error(
        'Unable to resolve attachment URLs. ' + (err.message || err)
      ),
      error: true
    }
  }
}

export async function fetchClients() {
  return createApiAction(
    'FETCH_CLIENTS',
    '/api/client',
    'Unable to retrieve clients.',
    { method: 'GET' }
  )
}

export async function updateClient(body) {
  return createApiAction(
    'UPDATE_CLIENT',
    '/api/client/' + (body._id || ''),
    'Unable to update client.',
    { body }
  )
}

export async function fetchFiles() {
  try {
    let res = await Storage.list('')
    let payload = res.reduce((files, file) => {
      let parts = file.key.split('/')
      files[parts[0]] ||= {}
      files[parts[0]][parts[1]] ||= []
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

export function uploadFiles(files, path) {
  return Promise.all(
    Array.from(files).map(file =>
      Storage.put(`${path}/${encodeURIComponent(file.name)}`, file, {
        contentType: file.type
      })
    )
  )
    .then(fetchFiles)
    .catch(err => ({
      type: 'UPLOAD_FILES',
      payload: new Error('Unable to upload file. ' + (err.message || err)),
      error: true
    }))
}

export function deleteFiles(files) {
  return Promise.all(files.map(key => Storage.remove(key)))
    .then(fetchFiles)
    .catch(err => ({
      type: 'DELETE_FILES',
      payload: new Error('Unable to delete file. ' + (err.message || err)),
      error: true
    }))
}

export function fetchSalesmen() {
  return new Promise((resolve, reject) =>
    cognito.listUsersInGroup(
      {
        GroupName: 'Salesmen',
        UserPoolId: 'us-west-2_***REMOVED***'
      },
      (err, res) => {
        if (err)
          return reject({
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
              case 'name':
                salesman.name = attr.Value
                break
              case 'phone_number':
                salesman.phoneNumber = attr.Value
            }
          }

          payload[user.Username] = salesman
        }

        resolve({ type: 'FETCH_SALESMEN', payload })
      }
    )
  ).catch(err => ({
    type: 'FETCH_SALESMEN',
    payload: new Error('Unable to retrieve salesmen. ' + (err.message || err)),
    error: true
  }))
}

export async function fetchUsers() {
  try {
    const users = await new Promise((resolve, reject) =>
      cognito.listUsers(
        {
          UserPoolId: 'us-west-2_***REMOVED***'
        },
        (err, res) => {
          if (err) reject(err)
          else resolve(res.Users)
        }
      )
    )

    const salesmen = (await new Promise((resolve, reject) =>
      cognito.listUsersInGroup(
        {
          GroupName: 'Salesmen',
          UserPoolId: 'us-west-2_***REMOVED***'
        },
        (err, res) => {
          if (err) reject(err)
          else resolve(res.Users)
          // else resolve(res.Users.map(user => user.Attributes.find(attr => attr.name == )))
        }
      )
    )).map(o => o.Username)

    const admins = (await new Promise((resolve, reject) =>
      cognito.listUsersInGroup(
        {
          GroupName: 'Admin',
          UserPoolId: 'us-west-2_***REMOVED***'
        },
        (err, res) => {
          if (err) reject(err)
          else resolve(res.Users)
        }
      )
    )).map(o => o.Username)

    let payload = {}
    for (let user of users) {
      let obj = {}

      for (let attr of user.Attributes) {
        switch (attr.Name) {
          case 'email':
            obj.email = attr.Value
            break
          case 'name':
            obj.name = attr.Value
            break
          case 'phone_number':
            obj.phoneNumber = attr.Value
        }
      }

      obj.salesmen = salesmen.includes(user.Username)
      obj.admin = admins.includes(user.Username)
      obj.id = user.Username

      payload[user.Username] = obj
    }

    return { type: 'FETCH_USERS', payload }
  } catch (err) {
    return {
      type: 'FETCH_USERS',
      payload: new Error(
        'Unable to retrieve salesmen. ' + (err.message || err)
      ),
      error: true
    }
  }
}

export function updateFilter(payload) {
  return { type: 'UPDATE_FILTER', payload }
}

export function clearError() {
  return { type: 'CLEAR_ERROR' }
}
