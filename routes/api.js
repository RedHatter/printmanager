const Router = require('koa-router')
const { format, startOfMonth, endOfMonth } = require('date-fns')
const nodemailer = require('nodemailer')
const Cognito = require('cognito-express')
const Jimp = require('jimp')
const util = require('util')
const querystring = require('querystring')
const amplify = require('aws-amplify')
const Amplify = amplify.default
const Storage = amplify.Storage
const AWS = require('aws-sdk')

const { Job, Client, Pixel, Eblast } = require('../schema')
const { mapObjectValues } = require('../utils.js')

const cognitoExpress = new Cognito({
    region: 'us-west-2',
    cognitoUserPoolId: 'us-west-2_***REMOVED***',
    tokenUse: 'id'
})
const validate = util.promisify(cognitoExpress.validate).bind(cognitoExpress)

AWS.config.update({
  credentials: new AWS.Credentials ({
    accessKeyId: '***REMOVED***',
    secretAccessKey: '***REMOVED***'
  })
})

Amplify.configure({
  Storage: {
    region: 'us-west-1',
    bucket: 'dealerdigitalgroup.media'
  }
})

const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-west-2' })
const adminCreateUser = util.promisify(cognito.adminCreateUser).bind(cognito)
const adminAddUserToGroup = util.promisify(cognito.adminAddUserToGroup).bind(cognito)
const adminRemoveUserFromGroup = util.promisify(cognito.adminRemoveUserFromGroup).bind(cognito)
const adminResetUserPassword = util.promisify(cognito.adminResetUserPassword).bind(cognito)
const adminDeleteUser = util.promisify(cognito.adminDeleteUser).bind(cognito)

const router = new Router()

router.use(async (ctx, next) => {
  try {
    let response = await validate(ctx.headers.authorization)
    ctx.state.user = response
    return next()
  } catch (err) {
    ctx.throw(403, err)
  }
})

router.post('/job', async ctx => {
  let model = ctx.request.body

  let today = new Date ()
  if (!model.name) {
    let n = await Job.count({
      client: model.client,
      created: {
        $gte: startOfMonth(today),
        $lt: endOfMonth(today)
      }
    })

    let client = await Client.findById(model.client)

    let type = ''
    switch (model.jobType) {
      case 'Postcard':
        type = 'PCARD'
        break;
      case 'Tri-fold service':
        type = 'TFLD_SV'
        break;
      case 'Tri-fold offer sales':
        type = 'TFLD_OFR'
        break;
      case 'Invoice w/ voucher buy back':
        type = 'INV_VOU_BB'
        break;
      case 'Invoice w/ck':
        type = 'INV_CK'
        break;
      case 'Invoice bilingual w/voucher':
        type = 'INV_VOU_BI'
        break;
      case 'Email buy back':
        type = 'EML_BB'
        break;
      case 'Letter orignal':
        type = 'LTR_OG'
        break;
      case 'Letter w/voucher w/offers':
        type = 'LTR_VOU_OFR'
        break;
      case 'Letter certificate':
        type = 'LTR_CERT'
        break;
      case 'Letter tax double window bilingual':
        type = 'LTR_TX_DW_DI'
        break;
      case 'Letter w/offers buy back':
        type = 'LTR_OFR_BB'
        break;
      case 'Check stub w/voucher':
        type = 'CSTB_VOU'
        break;
      case 'Carbon':
        type = 'CARB'
        break;
      case 'Tax snap buy back':
        type = 'TSNAP_BB'
        break;
    }

    let list = ''
    switch (model.listType) {
      case 'Database':
        list = '_DB'
        break;
      case 'Saturation':
        list = '_SAT'
        break;
      case 'Bankruptcy':
        list = '_BK'
        break;
      case 'Prequalified':
        list = '_PRQ'
        break;
    }

    model.name = `${client.acronym} ${format(today, 'MMYY')}-${n + 1} ${type}${list}`
  }

  model = mapObjectValues(model, val => val === '' ? undefined : val)

  let job = new Job(model)
  try {
    await job.save()
    ctx.response.type = 'json'
    ctx.body = job
    ctx.socketIo.emit('invalidateJobs')
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

function escapeRegExp(str) {
  return str ? str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") : str
}

router.post('/job/search', async ctx => {
  let { search, artStatus, salesman, client, created } = ctx.request.body
  let regex = new RegExp(`.*${escapeRegExp(search)}.*`, 'i')

  ctx.response.type = 'json'
  ctx.body = await Job.find({
    ...search && { $or: [ { name: regex }, { comments: regex }, { vendor: regex } ] },
    ...artStatus && { artStatus },
    ...salesman && { salesman },
    ...client && { client },
    ...created && created.length > 0 && { created: {
      $gte: created[0],
      $lt: created[1]
    } }
  }).populate('client').populate('pixels').exec()
})

router.post('/job/:id', async ctx => {
  ctx.assert(ctx.request.body._id == ctx.params.id, 422, 'Model id must match update id.')

  try {
    let model = mapObjectValues(ctx.request.body, val => val === '' ? undefined : val)
    delete model._id
    let job = await Job.findByIdAndUpdate(ctx.params.id, model, { runValidators: true, new: true })
    ctx.response.type = 'json'
    ctx.body = job
    ctx.socketIo.emit('invalidateJobs')
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.delete('/job/:id', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Job.findByIdAndDelete(ctx.params.id)
  ctx.socketIo.emit('invalidateJobs')
})

router.post('/client', async ctx => {
  try {
    let model = mapObjectValues(ctx.request.body, val => val === '' ? undefined : val)
    let client = new Client(model)
    await client.save()
    ctx.response.type = 'json'
    ctx.body = client
    ctx.socketIo.emit('invalidateClients', await Client.find())
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.post('/client/:id', async ctx => {
  ctx.assert(ctx.request.body._id == ctx.params.id, 422, 'Model id must match update id.')

  try {
    let model = mapObjectValues(ctx.request.body, val => val === '' ? undefined : val)
    delete model._id
    let client = await Client.findByIdAndUpdate(ctx.params.id, model, { runValidators: true, new: true })
    ctx.response.type = 'json'
    ctx.body = client
    ctx.socketIo.emit('invalidateClients')
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.get('/client', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Client.find()
})

let mail = nodemailer.createTransport({
  host: 'mail.dealerdigitalgroup.com',
  port: 465,
  auth: {
    user: 'ericag@dealerdigitalgroup.com',
    pass: '?Sf=hzfhCu)(5#pCyH'
  }
}, {
  from: '"Erica Garcia" <ericag@dealerdigitalgroup.com>'
})

router.post('/user', async ctx => {
  const config = ctx.request.body

  const user = await adminCreateUser({
    UserPoolId: 'us-west-2_***REMOVED***',
    Username: config.email,
    DesiredDeliveryMediums: [ 'EMAIL' ],
    ForceAliasCreation: false,
    UserAttributes: [
      {
        Name: 'email',
        Value: config.email
      },
      {
        Name: 'name',
        Value: config.name
      },
      {
        Name: 'email_verified',
        Value: 'true'
      }
    ]
  })

  if (config.admin) {
    adminAddUserToGroup({
      GroupName: 'Admin',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: user.User.Username
    })
  }

  if (config.salesmen) {
    adminAddUserToGroup({
      GroupName: 'Salesmen',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: user.User.Username
    })
  }

  ctx.body = user.User
})

router.post('/user/:id', async ctx => {
  const config = ctx.request.body

  if (config.admin) {
    adminAddUserToGroup({
      GroupName: 'Admin',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: config.id
    })
  } else {
    adminRemoveUserFromGroup({
      GroupName: 'Admin',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: config.id
    })
  }

  if (config.salesmen) {
    adminAddUserToGroup({
      GroupName: 'Salesmen',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: config.id
    })
  } else {
    adminRemoveUserFromGroup({
      GroupName: 'Salesmen',
      UserPoolId: 'us-west-2_***REMOVED***',
      Username: config.id
    })
  }
})

router.delete('/user/:id', async ctx => {
  adminDeleteUser({
    UserPoolId: 'us-west-2_***REMOVED***',
    Username: ctx.params.id
  })
  ctx.status = 200
})

router.get('/user/:id/reset', async ctx => {
  ctx.body = await adminResetUserPassword({
    UserPoolId: 'us-west-2_***REMOVED***',
    Username: ctx.params.id
  })
  console.log('test', ctx.body)
})

router.post('/send', async ctx => {
  let { recipients, attachments, subject, message, jobId } = ctx.request.body
  ctx.assert(recipients && recipients.length > 0, 422, 'Missing recipients.')
  ctx.assert(subject, 422, 'Missing subject.')
  ctx.assert(message, 422, 'Missing message.')

  let pixel = new Pixel()
  await pixel.save()

  let job = await Job.findById(jobId)
  job.pixels.push(pixel)
  await job.save()

  ctx.body = await new Promise((resolve, reject) =>
    mail.sendMail({
        to: recipients, subject,
        html: `${message.replace(/\n/g, '<br>')}<img src="https://printmanager.dealerdigitalgroup.com/pixel/${pixel._id}.png">`,
        attachments: attachments.map(path => ({
          path, filename: path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('?'))
        }))
    }, (err, info) => {
      if (err) reject(err)
      else resolve(info)
    })
  )
})

router.post('/eblast', async ctx => {
  let model = ctx.request.body
  if (!model.rows) {
    model.rows = [{
      y: 0,
      height: 100,
      cells: [{
        x: 0,
        width: 100,
        url: '',
        utmContent: '',
        alt: ''
      }]
    }]
  }

  let eblast = new Eblast(model)
  try {
    await eblast.save()
    ctx.response.type = 'json'
    ctx.body = eblast

    ctx.socketIo.emit('invalidateEblasts', await Eblast.find())
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.get('/eblast', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Eblast.find()
})

router.delete('/eblast/:id', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Eblast.findByIdAndDelete(ctx.params.id)
  ctx.socketIo.emit('invalidateEblasts')
})

router.post('/eblast/:id', async ctx => {
  const { id } = ctx.params
  const model = ctx.request.body
  ctx.assert(model._id == id, 422, 'Model id must match update id.')

  try {
    delete model._id
    let eblast = await Eblast.findByIdAndUpdate(id, model, { runValidators: true, new: true })
    ctx.response.type = 'json'
    ctx.body = eblast
    ctx.socketIo.emit('invalidateEblasts')
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.get('/eblast/:id/download', async ctx => {
  const model = await Eblast.findById(ctx.params.id)
  const image = await Jimp.read(model.image)
  const { width, height } = image.bitmap
  let html = `<!doctype html><html lang="en"><head><title>${model.name}</title><style>img { vertical-align: top; }</style></head><body><table cellspacing="0" cellpadding="0">`
  let i = 1
  for (const row of model.rows) {
    html += '<tr><td style="font-size: 0px;">'
    for (const cell of row.cells) {
      const section = await image.clone()
      await section.crop(
        cell.x * width / 100,
        row.y * height / 100,
        cell.width * width / 100,
        row.height * height / 100
      )
      const buffer = await section.getBufferAsync('image/png')

      const path = model.image.substring(
        'https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/'.length,
        model.image.lastIndexOf('.')
      ) + `_${i++}.png`
      await Storage.put(path, buffer, { contentType: 'image/png' })

      const utm = {
        utm_source: model.utmSource,
        utm_medium: 'email',
        utm_campaign: model.name,
      }

      let alt = ''

      if (cell.alt) {
        utm.utm_content = cell.alt
        alt = ` alt="${alt}"`
      }

      if (cell.url) {
        const url = `${cell.url}?${querystring.stringify(utm)}`
        html += `<a href="${url}"><img src="https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/${path}"${alt}></a>`
      } else {
        html += `<img src="https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/${path}"${alt}>`
      }
    }
    html += '</td></tr>'
  }
  html += '</table></body></html>'

  ctx.attachment('eblast.html')
  ctx.body = html
})


module.exports = router.routes()
