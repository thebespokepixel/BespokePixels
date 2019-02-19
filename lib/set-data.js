/*
 *  ╭───╮  BespokePixels for Sublime Text 3
 *  │ S │  ────────────────────────────────
 *  ╰───╯  Data setter
 */

const PluginError = require('plugin-error')
const through = require('through2')

module.exports = mode_ => through.obj(function (file, enc, cb) {
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
	} catch (error) {
		this.emit(
			'error',
			new PluginError(
				'Theme compiler @setData',
				error,
				{fileName: file.path}
			)
		)
	}

	cb()
})
