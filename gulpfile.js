var gulp = require('gulp'),
		pug = require('gulp-pug'), //Pug to HTML
		stylus = require('gulp-stylus'), //Stylus to CSS
		sourcemaps = require('gulp-sourcemaps'), //Build sourcemaps for browser
		nib = require('nib'), //Stylus library
		rupture	= require('rupture'), //Stylus library
		concat = require('gulp-concat'), //Concatenate files
		browserSync = require('browser-sync'), //Livereload
		uglify = require('gulp-uglify'), //Minify JS
		csso = require('gulp-csso'), //Minify CSS
		short = require('gulp-shorthand'), //Optimize CSS
		prefix = require('gulp-autoprefixer'), //Add browser prefixes
		fontmin = require('gulp-fontmin'), //TTF to EOT, OTF, WOFF, SVG + Font-face
		tinypng = require('gulp-tinypng-extended'), //Optimze images via https://tinypng.com 
		useref = require('gulp-useref'), //Simple production loader
		gulpIf = require('gulp-if'), //Permit to choose file type for .pipe
		del = require('del'); //Clear dist 

// Livereload
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		notify: false
	});
});

// Pug to HTML
gulp.task('pug', function() {
 return gulp.src('app/pug/*.pug')
 .pipe(pug({
    doctype: 'html',
    pretty: true
 }))
 .pipe(gulp.dest('app/'));
});

// Compiles Stylus to CSS
// Adds prefixes
gulp.task('styles', function() {
	return gulp.src('app/styl/*.styl')
	.pipe(sourcemaps.init())
	.pipe(stylus({
		sourcemaps: true,
		use: [rupture(), nib()],
		import: ['nib']
	}))
	.pipe(sourcemaps.write())
	.pipe(prefix('last 2 versions', 'ie 8', 'ie 9'))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

// Oprimize images via https://tinypng.com
gulp.task('img', function () {
	gulp.src('app/img/**/*')
	.pipe(tinypng({
            key: 'lkBIya40Ga-zWRQQIwdljlhKV-QQ0JD5' //get it on https://tinypng.com/developers
          }))
	.pipe(gulp.dest('app/img'));
});

// TTF to EOT, OTF, WOFF, SVG + Font-face
gulp.task('fontmin', function() {
	return gulp.src('app/fonts/*.ttf')
	.pipe(fontmin())
	.pipe(gulp.dest('app/fonts'))
});

// Font-face files to fonts.css
gulp.task('fface',['fontmin'], function(){
	return gulp.src('app/fonts/*.css')
	.pipe(concat('fonts.css'))
	.pipe(gulp.dest('app/css'))
});

// Removes font-face from fonts folder
gulp.task('fonts', ['fface'], function(){
	return del.sync('app/fonts/*.css')
});

// Default task
gulp.task('default', ['browser-sync', 'styles'], function(){
	gulp.watch('app/styl/**/*.styl', ['styles']);
	gulp.watch('app/pug/**/*.pug', ['pug']);
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

// Parses JS and CSS files in .html 
// Minifyes JS and CSS(+optimize)
// Loads to production
gulp.task('useref', ['styles'], function(){
	return gulp.src('app/*.html')
	.pipe(useref())
	.pipe(gulpIf('*.js', uglify()))
	.pipe(gulpIf('*.css', short()))
	.pipe(gulpIf('*.css', csso()))
	.pipe(gulp.dest('dist'))
});

//Delete dist folder
gulp.task('clean', function() {
	return del.sync('dist')
});

// Builds project for production
gulp.task('build', ['clean', 'useref'], function() {
	var buildFonts = gulp.srcStylus('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))

	var buildimg = gulp.src('app/img/**/*')
	.pipe(gulp.dest('dist/img'))
});