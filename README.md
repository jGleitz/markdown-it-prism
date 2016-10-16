# markdown-it-prism
> [markdown-it](https://github.com/markdown-it/markdown-it) plugin to highlight code blocks using [Prism](http://prismjs.com/)

## Usage
```js
const md = require('markdown-it')();
const prism = require('markdown-it-prism');

md.use(prism, options);
```

### Options
The `options` object may contain:

Name   | Description | Default
-------|-------------|--------
`plugins` | Array of [Prism Plugins](http://prismjs.com/#plugins) to load. The names to use can be found [here](https://github.com/PrismJS/prism/tree/master/plugins). | `[]`
`init` | A function called after setting up prism. Will receive the prism instance as only argument. Useful for plugins needing further intialisation. | `() => {}`
