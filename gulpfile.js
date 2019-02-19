/*
 *  BespokePixels Gulp File
 */
const path = require('path')
const {readFileSync} = require('fs')
const crypto = require('crypto')

const {paletteReader} = require('@thebespokepixel/palette2oco')
const gulp = require('gulp')
const PluginError = require('plugin-error')
const yaml = require('js-yaml')
const plist = require('plist')
const through = require('through2')
const $ = require('gulp-load-plugins')()
const _ = require('lodash')
const oco2Sublime = require('./lib/oco-to-sublime')

const config = yaml.safeLoad(readFileSync('source/config.yaml', 'utf8'))

const uuid = a => a ?
	((a ^	crypto.randomBytes(1)[0] % 16)	>> a / 4).toString(16) :
	([1e7] +	-1e3 + -4e3 + -8e3 +	-1e11).replace(/[018]/g, uuid)


const plistConverter = () => through.obj(function (file, enc, cb) {
	if (file.isNull()) {
		return cb(null, file)
	}

	if (file.isStream()) {
		return cb(new PluginError('Theme compiler', 'Streaming not supported'))
	}

	try {
		file.contents = new Buffer.from(plist.build(JSON.parse(file.contents)))
		this.push(file)
	} catch (err) {
		this.emit('error', new PluginError('Theme compiler @plistConverter', err, {fileName: file.path}))
	}
	cb()
})

const setData = mode_ => through.obj(function (file, enc, cb) {
	if (file.isNull()) {
		return cb(null, file)
	}

	if (file.isStream()) {
		return cb(new PluginError('Theme compiler', 'Streaming not supported'))
	}

	try {
		file.extname = `.${file.data.extname[mode_]}`
		file.stem = `${file.data.stem}`
		this.push(file)
	} catch (err) {
		this.emit('error', new PluginError('Theme compiler @setData', err, {fileName: file.path}))
	}
	cb()
})

function setPaths (cfg) {
	const paths = cfg.paths
	const requireProvider = () => {
		if (cfg.requires) {
			return cfg.types[cfg.requires].provider
		}
		return 'none'
	}

	return {
		paths: {
			scheme: `${paths.root}${paths.package}${paths.schemes}/${cfg.stem}.${cfg.extname.scheme}`,
			require: `${paths.root}${paths.package}${paths.syntax}/${requireProvider()}.${cfg.extname.syntax}`,
			external: `${paths.root}/${requireProvider()}.${cfg.extname.syntax}`
		},
		display_name: `${cfg.display} ${cfg.syntax.mark}`
	}
}

function setConfig(palette, type, ext) {
	return function (file_) {
		const basename = path.basename(file_.path, `.${ext}`)
		console.info(`Compiling ${config.types[basename].stem} ${type}...`)

		const jobConfig = {
			basename,
			uuid: uuid(),
			palette: palette.BespokePixels,
			...config,
			...config.types[basename]
		}

		return _.merge(jobConfig, setPaths(jobConfig))
	}
}

async function setPalette() {
	return paletteReader('source')
	.load(['source/BespokePixels.oco'])
	.then(oco2Sublime)
}

gulp.task('compile:settings', async () => {
	const palette = await setPalette()
	return gulp.src(['source/settings/*.json'])
		.pipe($.include())
		.pipe($.data(setConfig(palette, 'settings', 'json')))
		.pipe($.template())
		.pipe(setData('settings'))
		.pipe(gulp.dest('./settingsNew'))
})

gulp.task('compile:syntax', async () => {
	const palette = await setPalette()
	return gulp.src(['source/syntax/*.yaml'])
		.pipe($.include())
		.pipe($.data(setConfig(palette, 'syntax', 'yaml')))
		.pipe($.template())
		.pipe(setData('syntax'))
		.pipe(gulp.dest('./syntaxNew'))
})

gulp.task('compile:schemes', async () => {
	const palette = await setPalette()
	return gulp.src(['source/schemes/*.yaml'])
		.pipe($.include())
		.pipe($.data(setConfig(palette, 'schemes', 'yaml')))
		.pipe($.template())
		.pipe(setData('editable'))
		.pipe(gulp.dest('./schemesNew'))
		.pipe($.yaml({space: 2}))
		.pipe(plistConverter())
		.pipe(setData('scheme'))
		.pipe(gulp.dest('./schemesNew'))
})

gulp.task('compile:theme', async () => {
	const palette = await setPalette()
	return gulp.src(['source/themes/*.json'])
		.pipe($.include())
		.pipe($.data(setConfig(palette, 'theme', 'json')))
		.pipe($.template())
		.pipe(setData('theme'))
		.pipe(gulp.dest('./themeNew'))
})

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
