/*
 *  ╭───╮  BespokePixels for Sublime Text 3
 *  │ S │  ────────────────────────────────
 *  ╰───╯  Config setter
 */

const {basename} = require('path')
const {readFileSync} = require('fs')
const _ = require('lodash')
const log = require('fancy-log')
const yaml = require('js-yaml')
const uuid = require('./uuid')
const setPaths = require('./set-paths')

function setConfig(palette, type, ext) {
	return function (file_) {
		const config = yaml.safeLoad(readFileSync('source/config.yaml', 'utf8'))
		const base = basename(file_.path, `.${ext}`)
		log(`[${type}] Compiling ${config.types[base].stem}...`)

		const jobConfig = _.merge(
			config,
			{
				basename: base,
				uuid: uuid(),
				palette: palette.BespokePixels
			},
			config.types[base]
		)

		return _.merge(jobConfig, setPaths(jobConfig))
	}
}

module.exports = setConfig
