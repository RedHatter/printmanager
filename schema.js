const mongoose = require('mongoose')
const Schema = mongoose.Schema

mongoose.connect('mongodb://localhost/printmanager')
mongoose.connection
  .on('error', console.error.bind(console, 'connection error:'))

const Job = mongoose.model('Job', new Schema({
  created: { type: Date, default: Date.now },
  name: String,
  // client: { type: ObjectId, ref: 'Client' },
  envelope: { type: String, required: true },
  size: { type: String, required: true },
  fold: {
    type: String,
    required: true,
    enum: [ 'Half Fold', 'Tri Fold', 'Custom', 'No Fold' ]
  },
  addons: [ {
    type: String,
    enum: [
      "Scratcher", "Key", "Hologram Scratcher","KBB Append", "Handwriting",
      "4x6 Note", "Lamination", "Pull Tab", "Post-It-Note", "Bus. Card 1-sided",
      "BB Append", "Bus. Card 2-sided", "Credit Card", "Spanish", "Custom"
    ]
  } ],
  listType: {
    type: String,
    required: true,
    enum: [ 'Database', 'Saturation', 'Bankruptcy', 'Credit', 'Conquest' ]
  },
  // salesman: { type: ObjectId, ref: 'User' },
  postage: {
    type: String,
    required: true,
    enum: [
      'Indicia, Standard', 'Indicia, 1st Class',
      'Stamp, Standard', 'Stamp, 1st Class'
    ]
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
