/* eslint-env mocha */

import chai, {expect} from 'chai';
import chaiString from 'chai-string';
import markdownit from 'markdown-it';
import markdownItPrism from './index';
import fs from 'fs';

chai.use(chaiString);

const read = path => fs.readFileSync(`testdata/${path}`).toString();

describe('markdown-it-prism', () => {

	const input = read('input/test.md');

	it('should highlight fenced code blocks using Prism', () => {
		expect(markdownit()
			.use(markdownItPrism)
			.render(input)
		).to.equalIgnoreSpaces(read('expected/normal.html'));
	});

	it('should allow to use Prism plugins', () => {
		expect(markdownit()
			.use(markdownItPrism, {
				plugins: [
					'highlight-keywords',
					'show-language'
				]
			})
			.render(input)
		).to.equalIgnoreSpaces(read('expected/plugins.html'));
	});

	it('throws for unknown plugins', () => {
		expect(() => markdownit()
			.use(markdownItPrism, {
				plugins: ['foo']
			})).to.throw(Error, /plugin/);
	});

	it('offers an init function for further initilisation', () => {
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
});
