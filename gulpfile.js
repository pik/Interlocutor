
// 'use strict';

const polymerJson = require('./polymer.json');
const PolymerProject = require('polymer-build').PolymerProject;
const BUILD_DIRECTORY = 'build/';

const gulp = require('gulp');
const mergeStream = require('merge-stream');
const gulpif  = require('gulp-if')
const babel   = require('gulp-babel')
const uglify = require('gulp-uglify')
// const cssSlam = require('css-slam').gulp
const htmlMinifier = require('gulp-html-minifier')
const HtmlSplitter = require('polymer-build').HtmlSplitter

require('es6-promise').polyfill()

// No CSS processing because
// https://github.com/Polymer/polymer-build/issues/153#issuecomment-285173155

// const cssnano = require('gulp-cssnano')
// const htmlmin = require('gulp-htmlmin')
// const postcss = require('gulp-postcss')
// const posthtml = require('gulp-posthtml')
// const autoprefixer = require('autoprefixer')

function build() {
  // Each stream requires it's own HtmlSplitter instance
  const sourcesHtmlSplitter = new HtmlSplitter()
  const dependenciesHtmlSplitter = new HtmlSplitter()
  const project = new PolymerProject(polymerJson)

  const sourcesStream = project.sources()
    .pipe(sourcesHtmlSplitter.split())
    .pipe(gulpif(/\.js$/, babel({
      presets: ['es2015'],
      plugins: [
        ["babel-plugin-transform-builtin-extend", {
            globals: ["Error", "Array"]
        }]
      ]
    })))
    .pipe(gulpif(/\.js$/, uglify()))
    // .pipe(gulpif(/\.css$/, cssSlam()))
    .pipe(gulpif(/\.html$/, htmlMinifier({collapseWhitespace: true, removeComments: true})))
     // rejoins those files back into their original location
    .pipe(sourcesHtmlSplitter.rejoin())

  const dependenciesStream = project.dependencies()
    .pipe(dependenciesHtmlSplitter.split())
    .pipe(gulpif(/\.js$/, uglify()))
     // .pipe(gulpif(/\.css$/, cssnano()))
    .pipe(gulpif(/\.html$/, htmlMinifier({collapseWhitespace: true, removeComments: true})))
     // rejoins those files back into their original location
    .pipe(dependenciesHtmlSplitter.rejoin())

  // Merge the source and dependencies stream back
  let buildStream = mergeStream(sourcesStream, dependenciesStream)
    .pipe(project.bundler)
    .pipe(gulp.dest(BUILD_DIRECTORY))
  return buildStream
}

gulp.task('build', build)
