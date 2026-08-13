export default {
	build: {
		manifest: true,
		rollupOptions: {
			output: {
				format: 'iife',
				inlineDynamicImports: true,
			},
		},
	},
}
