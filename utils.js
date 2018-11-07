const { format } = require('date-fns')

const enums = {
  jobType: [ 'Postcard', 'Tri-fold service', 'Tri-fold offer sales',
   'Invoice w/ voucher buy back', 'Invoice w/ck', 'Invoice bilingual w/voucher',
   'Email buy back', 'Letter orignal', 'Letter w/voucher w/offers',
   'Letter certificate', 'Letter tax double window bilingual',
   'Letter w/offers buy back', 'Check stub w/voucher', 'Carbon',
   'Tax snap buy back' ],
  addons: [
    "Scratcher", "Key", "Hologram Scratcher","KBB Append", "Handwriting",
    "4x6 Note", "Lamination", "Pull Tab", "Post-It-Note", "Bus. Card 1-sided",
    "BB Append", "Bus. Card 2-sided", "Credit Card", "Spanish", "Custom"
  ],
  listType: [ 'Database', 'Saturation', 'Bankruptcy', 'Prequalified' ],
  postage: [
    'Indicia, Standard', 'Indicia, 1st Class',
    'Stamp, Standard', 'Stamp, 1st Class'
  ],
  envelope: [
    'None', '#10', '#10 Windowed', '#10 Full-Windowed',
    '6 x 9', '6 x 9 Windowed', '6 x 9 Double-Windowed'
  ],
  size: [
    '8.5 x 11',
    '8.5 x 14',
    '9 x 7',
    '11 x 15',
    '11 x 17'
  ],
  artStatus: [ 'In Progress', 'Needs Revisions', 'Sent to Client', 'Approved' ],
  eventTypes: [ 'created', 'changed' ]
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
  return format(date, 'MM/DD/YYYY')
}

const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/

function parseJSON (json) {
  return JSON.parse(json, (property, value) =>
    typeof value == 'string' && dateRegex.test(value) ? new Date(value) : value)
}

function clone (obj) {
  return parseJSON(JSON.stringify(obj))
}

function mapObjectValues(obj, func) {
  return Object.entries(obj).reduce((o, [ key, value ]) => (o[key] = func(value), o), {})
}

function range(start, end) {
    var total = [];

    if (!end) {
        end = start;
        start = 0;
    }

    for (var i = start; i < end; i += 1) {
        total.push(i);
    }

    return total;
}

module.exports = { enums, colorize, formatNumber, formatPhone, formatDate, parseJSON, clone, mapObjectValues, range }
