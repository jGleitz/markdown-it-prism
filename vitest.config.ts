import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		// Vitest 4 injects CJS globals into inlined modules; Vitest 5 can restore unit-level ESM purity with injectCjsGlobals: false.
		environment: 'node',
		globals: false,
	},
})
