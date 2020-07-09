declare module 'prismjs/components/' {
	interface LoadLanguages {
		(languages: string | string[]): void
		silent: boolean
	}

	const loadLanguages: LoadLanguages
	export default loadLanguages
}
