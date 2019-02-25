const patchHistory = require('mongoose-patch-history').default
const mongoose = require('mongoose')
const ClientSchema = require('./Client.js')
const JobSchema = require('./Job.js')
const PixelSchema = require('./Pixel.js')
const EblastSchema = require('./Eblast.js')

mongoose.Promise = Promise
mongoose.connect('mongodb://localhost/printmanager', { useNewUrlParser: true })
mongoose.connection.on(
  'error',
  console.error.bind(console, 'connection error:')
)

JobSchema.plugin(patchHistory, {
  mongoose,
  name: 'jobs_h',
  exclude: ['/versionComment'],
  includes: {
    versionComment: String
  }
})

module.exports = {
  Pixel: mongoose.model('Pixel', PixelSchema),
  Client: mongoose.model('Client', ClientSchema),
  Job: mongoose.model('Job', JobSchema),
  Eblast: mongoose.model('Eblast', EblastSchema)
}
