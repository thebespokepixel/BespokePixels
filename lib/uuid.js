/*
 *  ╭───╮  BespokePixels for Sublime Text 3
 *  │ S │  ────────────────────────────────
 *  ╰───╯  Simple UUID generator
 */

const {randomBytes} = require('crypto')

const uuid = a => a ?
	((a ^	randomBytes(1)[0] % 16)	>> a / 4).toString(16) :
	([1e7] +	-1e3 + -4e3 + -8e3 +	-1e11).replace(/[018]/g, uuid)

module.exports = uuid
