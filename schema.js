const mongoose = require('mongoose')
const Schema = mongoose.Schema
const enums = require('./enums.js')

mongoose.connect('mongodb://localhost/printmanager')
mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))

const Job = mongoose.model('Job', new Schema({
  created: { type: Date, default: Date.now },
  name: { type: String, required: true },
  // client: { type: ObjectId, ref: 'Client' },
  envelope: { type: String, required: true },
  size: { type: String, required: true },
  fold: {
    type: String,
    required: true,
    enum: enums.fold
  },
  addons: [ {
    type: String,
    enum: enums.addons
  } ],
  listType: {
    type: String,
    required: true,
    enum: enums.listType
  },
  // salesman: { type: ObjectId, ref: 'User' },
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
    required: true,
    match: /\+1[0-9]{10}/
  },
  artStatus: {
    type: Number,
    required: true,
    min: 1, max: 4
  },
  dropStatus: Date,
  completed: {
    postal: Boolean,
    prizeBoard: Boolean,
    dealerInvoice: Boolean,
    printerInvoice: Boolean
  }
}))

module.exports = { Job }
