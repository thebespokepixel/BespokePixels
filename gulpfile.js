/*
 *  BespokePixels Gulp File
 */
const {paletteReader} = require('@thebespokepixel/palette2oco')
const gulp = require('gulp')

const $ = require('gulp-load-plugins')()
const _ = require('lodash')
const trash = require('trash')

const oco2Sublime = require('./lib/oco-to-sublime')
const plistConverter = require('./lib/plist-converter')
const uuid = require('./lib/uuid')
const setData = require('./lib/set-data')
const setPaths = require('./lib/set-paths')
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

// gulp.task('compile:settings', () => gulp.src(['source/settings/*.json'])
// 	.pipe($.include())
// 	.pipe($.data(file_ => {
// 		const basename = path.basename(file_.path, '.json')
// 		const variantConfig = yaml.safeLoad(readFileSync('source/data/default.yaml', 'utf8'))

// 		console.info(`Compiling ${config[basename].stem} settings...`)

// 		const jobConfig = _.merge({basename, uuid: uuid()},
// 			config, variantConfig, palettes.default, config[basename])

// 		return _.merge(jobConfig,
// 			yaml.safeLoad(_.template(
// 				readFileSync('source/data/template.yaml', 'utf8')
// 			)(jobConfig)
// 		))
// 	}))
// 	.pipe($.template())
// 	.pipe(setData('settings'))
// 	// .pipe(gulp.dest('./settings'))
// )

// gulp.task('compile:syntax', () => gulp.src(['source/syntax/*.yaml'])
// 	.pipe($.include())
// 	.pipe($.data(file_ => {
// 		const basename = path.basename(file_.path, '.yaml')
// 		const variantConfig = yaml.safeLoad(shell.cat(`source/data/default.yaml`))

// 		console.info(`Compiling ${config[basename].stem} syntax files.`)

// 		const jobConfig = _.merge({basename, uuid: uuid()},
// 			config, variantConfig, palettes.default, config[basename])

// 		return _.merge(jobConfig,
// 			yaml.safeLoad(_.template(
// 				shell.cat(`source/data/template.yaml`)
// 			)(jobConfig)
// 		))
// 	}))
// 	.pipe($.template())
// 	.pipe(setData(''))
// 	.pipe(gulp.dest('./syntax'))
// )

// gulp.task('compile:scheme', gulp.parallel(
// 	_.map(palettes, (palette_, name_) => function colourScheme() {
// 		const variantConfig = yaml.safeLoad(shell.cat(`source/data/${name_}.yaml`))

// 		return gulp.src('source/schemes/*.yaml')
// 			.pipe($.include())
// 			.pipe($.data(file_ => {
// 				const basename = path.basename(file_.path, '.yaml')
// 				console.info(`Compiling ${config[basename].stem} colour scheme for ${name_} variant.`)

// 				const processConfig = variantPalette_ => {
// 					const jobConfig = _.merge({basename, uuid: uuid()},
// 						config, variantConfig, palette_, variantPalette_, config[basename])

// 					return _.merge(jobConfig, yaml.safeLoad(_.template(
// 						shell.cat(`source/data/template.yaml`)
// 					)(jobConfig)))
// 				}
// 				return new Promise(resolve => {
// 					stat(palettePath)
// 					.then(() => resolve(processConfig(paintBox(
// 						require('require-all')({
// 							dirname: palettePath,
// 							recursive: true
// 						})
// 					))))
// 					.catch(() => resolve(processConfig({})))
// 				})
// 			}))
// 			.pipe($.template())
// 			.pipe(setData('editable'))
// 			.pipe(gulp.dest('./schemes'))
// 			.pipe($.yaml({space: 2}))
// 			.pipe(plistConverter())
// 			.pipe(setData('scheme'))
// 			.pipe(gulp.dest('./schemes'))
// 	})
// ))

// gulp.task('compile:theme', gulp.parallel(
// 	_.map(palettes, (palette_, name_) => function uiTheme() {
// 		const variantConfig = yaml.safeLoad(shell.cat(`source/data/${name_}.yaml`))
// 		return gulp.src('source/themes/theme.json')
// 			.pipe($.include())
// 			.pipe($.data(() => {
// 				console.info(`Compiling ${config.theme.stem} settings for ${name_} variant.`)

// 				const jobConfig = _.merge({basename: 'theme', uuid: uuid()},
// 					config, variantConfig, palette_, config.theme)

// 				return _.merge(jobConfig,
// 					yaml.safeLoad(_.template(
// 						shell.cat(`source/data/template.yaml`)
// 					)(jobConfig)
// 				))
// 			}))
// 			.pipe($.template())
// 			.pipe(setData('theme'))
// 			.pipe(gulp.dest('./'))
// 	})
// ))
