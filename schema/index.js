const mongoose = require('mongoose')
const ClientSchema = require('./Client.js')
const JobSchema = require('./Job.js')
const PixelSchema = require('./Pixel.js')

mongoose.Promise = Promise
mongoose.connect('mongodb://localhost/printmanager', { useNewUrlParser: true })
mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))

module.exports = {
  Pixel: mongoose.model('Pixel', PixelSchema),
  Client: mongoose.model('Client', ClientSchema),
  Job: mongoose.model('Job', JobSchema)
}
