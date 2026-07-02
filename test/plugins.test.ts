import markdownit from 'markdown-it'
// @ts-ignore markdown-it-attrs has no types, and it’s not worth the effort adding a *.d.ts file
import markdownItAttrs from 'markdown-it-attrs'
import markdownItPrism from '../src'
import { read } from './util'

function assertFenceInfoContainsAttributes(md: ReturnType<typeof markdownit>) {
	md.core.ruler.after('prism_resolve_fence_language', 'assert_fence_info_contains_attributes', (state) => {
		const fenceToken = state.tokens.find(token => token.type === 'fence')
		expect(fenceToken?.info).toContain('{.preserve-marker}')
	})
}

describe('plugin support', () => {
	afterEach(() => jest.resetModules())

	it('produces identical output regardless of markdown-it-attrs load order', async () => {
		const markdown = await read('input/all-with-attrs.md')
		const expected = await read('expected/all-with-attrs.html')
		const attrsFirst = markdownit()
			.use(markdownItAttrs)
			.use(markdownItPrism, { highlightInlineCode: true })
			.render(markdown)
		const prismFirst = markdownit()
			.use(markdownItPrism, { highlightInlineCode: true })
			.use(markdownItAttrs)
			.render(markdown)
		expect(attrsFirst).toEqual(prismFirst)
		expect(attrsFirst).toEqual(expected)
	})

	it('preserves attributes in fence info when attrs loaded first', async () => {
		expect(markdownit()
			.use(markdownItAttrs)
			.use(markdownItPrism, { highlightInlineCode: true, defaultLanguageForUnspecified: 'java' })
			.use(assertFenceInfoContainsAttributes)
			.render(await read('input/fence-info-attrs.md'))
		).toEqual(await read('expected/fence-info-attrs.html'))
	})

	it('preserves attributes in fence info when prism loaded first', async () => {
		expect(markdownit()
			.use(markdownItPrism, { highlightInlineCode: true, defaultLanguageForUnspecified: 'java' })
			.use(markdownItAttrs)
			.use(assertFenceInfoContainsAttributes)
			.render(await read('input/fence-info-attrs.md'))
		).toEqual(await read('expected/fence-info-attrs.html'))
	})

	it('allows to use Prism plugins', async () => {
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
