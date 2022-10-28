import * as vscode from 'vscode';
import {setupPublisher} from './setupPublisher';
import {setupSubscriber} from './setupSubscriber';


export function activate(ctx: vscode.ExtensionContext) {
	ctx.subscriptions.push(vscode.commands.registerCommand(
		'p2p-share.setupPublisher',
		async () => setupPublisher(ctx))
	);

	ctx.subscriptions.push(vscode.commands.registerCommand(
		'p2p-share.setupSubscriber',
		async () => setupSubscriber(ctx))
	);
}

export function deactivate() { }
