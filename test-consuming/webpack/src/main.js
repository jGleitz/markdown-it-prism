import MarkdownIt from 'markdown-it'
import prism from 'markdown-it-prism'
import 'prismjs/components/prism-clike.js'
import 'prismjs/components/prism-java.js'

const source = '```java\nclass Foo {}\n```'
const render = (id, plugins = [], repeat = false) => {
	try {
		if (repeat) new MarkdownIt().use(prism, { plugins })
		document.querySelector(id).innerHTML = new MarkdownIt().use(prism, { plugins }).render(source)
	}
	catch (error) { document.querySelector(id).textContent = error.message }
}
render('#control'); render('#output'); render('#plugins', ['highlight-keywords'])
render('#plugins-neg', ['definitely-not-a-prism-plugin']); render('#plugins-dup', ['highlight-keywords'], true)
