const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const { enums } = require('./utils.js')

mongoose.connect('mongodb://localhost/printmanager')
mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))

const Client = mongoose.model('Client', new Schema({
  name: { type: String, required: true },
  acronym: {
    type: String,
    required: true,
    match: /^[A-Z]{3,5}$/
  },
  address: { type: String, required: true },
  contact: {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: /^.+@.+\..+$/
    },
    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    }
  },
  trackingNumbers: {
    database: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    },
    saturation: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    },
    bankruptcy: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    },
    credit: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    },
    conquest: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/
    }
  }
}))

const Job = mongoose.model('Job', new Schema({
  created: { type: Date, default: Date.now },
  name: {
    type: String,
    required: true,
    match: /^[A-Z]{3,5} \d{4}-\d+/
  },
  client: {
    type: ObjectId,
    ref: 'Client',
    required: true
  },
  envelope: { type: String, required: true },
  size: { type: String, required: true },
  fold: {
    type: String,
    required: true,
    enum: enums.fold
  },
  addons: [ {
    type: String,
    enum: enums.addons,
    default: []
  } ],
  listType: {
    type: String,
    required: true,
    enum: enums.listType
  },
  salesman: { type: String, required: true },
  postage: {
    type: String,
    required: true,
    enum: enums.postage
  },
  quantity: { type: Number, required: true, min: 0 },
  dropDate: { type: Date, required: true },
  printDate: { type: Date, required: true },
  expire: { type: Date, required: true },
  vendor: { type: String, required: true },
  trackingNumber: {
    type: String,
    // required: true,
    match: /^[0-9]{10}$/
  },
  comments: { type: String },
  artStatus: {
    type: String,
    required: true,
    enum: enums.artStatus
  },
  dropStatus: Date,
  completed: {
    postal: Boolean,
    prizeBoard: Boolean,
    dealerInvoice: Boolean,
    printerInvoice: Boolean
  }
}))

module.exports = { Job, Client }
