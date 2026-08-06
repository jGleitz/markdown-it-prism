import fs from 'node:fs'

const cjs = fs.readFileSync('dist/index.cjs', 'utf8')

fs.writeFileSync(
	'dist/index.cjs',
	cjs.replace('module.exports = __toCommonJS(index_exports);', 'module.exports = markdownItPrism;'),
)
fs.appendFileSync('dist/index.cjs', 'module.exports.default = module.exports;')
