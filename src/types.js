import fromSchema from 'prop-types-from-mongoose'

import JobSchema from '../schema/Job.js'
import ClientSchema from '../schema/Client.js'
import PixelSchema from '../schema/Pixel.js'
import EblastSchema from '../schema/Eblast.js'

export const JobType = fromSchema(
    {
      obj: Object.assign({}, JobSchema.obj, {
        salesman: {
          email: {
            type: String,
            required: true,
            match: /^.+@.+\..+$/
          },
          name: { type: String, required: true }
        },
        assignee: {
          email: {
            type: String,
            required: true,
            match: /^.+@.+\..+$/
          },
          name: { type: String, required: true }
        }
      })
    },
    {
      Client: ClientSchema,
      Pixel: PixelSchema
    }
  ),
  ClientType = fromSchema(ClientSchema),
  EblastType = fromSchema(EblastSchema)
