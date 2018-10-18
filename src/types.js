import fromSchema from 'prop-types-from-mongoose'

import JobSchema from '../schema/Job.js'
import ClientSchema from '../schema/Client.js'

export const
  JobType = fromSchema({
    obj: Object.assign({}, JobSchema.obj, {
      salesman: {
        email: {
          type: String,
          required: true,
          match: /^.+@.+\..+$/
        },
        name: { type: String, required: true },
        phoneNumber: {
          type: String,
          required: true,
          match: /^\+\d{11}$/
        }
      }
    })
  }, { Client: ClientSchema }),
  ClientType = fromSchema(ClientSchema)