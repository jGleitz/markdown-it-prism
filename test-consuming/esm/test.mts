import MarkdownIt from 'markdown-it'
import prism from 'markdown-it-prism'

if (typeof require !== 'undefined' || typeof __filename !== 'undefined') {
	throw new Error('CJS globals present in native Node ESM — the plugins case no longer proves the import.meta.url loader path')
}

const markdown = new MarkdownIt().use(prism)
if (!markdown.render('```javascript\nconst value = 1\n```').includes('<span class="token')) {
	throw new Error('Fenced JavaScript was not highlighted')
}

const markdownWithPlugin = new MarkdownIt().use(prism, { plugins: ['show-language'] })
if (!markdownWithPlugin.render('```javascript\nconst value = 1\n```').includes('<span class="token')) {
	throw new Error('Fenced JavaScript was not highlighted after loading show-language')
}
