const fs = require('fs').promises
const Router = require('koa-router')
const Storage = require('aws-amplify').Storage
const ObjectId = require('mongoose').Types.ObjectId
const { Job } = require('../../../schema')
const { ensureArray } = require('../../../utils.js')

const router = new Router()

router.post('/:id/comment', async ctx => {
  try {
    const comment = ctx.request.body
    comment._id = new ObjectId()
    comment.attachments = await Promise.all(
      ensureArray(ctx.request.files.attachments).map(async file => {
        const path = `${ctx.params.id}/comment/${comment._id}/${file.name}`
        await Storage.put(path, await fs.readFile(file.path), {
          contentType: file.type,
          bucket: 'dealerdigitalgroup.printmanager'
        })
        return path
      })
    )

    const to = comment.notify
    delete comment.notify
    const job = await Job.findById(ctx.params.id)
    job.comments.push(comment)
    await job.save()

    ctx.response.type = 'json'
    ctx.body = job
    ctx.socketIo.emit('invalidateJobs')

    if (to && to.length > 0) {
      await ctx.sendMail({
        from: `"${
          ctx.state.user.name
        } (Workflow)" <ericag@dealerdigitalgroup.com>`,
        to,
        subject: 'New comment on ' + job.name,
        html: `${ctx.state.user.name} has commented on <i>${job.name}</i>
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

router.delete('/:ref/comment/:id', async ctx => {
  const job = await Job.findById(ctx.params.ref)
  const comment = job.comments.id(ctx.params.id)
  ctx.assert(ctx.state.user['cognito:username'] == comment.user.id, 403)

  const files = await Storage.list(
    `${ctx.params.ref}/comment/${ctx.params.id}`,
    { bucket: 'dealerdigitalgroup.printmanager' }
  )
  await Promise.all(
    files.map(o =>
      Storage.remove(o.key, {
        bucket: 'dealerdigitalgroup.printmanager'
      })
    )
  )

  comment.remove()
  await job.save()

  ctx.response.type = 'json'
  ctx.body = job
  ctx.socketIo.emit('invalidateJobs')
})

router.get('/:ref/comment/:id/file/:index', async ctx => {
  const job = await Job.findById(ctx.params.ref)
  ctx.assert(job, 404)

  const comment = job.comments.id(ctx.params.id)
  ctx.assert(comment, 404)

  const file = comment.attachments[ctx.params.index]
  ctx.assert(file, 404)

  ctx.response.type = 'json'
  ctx.body = await Storage.get(file, {
    bucket: 'dealerdigitalgroup.printmanager'
  })
})

module.exports = router.routes()
