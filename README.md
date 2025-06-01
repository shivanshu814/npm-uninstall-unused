# npm-uninstall-unused

🚀 A CLI tool to detect and uninstall unused npm dependencies from your Node.js project.

## Features

- 🔍 Scans for unused dependencies and devDependencies
- 📦 Works with both single projects and monorepos
- 🎯 Supports nested package.json files
- ⚡ Fast uninstallation with --no-audit flag
- 🎨 Beautiful colored output
- 🤝 Interactive confirmation before uninstalling

## Installation

```bash
npm install -g npm-uninstall-unused
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

Feel free to open issues and pull requests!

## License

MIT
