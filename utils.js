const { format, formatRelative } = require('date-fns')

const enums = {
  jobType: {
    print: [
      'Postcard',
      'Tri-fold service',
      'Tri-fold offer sales',
      'Invoice w/ voucher buy back',
      'Invoice w/ck',
      'Invoice bilingual w/voucher',
      'Email buy back',
      'Letter orignal',
      'Letter w/voucher w/offers',
      'Letter certificate',
      'Letter tax double window bilingual',
      'Letter w/offers buy back',
      'Check stub w/voucher',
      'Carbon',
      'Tax snap buy back'
    ],
    digital: [
      'Website Sliders',
      'Google Banner',
      'Email Blast',
      'Service',
      'Facebook',
      'Instagram',
      'Billboards',
      'Service Slide',
      'Service Coupon'
    ]
  },
  addons: [
    'Scratcher',
    'Key',
    'Hologram Scratcher',
    'KBB Append',
    'Handwriting',
    '4x6 Note',
    'Lamination',
    'Pull Tab',
    'Post-It-Note',
    'Bus. Card 1-sided',
    'BB Append',
    'Bus. Card 2-sided',
    'Credit Card',
    'Spanish',
    'Custom'
  ],
  listType: ['Database', 'Saturation', 'Bankruptcy', 'Prequalified'],
  postage: [
    'Indicia, Standard',
    'Indicia, 1st Class',
    'Stamp, Standard',
    'Stamp, 1st Class'
  ],
  envelope: [
    'None',
    '#10',
    '#10 Windowed',
    '#10 Full-Windowed',
    '6 x 9',
    '6 x 9 Windowed',
    '6 x 9 Double-Windowed'
  ],
  size: {
    print: ['8.5 x 11', '8.5 x 14', '9 x 7', '11 x 15', '11 x 17'],
    digital: [
      '1920 x 1080',
      '1920 x 850',
      '1920 x 650',
      '1920 x 300',
      '1600 x 514',
      '1080 x 1350',
      '575 x 375',
      '464 x 240',
      '336 x 280',
      '320 x 100',
      '300 x 250',
      '160 x 600'
    ]
  },
  artStatus: [
    'Unassigned',
    'Info Needed',
    'In Progress',
    'Art Review',
    'Needs Changes',
    'Art Approved',
    'Client Review',
    'Client Approved',
    'Compliance Review',
    'Compliance Approved',
    'Approved to Post',
    'Printer Proof',
    'Complete'
  ],
  eventTypes: ['created', 'changed']
}

enums.jobType.all = [...enums.jobType.print, ...enums.jobType.digital]

function colorize(status) {
  switch (status) {
    case 'List Uploaded':
    case 'List Pending':
    default:
      return 'green'
    case 'Count Pending':
      return 'yellow'
    case 'Incomplete':
      return 'red'
    case 'In Progress':
      return undefined
  }
}

function formatNumber(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatPhone(phone) {
  return phone
    ? `+1 (${phone.substring(0, 3)}) ${phone.substring(3, 6)} ${phone.substring(
        6
      )}`
    : ''
}

function formatDate(date) {
  return format(date, 'MM/dd/yyyy')
}

function formatDateTime(date) {
  return formatRelative(date, new Date())
}

const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/

function parseJSON(json) {
  return JSON.parse(json, (property, value) =>
    typeof value == 'string' && dateRegex.test(value) ? new Date(value) : value
  )
}

function clone(obj) {
  return parseJSON(JSON.stringify(obj))
}

function mapObjectValues(obj, func) {
  return Object.entries(obj).reduce(
    (o, [key, value]) => ((o[key] = func(value)), o),
    {}
  )
}

function range(start, end) {
  var total = []

  if (!end) {
    end = start
    start = 0
  }

  for (var i = start; i < end; i += 1) {
    total.push(i)
  }

  return total
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function deepmerge(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepmerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepmerge(target, ...sources)
}

/**
 * Returns a function, that, when invoked, will only be triggered at most once
 * during a given window of time. Normally, the throttled function will run
 * as much as it can, without ever going more than once per `wait` duration;
 * but if you'd like to disable the execution on the leading edge, pass
 *`{leading: false}`. To disable execution on the trailing edge, ditto.
 */
function throttle(func, wait, options) {
  var timeout, context, args, result
  var previous = 0
  if (!options) options = {}

  var later = function() {
    previous = options.leading === false ? 0 : Date.now
    timeout = null
    result = func.apply(context, args)
    if (!timeout) context = args = null
  }

  var throttled = function() {
    var now = Date.now
    if (!previous && options.leading === false) previous = now
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      if (!timeout) context = args = null
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
    return result
  }

  throttled.cancel = function() {
    clearTimeout(timeout)
    previous = 0
    timeout = context = args = null
  }

  return throttled
}

function ensureArray (value) {
  return Array.isArray(value) ? value : [value]
}

function basename (file) {
  return decodeURIComponent(file.substring(file.lastIndexOf('/') + 1))
}

module.exports = {
  enums,
  colorize,
  formatNumber,
  formatPhone,
  formatDate,
  formatDateTime,
  parseJSON,
  clone,
  mapObjectValues,
  range,
  isObject,
  deepmerge,
  throttle,
  ensureArray,
  basename
}
