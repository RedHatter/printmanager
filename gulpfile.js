const sourcemaps = require('gulp-sourcemaps')
const notify = require('freedesktop-notifications')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const rename = require('gulp-rename')
const raster = require('gulp-raster')
const newer = require('gulp-newer')
const gulp = require('gulp')
const open = require("open")
const del = require('del')
const tap = require('gulp-tap')

const browserify = require('browserify')

function onError (err) {
  console.error(err.message)
  notify.createNotification({
      body: err.toString(),
      actions: { default: '' }
  }).on( 'action' , action => open(`${err.filename}:${err.loc.line}:${err.loc.column}`, 'atom-beta')).push()
  this.emit('end')
}

function svg () {
  return gulp.src('src/**/*.svg')
    .pipe(newer('public'))
    .pipe(raster())
    .pipe(rename({ extname: '.png' }))
    .pipe(gulp.dest('public'))
    .on('error', onError)
}

function javascript () {
  return browserify('./src/index.js', { debug: true })
    .plugin('collectify', {
      file: './public/styles.css',
      regex: /<style>([\s\S]+?)<\/style>/g,
      capture: 1
    })
    .transform('babelify', {
      "presets": [
        "env",
        "react"
      ],
      "plugins": [
        "babel-plugin-transform-object-rest-spread"
      ],
      sourceMaps: true
    })
    .bundle().on('error', onError)
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public'))
}

gulp.task('clean', () => del([ './public/**', '!./public/index.html' ]))

gulp.task('default', gulp.parallel(javascript, svg))

gulp.task('watch', gulp.parallel('default', () => {
  gulp.watch('src/**/*.{js,jsx}', javascript)
  gulp.watch('src/**/*.svg', svg)
}))
