export class DockerFilesMessage {
	userId: string;
	zipName: string;
	zipBuffer: Buffer;

	constructor(userId: string, zipName: string, zipBuffer: Buffer) {
		this.userId = userId;
		this.zipName = zipName;
		this.zipBuffer = zipBuffer;
	}


	static isDockerFilesMessage(o: any): o is DockerFilesMessage {
		return "userId" in o && "zipName" in o && "zipBuffer" in o;
	}
}

export class CommandMessage {
	command: string;
	constructor(command: string) {
		this.command = command;
	}

	static isCommandMessage(o: any): o is CommandMessage {
		return "command" in o;
	}
}

export class DestroyContainerMessage {
	destroyContainer = true;

	static isDestroyContainerMessage(o: any): o is DestroyContainerMessage {
		return "destroyContainer" in o;
	}
}