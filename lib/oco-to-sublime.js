/*
 *  ╭───╮  BespokePixels for Sublime Text 3
 *  │ S │  ────────────────────────────────
 *  ╰───╯  Open Color Converter
 */

const {OCOValueEX} = require('@thebespokepixel/oco-colorvalue-ex')
const _ = require('lodash')

function oco2Sublime(oco) {
	const output = {}
	const recurseForPath = (entry, tree) => {
		if (entry.name === 'Root') {
			return tree
		}

		return recurseForPath(entry.parent, {
			[entry.name]: tree
		})
	}

	oco.tree.traverseTree(['Color', 'Reference'], entry => {
		const color = entry.type === 'Color' ? entry : entry.resolved()
		_.merge(output, recurseForPath(entry.parent, {
			[entry.name]: {
				hex: `#${new OCOValueEX(color.get(0).identifiedValue.getOriginalInput(), entry.name).toHex8()}`,
				rgb: `${new OCOValueEX(color.get(0).identifiedValue.getOriginalInput(), entry.name).toArrayIntRGBA()}`
			}
		}))
	})
	return output
}

module.exports = oco2Sublime
