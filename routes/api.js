const Router = require('koa-router')
const { Job } = require('../schema.js')
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

module.exports = router.routes()
