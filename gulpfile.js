// Gulpfile adapted from here: https://www.npmjs.com/package/gulp-typescript

var gulp = require('gulp');
var ts = require('gulp-typescript');
var less = require('gulp-less');
var concatCss = require('gulp-concat-css');
var path = require('path');
var sourcemaps = require('gulp-sourcemaps');

var tsProject = ts.createProject(
    'tsconfig.json'
);

gulp.task('styles', function (){
    return gulp.src('./public/stylesheets/**/*.less')
        .pipe(sourcemaps.init())
        .pipe(less({
            paths: [path.join(__dirname, 'less', 'includes')]
        }))
        .pipe(concatCss('app.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('scripts', function () {
    var tsResult = tsProject.src() // instead of gulp.src(...)
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest('.'));
});

gulp.task('watch', ['scripts', 'styles'], function () {
    gulp.watch('./src/server/**/*.ts', ['scripts']);
    gulp.watch('./public/stylesheets/**/*.less', ['styles']);
});
