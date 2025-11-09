import { defineConfig } from 'eslint/config'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import ymleslint from 'eslint-plugin-yml'
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.recommended,
	ymleslint.configs['flat/recommended'],
	stylistic.configs.customize({
		indent: 'tab',
		quotes: 'single',
		semi: false,
		braceStyle: '1tbs',
	}),
	{
		ignores: [
			'build/**',
			'node_modules/**',
			'pnpm-lock.yaml',
		],
	},
	{
		languageOptions: {
			ecmaVersion: 6,
		},
		rules: {
			'linebreak-style': ['error', 'unix'],
			'@typescript-eslint/ban-ts-comment': [
				'error',
				{ 'ts-ignore': 'allow-with-description' },
			],
		},
	},
	{
		files: ['**/*.yml', '**/*.yaml'],
		rules: {
			'@stylistic/spaced-comment': 'off',
		},
	}
)
