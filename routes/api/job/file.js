const fs = require('fs').promises
const Router = require('koa-router')
const { S3 } = require('aws-sdk')
const { Job } = require('../../../schema')

const s3 = new S3({
  region: 'us-west-1',
  credentials: {
    accessKeyId: '***REMOVED***',
    secretAccessKey: '***REMOVED***'
  },
  params: { Bucket: 'dealerdigitalgroup.printmanager' }
})

const router = new Router()

router.post('/:id/file', async ctx => {
  const { type } = ctx.request.body
  ctx.assert(ctx.request.files && ctx.request.files.file && type, 422)

  const file = ctx.request.files.file
  const path = `${ctx.params.id}/${type}/${encodeURIComponent(file.name)}`
  await s3.putObject({
    Body: await fs.readFile(file.path),
    Key: path,
    ContentType: file.type
  }).promise()

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
  await s3.deleteObject({ Key: file.path }).promise()
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
  ctx.body = await s3.getSignedUrl('getObject', {Key: file.path})
})

module.exports = router.routes()
