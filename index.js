import Prism from 'prismjs';
import loadLanguages from 'prismjs/components/';

/**
 * A callback that can be used to perform custom initialisation of the Prism instance.
 *
 * @callback PrismInitialisationCallback
 * @param {Prism} prism
 *        The Prism instance
 */

/**
 * The options for the markdown-it-prism plugin
 *
 * @typedef {Object} MarkdownItPrismOptions
 * @property {String[]} plugins
 *        Names of Prism plugins to load
 * @property {PrismInitialisationCallback} init
 *        Callback for Prism initialisation
 * @property {String} defaultLanguageForUnknown
 *        The language to use for code blocks that specify a language that Prism does not know
 * @property {String} defaultLanguageForUnspecified
 *        The language to use for code block that do not specify a language
 * @property {String} defaultLanguage
 *        Shorthand to set both {@code defaultLanguageForUnknown} and {@code defaultLanguageForUnspecified} to the same value
 */
const DEFAULTS = {
	plugins: [],
	init: () => {
	},
	defaultLanguageForUnknown: undefined,
	defaultLanguageForUnspecified: undefined,
	defaultLanguage: undefined
};


/**
 * Loads the provided {@code lang} into prism.
 *
 * @param {String} lang
 *        Code of the language to load.
 * @return {Object} The Prism language object for the provided {@code lang} code. {@code undefined} if the language is not known to Prism.
 */
function loadPrismLang(lang) {
	if (!lang) return undefined;
	let langObject = Prism.languages[lang];
	if (langObject === undefined) {
		loadLanguages([lang]);
		langObject =  Prism.languages[lang];
	}
	return langObject;
}

/**
 * Loads the provided Prism plugin.a
 * @param name
 *        Name of the plugin to load
 * @throws {Error} If there is no plugin with the provided {@code name}
 */
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
 * @param {Object} options
 *        The options that were used to initialise the plugin.
 * @param {String} lang
 *        Code of the language to highlight the text in.
 * @return {Array} An array where the first element is the name of the language to use, and the second element is the PRISM language object for that language.
 */
function selectLanguage(options, lang) {
	let langToUse = lang;
	if (langToUse === '' && options.defaultLanguageForUnspecified !== undefined) {
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
 * @param {MarkdownIt} markdownit
 *        Instance of MarkdownIt Class. This argument is bound in markdownItPrism().
 * @param {MarkdownItPrismOptions} options
 *        The options that have been used to initialise the plugin. This argument is bound in markdownItPrism().
 * @param {String} text
 *        The text to highlight.
 * @param {String} lang
 *        Code of the language to highlight the text in.
 * @return {String} {@code text} wrapped in {@code &lt;pre&gt;} and {@code &lt;code&gt;}, both equipped with the appropriate class (markdown-it’s langPrefix + lang). If Prism knows {@code lang}, {@code text} will be highlighted by it.
 */
function highlight(markdownit, options, text, lang) {
	let langToUse, prismLang;
	[langToUse, prismLang] = selectLanguage(options, lang);
	const code = prismLang ? Prism.highlight(text, prismLang) : markdownit.utils.escapeHtml(text);
	const classAttribute = langToUse ? ` class="${markdownit.options.langPrefix}${langToUse}"` : '';
	return `<pre${classAttribute}><code${classAttribute}>${code}</code></pre>`;
}

/**
 * Checks whether an option represents a valid Prism language
 *
 * @param {MarkdownItPrismOptions} options
 *        The options that have been used to initialise the plugin.
 * @param optionName
 *        The key of the option insides {@code options} that shall be checked.
 * @throws {Error} If the option is not set to a valid Prism language.
 */
function checkLanguageOption(options, optionName) {
	const language = options[optionName];
	if (language !== undefined && loadPrismLang(language) === undefined) {
		throw new Error(`Bad option ${optionName}: There is no Prism language '${language}'.`);
	}
}

/**
 * Initialisation function of the plugin. This function is not called directly by clients, but is rather provided
 * to MarkdownIt’s {@link MarkdownIt.use} function.
 *
 * @param {MarkdownIt} markdownit
 *        The markdown it instance the plugin is being registered to.
 * @param {MarkdownItPrismOptions} useroptions
 *        The options this plugin is being initialised with.
 */
export default function markdownItPrism(markdownit, useroptions) {
	const options = Object.assign({}, DEFAULTS, useroptions);

	checkLanguageOption(options, 'defaultLanguage');
	checkLanguageOption(options, 'defaultLanguageForUnknown');
	checkLanguageOption(options, 'defaultLanguageForUnspecified');
	options.defaultLanguageForUnknown = options.defaultLanguageForUnknown || options.defaultLanguage;
	options.defaultLanguageForUnspecified = options.defaultLanguageForUnspecified || options.defaultLanguage;

	options.plugins.forEach(loadPrismPlugin);
	options.init(Prism);

	// register ourselves as highlighter
	markdownit.options.highlight = (...args) => highlight(markdownit, options, ...args);
}
