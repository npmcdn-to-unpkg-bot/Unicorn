// Gulpfile adapted from here: https://www.npmjs.com/package/gulp-typescript

var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var concat = require('gulp-concat');
var count = require('gulp-count');

var tsProject = ts.createProject(
    'tsconfig.json'
);

gulp.task('scripts', function () {
    var tsResult = tsProject.src() // instead of gulp.src(...)
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest('.'));
});

gulp.task('frontend-dependencies', function() {
    return gulp.src([
        //'./node_modules/es5-shim/es5-shim.js',
        './node_modules/es6-shim/es6-shim.js',
        //'./node_modules/systemjs/dist/system-polyfills.js',
        //'./node_modules/angular2/bundles/angular2-polyfills.js',
        './node_modules/systemjs/dist/system-register-only.src.js',
        './node_modules/rxjs/bundles/Rx.js',
        './node_modules/angular2/bundles/angular2.dev.js'
    ], {base: '.'})
        .pipe(count('## JS files selected'))
        .pipe(concat('dependencies.js'))
        .pipe(gulp.dest('./public/assets'))
});

gulp.task('frontend-app', function() {
    return gulp.src([
        './src/client/**/*.js'
    ], {base: '.'})
        .pipe(count('## JS files selected'))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./public/assets'))
});

gulp.task('watch', ['scripts'], function () {
    gulp.watch('./src/server/**/*.ts', ['scripts']);
});
