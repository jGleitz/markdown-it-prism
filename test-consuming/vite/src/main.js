import MarkdownIt from 'markdown-it'
import prism from 'markdown-it-prism'
import 'prismjs/components/prism-clike.js'
import 'prismjs/components/prism-java.js'

const source = '```java\nclass Foo {}\n```'
document.querySelector('#control').innerHTML = new MarkdownIt().use(prism).render(source)
document.querySelector('#output').innerHTML = new MarkdownIt().use(prism).render(source)

try {
	document.querySelector('#plugins').innerHTML = new MarkdownIt().use(prism, { plugins: ['highlight-keywords'] }).render(source)
} catch (error) {
	document.querySelector('#plugins').textContent = error.message
}

try {
	new MarkdownIt().use(prism, { plugins: ['definitely-not-a-prism-plugin'] })
} catch (error) {
	document.querySelector('#plugins-neg').textContent = error.message
}

try {
	new MarkdownIt().use(prism, { plugins: ['highlight-keywords'] })
	document.querySelector('#plugins-dup').innerHTML = new MarkdownIt().use(prism, { plugins: ['highlight-keywords'] }).render(source)
} catch (error) {
	document.querySelector('#plugins-dup').textContent = error.message
}
