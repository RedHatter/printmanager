const Router = require('koa-router')
const { format, startOfMonth, endOfMonth } = require('date-fns')
const nodemailer = require('nodemailer')
const Cognito = require('cognito-express')
const util = require('util')

const { Job, Client, Pixel } = require('../schema')
const { mapObjectValues } = require('../utils.js')

const cognito = new Cognito({
    region: 'us-west-2',
    cognitoUserPoolId: 'us-west-2_dQ6iTiYI4',
    tokenUse: 'id'
})

const validate = util.promisify(cognito.validate).bind(cognito)

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

    model.name = `${client.acronym} ${format(today, 'MMYY')}-${n + 1}`
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
  ctx.body = await Client.find({})
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

module.exports = router.routes()
