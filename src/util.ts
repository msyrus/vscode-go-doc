import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export const envPath: string = process.env['PATH'] || (process.platform === 'win32' ? process.env['Path'] : '') || '';

export function fileExists(filePath: string): boolean {
	try {
		return fs.statSync(filePath).isFile();
	} catch (e) {
		return false;
	}
}

export function byteOffsetAt(doc: vscode.TextDocument, pos: vscode.Position): number {
	return Buffer.byteLength(doc.getText().substr(0, doc.offsetAt(pos)));
}

export function getFileArchive(doc: vscode.TextDocument): string {
	let text = doc.getText();
	return doc.fileName + '\n' + Buffer.byteLength(text, 'utf8') + '\n' + text;
}

export function getBinPath(name: string): string {
	if (!name) { return ""; }
	if (binPathCache[name]) { return binPathCache[name]; }
	let binName = correctBinName(name);

	let goRoot = process.env["GOROOT"];
	if (goRoot) {
		let binPath = path.join(goRoot, "bin", binName);
		if (fileExists(binPath)) {
			binPathCache[name] = binPath;
			return binPathCache[name];
		}
	}

	let goPath = process.env["GOPATH"];
	if (goPath) {
		let binPath = path.join(goPath, "bin", binName);
		if (fileExists(binPath)) {
			binPathCache[name] = binPath;
			return binPathCache[name];
		}
	}

	if (envPath) {
		let binPath = envPath.split(path.delimiter)
			.map(dir => path.join(dir, binName))
			.filter(fp => fileExists(fp))[0];
		if (fileExists(binPath)) {
			binPathCache[name] = binPath;
			return binPathCache[name];
		}
	}

	return "";
}

let binPathCache: { [bin: string]: string} = {};
let defaultPathForGo: string = process.platform === 'win32' ? 'C:\\Go\\bin\\go.exe' : '/usr/local/go/bin/go';

export function getGoBinPath(): string {
	if (binPathCache["go"]) { return binPathCache["go"]; }
	let binName = correctBinName("go");
	let goRoot = process.env["GOROOT"];
	if (goRoot) {
		let binPath = path.join(goRoot, "bin", binName);
		if (fileExists(binPath)) {
			binPathCache["go"] = binPath;
			return binPathCache["go"];
		}
	}

	if (envPath) {
		let binPath = envPath.split(path.delimiter)
			.map(dir => path.join(dir, binName))
			.filter(fp => fileExists(fp))[0];
		if (fileExists(binPath)) {
			binPathCache["go"] = binPath;
			return binPathCache["go"];
		}
	}

	if (fileExists(defaultPathForGo)) {
		binPathCache["go"] = defaultPathForGo;
	}
	return binPathCache["go"];
}

function correctBinName(name: string) {
	return name && process.platform === 'win32'? name + '.exe': name;
}