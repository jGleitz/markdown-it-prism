import markdownit from 'markdown-it'
// @ts-ignore markdown-it-attrs has no types, and it’s not worth the effort adding a *.d.ts file
import markdownItAttrs from 'markdown-it-attrs'
import markdownItPrism from '../src'
import {read} from './util'

describe('plugin support', () => {
	afterEach(() => jest.resetModules())

	it('allows to use markdown-it-attrs (attrs loaded first)', async () => {
		expect(markdownit()
			.use(markdownItAttrs)
			.use(markdownItPrism, {highlightInlineCode: true})
			.render(await read('input/all-with-attrs.md'))
		).toEqual(await read('expected/all-with-attrs.html'))
	})

	it('allows to use markdown-it-attrs (attrs loaded second)', async () => {
		expect(markdownit()
			.use(markdownItPrism, {highlightInlineCode: true})
			.use(markdownItAttrs)
			.render(await read('input/all-with-attrs.md'))
		).toEqual(await read('expected/all-with-attrs.html'))
	})

	it('allows to use Prism plugins', async () => {
		expect(markdownit()
			.use(markdownItPrism, {
				highlightInlineCode: true,
				plugins: [
					'highlight-keywords',
					'show-language'
				]
			})
			.render(await read('input/all-with-language.md'))
		).toEqual(await read('expected/all-with-language-and-plugins.html'))
	})
})
