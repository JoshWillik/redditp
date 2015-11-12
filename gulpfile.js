var gulp = require('gulp')
var babel = require('gulp-babel')
var rename = require('gulp-rename')

var files = {
  public: './public/**/*.!(es6)',
  output: './build',
  javascript: {
    files: './public/**/*.es6'
  }
}

gulp.task('public', function () {
  return gulp.src(files.public).pipe(gulp.dest(files.output))
})

gulp.task('js', function () {
  return gulp.src(files.javascript.files)
    .pipe(babel({
      presets: ['es2015'],
    }))
    .pipe(rename(function(file){
      file.basename = file.basename.replace('.es6', '')
      return file
    }))
    .pipe(gulp.dest(files.output))
})


gulp.task('default', ['public', 'js'])

gulp.task('watch', ['default'], function () {
  gulp.watch(files.javascript.files, ['js'])
  gulp.watch(files.public, ['public'])
})
