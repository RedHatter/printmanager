const fs = require('fs').promises
const path = require('path')
const { S3 } = require('aws-sdk')
const Router = require('koa-router')
const { format, startOfMonth, endOfMonth } = require('date-fns')
const { Job, Client } = require('../../../schema')
const { transformValue } = require('../../../utils.js')

const s3 = new S3({
  region: 'us-west-1',
  credentials: {
    accessKeyId: '***REMOVED***',
    secretAccessKey: '***REMOVED***'
  }
})

const router = new Router()
router.use(require(path.join(__dirname, 'comment.js')))
router.use(require(path.join(__dirname, 'eblast.js')))
router.use(require(path.join(__dirname, 'file.js')))
router.use(require(path.join(__dirname, 'patch.js')))

async function notifiyAssignee(ctx, job, oldAssignee) {
  const user = ctx.state.user

  if (job.assignee && user['cognito:username'] != job.assignee.id)
    await ctx.sendMail({
      from: `"${user.name} (Workflow)" <ericag@dealerdigitalgroup.com>`,
      to: job.assignee.email,
      subject: job.name + ' assigned to you',
      html: `The job <i>${job.name}</i> has been assigned to you by ${
        user.name
      }.<br><br>
<a href="http://workflow.dealerdigitalgroup.com/?${
        job.id
      }">View in #Workflow</a>`
    })

  if (oldAssignee && user['cognito:username'] != oldAssignee.id)
    await ctx.sendMail({
      from: `"${user.name} (Workflow)" <ericag@dealerdigitalgroup.com>`,
      to: oldAssignee.email,
      subject: job.name + ' assigned to you',
      html: `You have been remove from the job <i>${job.name}</i> by ${
        user.name
      }.<br><br>
<a href="http://workflow.dealerdigitalgroup.com/?${
        job.id
      }">View in #Workflow</a>`
    })
}

router.post('/', async ctx => {
  let model = ctx.request.body

  const created = model.created ? new Date(model.created) : new Date()
  if (!model.name) {
    let n = await Job.count({
      client: model.client,
      created: {
        $gte: startOfMonth(created),
        $lt: endOfMonth(created)
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

      // Digital
      case 'Website Sliders':
        type = 'SLD'
        break
      case 'Google Banner':
        type = 'GB'
        break
      case 'Email Blast':
        type = 'Eblast'
        break
      case 'Service':
        type = 'SVC'
        break
      case 'Facebook':
        type = 'FB'
        break
      case 'Instagram':
        type = 'IG'
        break
      case 'Lease / Purchase':
        type = 'LP'
        break
      case 'Billboards':
        type = 'Billboards'
        break
      case 'Service Slide':
        type = 'SLD_SVC'
        break
      case 'Service Coupon':
        type = 'SVC_COUPON'
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

    model.name = `${client.acronym} ${format(created, 'MMyy')}-${n +
      1} ${type}${list}`
  }

  model = transformValue(model, val =>
    val === '' || val === null ? undefined : val
  )

  const notify = model.notify
  delete model.notify
  const job = new Job(model)

  if (notify) {
    await Promise.all(
      notify.map(user =>
        ctx.sendMail({
          from: `"${
            ctx.state.user.name
          } (Workflow)" <ericag@dealerdigitalgroup.com>`,
          to: user.email,
          subject: 'New job ' + job.name,
          html: `${ctx.state.user.name} has added a new job <i>${
            job.name
          }</i> to Workflow.<br><br>
<a href="http://workflow.dealerdigitalgroup.com/?${
            job.id
          }">View in #Workflow</a>`
        })
      )
    )
  }

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
  let {
    type,
    search,
    assignee,
    client,
    created,
    dueDate,
    skip,
    limit
  } = ctx.request.body
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
        { artStatus: regex },
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
    .skip(skip)
    .limit(limit)
    .sort({ name: -1 })
    .exec()
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
    let model = transformValue(ctx.request.body, val =>
      val === '' ? undefined : val
    )
    delete model._id
    delete model.id
    if (!model.completed && model.artStatus == 'Complete')
      model.completed = new Date()

    const job = await Job.findById(ctx.params.id)
    const oldAssignee = job.assignee
    await job.set(model)
    await job.save()

    ctx.response.type = 'json'
    ctx.body = job
    ctx.socketIo.emit('invalidateJobs')
    if (!(oldAssignee && job.assignee && oldAssignee.id == job.assignee.id))
      await notifiyAssignee(ctx, job, oldAssignee)
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
  const files = await s3.listObjectsV2({ Prefix: ctx.params.id, Bucket: 'dealerdigitalgroup.printmanager' }).promise()
  await s3.deleteObjects({ Delete: { Objects: files.Contents.map(o => ({ Key: o.Key })) }, Bucket: 'dealerdigitalgroup.printmanager' }).promise()

  const job = await Job.findByIdAndRemove(ctx.params.id)
  if (job.eblast.image) {
    const name = job.eblast.image.substring(
      'https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/'
        .length,
      job.eblast.image.lastIndexOf('.')
    )
    const files = await s3.listObjectsV2({ Prefix: name, Bucket: 'dealerdigitalgroup.media' }).promise()
    await s3.deleteObjects({ Delete: { Objects: files.Contents.map(o => ({ Key: o.Key })) }, Bucket: 'dealerdigitalgroup.media' }).promise()
  }

  ctx.response.type = 'json'
  ctx.body = job
  ctx.socketIo.emit('invalidateJobs')
})

module.exports = router.routes()
