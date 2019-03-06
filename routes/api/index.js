const { promisify } = require('util')
const Cognito = require('cognito-express')
const Amplify = require('aws-amplify').default
const Router = require('koa-router')
const path = require('path')
const AWS = require('aws-sdk')

const { Job, Pixel } = require('../../schema')

const cognitoExpress = new Cognito({
  region: 'us-west-2',
  cognitoUserPoolId: 'us-west-2_***REMOVED***',
  tokenUse: 'id'
})
const validate = promisify(cognitoExpress.validate).bind(cognitoExpress)

AWS.config.update({
  credentials: new AWS.Credentials({
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

router.use('/job', require(path.join(__dirname, 'job.js')))
router.use('/client', require(path.join(__dirname, 'client.js')))
router.use('/user', require(path.join(__dirname, 'user.js')))
router.use('/eblast', require(path.join(__dirname, 'eblast.js')))

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

  ctx.body = await ctx.sendMail({
    to: recipients,
    subject,
    html: `${message.replace(
      /\n/g,
      '<br>'
    )}<img src="https://printmanager.dealerdigitalgroup.com/pixel/${
      pixel.id
    }.png">`,
    attachments: attachments.map(path => ({
      path,
      filename: path.substring(path.lastIndexOf('/') + 1, path.lastIndexOf('?'))
    }))
  })
})

module.exports = router.routes()
