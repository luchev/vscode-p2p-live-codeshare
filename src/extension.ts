import * as vscode from 'vscode';
import {registerSetupPublisher} from './setupPublisher';
import {registerSetupSubscriber} from './setupSubscriber';
import {initLogger} from './shared/logger';
import { p2pShareProvider } from './sessionData';

import { registerFilePublisher } from './filePublisher';
import {registerDisconnect} from './setupDisconnect';

export async function activate(ctx: vscode.ExtensionContext) {
	initLogger(ctx);
	registerSetupPublisher(ctx);
	registerSetupSubscriber(ctx);
	registerDisconnect(ctx);
	
	vscode.window.registerTreeDataProvider('session', p2pShareProvider);
	registerFilePublisher(ctx);
}

export function deactivate() {}
