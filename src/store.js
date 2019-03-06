import { Atom, swap, deref, useAtom } from '@dbeining/react-atom'
import produce, { original } from 'immer'
import io from 'socket.io-client'

import { fetchJobs, fetchClients, fetchEblasts, fetchUsers } from './actions.js'

export const store = Atom.of({
  jobs: [],
  clients: [],
  users: [],
  files: {},
  filter: { created: [], dueDate: [] },
  eblasts: [],
  errors: []
})

export function update(fn) {
  swap(store, produce(fn))
  return true
}

export function useStore() {
  return useAtom(store)
}

export function getStore() {
  return deref(store)
}

const socket = io()
socket.on('invalidateJobs', fetchJobs)
socket.on('invalidateClients', fetchClients)
socket.on('invalidateEblasts', fetchEblasts)
socket.on('invalidateUsers', fetchUsers)
