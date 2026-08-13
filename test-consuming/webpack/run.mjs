import { readFile } from 'node:fs/promises'
import { JSDOM } from 'jsdom'

const mode = process.argv[2]
if (mode !== 'A' && mode !== 'B') throw new Error('Expected mode A or B')

const dom = new JSDOM('<!doctype html><body><div id="control"></div><div id="output"></div><div id="plugins"></div><div id="plugins-neg"></div><div id="plugins-dup"></div></body>', { runScripts: 'dangerously' })
const script = dom.window.document.createElement('script')
script.textContent = await readFile(new URL('./dist/main.bundle.js', import.meta.url), 'utf8')
dom.window.document.body.appendChild(script)

const html = Object.fromEntries(['control', 'output', 'plugins', 'plugins-neg', 'plugins-dup'].map((id) => [id, dom.window.document.querySelector(`#${id}`)?.innerHTML ?? '']))
const nodeOnly = 'markdown-it-prism: the "plugins" option requires Node.js module loading and is not supported in browser/bundler targets — import Prism languages manually instead (tracking: https://github.com/jGleitz/markdown-it-prism/issues/1147)'
const checks = mode === 'A' ? [
	['CORE', html.output.includes('<span class="token')], ['PLUGINS', html.plugins.includes('keyword-class')],
	['NEG', html['plugins-neg'] === 'Cannot load Prism plugin "definitely-not-a-prism-plugin". Please check the spelling.'],
	['CONTROL', html.control.includes('class="token keyword"') && !html.control.includes('keyword-class')],
	['DUP', html['plugins-dup'].split('keyword-class').length - 1 === 1],
] : [
	['CORE', html.output.includes('<span class="token')], ['PLUGINS', html.plugins === nodeOnly], ['NEG', html['plugins-neg'] === nodeOnly],
	['CONTROL', html.control.includes('class="token keyword"') && !html.control.includes('keyword-class')], ['DUP', html['plugins-dup'] === nodeOnly],
]
for (const [name, passed] of checks) console.log(`${name}:${passed ? 'PASS' : 'FAIL'}`)
if (checks.some(([, passed]) => !passed)) process.exitCode = 1
