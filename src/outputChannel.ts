import * as vscode from "vscode";

let outputChannel = vscode.window.createOutputChannel('Go Doc');

export function showOutput(message: string, clear?: boolean, focus?: boolean) {
	if (focus) {
		outputChannel.show();
	}
	if (clear) {
		outputChannel.clear();
	}
	outputChannel.appendLine(message);
}