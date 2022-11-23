import * as vscode from 'vscode';
import { logger } from './shared/logger';

class PeerNodeProvider implements vscode.TreeDataProvider<Peer> {

	private _onDidChangeTreeData: vscode.EventEmitter<Peer | undefined | void> = new vscode.EventEmitter<Peer | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Peer | undefined | void> = this._onDidChangeTreeData.event;

    private peers : Peer [];

	constructor() {
		this.peers = [];
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getNode(): Thenable<Peer> {
		if (this.peers.length === 0) {
			logger().error("There is no registered peer in the tree view.");
			return new Promise(resolve => {logger().info("shit");});
		} else {
			return new Promise(resolve => {logger().info("works");return this.peers[0];});
		}
	}

	getTreeItem(element: Peer): vscode.TreeItem {
        const item = new vscode.TreeItem(element.label, element.collapsibleState);
		return item;
	}

	getChildren(element?: Peer): vscode.ProviderResult<Peer[]> {
		return this.peers;
	}

    addItem(peerId:string) {
        this.peers.push(new Peer(peerId));
    }

	reset() {
		this.peers = [];
	}
}

class Peer extends vscode.TreeItem {

	constructor(
		public readonly label: string
	) {
		super(label);
	}

	contextValue = 'peer';
}

const p2pShareProvider = new PeerNodeProvider();

export {p2pShareProvider};