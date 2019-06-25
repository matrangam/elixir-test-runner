"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");

function activate(context) {

	const hoverCommand = 'exlixir-test-runner.run-test';
	const runTest = (args) => {
		const index = args.uri.indexOf("test")
		const actualURI = args.uri.slice(index)
		const hoverCommand = `./scripts/test ${actualURI}:${args.lineNumber}`
		const terminal = vscode.window.createTerminal();
		terminal.show();
		terminal.sendText(hoverCommand)
	};

	context.subscriptions.push(
		vscode.commands.registerCommand(hoverCommand, runTest)
	);

	const paletteCommand = "elixir-test-runner.test-file";
	const testFile = () => {
		const uri = activeEditor.document.uri.path
		const index = uri.indexOf("test")
		const actualURI = uri.slice(index)
		const hoverCommand = `./scripts/test ${actualURI}`
		const terminal = vscode.window.createTerminal();
		terminal.show();
		terminal.sendText(hoverCommand)
	}
	context.subscriptions.push(
		vscode.commands.registerCommand(paletteCommand, testFile)
	);
	

	let timeout: NodeJS.Timer | undefined = undefined;
	const testDecorationType = vscode.window.createTextEditorDecorationType({
		cursor: 'crosshair',
		backgroundColor: { id: 'myextension.largeNumberBackground' }
	});
	let activeEditor = vscode.window.activeTextEditor;
	function updateDecorations() {
		if (!activeEditor) {
			return;
		}
		const regEx = /(test|describe) ".+"/g
		const text = activeEditor.document.getText();
		const testMatches = [];
		let match;
		while (match = regEx.exec(text)) {
			const startPos = activeEditor.document.positionAt(match.index);
			const endPos = activeEditor.document.positionAt(
				match.index + match[0].length
			);

			const args = {
				uri: activeEditor.document.uri.path,
				lineNumber: startPos.line + 1
			};
			const hoverMessage = new vscode.MarkdownString(
				`[Run Suite: ${
				match[0]
				}](command:exlixir-test-runner.run-test?${encodeURIComponent(
					JSON.stringify(args)
				)})`
			);
			hoverMessage.isTrusted = true;
			const decoration = {
				range: new vscode.Range(startPos, endPos),
				hoverMessage: hoverMessage
			};
			testMatches.push(<never>decoration);
		}
		activeEditor.setDecorations(testDecorationType, testMatches);
	}
	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}
	if (activeEditor) {
		triggerUpdateDecorations();
	}
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);
	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map