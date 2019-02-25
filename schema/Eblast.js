const { Schema } = require('mongoose')

module.exports = new Schema({
  name: { type: String, required: true },
  utmSource: String,
  image: {
    type: String,
    required: true,
    match: /https:\/\/s3-us-west-1\.amazonaws\.com\/dealerdigitalgroup\.media\/public\/.+/
  },
  rows: [
    {
      y: { type: Number, min: 0, required: true },
      height: { type: Number, min: 0, required: true },
      cells: [
        {
          x: { type: Number, min: 0, required: true },
          width: { type: Number, min: 0, required: true },
          url: String,
          alt: String
        }
      ]
    }
  ],
  created: { type: Date, default: Date.now }
})
