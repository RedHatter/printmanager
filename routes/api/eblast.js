const Router = require('koa-router')
const Jimp = require('jimp')
const Storage = require('aws-amplify').Storage

const { Eblast } = require('../../schema')

const router = new Router()

router.post('/', async ctx => {
  let model = ctx.request.body
  if (!model.rows) {
    model.rows = [
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

  let eblast = new Eblast(model)
  try {
    await eblast.save()
    ctx.response.type = 'json'
    ctx.body = eblast

    ctx.socketIo.emit('invalidateEblasts', await Eblast.find())
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.get('/', async ctx => {
  ctx.response.type = 'json'
  ctx.body = (await Eblast.find()).reverse()
})

router.delete('/:id', async ctx => {
  ctx.response.type = 'json'
  ctx.body = await Eblast.findByIdAndDelete(ctx.params.id)
  ctx.socketIo.emit('invalidateEblasts')
})

router.post('/:id', async ctx => {
  const { id } = ctx.params
  const model = ctx.request.body
  ctx.assert(model.id == id, 422, 'Model id must match update id.')

  try {
    delete model._id
    delete model.id
    let eblast = await Eblast.findByIdAndUpdate(id, model, {
      runValidators: true,
      new: true
    })
    ctx.response.type = 'json'
    ctx.body = eblast
    ctx.socketIo.emit('invalidateEblasts')
  } catch (err) {
    if (err.name == 'ValidationError') {
      console.error(err.message)
      ctx.status = 422
      return
    }

    throw err
  }
})

router.get('/:id/download', async ctx => {
  const model = await Eblast.findById(ctx.params.id)
  const image = await Jimp.read(model.image)
  const { width, height } = image.bitmap
  let html = `<!doctype html><html lang="en"><head><title>${
    model.name
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

  ctx.attachment('eblast.html')
  ctx.body = html
})

module.exports = router.routes()
