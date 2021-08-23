import Prism, {Grammar} from 'prismjs'
import loadLanguages from 'prismjs/components/'
import MarkdownIt from 'markdown-it'
import {RenderRule} from 'markdown-it/lib/renderer'

interface Options {
	/**
	 * Prism plugins to load.
	 */
	plugins: string[]
	/**
	 * Callback for Prism initialisation. Useful for initialising plugins.
	 * @param prism The Prism instance that will be used by the plugin.
	 */
	init: (prism: typeof Prism) => void
	/**
	 * The language to use for code blocks that specify a language that Prism does not know.
	 */
	defaultLanguageForUnknown?: string
	/**
	 * The language to use for code blocks that do not specify a language.
	 */
	defaultLanguageForUnspecified?: string
	/**
	 * Shorthand to set both {@code defaultLanguageForUnknown} and {@code defaultLanguageForUnspecified} to the same value. Will be copied
	 * to each option if it is set to {@code undefined}.
	 */
	defaultLanguage?: string
}

const DEFAULTS: Options = {
	plugins: [],
	init: () => {
		// do nothing by default
	},
	defaultLanguageForUnknown: undefined,
	defaultLanguageForUnspecified: undefined,
	defaultLanguage: undefined
}


/**
 * Loads the provided `lang` into prism.
 *
 * @param lang
 *        Code of the language to load.
 * @return The Prism language object for the provided {@code lang} code. {@code undefined} if the language is not known to Prism.
 */
function loadPrismLang(lang: string): Grammar | undefined {
	if (!lang) return undefined
	let langObject = Prism.languages[lang]
	if (langObject === undefined) {
		loadLanguages([lang])
		langObject = Prism.languages[lang]
	}
	return langObject
}

/**
 * Loads the provided Prism plugin.
 * @param name
 *        Name of the plugin to load.
 * @throws {Error} If there is no plugin with the provided `name`.
 */
function loadPrismPlugin(name: string): void {
	try {
		require(`prismjs/plugins/${name}/prism-${name}`)
	} catch (e) {
		throw new Error(`Cannot load Prism plugin "${name}". Please check the spelling.`)
	}
}


/**
 * Select the language to use for highlighting, based on the provided options and the specified language.
 *
 * @param options
 *        The options that were used to initialise the plugin.
 * @param lang
 *        Code of the language to highlight the text in.
 * @return The name of the language to use and the Prism language object for that language.
 */
function selectLanguage(options: Options, lang: string): [string, Grammar | undefined] {
	let langToUse = lang
	if (langToUse === '' && options.defaultLanguageForUnspecified !== undefined) {
		langToUse = options.defaultLanguageForUnspecified
	}
	let prismLang = loadPrismLang(langToUse)
	if (prismLang === undefined && options.defaultLanguageForUnknown !== undefined) {
		langToUse = options.defaultLanguageForUnknown
		prismLang = loadPrismLang(langToUse)
	}
	return [langToUse, prismLang]
}

/**
 * Highlights the provided text using Prism.
 *
 * @param markdownit
 *        The markdown-it instance.
 * @param options
 *        The options that have been used to initialise the plugin.
 * @param text
 *        The text to highlight.
 * @param lang
 *        Code of the language to highlight the text in.
 * @return If Prism knows the language that {@link selectLanguage} returns for `lang`, the `text` highlighted for that language. Otherwise, `text`
 *  html-escaped.
 */
function highlight(markdownit: MarkdownIt, options: Options, text: string, lang: string): string {
	const [langToUse, prismLang] = selectLanguage(options, lang)
	return prismLang ? Prism.highlight(text, prismLang, langToUse) : markdownit.utils.escapeHtml(text)
}

/**
 * Construct the class name for the provided `lang`.
 *
 * @param markdownit
 *        The markdown-it instance.
 * @param lang
 *        The selected language.
 * @return the class to use for `lang`.
 */
function languageClass(markdownit: MarkdownIt, lang: string): string {
	return markdownit.options.langPrefix + markdownit.utils.escapeHtml(lang)
}

/**
 * Patch the `<pre>` and `<code>` tags produced by the `existingRule` for fenced code blocks.
 *
 * @param markdownit
 *        The markdown-it instance.
 * @param options
 *        The options that have been used to initialise the plugin.
 * @param existingRule
 *        The currently configured render rule for fenced code blocks.
 */
function applyCodeAttributes(markdownit: MarkdownIt, options: Options, existingRule: RenderRule): RenderRule {
	return (tokens, idx, renderOptions, env, self) => {
		const fenceToken = tokens[idx]
		const info = fenceToken.info ? markdownit.utils.unescapeAll(fenceToken.info).trim() : ''
		const lang = info.split(/(\s+)/g)[0]
		const [langToUse] = selectLanguage(options, lang)
		if (!langToUse) {
			return existingRule(tokens, idx, renderOptions, env, self)
		} else {
			fenceToken.info = langToUse
			const existingResult = existingRule(tokens, idx, renderOptions, env, self)
			const langClass = languageClass(markdownit, langToUse)
			return existingResult.replace(
				/<((?:pre|code)[^>]*?)(?:\s+class="([^"]*)"([^>]*))?>/g,
				(match, tagStart, existingClasses?: string, tagEnd?) =>
					existingClasses?.includes(langClass) ? match
						: `<${tagStart} class="${existingClasses ? `${existingClasses} ` : ''}${langClass}"${tagEnd || ''}>`
			)
		}
	}
}

/**
 * Checks whether an option represents a valid Prism language
 *
 * @param options
 *        The options that have been used to initialise the plugin.
 * @param optionName
 *        The key of the option inside {@code options} that shall be checked.
 * @throws {Error} If the option is not set to a valid Prism language.
 */
function checkLanguageOption(
	options: Options,
	optionName: 'defaultLanguage' | 'defaultLanguageForUnknown' | 'defaultLanguageForUnspecified'
): void {
	const language = options[optionName]
	if (language !== undefined && loadPrismLang(language) === undefined) {
		throw new Error(`Bad option ${optionName}: There is no Prism language '${language}'.`)
	}
}

/**
 * Initialisation function of the plugin. This function is not called directly by clients, but is rather provided
 * to MarkdownIt’s {@link MarkdownIt.use} function.
 *
 * @param markdownit
 *        The markdown it instance the plugin is being registered to.
 * @param useroptions
 *        The options this plugin is being initialised with.
 */
export default function markdownItPrism(markdownit: MarkdownIt, useroptions: Options): void {
	const options = Object.assign({}, DEFAULTS, useroptions)

	checkLanguageOption(options, 'defaultLanguage')
	checkLanguageOption(options, 'defaultLanguageForUnknown')
	checkLanguageOption(options, 'defaultLanguageForUnspecified')
	options.defaultLanguageForUnknown = options.defaultLanguageForUnknown || options.defaultLanguage
	options.defaultLanguageForUnspecified = options.defaultLanguageForUnspecified || options.defaultLanguage

	options.plugins.forEach(loadPrismPlugin)
	options.init(Prism)

	// register ourselves as highlighter
	markdownit.options.highlight = (text, lang) => highlight(markdownit, options, text, lang)
	markdownit.renderer.rules.fence = applyCodeAttributes(markdownit, options, markdownit.renderer.rules.fence || (() => ''))
}
