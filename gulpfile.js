/*global require*/

var gulp = require('gulp'),
	pug = require('gulp-pug'),
	prefix = require('gulp-autoprefixer'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	pugLinter = require('gulp-pug-linter'),
	minifyCSS = require('gulp-minify-css'),
	concat = require('gulp-concat'),
	pug_markdown_filter = require('jstransformer-markdown-it'),
	notify = require('gulp-notify'),
	plumber = require('gulp-plumber'),
	stripCssComments = require ('gulp-strip-css-comments'),
	sourcemaps  = require('gulp-sourcemaps');

var paths = {
  public: './dist/',
  sass: './src/scss/',
  css: './dist/css/',
  data: './src/_data/',
		pug: './src/*.pug'
};

var displayError = function(error) {
  // Initial building up of the error
  var errorString = '[' + error.plugin.error.bold + ']';
  errorString += ' ' + error.message.replace("\n",''); // Removes new line at the end

  // If the error contains the filename or line number add it to the string
  if(error.fileName)
      errorString += ' in ' + error.fileName;

  if(error.lineNumber)
      errorString += ' on line ' + error.lineNumber.bold;

  // This will output an error like the following:
  // [gulp-sass] error message in file_name on line 1
  console.error(errorString);
};

var onError = function(err) {
  notify.onError({
    title:    "Gulp",
    subtitle: "Failure!",
    message:  "Error: <%= error.message %>",
    sound:    "Basso"
  })(err);
  this.emit('end');
};

var sassOptions = {
  outputStyle: 'compressed'
};

var prefixerOptions = {
  browsers: ['last 2 versions']
};

/* SCSS
---------------------------------------------*/
gulp.task('sass', function (){
	return gulp.src(paths.sass + 'styles.scss')
		.pipe(sass())
		.pipe(plumber({errorHandler: onError}))
  .pipe(sourcemaps.init())
  .pipe(sass(sassOptions))
  .pipe(prefix(prefixerOptions))
		.pipe(concat('styles.css'))
		.pipe(stripCssComments({ preserve: false }))
  .pipe(minifyCSS())
		.pipe(gulp.dest(paths.css));
});


/* PUG
---------------------------------------------*/
gulp.task('pug',function (){
	return gulp.src(paths.pug)
		.pipe(pug({
      pretty: true,
      filters: {
        md: pug_markdown_filter
      }
    }))
				.on('error', notify.onError(function (error) {
    return 'An error occurred while compiling pug.\nLook in the console for details.\n' + error;
}))
		.pipe(gulp.dest(paths.public));
});

gulp.task('rebuild', ['pug'], function () {
  browserSync.reload();
});

gulp.task('browser-sync', ['sass', 'pug'], function () {
  browserSync({
    server: {
      baseDir: paths.public
    },
    notify: false
  });
});

/* PUG LINT
---------------------------------------------*/
gulp.task('lint:template', function () {
  return gulp
    .src(paths.pug)
    .pipe(pugLinter())
    .pipe(pugLinter.reporter());
});

/* WATCH
---------------------------------------------*/
gulp.task('watch', function (){
	gulp.watch(paths.sass + '**/*.scss',['sass']);
	gulp.watch('./src/**/*.pug', ['rebuild']);
});

/* BUILD
---------------------------------------------*/
gulp.task('build', ['sass', 'pug']);

/* BROWSER SYNC
---------------------------------------------*/
gulp.task('default', ['browser-sync', 'watch']);