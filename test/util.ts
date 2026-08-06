import fs from 'node:fs'

export async function read(path: string) {
	return (await fs.promises.readFile(`testdata/${path}`)).toString()
}
