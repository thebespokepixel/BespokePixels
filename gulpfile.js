/*
 *  BespokePixels Gulp File
 */
const {paletteReader} = require('@thebespokepixel/palette2oco')
const gulp = require('gulp')

const $ = require('gulp-load-plugins')()
const trash = require('trash')

const oco2Sublime = require('./lib/oco-to-sublime')
const plistConverter = require('./lib/plist-converter')
const setData = require('./lib/set-data')
const setConfig = require('./lib/set-config')

async function setPalette() {
	return paletteReader('source')
		.load(['source/BespokePixels.oco'])
		.then(oco2Sublime)
}

gulp.task('compile:settings', async () => {
	const palette = await setPalette()
	return gulp.src('source/settings/*.json')
		.pipe($.include())
		.pipe($.data(setConfig(palette, 'Settings', 'json')))
		.pipe($.template())
		.pipe(setData('settings'))
		.pipe(gulp.dest('./dist/Theme - BespokePixels/settings'))
})

gulp.task('compile:syntax', async () => {
	const palette = await setPalette()
	return gulp.src(['source/syntax/*.yaml'])
		.pipe($.include())
		.pipe($.data(setConfig(palette, 'Syntax', 'yaml')))
		.pipe($.template())
		.pipe(setData('syntax'))
		.pipe(gulp.dest('./dist/Theme - BespokePixels/syntax'))
})

gulp.task('compile:schemes', async () => {
	const palette = await setPalette()
	return gulp.src('source/schemes/*.yaml')
		.pipe($.include())
		.pipe($.data(setConfig(palette, 'Schemes', 'yaml')))
		.pipe($.template())
		.pipe(setData('editable'))
		.pipe(gulp.dest('./schemesNew'))
		.pipe($.yaml({space: 2}))
		.pipe(plistConverter())
		.pipe(setData('scheme'))
		.pipe(gulp.dest('./dist/Theme - BespokePixels/schemes'))
})

gulp.task('compile:theme', async () => {
	const palette = await setPalette()
	return gulp.src('source/themes/*.json')
		.pipe($.include())
		.pipe($.data(setConfig(palette, 'Theme', 'json')))
		.pipe($.template())
		.pipe(setData('theme'))
		.pipe(gulp.dest('./dist/Theme - BespokePixels'))
})

gulp.task('compile:icons', () => gulp.src('source/icons/build/*')
	.pipe(gulp.dest('./dist/Theme - BespokePixels/icons'))
)

gulp.task('compile:meta', () => gulp.src('source/meta/*')
	.pipe(gulp.dest('./dist/Theme - BespokePixels/meta'))
)

gulp.task('compile:media', () => gulp.src('source/media/build/*')
	.pipe(gulp.dest('./dist/Theme - BespokePixels/media'))
)

gulp.task('compile', gulp.parallel(
	'compile:settings',
	'compile:syntax',
	'compile:schemes',
	'compile:theme',
	'compile:icons',
	'compile:meta',
	'compile:media'
))

gulp.task('clean', () => trash([
	'./dist/Theme - BespokePixels'
]))

gulp.task('default', gulp.series(
	'clean',
	'compile',
))
