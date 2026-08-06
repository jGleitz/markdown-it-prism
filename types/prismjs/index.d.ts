declare module 'prismjs/components/index.js' {
	interface LoadLanguages {
		(languages: string | string[]): void
		silent: boolean
	}

	const loadLanguages: LoadLanguages
	export default loadLanguages
}
