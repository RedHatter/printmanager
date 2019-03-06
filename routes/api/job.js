const Router = require('koa-router')
const { format, startOfMonth, endOfMonth } = require('date-fns')
const { Job, Client } = require('../../schema')
const { mapObjectValues } = require('../../utils.js')

const router = new Router()

function notifiyAssignee(ctx, job) {
  return ctx.sendMail({
    to: job.assignee.email,
    subject: job.name,
    html: `The job <i>${job.name}</i> has been assigned to you.<br><br>
<a href="http://printmanager.dealerdigitalgroup.com/?${
      job.id
    }">View in PrintManager</a>`
  })
}

router.post('/', async ctx => {
  let model = ctx.request.body

  let today = new Date()
  if (!model.name) {
    let n = await Job.count({
      client: model.client,
      created: {
        $gte: startOfMonth(today),
        $lt: endOfMonth(today)
      }
    })

    let client = await Client.findById(model.client)

    let type = ''
    switch (model.jobType) {
      case 'Postcard':
        type = 'PCARD'
        break
      case 'Tri-fold service':
        type = 'TFLD_SV'
        break
      case 'Tri-fold offer sales':
        type = 'TFLD_OFR'
        break
      case 'Invoice w/ voucher buy back':
        type = 'INV_VOU_BB'
        break
      case 'Invoice w/ck':
        type = 'INV_CK'
        break
      case 'Invoice bilingual w/voucher':
        type = 'INV_VOU_BI'
        break
      case 'Email buy back':
        type = 'EML_BB'
        break
      case 'Letter orignal':
        type = 'LTR_OG'
        break
      case 'Letter w/voucher w/offers':
        type = 'LTR_VOU_OFR'
        break
      case 'Letter certificate':
        type = 'LTR_CERT'
        break
      case 'Letter tax double window bilingual':
        type = 'LTR_TX_DW_DI'
        break
      case 'Letter w/offers buy back':
        type = 'LTR_OFR_BB'
        break
      case 'Check stub w/voucher':
        type = 'CSTB_VOU'
        break
      case 'Carbon':
        type = 'CARB'
        break
      case 'Tax snap buy back':
        type = 'TSNAP_BB'
        break
    }

    let list = ''
    switch (model.listType) {
      case 'Database':
        list = '_DB'
        break
      case 'Saturation':
        list = '_SAT'
        break
      case 'Bankruptcy':
        list = '_BK'
        break
      case 'Prequalified':
        list = '_PRQ'
        break
    }

    model.name = `${client.acronym} ${format(today, 'MMyy')}-${n +
      1} ${type}${list}`
  }

  model = mapObjectValues(model, val => (val === '' ? undefined : val))

  let job = new Job(model)
  try {
    await job.save()
    ctx.response.type = 'json'
    ctx.body = job
    ctx.socketIo.emit('invalidateJobs')
    await notifiyAssignee(ctx, job)
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

function escapeRegExp(str) {
  return str ? str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') : str
}

router.post('/search', async ctx => {
  let { type, search, assignee, client, created, dueDate } = ctx.request.body
  let regex = new RegExp(`.*${escapeRegExp(search)}.*`, 'i')

  ctx.response.type = 'json'
  ctx.body = await Job.find({
    ...(type && { type }),
    ...(search && {
      $or: [
        { name: regex },
        { details: regex },
        { vendor: regex },
        { jobType: regex },
        {
          comments: {
            $elemMatch: {
              html: regex
            }
          }
        }
      ]
    }),
    ...(assignee && { assignee }),
    ...(client && { client }),
    ...(created &&
      created.length > 0 && {
        created: {
          $gte: created[0],
          $lt: created[1]
        }
      }),
    ...(dueDate &&
      dueDate.length > 0 && {
        dueDate: {
          $gte: dueDate[0],
          $lt: dueDate[1]
        }
      })
  })
})

router.get('/:id', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Job.findById(ctx.params.id)
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
    delete model._id
    delete model.id
    if (!model.completed && model.artStatus == 'Complete')
      model.completed = new Date()

    const job = await Job.findById(ctx.params.id)
    const assigned = job.assignee.id != model.assignee
    await job.set(model)
    await job.save()

    ctx.response.type = 'json'
    ctx.body = job
    ctx.socketIo.emit('invalidateJobs')
    if (assigned) await notifiyAssignee(ctx, job)
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.post('/:id/comments', async ctx => {
  try {
    const comment = ctx.request.body
    const to = comment.notify
    delete comment.notify
    const job = await Job.findById(ctx.params.id)
    if (!job.comments) job.comments = []

    job.comments.push(comment)
    await job.save()

    ctx.response.type = 'json'
    ctx.body = job
    ctx.socketIo.emit('invalidateJobs')

    await ctx.sendMail({
      to,
      subject: job.name,
      html: `A new comment has been posted to <i>${job.name}</i>
<blockquote>${comment.html}</blockquote>
<a href="http://printmanager.dealerdigitalgroup.com/?${
        job.id
      }">View in PrintManager</a>`
    })
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.get('/:ref/patches', async ctx => {
  ctx.response.type = 'json'
  ctx.body = (await Job.Patches.find({ ref: ctx.params.ref })).reverse()
})

router.get('/:ref/patches/:id', async ctx => {
  ctx.response.type = 'json'
  let doc = await Job.findById(ctx.params.ref)
  ctx.body = await doc.rollback(ctx.params.id, {}, false)
})

router.delete('/:id', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Job.findByIdAndDelete(ctx.params.id)
  ctx.socketIo.emit('invalidateJobs')
})

module.exports = router.routes()
