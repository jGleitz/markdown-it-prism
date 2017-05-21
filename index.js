import Prism from 'prismjs';

const DEFAULTS = {
	plugins: [],
	init: () => {}
};


/**
 * Loads the provided <code>lang</code> into prism.
 *
 * @param <String> lang
 *		Code of the language to load.
 * @return <Object?> The Prism language object for the provided <code>lang</code> code. <code>undefined</code> if the code is not known to Prism.
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
 * @param <MarkdownIt> markdownit
 * 		Instance of MarkdownIt Class. This argument is bound in markdownItPrism().
 * @param <String> text
 * 		The text to highlight.
 * @param <String> lang
 *		Code of the language to highlight the text in.
 * @return <String> <code>text</code> wrapped in <code>&lt;pre&gt;</code> and <code>&lt;code&gt;</code>, both equipped with the appropriate class (markdown-it’s langPrefix + lang). If Prism knows <code>lang</code>, <code>text</code> will be highlighted by it.
 */
function highlight(markdownit, text, lang) {
	const prismLang = loadPrismLang(lang);
	const code = prismLang ? Prism.highlight(text, prismLang) : markdownit.utils.escapeHtml(text);
	const classAttribute = lang ? ` class="${markdownit.options.langPrefix}${lang}"` : '';
	return `<pre${classAttribute}><code${classAttribute}>${code}</code></pre>`;
}

function markdownItPrism(markdownit, useroptions) {
	const options = Object.assign({}, DEFAULTS, useroptions);

	options.plugins.forEach(loadPrismPlugin);
	options.init(Prism);

	// register ourselves as highlighter
	markdownit.options.highlight = (...args) => highlight(markdownit, ...args);
}

export default markdownItPrism;
