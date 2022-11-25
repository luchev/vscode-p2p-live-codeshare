import { getExtensionLogger } from "@vscode-logging/logger";
import { IVSCodeExtLogger } from "@vscode-logging/types";
import {extensionName} from "./constants";
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
		extName: extensionName,
		level: 'info',
		logPath: ctx.logUri.fsPath,
		logOutputChannel: vscode.window.createOutputChannel(extensionName),
		sourceLocationTracking: false,
		logConsole: true,
	});
	isInitialized = true;
}

export function log() {
	return function (target: any, propertyKey: any, descriptor: PropertyDescriptor) {
		var originalMethod = descriptor.value;

		descriptor.value = function (...args: any[]) {
			let functionName = propertyKey;
			logger().debug(functionName + "(" + args.join(", ") + ")");
			return originalMethod.apply(this, args);
		};

		return descriptor;
	};
}
