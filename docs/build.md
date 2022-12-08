# Build instructions

## Dependencies

- [Node.js with npm](https://nodejs.org/en/) (v18.12.1 or higher)
- `npm install -g yarn`
- `npm install -g @vscode/vsce`

## Build

1. `yarn install`
2. `vsce package`

You should have a `.vsix` file in the root of the project. If you want to install the extension locally, you can run `code --install-extension <vsix file>`.
