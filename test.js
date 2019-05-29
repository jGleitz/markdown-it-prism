/* eslint-env mocha */

import chai, {expect} from 'chai';
import chaiString from 'chai-string';
import markdownit from 'markdown-it';
import markdownItPrism from './index';
import fs from 'fs';

chai.use(chaiString);

const read = path => fs.readFileSync(`testdata/${path}`).toString();

describe('markdown-it-prism', () => {

	it('highlights fenced code blocks with language specification using Prism', () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(read('input/fenced-with-language.md'))
		).to.equalIgnoreSpaces(read('expected/fenced-with-language.html'));
	});

	it('throws for unknown plugins', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				plugins: ['foo']
			})).to.throw(Error, /plugin/);
	});

	it('throws for unknown defaultLanguage', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				defaultLanguage: 'i-dont-exist'
			})).to.throw(Error, /defaultLanguage.*i-dont-exist/);
	});

	it('throws for unknown defaultLanguageForUnknown', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnknown: 'i-dont-exist'
			})).to.throw(Error, /defaultLanguageForUnknown.*i-dont-exist/);
	});

	it('throws for unknown defaultLanguageForUnspecified', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnspecified: 'i-dont-exist'
			})).to.throw(Error, /defaultLanguageForUnspecified.*i-dont-exist/);
	});

	it('offers an init function for further initialisation', () => {
		let called = false;
		markdownit()
			.use(markdownItPrism, {
				init: prism => {
					expect(prism).to.have.ownProperty('plugins');
					called = true;
				}
			});
		expect(called).to.be.true;
	});

	it('does not add classes to fenced code blocks without language specification', () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(read('input/fenced-without-language.md'))
		).to.equalIgnoreSpaces(read('expected/fenced-without-language.html'));
	});

	it('falls back to defaultLanguageForUnspecified if no language is specified', () => {
		expect(markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnspecified: 'java'
			})
			.render(read('input/fenced-without-language.md'))
		).to.equalIgnoreSpaces(read('expected/fenced-with-language.html'));
	});

	it('falls back to defaultLanguage if no language and no defaultLanguageForUnspecified is specified', () => {
		expect(markdownit()
			.use(markdownItPrism, {
				defaultLanguage: 'java'
			})
			.render(read('input/fenced-without-language.md'))
		).to.equalIgnoreSpaces(read('expected/fenced-with-language.html'));
	});

	it('does not add classes to indented code blocks', () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(read('input/indented.md'))
		).to.equalIgnoreSpaces(read('expected/indented.html'));

	});

	it('adds classes even if the language is unknown', () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(read('input/fenced-with-unknown-language.md'))
		).to.equalIgnoreSpaces(read('expected/fenced-with-unknown-language.html'));
	});

	it('falls back to defaultLanguageForUnknown if the specified language is unknown', () => {
		expect(markdownit()
			.use(markdownItPrism, {
				defaultLanguageForUnknown: 'java'
			})
			.render(read('input/fenced-with-unknown-language.md'))
		).to.equalIgnoreSpaces(read('expected/fenced-with-language.html'));
	});

	it('falls back to defaultLanguage if the specified language is unknown and no defaultLanguageForUnknown is specified', () => {
		expect(markdownit()
			.use(markdownItPrism, {
				defaultLanguage: 'java'
			})
			.render(read('input/fenced-with-unknown-language.md'))
		).to.equalIgnoreSpaces(read('expected/fenced-with-language.html'));
	});

	it('respects markdown-it’s langPrefix setting', () => {
		expect(
			markdownit({
				langPrefix: 'test-'
			})
				.use(markdownItPrism)
				.render(read('input/fenced-with-language.md'))
		).to.equalIgnoreSpaces(read('expected/fenced-with-language-prefix.html'));
	});

	it('is able to resolve C++ correctly', () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(read('input/cpp.md'))
		).to.equalIgnoreSpaces(read('expected/cpp.html'));
	});

	// This test must be the last one, as the plugins get loaded into Prism and cannot be unloaded!
	it('allows to use Prism plugins', () => {
		expect(markdownit()
			.use(markdownItPrism, {
				plugins: [
					'highlight-keywords',
					'show-language'
				]
			})
			.render(read('input/fenced-with-language.md'))
		).to.equalIgnoreSpaces(read('expected/fenced-with-language-plugins.html'));
	});
});
