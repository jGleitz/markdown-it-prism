import markdownit from 'markdown-it'
import markdownItPrism from '../src'
import fs from 'fs'

const read = async (path: string) => (await fs.promises.readFile(`testdata/${path}`)).toString()

describe('markdown-it-prism', () => {

	it('highlights fenced code blocks with a language specification using Prism', async () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(await read('input/fenced-with-language.md'))
		).toEqual(await read('expected/fenced-with-language.html'))
	})

	it('throws for unknown plugins', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				plugins: ['foo']
			})).toThrowError(/plugin/)
	})

	it('throws for unknown defaultLanguage', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				defaultLanguage: 'i-dont-exist'
			})).toThrowError(/defaultLanguage.*i-dont-exist/)
	})

	it('throws for unknown defaultLanguageForUnknown', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnknown: 'i-dont-exist'
			})).toThrowError(/defaultLanguageForUnknown.*i-dont-exist/)
	})

	it('throws for unknown defaultLanguageForUnspecified', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnspecified: 'i-dont-exist'
			})).toThrowError(/defaultLanguageForUnspecified.*i-dont-exist/)
	})

	it('offers an init function for further initialisation', () => {
		const initCallback = jest.fn(prism => {
			expect(prism).toHaveProperty('plugins')
		})
		markdownit()
			.use(markdownItPrism, {init: initCallback})
		expect(initCallback).toHaveBeenCalled
	})

	it('does not add classes to fenced code blocks without language specification', async () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(await read('input/fenced-without-language.md'))
		).toEqual(await read('expected/fenced-without-language.html'))
	})

	it('falls back to defaultLanguageForUnspecified if no language is specified', async () => {
		expect(markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnspecified: 'java'
			})
			.render(await read('input/fenced-without-language.md'))
		).toEqual(await read('expected/fenced-with-language.html'))
	})

	it('falls back to defaultLanguage if no language and no defaultLanguageForUnspecified is specified', async () => {
		expect(markdownit()
			.use(markdownItPrism, {
				defaultLanguage: 'java'
			})
			.render(await read('input/fenced-without-language.md'))
		).toEqual(await read('expected/fenced-with-language.html'))
	})

	it('does not add classes to indented code blocks', async () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(await read('input/indented.md'))
		).toEqual(await read('expected/indented.html'))
	})

	it('adds classes even if the language is unknown', async () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(await read('input/fenced-with-unknown-language.md'))
		).toEqual(await read('expected/fenced-with-unknown-language.html'))
	})

	it('escapes HTML in the language name', async () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(await read('input/fenced-with-html-in-language.md'))
		).toEqual(await read('expected/fenced-with-html-in-language.html'))
	})

	it('falls back to defaultLanguageForUnknown if the specified language is unknown', async () => {
		expect(markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnknown: 'java'
			})
			.render(await read('input/fenced-with-unknown-language.md'))
		).toEqual(await read('expected/fenced-with-language.html'))
	})

	it('falls back to defaultLanguage if the specified language is unknown and no defaultLanguageForUnknown is specified', async () => {
		expect(markdownit()
			.use(markdownItPrism, {
				defaultLanguage: 'java'
			})
			.render(await read('input/fenced-with-unknown-language.md'))
		).toEqual(await read('expected/fenced-with-language.html'))
	})

	it('respects markdown-it’s langPrefix setting', async () => {
		expect(
			markdownit({
				langPrefix: 'test-'
			})
				.use(markdownItPrism)
				.render(await read('input/fenced-with-language.md'))
		).toEqual(await read('expected/fenced-with-language-prefix.html'))
	})

	it('is able to resolve C++ correctly', async () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(await read('input/cpp.md'))
		).toEqual(await read('expected/cpp.html'))
	})

	describe('plugin support', () => {

		afterEach(() => {
			jest.resetModules()
		})

		it('allows to use Prism plugins', async () => {
			expect(markdownit()
				.use(markdownItPrism, {
					plugins: [
						'highlight-keywords',
						'show-language'
					]
				})
				.render(await read('input/fenced-with-language.md'))
			).toEqual(await read('expected/fenced-with-language-plugins.html'))
		})
	})
})
