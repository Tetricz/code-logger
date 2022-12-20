// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { LocalStorage, KeysList } from './storage';
//import { ExtensionContext, commands, window, WindowState } from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated

	console.log('Congratulations, your extension "code-logger" is now active in the web extension host!');
	console.log('The window state is: ' + vscode.window.state);
	let activationTime = new Date().getTime();

	console.log('Activation time: ' + (activationTime) + 'ms');


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('code-logger.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from code-logger in a web extension host!');
	});

	context.subscriptions.push(disposable);

	const storage: LocalStorage = new LocalStorage(context.globalState);
	const keysList: KeysList = new KeysList(storage);

	const label = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
	label.show();
	context.subscriptions.push(label);

	let totalKeypressCount: number = storage.getValue<number>('totalKeypressCount', 0);
	let consecutiveKeypressCount: number = 0;
	let timeoutComboHandle: NodeJS.Timeout;
	let timeoutSaveHandle: NodeJS.Timeout;

	const updateLabel = () => {
		// Format totalKeypressCount as 1,234,567
		const formattedCount = totalKeypressCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
		label.text = '$(flame)' + formattedCount + (consecutiveKeypressCount > 0 ? ` | ${consecutiveKeypressCount} combo` : '');
	};
	updateLabel();

	keysList.load();

	const onKeyPressed = (event: vscode.TextDocumentChangeEvent) => {
		const keyEventText = event.contentChanges[0].text;
		if (keyEventText.length === 1) {
		const key = keyEventText.toLowerCase();
		if (keysList.buffer[key] !== undefined) {
			keysList.buffer[key]++;
		} else {
			keysList.buffer[key] = 1;
		}
		}

		consecutiveKeypressCount++;
		updateLabel();

		if (timeoutComboHandle) {
		clearTimeout(timeoutComboHandle);
		}
		timeoutComboHandle = setTimeout(() => {
		onConsecutiveEnded();
		}, 3000);

		if (timeoutSaveHandle) {
		clearTimeout(timeoutSaveHandle);
		}
		timeoutSaveHandle = setTimeout(() => {
		keysList.save();
		}, 5000);
	};

	const onConsecutiveEnded = () => {
		totalKeypressCount = storage.getValue<number>('totalKeypressCount', 0);
		totalKeypressCount += consecutiveKeypressCount;
		storage.setValue('totalKeypressCount', totalKeypressCount);
		consecutiveKeypressCount = 0;
		updateLabel();
	};

	vscode.workspace.onDidChangeTextDocument(event => {
		onKeyPressed(event);
	});
	}

// This method is called when your extension is deactivated
export function deactivate() {}
