/*
 *  ╭───╮  BespokePixels for Sublime Text 3
 *  │ S │  ────────────────────────────────
 *  ╰───╯  Open Color Helper Class
 */

const path = require('path')
const fs = require('fs')
const promisify = require('es6-promisify')
const oco = require('opencolor')
const OCOValueEX = require('@thebespokepixel/oco-colorvalue-ex')

const loader = promisify(fs.readFile)

// class OCOValueEX extends tinycolor {
// 	constructor(color_, name_, options_) {
// 		super(color_, options_)
// 		this._name = name_
// 	}

// 	get alphaActive() {
// 		return this._a < 1 && this._a >= 0
// 	}

// 	toSublimeUI() {
// 		const alphaSuffix = this.alphaActive ? `, ${Math.round(this._a * 255)}` : ''

// 		return `[${
// 			Math.round(this._r)
// 		}, ${
// 			Math.round(this._g)
// 		}, ${
// 			Math.round(this._b)
// 		}${alphaSuffix}]`
// 	}

// 	rgbaToHexRGBA(allowRGBA) {
// 		const hexAA = this.alphaActive ? bstr.pad(Math.round(this._a * 255).toString(16), 2, '0').toUpperCase() : ''
// 		const hexA = this.alphaActive && allowRGBA && hexAA[0] === hexAA[1] ? hexAA[0] : hexAA

// 		const hexRGB = this.toHex(allowRGBA && hexA.length === 1).toUpperCase()
// 		return `#${hexRGB}${hexA}`
// 	}

// 	toString(format) {
// 		format = format || this._format
// 		let output
// 		switch (format) {
// 			case 'sublRGBA':
// 				output = this.toSublimeUI()
// 				break

// 			case 'hexRGBA':
// 				output = this.rgbaToHexRGBA(true)
// 				break

// 			default:
// 				output = super.toString(format)
// 		}
// 		return output
// 	}

// 	static fromJSON(raw_) {
// 		return new OCOValueEX(
// 			tinycolor.fromRatio({
// 				r: raw_.red,
// 				g: raw_.green,
// 				b: raw_.blue,
// 				a: raw_.alpha
// 			}), raw_.name
// 		)
// 	}

// 	static isJSON(is_) {
// 		const tests = {
// 			palette: {
// 				name: (typeof is_.name === 'string') && is_.name,
// 				colors: (Array.isArray(is_.colors)) && is_.colors
// 			},
// 			rgba: {
// 				name: typeof is_.name === 'string' && is_.name,
// 				red: (is_.red >= 0.0 && is_.red <= 1.0) && is_.red,
// 				green: (is_.green >= 0.0 && is_.green <= 1.0) && is_.green,
// 				blue: (is_.blue >= 0.0 && is_.blue <= 1.0) && is_.blue,
// 				alpha: (is_.alpha >= 0.0 && is_.alpha <= 1.0) && is_.alpha
// 			}
// 		}
// 		return {
// 			palette: _.isEqual(is_, tests.palette),
// 			rgba: _.isEqual(is_, tests.rgba)
// 		}
// 	}

// 	static generatePalette(name_, colorArray_) {
// 		return new oco.Entry(
// 			name_,
// 			colorArray_.map(color_ => new oco.Entry(
// 				color_._name,
// 				[new oco.ColorValue('original', color_.toRgbString(), color_)],
// 				'Color',
// 				-1
// 			))
// 		)
// 	}
// }

class OpenColorHelper {
	constructor(source_) {
		this.sourcePath = source_
		this.tree = new oco.Entry()
	}

	pick(key_) {
		return key_ ? this.tree.get(key_) : this.tree.root()
	}

	transformColors(formats_) {
		this.tree.traverseTree('Color', color_ => {
			const original = color_.get(0).identifiedValue.getOriginalInput()
			color_.children = []

			formats_.forEach((format, index_) => {
				const newFormat = new OCOValueEX(original, color_.name)
				newFormat._format = format

				color_.addChild(new oco.ColorValue(
					format,
					newFormat.toString(format),
					newFormat
				), true, index_)
			})
		})
		return this
	}

	loadJSON(identity_) {
		return loader(identity_.source, 'utf8').then(JSON.parse)
			.then(palette_ => {
				if (OCOValueEX.isJSON(palette_).palette) {
					return OCOValueEX.generatePalette(
						identity_.name,
						palette_.colors.map(raw_ => {
							if (OCOValueEX.isJSON(raw_).rgba) {
								return OCOValueEX.fromJSON(raw_)
							}
							throw new Error(`${raw_.name}.json is not a valid JSON RGBA object`)
						})
					)
				}
				throw new Error(`${identity_.name}.json is not a palette`)
			}
		)
	}

	loadOCO(identity_) {
		return loader(identity_.source, 'utf8').then(oco.parse)
	}

	loadAll(pathArray_) {
		return Promise.all(pathArray_
			.filter(file_ => file_.match(/\.(json|oco)$/))
			.map(path_ => {
				const address = path_
					.replace(this.sourcePath, '')
					.match(/(.*\/)(.+?).(json|oco)$/)
				return {
					source: path_,
					name: address[2],
					path: address[1].replace(/^\//, '').replace(/\//g, '.'),
					type: address[3]
				}
			}).map(identity_ => (identity_.type === 'json' ?
				this.loadJSON(identity_) : this.loadOCO(identity_))
				.then(entry_ => {
					entry_.addMetadata({
						'import/file/source': path.relative(__dirname, identity_.source),
						'import/file/type': identity_.type
					})
					return entry_
				})
				.then(entry_ => this.tree.set(`${identity_.path}${identity_.name}`, entry_))
			)
		).then(() => this)
	}

	render(path_) {
		return oco.render(this.pick(path_))
	}
}

module.exports = OpenColorHelper
