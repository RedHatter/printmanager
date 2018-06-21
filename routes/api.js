const Router = require('koa-router')
const { Job, Client } = require('../schema')
const moment = require('moment')

const { mapObjectValues } = require('../utils.js')

const router = new Router()

router.post('/job', async ctx => {
  let model = ctx.request.body

  if (!model.name) {
    let n = await Job.count({
      client: model.client,
      created: {
        $gte: moment().startOf('month').toDate(),
        $lt: moment().endOf('month').toDate()
      }
    })

    let client = await Client.findById(model.client)

    model.name = `${client.acronym} ${moment().format('MMYY')}-${n + 1}`
  }

  model = mapObjectValues(model, val => val === '' ? undefined : val)

  let job = new Job(model)
  try {
    await job.save()
    ctx.status = 200
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

router.get('/job', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Job.find({}).populate('client').exec()
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
  await Job.findByIdAndDelete(ctx.params.id)
  ctx.socketIo.emit('invalidateJobs')
})

router.post('/client', async ctx => {
  try {
    let model = mapObjectValues(ctx.request.body, val => val === '' ? undefined : val)
    let client = new Client(model)
    await client.save()
    ctx.status = 200
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

module.exports = router.routes()
