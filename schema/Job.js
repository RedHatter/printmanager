const { Schema } = require('mongoose')
const ObjectId = Schema.Types.ObjectId
const xss = require('xss')

const users = require('./users.js')
const { enums } = require('../utils.js')

const whiteList = { ...xss.whiteList, span: ['style'] }

const userType = {
  type: String,
  required: true,
  match: /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/,
  set: o => (typeof o === 'object' ? o.id : o),
  get: value => users.value.find(o => o.id == value)
}

const CommentSchema = new Schema(
  {
    user: userType,
    html: {
      type: String,
      set: v => xss(v, { whiteList })
    }
  },
  {
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true }
  }
)

CommentSchema.virtual('created').get(function() {
  return this._id.getTimestamp()
})

module.exports = new Schema(
  {
    type: { type: String, enum: ['Print', 'Digital'], required: true },
    created: { type: Date, default: Date.now },
    name: {
      type: String,
      required: true,
      match: /^[A-Z]{3,5} \d{4}-\d+/
    },
    client: {
      type: ObjectId,
      ref: 'Client',
      autopopulate: true,
      required: true
    },
    jobType: {
      type: String,
      enum: enums.jobType,
      required: true
    },
    size: { type: String, required: true },
    salesman: userType,
    assignee: userType,
    dueDate: { type: Date, required: true },
    dropDate: { type: Date, required: true },
    secondDropDate: { type: Date },
    expire: { type: Date, required: true },
    trackingNumber: {
      type: String,
      // required: true,
      match: /^[0-9]{10}$/
    },
    details: { type: String },
    artStatus: {
      type: String,
      required: true,
      enum: enums.artStatus
    },
    completed: Date,
    forceComplete: Boolean,
    pixels: [
      {
        type: ObjectId,
        ref: 'Pixel',
        autopopulate: true
      }
    ],
    versionComment: String,
    priority: {
      type: Number,
      min: 1,
      max: 3,
      default: 1
    },
    comments: [CommentSchema],

    listType: {
      type: String,
      enum: enums.listType
    },
    envelope: { type: String },
    addons: [
      {
        type: String,
        enum: enums.addons,
        default: []
      }
    ],
    postage: {
      type: String,
      enum: enums.postage
    },
    quantity: { type: Number, min: 0 },
    printDate: { type: Date },
    vendor: { type: String },
    dropStatus: Date
  },
  {
    toObject: { getters: true },
    toJSON: { getters: true }
  }
)
