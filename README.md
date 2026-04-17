# Visual Studio Code Go Doc

![Go Doc logo](media/logo.png)

A Visual Studio Code extension for showing Go symbol and package documentation in the Output panel.

## Configuration

The extension uses the registered Go hover provider in VS Code to retrieve documentation for the symbol under the cursor.

For the best results, install and enable:

* [Go extension for VS Code](https://marketplace.visualstudio.com/items?itemName=golang.Go)
* `gopls` in your Go workspace

If hover-based documentation is unavailable, the command prints troubleshooting steps in the Output panel instead of failing with a low-level tool error.

### Commands

* Go Doc: Get Definition - Prints the selected symbol definition and documentation in the Output panel
