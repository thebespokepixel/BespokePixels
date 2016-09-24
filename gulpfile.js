/*
 *  BespokePixels Gulp File
 */
const path = require('path')
// const fs = require('fs')
const crypto = require('crypto')

const gulp = require('gulp')
const gutil = require('gulp-util')
const shell = require('shelljs')
const yaml = require('js-yaml')
const plist = require('plist')
const through = require('through2')
// const promisify = require('es6-promisify')

const $ = require('gulp-load-plugins')()
const _ = require('lodash')

const TemplateHelper = require('./lib/template-helper-class')
const OpenColorHelper = require('./lib/opencolor-helper-class')

const config = yaml.safeLoad(shell.cat('source/data/config.yaml'))

const uuid = a => a ?
	((a ^	crypto.randomBytes(1)[0] % 16)	>> a / 4).toString(16) :
	([1e7] +	-1e3 + -4e3 + -8e3 +	-1e11).replace(/[018]/g, uuid)

const palette = new OpenColorHelper(`${__dirname}/source/palettes`)
	.loadAll(shell.find('source/palettes').map(path_ => path.resolve(path_)))

const preparePalette = palette_ => palette_.transformColors(['sublRGBA', 'hexRGBA'])

const plistConverter = () => through.obj(function (file, enc, cb) {
	if (file.isNull()) {
		return cb(null, file)
	}
	if (file.isStream()) {
		return cb(new gutil.PluginError('Theme compiler', 'Streaming not supported'))
	}
	try {
		file.contents = new Buffer(plist.build(JSON.parse(file.contents)))
		this.push(file)
	} catch (err) {
		this.emit('error', new gutil.PluginError('Theme compiler @plistConverter', err, {fileName: file.path}))
	}
	cb()
})

const setData = mode_ => through.obj(function (file, enc, cb) {
	if (file.isNull()) {
		return cb(null, file)
	}
	if (file.isStream()) {
		return cb(new gutil.PluginError('Theme compiler', 'Streaming not supported'))
	}
	try {
		file.extname = `.${file.data.extname[mode_]}`
		file.stem = `${file.data.stem}${file.data.ui_variant}`
		this.push(file)
	} catch (err) {
		this.emit('error', new gutil.PluginError('Theme compiler @setData', err, {fileName: file.path}))
	}
	cb()
})

gulp.task('default', () => palette
	.then(preparePalette)
	.then(p_ => {
		// console.dir(p_.pick(), {
		// 	depth: 2,
		// 	colors: true
		// })

		console.log(p_.render())
	})
)

gulp.task('compile:settings', () => gulp.src(['source/settings/*.json'])
	.pipe($.include())
	.pipe($.data(file_ => {
		const basename = path.basename(file_.path, '.json')
		const variantConfig = yaml.safeLoad(shell.cat(`source/data/default.yaml`))

		console.info(`Compiling ${config[basename].stem} settings...`)

		const jobConfig = _.merge({basename, uuid: uuid()},
			config, variantConfig, palettes.default, config[basename])

		return _.merge(jobConfig,
			yaml.safeLoad(_.template(
				shell.cat(`source/data/template.yaml`)
			)(jobConfig)
		))
	}))
	.pipe($.template())
	.pipe(setData('settings'))
	.pipe(gulp.dest('./settings'))
)

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
// 	.pipe(setData('syntax'))
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
