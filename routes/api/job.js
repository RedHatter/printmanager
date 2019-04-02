const fs = require('fs').promises
const Router = require('koa-router')
const Jimp = require('jimp')
const Storage = require('aws-amplify').Storage
const querystring = require('querystring')
const { format, startOfMonth, endOfMonth } = require('date-fns')
const { Job, Client } = require('../../schema')
const { mapObjectValues } = require('../../utils.js')

const router = new Router()

async function notifiyAssignee(ctx, job, oldAssignee) {
  const user = ctx.state.user

  if (job.assignee && user['cognito:username'] != job.assignee.id)
    await ctx.sendMail({
      to: job.assignee.email,
      subject: job.name,
      html: `The job <i>${job.name}</i> has been assigned to you by ${
        user.name
      }.<br><br>
<a href="http://workflow.dealerdigitalgroup.com/?${
        job.id
      }">View in #Workflow</a>`
    })

  if (oldAssignee && user['cognito:username'] != oldAssignee.id)
    await ctx.sendMail({
      to: oldAssignee.email,
      subject: job.name,
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

    model.name = `${client.acronym} ${format(today, 'MMyy')}-${n +
      1} ${type}${list}`
  }

  model = mapObjectValues(model, val =>
    val === '' || val === null ? undefined : val
  )

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
    let model = mapObjectValues(ctx.request.body, val =>
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

    if (to.length > 0) {
      await ctx.sendMail({
        to,
        subject: job.name,
        html: `A new comment has been posted to <i>${job.name}</i>
<blockquote>${comment.html}</blockquote>
<a href="http://workflow.dealerdigitalgroup.com/?${
          job.id
        }">View in #Workflow</a>`
      })
    }
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.delete('/:ref/comments/:id', async ctx => {
  const job = await Job.findById(ctx.params.ref)
  job.comments.splice(job.comments.findIndex(o => o._id == ctx.params.id), 1)
  await job.save()
  ctx.socketIo.emit('invalidateJobs')
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
  const files = await Storage.list(ctx.params.id, {
    bucket: 'dealerdigitalgroup.printmanager'
  })
  await Promise.all(files.map(o => Storage.remove(o.key, {
    bucket: 'dealerdigitalgroup.printmanager'
  })))

  const job = await Job.findByIdAndRemove(ctx.params.id)
  if (job.eblast.image) {
    const name = job.eblast.image.substring(
      'https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/'
        .length,
      job.eblast.image.lastIndexOf('.')
    )
    const allFiles = await Storage.list('')
    await Promise.all(
      allFiles
        .filter(o => o.key.startsWith(name))
        .map(o => Storage.remove(o.key))
    )
  }

  ctx.response.type = 'json'
  ctx.body = job
  ctx.socketIo.emit('invalidateJobs')
})

router.get('/:id/eblast', async ctx => {
  const job = await Job.findById(ctx.params.id)
  ctx.assert(job && job.eblast, 404)

  const model = job.eblast
  const image = await Jimp.read(model.image)
  const { width, height } = image.bitmap
  let html = `<!doctype html><html lang="en"><head><title>${
    job.name
  }</title><style>img { vertical-align: top; }</style></head><body><table cellspacing="0" cellpadding="0">`
  let i = 1
  for (const row of model.rows) {
    html += '<tr><td style="font-size: 0px;">'
    for (const cell of row.cells) {
      const section = await image.clone()
      await section.crop(
        (cell.x * width) / 100,
        (row.y * height) / 100,
        (cell.width * width) / 100,
        (row.height * height) / 100
      )
      const buffer = await section.getBufferAsync('image/png')

      const path =
        model.image.substring(
          'https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/'
            .length,
          model.image.lastIndexOf('.')
        ) + `_${i++}.png`
      await Storage.put(path, buffer, { contentType: 'image/png' })

      const utm = {
        utm_source: model.utmSource,
        utm_medium: 'email',
        utm_campaign: model.name
      }

      let alt = ''

      if (cell.alt) {
        utm.utm_content = cell.alt
        alt = ` alt="${alt}"`
      }

      if (cell.url) {
        const url = `${cell.url}?${querystring.stringify(utm)}`
        html += `<a href="${url}"><img src="https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/${path}"${alt}></a>`
      } else {
        html += `<img src="https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/${path}"${alt}>`
      }
    }
    html += '</td></tr>'
  }
  html += '</table></body></html>'

  ctx.attachment(job.name + '.html')
  ctx.body = html
})

router.post('/:id/eblast', async ctx => {
  const job = await Job.findById(ctx.params.id)
  ctx.assert(job, 404)

  if (ctx.request.files) {
    const file = ctx.request.files.file
    ctx.assert(file, 422)
    const path = encodeURIComponent(
      job.name.replace(/ /g, '_') +
        file.name.substring(file.name.lastIndexOf('.'))
    )
    await Storage.put(path, await fs.readFile(file.path), {
      contentType: file.type,
      bucket: 'dealerdigitalgroup.media'
    })

    job.eblast = {
      image:
        'https://s3-us-west-1.amazonaws.com/dealerdigitalgroup.media/public/' +
        path,
      rows: [
        {
          y: 0,
          height: 100,
          cells: [
            {
              x: 0,
              width: 100,
              url: '',
              utmContent: '',
              alt: ''
            }
          ]
        }
      ]
    }
  } else {
    ctx.assert(ctx.request.body.image, 422)
    job.eblast = ctx.request.body
  }

  await job.save()
  ctx.response.type = 'json'
  ctx.body = job
  ctx.socketIo.emit('invalidateJobs')
})

router.post('/:id/file', async ctx => {
  const { type } = ctx.request.body
  ctx.assert(ctx.request.files && ctx.request.files.file && type, 422)

  const file = ctx.request.files.file
  const path = `${ctx.params.id}/${type}/${encodeURIComponent(file.name)}`
  await Storage.put(path, await fs.readFile(file.path), {
    contentType: file.type,
    bucket: 'dealerdigitalgroup.printmanager'
  })

  const job = await Job.findById(ctx.params.id)
  ctx.assert(job, 404)
  job.files.push({ type, path })
  job.save()
  // await Job.findByIdAndUpdate(ctx.params.id, { $push: { files: { type, path } } })

  ctx.response.type = 'json'
  ctx.body = job
  ctx.socketIo.emit('invalidateJobs')
})

router.delete('/:ref/file/:id', async ctx => {
  const job = await Job.findById(ctx.params.ref)
  ctx.assert(job, 404)

  const file = job.files.id(ctx.params.id)
  ctx.assert(file, 404)
  await Storage.remove(file.path, { bucket: 'dealerdigitalgroup.printmanager' })
  file.remove()
  await job.save()

  ctx.response.type = 'json'
  ctx.body = job
})

router.get('/:ref/file/:id', async ctx => {
  const job = await Job.findById(ctx.params.ref)
  ctx.assert(job, 404)

  const file = job.files.id(ctx.params.id)
  ctx.assert(file, 404)

  ctx.response.type = 'json'
  ctx.body = await Storage.get(file.path, {
    bucket: 'dealerdigitalgroup.printmanager'
  })
})

module.exports = router.routes()
