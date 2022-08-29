import markdownit from 'markdown-it'

import markdownItPrism from '../src'
import {read} from './util'

const codeSectionTypeSettings = {
	'fenced': {},
	'inline': {highlightInlineCode: true}
}

describe('code highlighting', () => {
	Object.entries(codeSectionTypeSettings).forEach(([codeSectionType, options]) => describe(`${codeSectionType} code`, () => {

		it('highlights code with a language specification using Prism', async () => {
			expect(markdownit()
				.use(markdownItPrism, options)
				.render(await read(`input/${codeSectionType}/with-language.md`))
			).toEqual(await read(`expected/${codeSectionType}/with-language.html`))
		})

		it('does not add classes to code without language specification', async () => {
			expect(markdownit()
				.use(markdownItPrism, options)
				.render(await read(`input/${codeSectionType}/without-language.md`))
			).toEqual(await read(`expected/${codeSectionType}/without-language.html`))
		})

		it('falls back to defaultLanguageForUnspecified if no language is specified', async () => {
			expect(markdownit()
				.use(markdownItPrism, {
					defaultLanguageForUnspecified: 'java',
					...options
				})
				.render(await read(`input/${codeSectionType}/without-language.md`))
			).toEqual(await read(`expected/${codeSectionType}/with-language.html`))
		})

		it('falls back to defaultLanguage if no language and no defaultLanguageForUnspecified is specified', async () => {
			expect(markdownit()
				.use(markdownItPrism, {
					defaultLanguage: 'java',
					...options
				})
				.render(await read(`input/${codeSectionType}/without-language.md`))
			).toEqual(await read(`expected/${codeSectionType}/with-language.html`))
		})

		it('does not add classes to indented code blocks', async () => {
			expect(markdownit()
				.use(markdownItPrism, options)
				.render(await read('input/indented.md'))
			).toEqual(await read('expected/indented.html'))
		})

		it('adds classes even if the language is unknown', async () => {
			expect(markdownit()
				.use(markdownItPrism, options)
				.render(await read(`input/${codeSectionType}/with-unknown-language.md`))
			).toEqual(await read(`expected/${codeSectionType}/with-unknown-language.html`))
		})

		it('escapes HTML in the language name', async () => {
			expect(markdownit()
				.use(markdownItPrism, options)
				.render(await read(`input/${codeSectionType}/with-html-in-language.md`))
			).toEqual(await read(`expected/${codeSectionType}/with-html-in-language.html`))
		})

		it('falls back to defaultLanguageForUnknown if the specified language is unknown', async () => {
			expect(markdownit()
				.use(markdownItPrism, {
					defaultLanguageForUnknown: 'java',
					...options
				})
				.render(await read(`input/${codeSectionType}/with-unknown-language.md`))
			).toEqual(await read(`expected/${codeSectionType}/with-language.html`))
		})

		it('falls back to defaultLanguage if the specified language is unknown and no defaultLanguageForUnknown is specified', async () => {
			expect(markdownit()
				.use(markdownItPrism, {
					defaultLanguage: 'java',
					...options
				})
				.render(await read(`input/${codeSectionType}/with-unknown-language.md`))
			).toEqual(await read(`expected/${codeSectionType}/with-language.html`))
		})

		it('respects markdown-it’s langPrefix setting', async () => {
			expect(
				markdownit({
					langPrefix: 'test-',
				})
					.use(markdownItPrism, options)
					.render(await read(`input/${codeSectionType}/with-language.md`))
			).toEqual(await read(`expected/${codeSectionType}/with-language-prefix.html`))
		})

		it('is able to resolve C++ correctly', async () => {
			expect(markdownit()
				.use(markdownItPrism, options)
				.render(await read(`input/${codeSectionType}/cpp.md`))
			).toEqual(await read(`expected/${codeSectionType}/cpp.html`))
		})
	}))

	it('does not highlight inline code unless configured', async () => {
		expect(markdownit()
			.use(markdownItPrism, codeSectionTypeSettings.fenced)
			.render(await read('input/inline/with-language.md'))
		).toEqual(await (read('expected/inline/not-highlighted.html')))
	})
})
