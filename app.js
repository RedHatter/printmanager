const Koa = require('koa')
const path = require('path')
const http = require('http')
const AWS = require('aws-sdk')
const body = require('koa-body')
const serve = require('koa-static')
const Router = require('koa-router')
const session = require('koa-session')
const socketIo = require('socket.io')
const nodemailer = require('nodemailer')
const Amplify = require('aws-amplify').default

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

const app = new Koa()
const router = new Router()

app.keys = ['d4c2b975-6876-4e04-9e41-dc8153bbade6']
app.context.mail = nodemailer.createTransport(
  {
    host: 'mail.dealerdigitalgroup.com',
    port: 465,
    auth: {
      user: 'ericag@dealerdigitalgroup.com',
      pass: '?Sf=hzfhCu)(5#pCyH'
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  {
    from: '"Erica Garcia" <ericag@dealerdigitalgroup.com>'
  }
)
app.context.sendMail = body =>
  new Promise((resolve, reject) =>
    app.context.mail.sendMail(body, (err, info) => {
      if (err) reject(err)
      else resolve(info)
    })
  )

router.use('/api', require(path.join(__dirname, 'routes', 'api/index.js')))
router.use('/pixel', require(path.join(__dirname, 'routes', 'pixel.js')))

app
  .use(body())
  .use(session({ maxAge: 'session' }, app))
  .use(router.routes())
  .use(serve(path.join(__dirname, 'public')))

let connection = http.createServer(app.callback())
app.context.socketIo = socketIo(connection)
connection.listen(5348)
