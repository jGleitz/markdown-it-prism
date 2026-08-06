import fs from 'node:fs'

const cjs = fs.readFileSync('dist/index.cjs', 'utf8')
const assignment = 'module.exports = __toCommonJS(index_exports);'
const assignmentCount = cjs.split(assignment).length - 1

if (assignmentCount !== 1) {
	throw new Error(`Expected exactly one CJS export assignment, found ${assignmentCount}`)
}
fs.writeFileSync(
	'dist/index.cjs',
	cjs.replace(assignment, 'module.exports = markdownItPrism;'),
)
fs.appendFileSync('dist/index.cjs', 'module.exports.default = module.exports;')
