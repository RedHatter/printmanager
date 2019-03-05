const { Schema } = require('mongoose')

module.exports = new Schema(
  {
    viewed: Date,
    created: { type: Date, default: Date.now }
  },
  {
    toObject: { virtuals: true, getters: true },
    toJSON: { virtuals: true, getters: true }
  }
)
