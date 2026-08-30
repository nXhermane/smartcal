# Changelog

All notable changes to SmartCal will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0](https://github.com/nXhermane/smartcal/compare/smartcal-v1.0.14...smartcal-v2.0.0) (2026-08-30)


### ⚠ BREAKING CHANGES

* String literal parsing now accepts a broader range of characters, potentially affecting expressions with special Unicode symbols in edge cases.

### Features

* Add comprehensive unit tests ([39f50ed](https://github.com/nXhermane/smartcal/commit/39f50edf08a3f7c037ef75dfc428a0419730463f))
* Add comprehensive unit tests ([ed68dcd](https://github.com/nXhermane/smartcal/commit/ed68dcd9c5f240b83d03bc8c0582bec54eef55b4))
* Add GitHub Actions workflow for deploying documentation to GitHub Pages ([83a9f5b](https://github.com/nXhermane/smartcal/commit/83a9f5b42b49ff2e22adb757da5bb21025e0ea3e))
* add new test cases for SmartCal and export additional types ([79f0180](https://github.com/nXhermane/smartcal/commit/79f018023280ad933acc9cc528b09ace9dd5645a))
* Add permissions for GitHub Actions to write contents ([e9ebb0f](https://github.com/nXhermane/smartcal/commit/e9ebb0fa2594194f52fe1fea9827966466cb34ce))
* add support for Unicode characters in string literals ([4b810bf](https://github.com/nXhermane/smartcal/commit/4b810bf32d62bffac3671bb90c797990273e30d0))
* engine rewrite with modernized tooling (v1.1) ([991d8a6](https://github.com/nXhermane/smartcal/commit/991d8a6684b188c9db89e676df155a1be254f529))
* Enhance error handling with custom error classes and improve formula parsing ([9d5b27f](https://github.com/nXhermane/smartcal/commit/9d5b27f2b2ddbf9c0dac5e23ea3fc5eb7c6023b7))
* modernize documentation with comprehensive JSDoc, enhanced README, and generated docs ([65a31c9](https://github.com/nXhermane/smartcal/commit/65a31c905b10fb43cc1511bf6899bbb1487ad30f))
* Update documentation build scripts to target specific directories ([d0f310a](https://github.com/nXhermane/smartcal/commit/d0f310a77f6b41534313179f4c946f90a2b1a1a4))


### Bug Fixes

* resolve TypeScript type errors in parser and tokenizer ([a9f3a69](https://github.com/nXhermane/smartcal/commit/a9f3a69ee2171884b0267ec0d8111addc24eaa98))
* set VitePress base path to /smartcal/ ([1717b90](https://github.com/nXhermane/smartcal/commit/1717b9062497b6cc289e54a24a63936390498b05))

## [1.0.11] - 2025-10-15

### Added
- **Modern Documentation**: Complete overhaul of documentation with modern README.md
- **JSDoc Comments**: Comprehensive JSDoc documentation for all public APIs
- **Advanced Examples**: Enhanced example file with 16 detailed usage examples
- **Generated Documentation**: HTML and Markdown documentation generated using documentation.js
- **Troubleshooting Guide**: Common issues and solutions section
- **FAQ Section**: Frequently asked questions with detailed answers
- **Operator Precedence Table**: Clear documentation of operator precedence rules
- **Unicode Support Documentation**: Examples of Unicode string handling
- **Formula Variables Guide**: Detailed explanation of nested formula variables

### Enhanced
- **README.md**: Modern design with table of contents, badges, and comprehensive sections
- **API Reference**: Detailed TypeScript interfaces and function signatures
- **Package.json**: Updated keywords and metadata for better discoverability
- **Build Scripts**: Added documentation generation scripts

### Fixed
- **Type Definitions**: Improved JSDoc comments with proper TypeScript types
- **Example Code**: Fixed TypeScript errors in example file

### Documentation
- Added comprehensive API documentation
- Created examples for all major features
- Added troubleshooting and FAQ sections
- Generated HTML documentation in `docs/` directory

## [1.0.0] - Initial Release

### Added
- Core expression evaluation functionality
- Support for arithmetic, comparison, and logical operators
- Variable binding and data context
- Formula compilation for performance
- Unicode string support
- TypeScript type definitions
- Basic test suite

### Features
- Mathematical expression parsing and evaluation
- Dynamic variable resolution
- Ternary operator support
- Parentheses for expression precedence
- Error handling for invalid expressions
