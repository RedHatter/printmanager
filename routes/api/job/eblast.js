const fs = require('fs').promises
const Router = require('koa-router')
const Jimp = require('jimp')
const Storage = require('aws-amplify').Storage
const querystring = require('querystring')
const { Job } = require('../../../schema')

const router = new Router()

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
    job.eblast.rows = job.eblast.rows
      .filter(r => r.height > 0)
      .map(r => {
        r.y = Math.max(0, r.y)
        r.cells = r.cells
          .filter(c => c.width > 0)
          .map(c => ((c.x = Math.max(0, c.x)), c))
        return r
      })
  }

  await job.save()
  ctx.response.type = 'json'
  ctx.body = job
  ctx.socketIo.emit('invalidateJobs')
})

module.exports = router.routes()
