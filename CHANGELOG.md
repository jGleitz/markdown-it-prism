# [Changelog](http://keepachangelog.com/)

This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased][unreleased]

## [2.0.0] – 2018-12-02
### Deprecated
 * Deprecate Node.JS 4 and require Node.JS >= 6
### Added
 * Note about adding a stylesheet to the HTML in README
 * Options `defaultLanguage`, `defaultLanguageForUnknown` and `defaultLanguageForUnspecified` to specify fallback prism languages
### Fixed
 * Update all packages and eliminate dependency versions with known security issues
 * Improve the project setup
 * Improve the documentation in code

## [1.1.2] – 2018-03-17
 * Upgrade dependencies

## [1.1.1] – 2017-05-22
 * Removed a bad `\n\t` before the code that was affecting the HTML output.

## [1.1.0] – 2017-05-21
 * Add the `language-*` class also to the `<pre>` tag (not only to `<code>`).
 * Add the class `language-x` if `x` is the defined language, even if `x` cannot be highlighted with Prism.

## [1.0.1] – 2016-10-19
 * Fixed build bug that led to the plugin not being exported correctly.

## 1.0.0 – 2016-10-16
* Initial release.

[unreleased]: https://github.com/jGleitz/markdown-it-prism/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/jGleitz/markdown-it-prism/compare/v1.1.2...v2.0.0
[1.1.2]: https://github.com/jGleitz/markdown-it-prism/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/jGleitz/markdown-it-prism/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/jGleitz/markdown-it-prism/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/jGleitz/markdown-it-prism/compare/v1.0.0...v1.0.1
