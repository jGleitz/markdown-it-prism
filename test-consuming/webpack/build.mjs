import { fileURLToPath } from 'node:url'
import webpack from 'webpack'

webpack({
	mode: 'production',
	target: 'web',
	entry: './src/main.js',
	output: {
		path: fileURLToPath(new URL('./dist', import.meta.url)),
		filename: 'main.bundle.js',
	},
}, (error, stats) => {
	if (error) throw error
	if (stats?.hasErrors()) throw new Error(stats.toString({ all: false, errors: true }))
})
