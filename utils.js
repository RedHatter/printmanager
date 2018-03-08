const moment = require('moment')

const enums = {
  fold: [ 'Half Fold', 'Tri Fold', 'Custom', 'No Fold' ],
  addons: [
    "Scratcher", "Key", "Hologram Scratcher","KBB Append", "Handwriting",
    "4x6 Note", "Lamination", "Pull Tab", "Post-It-Note", "Bus. Card 1-sided",
    "BB Append", "Bus. Card 2-sided", "Credit Card", "Spanish", "Custom"
  ],
  listType: [ 'Database', 'Saturation', 'Bankruptcy', 'Credit', 'Conquest' ],
  postage: [
    'Indicia, Standard', 'Indicia, 1st Class',
    'Stamp, Standard', 'Stamp, 1st Class'
  ],
  envelope: [
    'None', '#10', '#10 Windowed', '#10 Full-Windowed',
    '6 x 9', '6 x 9 Windowed', '6 x 9 Double-Windowed'
  ],
  size: [
    '4 x 6', '5 x 7', '5.5 x 11', '8.5 x 11', '8.5 x 14',
    '11 x 15', '11 x 17', '19 x 27', '21 x 34', 'Double 21 x 34',
    '8.5 x 11 Snap Pack', '8.5 x 11 Windowed Snap Pack',
    '8 Page 11 x 17 Magazine', '8 Page 11 x 17 Newsprint', 'Die Cut'
  ],
  artStatus: [ 'In Progress', 'Needs Revisions', 'Sent to Client', 'Approved' ]
}

function colorize (status) {
  switch(status) {
    case 'Approved':
    case 'List Uploaded':
    case 'List Pending':
    default:
      return 'green'
    case 'Sent to Client':
    case 'Count Pending':
      return 'yellow'
    case 'Needs Revisions':
    case 'Incomplete':
      return 'red'
    case 'In Progress':
      return undefined
  }
}

function formatNumber (number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatPhone (phone) {
  return phone ? `+1 (${phone.substring(0, 3)}) ${phone.substring(3, 6)} ${phone.substring(6)}` : ''
}

function formatDate (date) {
  return moment(date).format('MM/DD/YYYY')
}

module.exports = { enums, colorize, formatNumber, formatPhone, formatDate }
