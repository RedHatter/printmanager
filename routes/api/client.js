const Router = require('koa-router')
const { Client } = require('../../schema')
const { mapObjectValues } = require('../../utils.js')

const router = new Router()

router.post('/', async ctx => {
  try {
    let model = mapObjectValues(ctx.request.body, val =>
      val === '' ? undefined : val
    )
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

router.post('/:id', async ctx => {
  ctx.assert(
    ctx.request.body.id == ctx.params.id,
    422,
    'Model id must match update id.'
  )

  try {
    let model = mapObjectValues(ctx.request.body, val =>
      val === '' ? undefined : val
    )
    delete model.id
    delete model._id
    let client = await Client.findByIdAndUpdate(ctx.params.id, model, {
      runValidators: true,
      new: true
    })
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

router.delete('/:id', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Client.findByIdAndDelete(ctx.params.id)
  ctx.socketIo.emit('invalidateClients')
})

router.get('/', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Client.find()
})

module.exports = router.routes()
