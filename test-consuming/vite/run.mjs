import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'

const mode = process.argv[2]
if (mode !== 'A' && mode !== 'B') throw new Error('Expected mode A or B')

const manifest = JSON.parse(await readFile(new URL('./dist/.vite/manifest.json', import.meta.url), 'utf8'))
const entries = Object.values(manifest).filter((record) => record.isEntry === true)
if (entries.length !== 1) throw new Error(`Expected exactly one manifest entry, received ${entries.length}`)

const dom = new JSDOM('<!doctype html><body><div id="control"></div><div id="output"></div><div id="plugins"></div><div id="plugins-neg"></div><div id="plugins-dup"></div></body>', { runScripts: 'dangerously' })
const script = dom.window.document.createElement('script')
script.textContent = await readFile(new URL(`./dist/${entries[0].file}`, import.meta.url), 'utf8')
dom.window.document.body.appendChild(script)

const nodeOnlyError = 'markdown-it-prism: the "plugins" option requires Node.js module loading and is not supported in browser/bundler targets — import Prism languages manually instead (tracking: https://github.com/jGleitz/markdown-it-prism/issues/1147)'
const unknownPluginError = 'Cannot load Prism plugin "definitely-not-a-prism-plugin". Please check the spelling.'
const value = (id) => dom.window.document.querySelector(id)?.innerHTML ?? ''
const results = {
	CORE: value('#output').includes('<span class="token'),
	PLUGINS: mode === 'A' ? value('#plugins').includes('keyword-class') : value('#plugins') === nodeOnlyError,
	NEG: mode === 'A' ? value('#plugins-neg') === unknownPluginError : value('#plugins-neg') === nodeOnlyError,
	CONTROL: value('#control').includes('class="token keyword"') && !value('#control').includes('keyword-class'),
	DUP: mode === 'A' ? value('#plugins-dup').split('keyword-class').length - 1 === 1 : value('#plugins-dup') === nodeOnlyError,
}

for (const [name, passed] of Object.entries(results)) console.log(`${name}:${passed ? 'PASS' : 'FAIL'}`)
if (Object.values(results).includes(false)) process.exitCode = 1
