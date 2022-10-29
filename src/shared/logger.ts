import {getExtensionLogger} from "@vscode-logging/logger";
import { IVSCodeExtLogger } from "@vscode-logging/types";
import {ExtensionName} from "../constants";
import * as vscode from 'vscode';

let _logger: IVSCodeExtLogger;
let isInitialized = false;

export function logger() {
    if (!isInitialized) {
        throw Error("Logger has not yet been initialized!");
    }
    return _logger;
}

export function initLogger(ctx: vscode.ExtensionContext) {
	_logger = getExtensionLogger({
		extName: ExtensionName,
		level: 'info',
		logPath: ctx.logUri.path,
		logOutputChannel: vscode.window.createOutputChannel(ExtensionName),
		sourceLocationTracking: false,
		logConsole: false,
	});
    isInitialized = true;
}
