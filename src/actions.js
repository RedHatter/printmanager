import { CognitoIdentityServiceProvider } from 'aws-sdk'
import { Auth } from 'aws-amplify'

import { update, getStore } from './store.js'
import { parseJSON } from '../utils.js'

const cognito = new CognitoIdentityServiceProvider({
  region: 'us-west-2',
  accessKeyId: '***REMOVED***',
  secretAccessKey: '***REMOVED***'
})

async function api(url, error, { body, method }) {
  try {
    const request = {
      method: method || 'POST',
      headers: {
        Authorization: (await Auth.currentSession()).idToken.jwtToken
      }
    }

    if (body instanceof FormData) request.body = body
    else if (body) {
      request.body = JSON.stringify(body)
      request.headers['Content-Type'] = 'application/json'
    }

    let res = await fetch(url, request)

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

export async function createEblast(id, file) {
  const body = new FormData()
  body.append('file', file)

  return api(`/api/job/${id}/eblast`, 'Unable to create e-blast.', { body })
}

export function updateEblast(id, body) {
  return api(`/api/job/${id}/eblast`, 'Unable to update e-blast.', { body })
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
  return api('/api/send', 'Unable to send email.', { body })
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

export async function uploadFiles(id, files, type) {
  for (const file of files) {
    const body = new FormData()
    body.append('file', file)
    body.append('type', type)
    if (!(await api(`/api/job/${id}/file`, 'Unable to upload file.', { body })))
      return false
  }

  return fetchJobs()
}

export async function deleteFiles(id, files) {
  for (const file of files) {
    if (
      !(await api(`/api/job/${id}/file/${file._id}`, 'Unable to delete file.', {
        method: 'DELETE'
      }))
    )
      return false
  }

  return fetchJobs()
}
