import browserify from 'browserify'
import fs from 'fs'
import MultiStream from 'multistream'

const dev = process.env.NODE_ENV == 'dev'
browserify('./src/index.js', {
  debug: dev,
  fullPaths: dev
})
  .plugin('collectify', {
    file: './public/styles.css',
    regex: /<style>([\s\S]+?)<\/style>/g,
    capture: 1
  })
  .transform('babelify', {
    presets: ['@babel/preset-env', '@babel/preset-react'],
    plugins: [
      ['@babel/plugin-proposal-decorators', { decoratorsBeforeExport: true }],
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-logical-assignment-operators'
    ],
    sourceMaps: dev
  })
  .bundle()
  .on('error', console.error)
  .on('end', () =>
    MultiStream([
      fs.createReadStream('./node_modules/material-ui-utils/build/styles.css'),
      fs.createReadStream('./node_modules/draft-js/dist/Draft.css')
    ]).pipe(fs.createWriteStream('./public/styles.css', { flags: 'a' }))
  )
  .pipe(fs.createWriteStream('./public/app.js'))
