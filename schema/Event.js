const { Schema } = require('mongoose')
const { emus } = reqiure('../util.js')

module.exports = new Schema({
  type: {
    type: String,
    enum: enums.addons,
    require: true
  }
  created: { type: Date, default: Date.now },
})
