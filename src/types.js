import fromSchema from 'prop-types-from-mongoose'

import JobSchema from '../schema/Job.js'
import ClientSchema from '../schema/Client.js'

export const
  JobType = fromSchema(JobSchema, { Client: ClientSchema }),
  ClientType = fromSchema(ClientSchema)
