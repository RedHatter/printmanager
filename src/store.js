import { Atom, swap, deref, useAtom } from '@dbeining/react-atom'
import { subDays, endOfDay } from 'date-fns'
import produce, { original } from 'immer'
import io from 'socket.io-client'

import { fetchJobs, fetchClients, fetchUsers } from './actions.js'

export const store = Atom.of({
  jobs: [],
  clients: [],
  users: [],
  filter: {
    created: [subDays(new Date(), 30), endOfDay(new Date())],
    dueDate: [],
    skip: 0,
    limit: 50
  },
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
socket.on('invalidateUsers', fetchUsers)
