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

const expectedPluginValue = mode === 'A' ? 'keyword-class' : 'markdown-it-prism: the "plugins" option requires Node.js module loading and is not supported in browser/bundler targets — import Prism languages manually instead (tracking: https://github.com/jGleitz/markdown-it-prism/issues/1147)'
const expectedNegativeValue = mode === 'A' ? 'Cannot load Prism plugin "definitely-not-a-prism-plugin". Please check the spelling.' : expectedPluginValue
const value = (id) => dom.window.document.querySelector(id)?.innerHTML ?? ''
const pluginMatches = (id) => mode === 'A' ? value(id).includes(expectedPluginValue) : value(id) === expectedPluginValue
const results = Object.fromEntries([
	['CORE', value('#output').includes('<span class="token')], ['PLUGINS', pluginMatches('#plugins')],
	['NEG', value('#plugins-neg') === expectedNegativeValue], ['CONTROL', value('#control').includes('class="token keyword"') && !value('#control').includes('keyword-class')],
	['DUP', mode === 'A' ? value('#plugins-dup').split('keyword-class').length - 1 === 1 : pluginMatches('#plugins-dup')],
])
for (const [name, passed] of Object.entries(results)) console.log(`${name}:${passed ? 'PASS' : 'FAIL'}`)
if (Object.values(results).includes(false)) process.exitCode = 1
