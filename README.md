# npm-uninstall-unused

A CLI tool to detect and uninstall unused npm dependencies from your Node.js project. Perfect for both single projects and monorepos!

## Status

[![npm version](https://badge.fury.io/js/npm-uninstall-unused.svg)](https://badge.fury.io/js/npm-uninstall-unused)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Why use this?

Have you ever:

- Wondered which npm packages are just sitting in your `package.json` unused?
- Wanted to clean up your project but were afraid of breaking things?
- Struggled with managing dependencies in a monorepo?

This tool helps you identify and safely remove unused dependencies, making your project cleaner and more maintainable.

## Features

- Scans for unused dependencies and devDependencies
- Works with both single projects and monorepos
- Supports nested package.json files
- Fast uninstallation with --no-audit flag
- Beautiful colored output
- Interactive confirmation before uninstalling

## Installation

```bash
# Install globally
npm install -g npm-uninstall-unused

# Or use npx (no installation needed)
npx npm-uninstall-unused
```

## Usage

Simply run the command in your project directory:

```bash
npm-uninstall-unused
```

The tool will:

1. Scan all package.json files in the current directory and subdirectories
2. Show you unused dependencies and devDependencies
3. Ask for confirmation before uninstalling
4. Remove the unused packages

## Options

- `--ci`: Run in CI mode (skips confirmation prompts)
- `--no-audit`: Skip npm audit (faster uninstallation)

## Examples

```bash
# Basic usage
npm-uninstall-unused

# Run in CI mode
CI=true npm-uninstall-unused

# Skip audit
npm-uninstall-unused --no-audit
```

## How it works

1. The tool uses `depcheck` to scan your project for unused dependencies
2. It recursively finds all package.json files in your project
3. For each package.json, it:
   - Checks for unused dependencies
   - Checks for unused devDependencies
   - Shows the results
   - Asks for confirmation
   - Uninstalls if confirmed

## Contributing

Found a bug? Have a feature request? Feel free to open an issue or submit a pull request!

## License

MIT - Feel free to use this tool however you want!

---

Made with ❤️ by [Shivanshu Pathak](https://github.com/shivanshu814)
