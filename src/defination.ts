import {window, Position, TextDocument} from 'vscode';
import * as cp  from 'child_process';
import * as path from "path";
import { getBinPath, getFileArchive, installTools } from './util';
import { showOutput } from './outputChannel';

export function printDefination() {
	let editor = window.activeTextEditor;
	if (!editor) {
		window.showInformationMessage('No editor is active');
		return;
	}
	if (editor.document.languageId !== 'go') {
		window.showInformationMessage('File in the active editor is not a Go file');
		return;
	}

	showOutput('Generating documentation...', true);
	
	getDefinition(editor.document, editor.selection.active).then(def => {
		if (!def) {
			return;
		}
		showOutput(def, true, true);
	}, (err) => {
		window.showErrorMessage(err);
	});
}

async function getDefinition(doc: TextDocument, pos: Position): Promise<string> {
	let gogetdoc = getBinPath('gogetdoc');
	if (!path.isAbsolute(gogetdoc)) {
		try {
			await installTools()
			gogetdoc = getBinPath('gogetdoc');
		} catch (err) {
			return Promise.reject(err)
		}
	}

	const fileArch = getFileArchive(doc);
	const offset = Buffer.byteLength(doc.getText().substr(0, doc.offsetAt(pos)));

	return new Promise<string>((resolve, reject) => {
		const opts = {
			cwd: path.dirname(doc.fileName),	
		};

		const p = cp.execFile(gogetdoc, ['-json', '-modified', '-u', '-pos', doc.fileName + ':#' + offset.toString()], opts, (err, _, stderr) => {
			if (err && (<any>err).code === 'ENOENT') {
				return reject('gogetdoc is missing');
			}
			if (err) {
				return reject(stderr);
			}
		});

		p.stdin?.end(fileArch);
		p.stdout?.on('data', data => {
			try {
				const def = JSON.parse(data);
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
				return resolve(e);
			}
		});
	});
}
