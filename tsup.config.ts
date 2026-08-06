import { defineConfig } from 'tsup'

const shared = {
	entry: ['src/index.ts'],
	bundle: false,
	dts: true,
	clean: false,
	target: 'es2022',
	outDir: 'dist',
}

export default defineConfig([
	{ ...shared, format: ['esm'] },
	{ ...shared, format: ['cjs'], cjsInterop: true },
])
