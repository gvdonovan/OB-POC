var gulp 		= require('gulp');
var wiredep = require('wiredep');
var inject  = require('gulp-inject');
var order   = require('gulp-order');
var less    = require('gulp-less');
var babel   = require('gulp-babel');

var paths   = require('../paths');

/**
 * Wire Bower dependencies and inject application js
 */
gulp.task('index', ['vendor-js', 'vendor-css', 'vendor-fonts', 'less', 'es6', 'lib-js' ], function() {
  return gulp
    .src(paths.client + 'index.html')
    .pipe(wiredep.stream({options: paths.bower,
        fileTypes: {
        html: {
          replace: {
            js: function(filePath) {
              return '<script src="' + 'vendor/js/' + filePath.split('/').pop() + '"></script>';
            },
            css: function(filePath) {
              return '<link rel="stylesheet" href="' + 'vendor/css/' + filePath.split('/').pop() + '"/>';
            }}}}}))   
    .pipe(inject(gulp.src(paths.source)
    .pipe(order(['**/app.module.js', '**/*.module.js', '**/*.js']), {read: false, name: 'inject'}), {relative: true}))
    .pipe(gulp.dest(paths.client))
    .pipe(gulp.dest(paths.client));
});

/**
 * Copy Bower js 
 */
gulp.task('vendor-js', function() {
  return gulp
    .src(wiredep(paths.bower).js)
    .pipe(gulp.dest(paths.vendor + 'js/'));
});

/**
 * Copy Bower css
 */
gulp.task('vendor-css', function() {
  return gulp
    .src(wiredep(paths.bower).css)
    .pipe(gulp.dest(paths.vendor + 'css/'));
});

/**
 * Copy Bower fonts
 */
gulp.task('vendor-fonts', function() {
  
  var fonts = [
    './bower_components/font-awesome/fonts/fontawesome-webfont.*',
    './bower_components/bootstrap/fonts/glyphicons-halflings-regular.*'
  ];
  
  return gulp
    .src(fonts)
    .pipe(gulp.dest(paths.vendor + 'fonts/'));
});

gulp.task('less', function(){
  return gulp
    .src(paths.less + '*.less')
    .pipe(less({
      // paths: [ ]
    }))
    .pipe(gulp.dest(paths.style));
});

gulp.task('es6', function() {
  return gulp
    .src(paths.es6 + '*.js')
    .pipe(babel())
    .pipe(gulp.dest(paths.lib));
});

gulp.task('lib-js', function(){
   return gulp
     .src(paths.client + 'index.html')
     .pipe(inject(gulp.src(paths.lib + '*.js',{read: false}), { name: 'lib'}))
     .pipe(gulp.dest(paths.client));
});