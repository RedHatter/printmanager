const Koa = require('koa')
const path = require('path')
const http = require('http')
const body = require('koa-body')
const serve = require('koa-static')
const Router = require('koa-router')
const session = require('koa-session')
const socketIo = require('socket.io')

const app = new Koa()
const router = new Router()

app.keys = ['d4c2b975-6876-4e04-9e41-dc8153bbade6']

router.use('/api', require(path.join(__dirname, 'routes', 'api.js')))

app
  .use(body())
  .use(session({ maxAge: 'session' }, app))
  .use(router.routes())
  .use(serve(path.join(__dirname, 'public')))

let connection = http.createServer(app.callback())
app.context.socketIo = socketIo(connection)
connection.listen(3000)
