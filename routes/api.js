const Router = require('koa-router')
const { Job, Client } = require('../schema.js')
const moment = require('moment')

const router = new Router()

router.post('/job', async ctx => {
  let model = ctx.request.body

  if (!model.name) {
    let monthStart = moment('1', 'D').toDate()
    let monthEnd = moment(monthStart).endOf('month').toDate()

    let n = await Job.count({
      // client: data.client
      dropDate: { $gte: monthStart, $lt: monthEnd }
    })

    model.name = `${moment().format('MMYY')}-${n + 1}`
  }

  let job = new Job(model)
  try {
    await job.save()
    ctx.status = 200
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
  ctx.body = await Job.find({})
})

router.post('/job/:id', async ctx => {
  ctx.assert(ctx.request.body._id == ctx.params.id, 422, 'Model id must match update id.')

  try {
    delete ctx.request.body._id
    let job = await Job.findByIdAndUpdate(ctx.params.id, ctx.request.body, { runValidators: true, new: true })
    ctx.response.type = 'json'
    ctx.body = job
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.post('/client', async ctx => {
  try {
    let client = new Client(ctx.request.body)
    await client.save()
    ctx.status = 200
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
    delete ctx.request.body._id
    let client = await Client.findByIdAndUpdate(ctx.params.id, ctx.request.body, { runValidators: true, new: true })
    ctx.response.type = 'json'
    ctx.body = client
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
