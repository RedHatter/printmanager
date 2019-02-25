const sourcemaps = require('gulp-sourcemaps')
const notify = require('freedesktop-notifications')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const rename = require('gulp-rename')
const raster = require('gulp-raster')
const concat = require('gulp-concat')
const { Buffer } = require('buffer')
const prettier = require('prettier')
const newer = require('gulp-newer')
const util = require('gulp-util')
const tap = require('gulp-tap')
const gulp = require('gulp')
const open = require('open')
const del = require('del')

const browserify = require('browserify')

function onError(err) {
  console.error(err.message)
  notify
    .createNotification({
      body: err.toString(),
      actions: { default: '' }
    })
    .on('action', action =>
      open(`${err.filename}:${err.loc.line}:${err.loc.column}`, 'atom-beta')
    )
    .push()
  this.emit('end')
}

function svg() {
  return gulp
    .src('src/**/*.svg')
    .pipe(newer('public'))
    .pipe(raster())
    .pipe(rename({ extname: '.png' }))
    .pipe(gulp.dest('public'))
    .on('error', onError)
}

function format() {
  return gulp
    .src(['**/*.{js,jsx}', '!node_modules/**', '!public/**'])
    .pipe(
      tap(
        file =>
          (file.contents = Buffer.from(
            file.contents.toString().replace(
              /^(.+?)(?:<style>(.+?)<\/style>)?\s*$/s,
              (_, js, css) =>
                prettier.format(js, {
                  semi: false,
                  singleQuote: true,
                  parser: 'babel'
                }) +
                (css
                  ? `
<style>
${prettier.format(css, { parser: 'css' })}
</style>`
                  : '')
            )
          ))
      )
    )
    .pipe(gulp.dest('.'))
}

function javascript() {
  const bundle = browserify('./src/index.js', {
    debug: !util.env.production,
    fullPaths: !util.env.production
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
      sourceMaps: !util.env.production
    })

  if (util.env.production)
    return bundle
      .bundle()
      .on('error', onError)
      .pipe(source('app.js'))
      .pipe(gulp.dest('./public'))
  else
    return bundle
      .bundle()
      .on('error', onError)
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest('./public'))
}

function styles() {
  return gulp
    .src([
      './public/styles.css',
      './node_modules/material-ui-utils/build/styles.css',
      './node_modules/draft-js/dist/Draft.css'
    ])
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('./public/'))
}

gulp.task('clean', () =>
  del([
    './public/**',
    '!./public',
    '!./public/index.html',
    '!./public/images/pxl.png'
  ])
)

gulp.task(
  'default',
  gulp.parallel(gulp.series(format, javascript, styles), svg)
)

gulp.task('format', format)

gulp.task(
  'watch',
  gulp.parallel('default', () => {
    gulp.watch('src/**/*.{js,jsx}', javascript)
    gulp.watch('src/**/*.svg', svg)
  })
)
