import Prism, { Grammar } from 'prismjs'
import loadLanguages from 'prismjs/components/'
import MarkdownIt, { Renderer, StateCore, Token } from 'markdown-it'

const SPECIFIED_LANGUAGE_META_KEY = 'de.joshuagleitze.markdown-it-prism.specifiedLanguage'

interface Options {
	/**
	 * Whether to highlight inline code. Defaults to `false`.
	 */
	highlightInlineCode: boolean
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
	highlightInlineCode: false,
	plugins: [],
	init: () => {
		// do nothing by default
	},
	defaultLanguageForUnknown: undefined,
	defaultLanguageForUnspecified: undefined,
	defaultLanguage: undefined,
}

/**
 * Loads the provided `lang` into prism.
 *
 * @param lang
 *        Code of the language to load.
 * @return The Prism grammar object for the provided {@code lang} code. {@code undefined} if the language is not known
 * to Prism.
 */
function loadPrismGrammar(lang: string): Grammar | undefined {
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
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		require(`prismjs/plugins/${name}/prism-${name}`)
	} catch (cause) {
		throw new Error(`Cannot load Prism plugin "${name}". Please check the spelling.`, { cause })
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
	let prismLang = loadPrismGrammar(langToUse)
	if (prismLang === undefined && options.defaultLanguageForUnknown !== undefined) {
		langToUse = options.defaultLanguageForUnknown
		prismLang = loadPrismGrammar(langToUse)
	}
	return [langToUse, prismLang]
}

/**
 * Highlights the provided text using Prism.
 *
 * @param markdownit
 *        The markdown-it instance.
 * @param text
 *        The text to highlight.
 * @param lang
 *        Name of the selected Prism language to use for highlighting.
 * @param prismGrammar
 * 		 Prism’s {@link Grammar} for {@link lang} if Prism knows that language. Else `undefined`.
 *
 * @return If {@link prismGrammar} `!== undefined` (i.e. Prism knows {@link lang}), the {@link text} highlighted for
 * that language. Otherwise, {@link text} html-escaped.
 */
function highlight(markdownit: MarkdownIt, text: string, lang: string, prismGrammar: Grammar | undefined): string {
	return prismGrammar ? Prism.highlight(text, prismGrammar, lang) : markdownit.utils.escapeHtml(text)
}

/**
 * Builds a {@link RuleCore} that modifies the programming language of fenced code blocks before
 * rendering. This is necessary to implement the options {@link Options.defaultLanguageForUnknown},
 * {@link Options.defaultLanguageForUnspecified}, and {@link Options.defaultLanguage}. We cannot implement those options
 * in {@link highlight} because e.g. unknown languages will already have been removed by markdown-it.
 *
 * @param options
 *        The options that have been used to initialise the plugin.
 */
function createFencedCodeLanguageFallbackRule(options: Options): MarkdownIt.Core.RuleCore {
	return (state) => {
		for (const token of state.tokens) {
			if (token.type === 'fence') {
				// markdown-it trim()s the language specification before setting it on .info, but markdown-it-attrs does not!
				const [langToUse] = selectLanguage(options, token.info.trim())
				token.info = langToUse
			}
		}
	}
}

/**
 * A {@link RuleCore} that searches for and extracts language specifications on inline code tokens.
 */
function inlineCodeLanguageRule(state: StateCore) {
	for (const inlineToken of state.tokens) {
		if (inlineToken.type === 'inline' && inlineToken.children !== null) {
			for (const [index, token] of inlineToken.children.entries()) {
				if (token.type === 'code_inline') {
					extractAndStoreInlineCodeSpecifiedLanguage(token, inlineToken.children.at(index + 1))
				}
			}
		}
	}
}

/**
 * Searches for a language specification after an inline code token (e.g. ``{language=cpp}). If present, extracts the
 * language, sets it on {@link inlineCodeToken}’s meta, and removes the specification.
 *
 * @param inlineCodeToken
 *  The inline code token for which to extract the language.
 * @param followingToken
 *    The token immediately following the{@link inlineCodeToken}. `undefined` if {@link inlineCodeToken} was the last token.
 */
function extractAndStoreInlineCodeSpecifiedLanguage(inlineCodeToken: Token, followingToken: Token | undefined) {
	const langAttributeIndex = inlineCodeToken.attrIndex('language')
	if (langAttributeIndex >= 0) {
		// markdown-it-attrs was here and parsed the attributes for us. Neat!
		const specifiedLanguage = inlineCodeToken.attrs![langAttributeIndex][1]
		inlineCodeToken.attrs!.splice(langAttributeIndex, 1)
		inlineCodeToken.meta = { ...inlineCodeToken.meta, [SPECIFIED_LANGUAGE_META_KEY]: specifiedLanguage }
	} else if (followingToken !== undefined) {
		// No specified language via already-parsed attributes. Let’s see whether we can find and parse a language specification ourselves
		const languageSpecificationMatch = /^\{((?:[^\s}]+\s)*)language=([^\s}]+)((?:\s+[^\s}]+)*)\s*}/.exec(followingToken.content)
		if (languageSpecificationMatch !== null) {
			const [fullMatch, attrsBefore, specifiedLanguage, attrsAfter] = languageSpecificationMatch
			inlineCodeToken.meta = { ...inlineCodeToken.meta, [SPECIFIED_LANGUAGE_META_KEY]: specifiedLanguage }
			followingToken.content = followingToken.content.slice(fullMatch.length)
			if (attrsBefore || attrsAfter) {
				followingToken.content = `{${attrsBefore || ''}${(attrsAfter || ' ').slice(1)}}${followingToken.content}`
			}
		}
	}
}

/**
 * Renders inline code tokens by highlighting them with Prism.
 *
 * @param markdownit
 *        The markdown-it instance.
 * @param options
 *        The options that have been used to initialise the plugin.
 * @param existingRule
 *        The previously configured render rule for inline code.
 */
function renderInlineCode(markdownit: MarkdownIt, options: Options, existingRule: Renderer.RenderRule): Renderer.RenderRule {
	return (tokens, idx, renderOptions, env, self) => {
		const inlineCodeToken = tokens[idx]
		const specifiedLanguage = inlineCodeToken.meta ? (inlineCodeToken.meta[SPECIFIED_LANGUAGE_META_KEY] || '') : ''
		const [langToUse, prismGrammar] = selectLanguage(options, specifiedLanguage)
		if (langToUse) {
			const highlighted = highlight(markdownit, inlineCodeToken.content, langToUse, prismGrammar)
			inlineCodeToken.attrJoin('class', markdownit.options.langPrefix + langToUse)
			return `<code${self.renderAttrs(inlineCodeToken)}>${highlighted}</code>`
		} else {
			return existingRule(tokens, idx, renderOptions, env, self)
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
	optionName: 'defaultLanguage' | 'defaultLanguageForUnknown' | 'defaultLanguageForUnspecified',
): void {
	const language = options[optionName]
	if (language !== undefined && loadPrismGrammar(language) === undefined) {
		throw new Error(`Bad option ${optionName}: There is no Prism language '${language}'.`)
	}
}

/**
 * ‘the most basic rule to render a token’ (https://github.com/markdown-it/markdown-it/blob/master/docs/examples/renderer_rules.md)
 */
function renderFallback(tokens: Token[], idx: number, options: MarkdownIt.Options, env: unknown, self: Renderer): string {
	return self.renderToken(tokens, idx, options)
}

/**
 * Initialisation function of the plugin. This function is not called directly by clients, but is rather provided
 * to MarkdownIt’s {@link MarkdownIt.use} function.
 *
 * @param markdownit
 *        The markdown-it instance the plugin is being registered to.
 * @param useroptions
 *        The options this plugin is being initialised with.
 */
export default function markdownItPrism(markdownit: MarkdownIt, useroptions: Options): void {
	const options = { ...DEFAULTS, ...useroptions }

	checkLanguageOption(options, 'defaultLanguage')
	checkLanguageOption(options, 'defaultLanguageForUnknown')
	checkLanguageOption(options, 'defaultLanguageForUnspecified')
	options.defaultLanguageForUnknown = options.defaultLanguageForUnknown || options.defaultLanguage
	options.defaultLanguageForUnspecified = options.defaultLanguageForUnspecified || options.defaultLanguage

	options.plugins.forEach(loadPrismPlugin)
	options.init(Prism)

	// register ourselves as highlighter
	markdownit.options.highlight = (text, lang) => highlight(markdownit, text, lang, loadPrismGrammar(lang))
	markdownit.core.ruler.push('prism_language_fallback', createFencedCodeLanguageFallbackRule(options))
	if (options.highlightInlineCode) {
		markdownit.core.ruler.push('prism_inline_code_language', inlineCodeLanguageRule)
		markdownit.renderer.rules.code_inline = renderInlineCode(markdownit, options, markdownit.renderer.rules.code_inline || renderFallback)
	}
}
