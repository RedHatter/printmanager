const { Schema } = require('mongoose')

module.exports = new Schema({
  viewed: Date,
  created: { type: Date, default: Date.now }
})
