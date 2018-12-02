import Prism from 'prismjs';

const DEFAULTS = {
	plugins: [],
	init: () => {},
	defaultLanguage: undefined,
	defaultLanguageForUnknown: undefined,
	defaultLanguageForUnspecified: undefined
};


/**
 * Loads the provided <code>lang</code> into prism.
 *
 * @param <String> lang
 *		Code of the language to load.
 * @return <Object?> The Prism language object for the provided <code>lang</code> code. <code>undefined</code> if the code is not known to Prism.
 */
function loadPrismLang(lang) {
	if (!lang) return undefined;
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
 * Select the language to use for highlighting, based on the provided options and the specified language.
 *
 * @param <Object> options
 * 		The options that were used to initialise the plugin.
 * @param <String> lang
 *		Code of the language to highlight the text in.
 * @return <Array> An array where the first element is the name of the language to use, and the second element is the PRISM language object for that language.
 */
function selectLanguage(options, lang) {
	let langToUse = lang;
	if (langToUse == '' && options.defaultLanguageForUnspecified !== undefined) {
		langToUse = options.defaultLanguageForUnspecified;
	}
	let prismLang = loadPrismLang(langToUse);
	if (prismLang === undefined && options.defaultLanguageForUnknown !== undefined) {
		langToUse = options.defaultLanguageForUnknown;
		prismLang = loadPrismLang(langToUse);
	}
	return [langToUse, prismLang];
}

/**
 * Highlights the provided text using Prism.
 *
 * @param <MarkdownIt> markdownit
 * 		Instance of MarkdownIt Class. This argument is bound in markdownItPrism().
 * @param <Object> options
 *		The options that have been used to initialise the plugin. This argument is bound in markdownItPrism().
 * @param <String> text
 * 		The text to highlight.
 * @param <String> lang
 *		Code of the language to highlight the text in.
 * @return <String> <code>text</code> wrapped in <code>&lt;pre&gt;</code> and <code>&lt;code&gt;</code>, both equipped with the appropriate class (markdown-it’s langPrefix + lang). If Prism knows <code>lang</code>, <code>text</code> will be highlighted by it.
 */
function highlight(markdownit, options, text, lang) {
	let langToUse, prismLang;
	[langToUse, prismLang] = selectLanguage(options, lang);
	const code = prismLang ? Prism.highlight(text, prismLang) : markdownit.utils.escapeHtml(text);
	const classAttribute = langToUse ? ` class="${markdownit.options.langPrefix}${langToUse}"` : '';
	return `<pre${classAttribute}><code${classAttribute}>${code}</code></pre>`;
}

function checkLanguage(options, optionName) {
	const language = options[optionName];
	if (language !== undefined && loadPrismLang(language) === undefined) {
		throw new Error(`Bad option ${optionName}: There is no Prism language '${language}'.`);
	}
}

export default function markdownItPrism(markdownit, useroptions) {
	const options = Object.assign({}, DEFAULTS, useroptions);

	checkLanguage(options, 'defaultLanguage');
	checkLanguage(options, 'defaultLanguageForUnknown');
	checkLanguage(options, 'defaultLanguageForUnspecified');
	options.defaultLanguageForUnknown = options.defaultLanguageForUnknown || options.defaultLanguage;
	options.defaultLanguageForUnspecified = options.defaultLanguageForUnspecified || options.defaultLanguage;

	options.plugins.forEach(loadPrismPlugin);
	options.init(Prism);

	// register ourselves as highlighter
	markdownit.options.highlight = (...args) => highlight(markdownit, options, ...args);
}
