//
// import names
//

var gulp = require('gulp');
var gutil = require('gulp-util');

var del = require('del');

var connect = require('gulp-connect');

var minify = require('gulp-minify');

var path = {
  src: './src/**/*.js',
  out: './dist/',
}

//
// clean
//

gulp.task('clean', function () {
  return del(path.out);
});

//
// build
//

gulp.task('build', function () {
  return gulp.src(path.src)
    .pipe(minify({
      ext: {
        src: '.js',
        min:'.min.js',
      },
      ignoreFiles: ['*.min.js']
    }))
    .on('error', function (err) {
      gutil.log(err);
      this.emit('end');
    })
    .pipe(gulp.dest(path.out))
    .pipe(connect.reload());
});

//
// server
//

gulp.task('webserver', function(){
  return connect.server({
    root: './',
    port: 8005,
    livereload: true
  });
});

//
// watch
//

gulp.task('watch', function() {
  return gulp.watch(path.src, gulp.series('build'));
});

//
// default
//
 
gulp.task('default', gulp.series('clean', gulp.parallel('build', 'webserver', 'watch')));