'use strict';

import * as vscode from 'vscode';
import * as cp  from 'child_process';
import * as path from "path";
import { getBinPath, getFileArchive } from './util';
import { showOutput } from './outputChannel';

export function printDefination() {
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showInformationMessage('No editor is active');
		return;
	}
	if (editor.document.languageId !== 'go') {
		vscode.window.showInformationMessage('File in the active editor is not a Go file');
		return;
	}

	showOutput('Generating documentation...', true);
	
	getDefinition(editor.document, editor.selection.active).then(def => {
		if (!def) {
			return;
		}
		showOutput(def, true, true);
	}, (err) => {
		showOutput(err, true);
	});
}

function getDefinition(doc: vscode.TextDocument, pos: vscode.Position): Promise<string> {
	let gogetdoc = getBinPath('gogetdoc');
	if (!path.isAbsolute(gogetdoc)) {
		return Promise.reject('gogetdoc is missing');
	}

	let offset = Buffer.byteLength(doc.getText().substr(0, doc.offsetAt(pos)));

	return new Promise<string>((resolve, reject) => {
		let p = cp.execFile(gogetdoc, ['-json', '-modified', '-u', '-pos', doc.fileName + ':#' + offset.toString()], undefined, (err, stdout, stderr) => {
			try {
				if (err && (<any>err).code === 'ENOENT') {
					return reject('gogetdoc is missing');
				}
				if (err) {
					return reject(stderr);
				}
				let def = JSON.parse(stdout);
				let out = '';
				if (def.import) {
					out = def.import + '\n';
				}
				if (def.decl) {
					out += (out? '\n' : '') + def.decl + '\n';
				}
				if (def.doc) {
					out += (out? '\n' : '') + def.doc;
				}
				return resolve(out);
	
			} catch (e) {
				return reject(e);
			}
		});
		p.stdin.end(getFileArchive(doc));
	});
}
