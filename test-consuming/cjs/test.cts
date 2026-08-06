import MarkdownIt = require('markdown-it')
import prism = require('markdown-it-prism')

if (typeof prism !== 'function') {
	throw new TypeError('CommonJS require did not return a callable markdown-it plugin')
}

const markdown = new MarkdownIt()
markdown.use(prism)
if (!markdown.render('```javascript\nconst value = 1\n```').includes('<span class="token')) {
	throw new Error('Fenced JavaScript was not highlighted')
}

if (Reflect.get(prism, 'default') !== prism) {
	throw new Error('CommonJS default compatibility alias did not reference the callable plugin')
}
