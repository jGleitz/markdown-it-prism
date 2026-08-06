import markdownit from 'markdown-it'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import markdownItPrism from '../src/index.js'
import loadLanguages from 'prismjs/components/index.js'

describe('option handling', () => {
	beforeAll(() => {
		loadLanguages.silent = true
	})

	it('throws for unknown plugins', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				plugins: ['foo'],
			})).toThrow(/plugin/)
	})

	it('throws for unknown defaultLanguage', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				defaultLanguage: 'i-dont-exist',
			})).toThrow(/defaultLanguage.*i-dont-exist/)
	})

	it('throws for unknown defaultLanguageForUnknown', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnknown: 'i-dont-exist',
			})).toThrow(/defaultLanguageForUnknown.*i-dont-exist/)
	})

	it('throws for unknown defaultLanguageForUnspecified', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnspecified: 'i-dont-exist',
			})).toThrow(/defaultLanguageForUnspecified.*i-dont-exist/)
	})

	it('offers an init function for further initialisation', () => {
		const initCallback = vi.fn((prism) => {
			expect(prism).toHaveProperty('plugins')
		})
		markdownit()
			.use(markdownItPrism, { init: initCallback })
		expect(initCallback).toHaveBeenCalled()
	})

	it('uses defaults when required options are explicitly undefined', () => {
		const input = '```js\nconst value = 1\n```'
		const defaultRender = markdownit()
			.use(markdownItPrism)
			.render(input)
		const explicitUndefinedRender = markdownit()
			.use(markdownItPrism, {
				plugins: undefined,
				init: undefined,
				highlightInlineCode: undefined,
			})
			.render(input)

		expect(explicitUndefinedRender).toBe(defaultRender)
	})
})
