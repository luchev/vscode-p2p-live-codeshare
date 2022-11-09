import * as vscode from 'vscode';
import {copyEdit} from './applyEdit';
import {registerSetupPublisher} from './setupPublisher';
import {registerSetupSubscriber} from './setupSubscriber';
import {initLogger} from './shared/logger';


export function activate(ctx: vscode.ExtensionContext) {
	initLogger(ctx);
	registerSetupPublisher(ctx);
	registerSetupSubscriber(ctx);
}

export function deactivate() { }
