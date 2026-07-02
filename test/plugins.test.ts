import markdownit from 'markdown-it'
import markdownItAttrs from 'markdown-it-attrs'
import markdownItPrism from '../src'
import { read } from './util'

describe('plugin support', () => {
	afterEach(() => jest.resetModules())

	it('is compatible with markdown-it-attrs (attrs loaded first)', async () => {
		expect(markdownit()
			.use(markdownItAttrs)
			.use(markdownItPrism, { highlightInlineCode: true })
			.render(await read('input/all-with-attrs.md'))
		).toEqual(await read('expected/all-with-attrs.html'))
	})

	it('is compatible with markdown-it-attrs (prism loaded first)', async () => {
		expect(markdownit()
			.use(markdownItPrism, { highlightInlineCode: true })
			.use(markdownItAttrs)
			.render(await read('input/all-with-attrs.md'))
		).toEqual(await read('expected/all-with-attrs.html'))
	})

	it('is compatible with markdown-it-attrs when using custom delimiters (attrs loaded first)', async () => {
		expect(markdownit()
			.use(markdownItAttrs, { leftDelimiter: '«', rightDelimiter: '»' })
			.use(markdownItPrism, { highlightInlineCode: true })
			.render(await read('input/all-with-attrs-custom-delimiters.md'))
		).toEqual(await read('expected/all-with-attrs.html'))
	})

	it('is compatible with markdown-it-attrs when using custom delimiters (prism loaded first)', async () => {
		expect(markdownit()
			.use(markdownItPrism, { highlightInlineCode: true })
			.use(markdownItAttrs, { leftDelimiter: '«', rightDelimiter: '»' })
			.render(await read('input/all-with-attrs-custom-delimiters.md'))
		).toEqual(await read('expected/all-with-attrs.html'))
	})

	it('highlights a solitaire inline code when markdown-it-attrs is loaded (attrs loaded first)', async () => {
		expect(markdownit()
			.use(markdownItAttrs)
			.use(markdownItPrism, { highlightInlineCode: true })
			.render(await read('input/inline/with-language.md'))
		).toEqual(await read('expected/inline/with-language.html'))
	})

	it('highlights a solitaire inline code when markdown-it-attrs is loaded (prism loaded first)', async () => {
		expect(markdownit()
			.use(markdownItPrism, { highlightInlineCode: true })
			.use(markdownItAttrs)
			.render(await read('input/inline/with-language.md'))
		).toEqual(await read('expected/inline/with-language.html'))
	})

	it('allows using Prism plugins', async () => {
		expect(markdownit()
			.use(markdownItPrism, {
				highlightInlineCode: true,
				plugins: [
					'highlight-keywords',
					'show-language',
				],
			})
			.render(await read('input/all-with-language.md'))
		).toEqual(await read('expected/all-with-language-and-plugins.html'))
	})

	it('loads with the commonmark preset and renders fenced code', async () => {
		expect(markdownit('commonmark')
			.use(markdownItPrism)
			.render('```js\nconst value = 1\n```')
		).toEqual('<pre><code class="language-js"><span class="token keyword keyword-const">const</span> value <span class="token operator">=</span> <span class="token number">1</span>\n</code></pre>\n')
	})
})
