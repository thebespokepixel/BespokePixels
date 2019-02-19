/*
 *  ╭───╮  BespokePixels for Sublime Text 3
 *  │ S │  ────────────────────────────────
 *  ╰───╯  Path setter
 */

function setPaths(cfg) {
	const {paths} = cfg

	const requireProvider = () => {
		if (cfg.requires) {
			return cfg.types[cfg.requires].provides
		}

		return 'none'
	}

	return {
		paths: {
			scheme: `${paths.root}${paths.package}${paths.schemes}/${cfg.stem}.${cfg.extname.scheme}`,
			require: `${paths.root}${paths.package}${paths.syntax}/${requireProvider()}.${cfg.extname.syntax}`,
			external: `${paths.root}/${requireProvider()}.${cfg.extname.syntax}`
		},
		displayName: `${cfg.display} ${cfg.syntax.mark}`
	}
}

module.exports = setPaths
