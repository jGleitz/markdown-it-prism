import markdownit from 'markdown-it'
import markdownItPrism from '../src'

describe('option handling', () => {
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
		const initCallback = jest.fn((prism) => {
			expect(prism).toHaveProperty('plugins')
		})
		markdownit()
			.use(markdownItPrism, { init: initCallback })
		expect(initCallback).toHaveBeenCalled()
	})
})
