// Gulpfile adapted from here: https://www.npmjs.com/package/gulp-typescript

var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');

var tsProject = ts.createProject(
    'tsconfig.json'
);

gulp.task('scripts', function () {
    var tsResult = tsProject.src() // instead of gulp.src(...)
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest('.'));
});

gulp.task('watch', ['scripts'], function () {
    gulp.watch('./src/server/**/*.ts', ['scripts']);
});
