import * as vscode from 'vscode';
import * as path from 'path';
import { TextDecoder } from 'util';
import { DockerFilesMessage } from '../models/DockerFilesMessage';
import { nameof } from './nameof';
import { Docker } from './docker-commands';
import AdmZip from 'adm-zip';
import { logger } from './logger';
import { Stream } from '@libp2p/interface-connection';

export async function handleReceivedDockerContent(context: vscode.ExtensionContext, uint8Array: Uint8Array, stream: Stream) {
	//on docker machine
	logger().info('Received zipped content!');
	vscode.window.showInformationMessage('Received zipped content!');
	let recivedMessage: DockerFilesMessage = JSON.parse(new TextDecoder().decode(uint8Array), (key, value) => {
		if (key === nameof<DockerFilesMessage>("zipBuffer")) {
			return Buffer.from(value);
		} else {
			return value;
		}
	});

	let zip2 = new AdmZip(recivedMessage.zipBuffer);
	let filePath = path.join(context.extensionPath, recivedMessage.userId, recivedMessage.zipName);
	zip2.extractAllTo(filePath, true);

	Docker.buildAndStartDockerContainer(context, filePath, stream);
}