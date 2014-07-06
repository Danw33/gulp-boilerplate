'use strict';

var gulp = require('gulp');

gulp.task('clean', function(cb) {
    require('rimraf')('dist', cb);
});

gulp.task('lint', function() {
    var jshint = require('gulp-jshint');

    return gulp.src('app/scripts/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('sass', function () {
    var sass = require('gulp-sass'),
        cssbeautify = require('gulp-cssbeautify');

    return gulp.src('app/scss/*.scss')
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(cssbeautify())
        .pipe(gulp.dest('app/styles'));
});

gulp.task('connect', function() {
    var connect = require('connect');
    var app = connect()
        .use(require('connect-livereload')({ port: 35729 }))
        .use(connect.static('app'))
        .use(connect.directory('app'));

    require('http').createServer(app)
        .listen(9000)
        .on('listening', function() {
            console.log('Started connect web server on http://localhost:9000');
        });
});

gulp.task('serve', ['connect', 'sass'], function () {
    require('opn')('http://localhost:9000');
});

gulp.task('images', function(){
    return gulp.src('app/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}')
        .pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', function(){
    return gulp.src('app/styles/fonts/*')
        .pipe(gulp.dest('dist/styles/fonts'));
});

gulp.task('misc', function(){
    return gulp.src([
            'app/*.{ico,png,txt}',
            'app/.htaccess'
        ])
        .pipe(gulp.dest('dist'));
});

gulp.task('html', ['sass'], function(){
    var uglify = require('gulp-uglify'),
        minifyCss = require('gulp-minify-css'),
        useref = require('gulp-useref'),
        gulpif = require('gulp-if');

    return gulp.src('app/*.html')
        .pipe(useref.assets())
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(useref.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    gulp.src('app/scss/**/*.scss')
        .pipe(wiredep({directory: 'app/bower_components'}))
        .pipe(gulp.dest('app/styles'));

    gulp.src('app/*.html')
        .pipe(wiredep({
            directory: 'app/bower_components'
        }))
        .pipe(gulp.dest('app'));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var livereload = require('gulp-livereload');

    livereload.listen();

    // watch for changes
    gulp.watch([
        'app/*.html',
        '.tmp/styles/**/*.css',
        'app/scripts/**/*.js',
        'app/images/**/*'
    ]).on('change', livereload.changed);

    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch('bower.json', ['wiredep']);
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'misc']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});