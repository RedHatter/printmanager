const mongoose = require('mongoose')
const ClientSchema = require('./Client.js')
const JobSchema = require('./Job.js')

mongoose.Promise = Promise
mongoose.connect('mongodb://localhost/printmanager')
mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))

module.exports = {
  Client: mongoose.model('Client', ClientSchema),
  Job: mongoose.model('Job', JobSchema)
}
