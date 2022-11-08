export class DockerFilesMessage {
	userId: string;
	zipName: string;
	zipBuffer: Buffer;

	constructor(userId: string, zipName: string, zipBuffer: Buffer) {
		this.userId = userId;
		this.zipName = zipName;
		this.zipBuffer = zipBuffer;
	}
}