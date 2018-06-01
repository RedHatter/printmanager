const { Schema } = require('mongoose')

module.exports = new Schema({
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
})
