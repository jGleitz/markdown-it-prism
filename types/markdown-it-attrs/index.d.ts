/*
 * TEMPORARY TYPE OVERRIDE — REMOVE AS SOON AS POSSIBLE.
 * Why: markdown-it-attrs@5.0.1 bundles declarations written against
 * @types/markdown-it (v14), which conflict with markdown-it v15's bundled
 * declarations and break tsc for our test suite.
 * Remove when: a markdown-it-attrs release ships v15-compatible types.
 * Watch: https://github.com/arve0/markdown-it-attrs releases. On removal,
 * delete this directory and the "markdown-it-attrs" entry in tsconfig paths.
 */

declare module 'markdown-it-attrs' {
	import type { MarkdownIt as MarkdownItInstance } from 'markdown-it'

	const markdownItAttrs: (
		md: MarkdownItInstance,
		options?: {
			leftDelimiter?: string
			rightDelimiter?: string
			allowedAttributes?: Array<string | RegExp>
		},
	) => void

	export default markdownItAttrs
}
