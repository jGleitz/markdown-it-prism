import Prism from 'prismjs';
const md = require('markdown-it')();

const DEFAULTS = {
	plugins: [],
	init: () => { }
};


/**
 * Loads the provided <code>lang</code> into prism.
 *
 * @param <String> lang
 *		Code of the language to load.
 * @return <Object?> The prism language object for the provided <code>lang</code> code. <code>undefined</code> if the code is not known to prism.
 */
function loadPrismLang(lang) {
	let langObject = Prism.languages[lang];
	if (langObject === undefined) {
		try {
			require('prismjs/components/prism-' + lang);
			return Prism.languages[lang];
		} catch (e) {
			// nothing to do
		}
	}
	return langObject;
}

function loadPrismPlugin(name) {
	try {
		require(`prismjs/plugins/${name}/prism-${name}`);
	} catch (e) {
		throw new Error(`Cannot load Prism plugin "${name}". Please check the spelling.`);
	}
}

/**
 * Highlights the provided text using Prism.
 *
 * @param <String> text
 * 		The text to highlight.
 * @param <String> lang
 *		Code of the language to highlight the text in.
 * @return <String> If Prism can highlight <code>text</code> in using <code>lang</code>, the highlighted code. Unchanged <code>text</code> otherwise.
 */
function highlight(text, lang) {
	const prismLang = loadPrismLang(lang);
	if (prismLang) {
		return `<pre class="language-${lang}"><code class="language-${lang}">\n\t${Prism.highlight(text, prismLang)}</code></pre>`;
	} else {
		return `<pre class="language-unknown"><code class="language-unknown">\n\t${md.utils.escapeHtml(text)}</code></pre>`;
	}
}

function markdownItPrism(markdownit, useroptions) {
	const options = Object.assign({}, DEFAULTS, useroptions);

	options.plugins.forEach(loadPrismPlugin);
	options.init(Prism);

	// register ourselves as highlighter
	markdownit.options.highlight = highlight;
}

export default markdownItPrism;
