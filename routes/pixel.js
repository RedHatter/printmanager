const Router = require('koa-router')
const fs = require('fs')
const path = require('path')

const { Pixel } = require('../schema')

const router = new Router()

router.get('/:pixel.png', async ctx => {
  let pixel = await Pixel.findById(ctx.params.pixel)
  pixel.viewed = new Date()
  await pixel.save()
  console.log(ctx.params)
  ctx.type = 'png'
  ctx.body = fs.createReadStream(path.join(__dirname, '../public/images/pxl.png'))
})

module.exports = router.routes()
