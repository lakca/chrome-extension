const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const uglify = require('gulp-uglify')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps');
const shakeify = require('common-shakeify')
const { inspect } = require('util')

function done() {
  const promises = []
  for (const param of [...arguments]) {
    Array.isArray(param)
    ? promises.push(...param)
    : promises.push(param)
  }
  const results = []
  promises.forEach((promise, i) => {
    console.log(promise)
    promise.then(r => {
      results[i] = [null, r]
    }).catch(e => {
      results[i] = [e, r]
    })
  })
  return new Promise(resolve => resolve(results))
}

gulp.task('build', function(cb) {
  const dist = path.resolve(__filename, '../dist')
  const src = path.resolve(__filename, '../src')
  const entries = fs.readdirSync(src)
  .filter(file => /^entry/.test(file))

  let n = 0
  function end() {
    --n
    if (n < 1) {
      cb()
    }
  }
  ++n
  gulp.src([
    'manifest.json',
    'src/*.html'
  ], {
    cwd: __dirname
  })
  .pipe(gulp.dest(dist))
  .on('end', end)

  for (const entry of entries) {
    ++n
    browserify({
      entries: [path.resolve(src, entry)]
    })
    // .plugin(shakeify, {
    //   onModuleBailout(module, reasons) {
    //     console.log('shake failed on module: ', inspect(module.bailouts))
    //   },
    //   onGlobalBailout(reason) {
    //     console.log('shake failed')
    //   }
    // })
    .bundle()
    .on('error', console.error)
    .pipe(source(entry.replace('entry_', '')))
    .pipe(buffer())
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .on('error', console.error)
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dist))
    .on('end', end)
  }
})