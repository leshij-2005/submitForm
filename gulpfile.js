//
// import names
//

var gulp = require('gulp');
var gutil = require('gulp-util');

var del = require('del');

var connect = require('gulp-connect');

var rigger = require('gulp-rigger');

var minify = require('gulp-minify');

var path = {
  src: './src/**/*.js',
  out: './dist/',
}

//
// clean
//

gulp.task('clean', function () {
  del(path.out);
});

//
// build
//

gulp.task('build', function () {
  gulp.src(path.src)
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
  connect.server({
    root: './',
    port: 8005,
    livereload: true
  });
});

//
// watch
//

gulp.task('watch', function() {
  gulp.watch(path.src, ['build']);
});

//
// default
//
 
gulp.task('default', ['build', 'webserver', 'watch']);