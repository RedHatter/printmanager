import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { Auth, Storage } from 'aws-amplify'

import { update, getStore } from './store.js'
import { parseJSON } from '../utils.js'

const cognito = new CognitoIdentityServiceProvider({
  region: 'us-west-2',
  accessKeyId: '***REMOVED***',
  secretAccessKey: '***REMOVED***'
})

async function api(url, error, { body, method }) {
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

    return parseJSON(await res.text())
  } catch (err) {
    return showError(error, err)
  }
}

export function updateFilter(payload) {
  return update(state => {
    Object.assign(state.filter, payload)
  })
}

export function clearError() {
  return update(state => {
    state.errors.shift()
  })
}

async function showError(message, err) {
  update(state => {
    state.errors.push(new Error(`${message} ${err.message || err}`))
  })
  return false
}

export async function createEblast(file) {
  let path = encodeURIComponent(file.name.replace(/ /g, '_'))
  Storage.put(path, file, {
    contentType: file.type,
    bucket: 'dealerdigitalgroup.media'
  }).catch(err => showError('Unable to upload e-blast.', err))

  return api('/api/eblast', 'Unable to create e-blast.', {
    body: {
      name: file.name.substring(0, file.name.lastIndexOf('.')),
      image:
        'https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/' +
        path
    }
  })
}

export function updateEblast(body) {
  return api('/api/eblast/' + body.id, 'Unable to update e-blasts.', { body })
}

export function deleteEblast(id) {
  return api('/api/eblast/' + id, 'Unable to delete e-blast.', {
    method: 'DELETE'
  })
}

export async function fetchEblasts() {
  const eblasts = await api('/api/eblast', 'Unable to retrieve e-blasts.', {
    method: 'GET'
  })
  if (eblasts === false) return false

  return update(state => {
    state.eblasts = eblasts
  })
}

export async function fetchJobs() {
  const jobs = await api('/api/job/search', 'Unable to retrieve jobs.', {
    body: getStore().filter
  })
  if (jobs === false) return false

  return update(state => {
    state.jobs = jobs
  })
}

export function updateJob(body) {
  return api('/api/job/' + (body.id || ''), 'Unable to update job.', { body })
}

export function addComment(body, id) {
  return api(`/api/job/${id}/comments`, 'Unable to comment on job.', { body })
}

export function deleteComment(job, comment) {
  return api(
    `/api/job/${job}/comments/${comment}`,
    'Unable to comment on job.',
    { method: 'DELETE' }
  )
}

export function deleteJob(id) {
  return api('/api/job/' + id, 'Unable to delete job.', { method: 'DELETE' })
}

export function deleteUser(id) {
  return api('/api/user/' + id, 'Unable to create user.', {
    method: 'DELETE'
  })
}

export async function fetchUsers() {
  const users = await api('/api/user', 'Unable to fetch users', {
    method: 'GET'
  })
  if (users === false) return false

  return update(state => {
    state.users = users
  })
}

export function createUser(body) {
  return api('/api/user/', 'Unable to create user.', { method: 'POST', body })
}

export function editUser(body) {
  return api('/api/user/' + body.id, 'Unable to create user.', {
    method: 'POST',
    body
  })
}

export function resetUserPassword(body) {
  return api(`/api/user/${body.id}/reset`, 'Unable to reset user password.', {
    method: 'GET'
  })
}

export async function send(body) {
  try {
    if (body.attachments) {
      body.attachments = await Promise.all(
        body.attachments.map(key => Storage.get(key))
      )
    }

    return api('/api/send', 'Unable to send email.', { body })
  } catch (err) {
    return showError('Unable to resolve attachment URLs.', err)
  }
}

export async function fetchClients() {
  const clients = await api('/api/client', 'Unable to retrieve clients.', {
    method: 'GET'
  })
  if (clients === false) return false

  return update(state => {
    state.clients = clients
  })
}

export function deleteClient(id) {
  return api('/api/client/' + id, 'Unable to delete client.', {
    method: 'DELETE'
  })
}

export function updateOrCreateClient(body) {
  return api('/api/client/' + (body.id || ''), 'Unable to update client.', {
    body
  })
}

export async function fetchFiles() {
  try {
    const res = await Storage.list('')
    return update(state => {
      state.files = res.reduce((files, file) => {
        let parts = file.key.split('/')
        files[parts[0]] ||= {}
        files[parts[0]][parts[1]] ||= []
        files[parts[0]][parts[1]].push({
          key: file.key,
          name: decodeURIComponent(parts[2])
        })

        return files
      }, {})
    })
  } catch (err) {
    return showError('Unable to fetch files.', err.message)
  }
}

export async function uploadFiles(files, path) {
  try {
    await Promise.all(
      Array.from(files).map(file =>
        Storage.put(`${path}/${encodeURIComponent(file.name)}`, file, {
          contentType: file.type
        })
      )
    )
    return fetchFiles()
  } catch (err) {
    return showError('Unable to upload file.', err)
  }
}

export async function deleteFiles(files) {
  try {
    await Promise.all(files.map(key => Storage.remove(key)))
    return fetchFiles()
  } catch (err) {
    return showError('Unable to delete file.', err)
  }
}
