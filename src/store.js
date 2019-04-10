import { Atom, swap, deref, useAtom } from '@dbeining/react-atom'
import { subDays, endOfDay } from 'date-fns'
import produce from 'immer'
import jwtDecode from 'jwt-decode'
import Cookies from 'js-cookie'

const cognitoUser = jwtDecode(Cookies.get('AccessToken'))

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
  errors: [],
  user: {
    id: cognitoUser.username,
    isAdmin: cognitoUser['cognito:groups'].includes('Admin'),
    isSalesman: cognitoUser['cognito:groups'].includes('Salesmen')
  }
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
