# markdown-it-prism [![CI](https://github.com/jGleitz/markdown-it-prism/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/jGleitz/markdown-it-prism/actions/workflows/ci.yml?query=branch%3Amain) [![NPM Version](https://img.shields.io/npm/v/markdown-it-prism?logo=npm&logoColor=%23DDD)](https://www.npmjs.com/package/markdown-it-prism)

> [markdown-it](https://github.com/markdown-it/markdown-it) plugin to highlight code blocks
> using [Prism](http://prismjs.com/)

## Migrating to v5

v5 is a major release with breaking changes. When upgrading from v4.x, check these points:

1. **markdown-it v15 only.** v5 requires `markdown-it` v15. Older markdown-it versions (<15) are no longer supported.
2. **Node.js 22 or later.** v5 requires Node.js >= 22.
3. **Dual ESM and CJS.** v5 ships native ESM and CommonJS through conditional exports. `require('markdown-it-prism')` keeps working unchanged, and `import prism from 'markdown-it-prism'` is now a native ESM import.
4. **Remove `@types/markdown-it`.** markdown-it bundles its own type definitions since v15, so you no longer need a separate `@types/markdown-it` dependency. Remove it if you have one.
5. **Temporary regression: browser bundlers.** v5.0.0 does not work in browser bundlers (Webpack/Vite browser targets). Restoration is tracked in [#1147](https://github.com/jGleitz/markdown-it-prism/issues/1147). If you bundle this plugin for the browser, stay on v4.x until the restoration lands.

## Usage

ESM:

```js
import MarkdownIt from 'markdown-it';
import prism from 'markdown-it-prism';

const md = new MarkdownIt();
md.use(prism, options);
```

CommonJS:

```js
const MarkdownIt = require('markdown-it');
const prism = require('markdown-it-prism');

const md = new MarkdownIt();
md.use(prism, options);
```

The plugin will insert the necessary markup into all code
blocks. [Include one of Prism’s stylesheets](http://prismjs.com/#basic-usage) in
your HTML to get highlighted code.

### Options

The `options` object may contain:

| Name                            | Description                                                                                                                                                                                                                                                                                                                                                       | Default     |
|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `highlightInlineCode`           | Whether to highlight inline code.                                                                                                                                                                                                                                                                                                                                 | `false`     |
| `plugins`                       | Array of [Prism Plugins](http://prismjs.com/#plugins) to load. The names to use can be found [here](https://github.com/PrismJS/prism/tree/master/plugins). Please note that some prism plugins (notably line-numbers) rely on the DOM being present and can thus not be used with this package (see [#1](https://github.com/jGleitz/markdown-it-prism/issues/1)). | `[]`        |
| `init`                          | A function called after setting up prism. Will receive the prism instance as only argument. Useful for plugins needing further intialisation.                                                                                                                                                                                                                     | `() => {}`  |
| `defaultLanguageForUnknown`     | The language to use for code blocks that specify a language that Prism does not know. No default will be used if this option is `undefined`.                                                                                                                                                                                                                      | `undefined` |
| `defaultLanguageForUnspecified` | The language to use for code block that do not specify a language. No default will be used if this option is `undefined`.                                                                                                                                                                                                                                         | `undefined` |
| `defaultLanguage`               | Shorthand to set both `defaultLanguageForUnknown` and `defaultLanguageForUnspecified` to the same value.                                                                                                                                                                                                                                                          | `undefined` |

### Inline Code

When `highlightInlineCode` is set, inline code will be highlighted just like fenced code blocks are.
To specifiy the language of inline code, add `{language=<your-language>}` after the code segment:

```markdown
`class Demo { };`{language=cpp}
```

### markdown-it-attrs

This plugin is compatible with [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs).
For inline code, the `language` attribute will be interpreted as the highlight language and will _not_ be present as an HTML
attribute.

> [!IMPORTANT]
>  1. For full compatibility, you must use [markdown-it-attrs](https://github.com/arve0/markdown-it-attrs) v5.0.0 or later.
> 2. If you configure `allowedAttributes` for markdown-it-attrs, make sure to include `language`. Otherwise, you will not be able to specify the language of inline code. 

## Usage with Webpack

> [!IMPORTANT]
> This section applies to markdown-it-prism **v4.x only**. v5.0.0 does not work in browser bundlers yet; restoration is tracked in [#1147](https://github.com/jGleitz/markdown-it-prism/issues/1147). Stay on v4.x for bundler usage until the restoration lands.

If you want to use this plugin together with [Webpack](https://webpack.js.org/), you need to import all languages you
intend to use:

```javascript
import MarkdownIt from 'markdown-it';
import prism from 'markdown-it-prism';

import "prismjs/components/prism-clike"
import "prismjs/components/prism-java"

function component() {
    const md = new MarkdownIt();
    md.use(prism);
    const element = document.createElement('div');
    element.innerHTML = md.render(`
Here is some *code*:
\`\`\`java
public class Test {
  public void foo() {}
}
\`\`\`
`);

    return element;
}

document.body.appendChild(component());
```

> [!NOTE]
> Prisms languages have dependencies onto each other. You need to import the languages together with their dependencies in the correct order.
