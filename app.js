const Koa = require('koa')
const path = require('path')
const http = require('http')
const body = require('koa-body')
const serve = require('koa-static')
const Router = require('koa-router')
const session = require('koa-session')
const socketIo = require('socket.io')
const { promisify } = require('util')
const nodemailer = require('nodemailer')
const Cognito = require('cognito-express')

const cognitoExpress = new Cognito({
  region: 'us-west-2',
  cognitoUserPoolId: '***REMOVED***',
  tokenUse: 'access'
})
const validate = promisify(cognitoExpress.validate).bind(cognitoExpress)

const app = new Koa()
const router = new Router()

app.keys = ['d4c2b975-6876-4e04-9e41-dc8153bbade6']
app.context.mail = nodemailer.createTransport({
  host: 'mail.dealerdigitalgroup.com',
  port: 465,
  auth: {
    user: 'ericag@dealerdigitalgroup.com',
    pass: '?Sf=hzfhCu)(5#pCyH'
  },
  tls: {
    rejectUnauthorized: false
  }
})
app.context.sendMail = body =>
  new Promise((resolve, reject) =>
    app.context.mail.sendMail(body, (err, info) => {
      if (err) reject(err)
      else resolve(info)
    })
  )

async function secure(ctx, next) {
  try {
    ctx.state.user = await validate(ctx.cookies.get('AccessToken'))
    return next()
  } catch (err) {
    ctx.throw(403, err)
  }
}

router.use('/pixel', require(path.join(__dirname, 'routes', 'pixel.js')))
router.use('/api', secure)
router.use('/api', require(path.join(__dirname, 'routes', 'api/index.js')))

router.get('/bundle.js', secure)
router.get('/', async (ctx, next) => {
  const token = ctx.cookies.get('AccessToken')
  try {
    ctx.state.user = await validate(token)
    return next()
  } catch (err) {
    if (token) ctx.cookies.set('AccessToken')
    ctx.redirect('/login/')
  }
})

app
  .use(body({ multipart: true, formLimit: '5mb' }))
  // .use(session({ maxAge: 'session' }, app))
  .use(router.routes())
  .use(serve(path.join(__dirname, 'public')))

let connection = http.createServer(app.callback())
app.context.socketIo = socketIo(connection)
connection.listen(5348)
