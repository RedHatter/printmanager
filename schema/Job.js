const { Schema } = require('mongoose')
const ObjectId = Schema.Types.ObjectId
const { enums } = require('../utils.js')

module.exports = new Schema({
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
  jobType: {
    type: String,
    enum: enums.jobType,
    required: true
  },
  envelope: { type: String, required: true },
  size: { type: String, required: true },
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
  forceComplete: Boolean,
  pixels: [ {
    type: ObjectId,
    ref: 'Pixel'
  } ]
})
