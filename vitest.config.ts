import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		// Vitest 4 always injects CJS globals into inlined source modules; 4.x has no injectCjsGlobals switch.
		// Unit tests exercise the source loader's require/__filename branch; T13 proves native ESM import.meta.url.
		// Stable Vitest 5 can restore unit-level ESM purity with injectCjsGlobals: false.
		environment: 'node',
		globals: false,
	},
})
