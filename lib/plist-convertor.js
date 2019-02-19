/*
 *  ╭───╮  BespokePixels for Sublime Text 3
 *  │ S │  ────────────────────────────────
 *  ╰───╯  pList Converter
 */

const PluginError = require('plugin-error')
const through = require('through2')
const plist = require('plist')

module.exports = () => through.obj(function (file, enc, cb) {
	if (file.isNull()) {
		return cb(null, file)
	}

	if (file.isStream()) {
		return cb(new PluginError('Theme compiler', 'Streaming not supported'))
	}

	try {
		file.contents = Buffer.from(plist.build(JSON.parse(file.contents)))
		this.push(file)
	} catch (error) {
		this.emit(
			'error',
			new PluginError(
				'Theme compiler @plistConverter',
				error,
				{fileName: file.path}
			)
		)
	}

	cb()
})
