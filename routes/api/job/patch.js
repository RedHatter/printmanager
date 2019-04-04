const Router = require('koa-router')
const { Job } = require('../../../schema')

const router = new Router()

router.get('/:ref/patch', async ctx => {
  ctx.response.type = 'json'
  ctx.body = (await Job.Patches.find({ ref: ctx.params.ref })).reverse()
})

router.get('/:ref/patch/:id', async ctx => {
  ctx.response.type = 'json'
  let doc = await Job.findById(ctx.params.ref)
  ctx.body = await doc.rollback(ctx.params.id, {}, false)
})

module.exports = router.routes()
