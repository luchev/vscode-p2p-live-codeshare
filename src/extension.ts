import * as vscode from 'vscode';
import { registerFilePublisher } from './filePublisher';
import {registerSetupPublisher} from './setupPublisher';
import {registerSetupSubscriber} from './setupSubscriber';
import {initLogger} from './shared/logger';

export async function activate(ctx: vscode.ExtensionContext) {
	initLogger(ctx);
	registerSetupPublisher(ctx);
	registerSetupSubscriber(ctx);
	registerFilePublisher(ctx);
}

export function deactivate() { }
