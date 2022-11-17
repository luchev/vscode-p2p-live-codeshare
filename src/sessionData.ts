import * as vscode from 'vscode';

class PeerNodeProvider implements vscode.TreeDataProvider<Peer> {

	private _onDidChangeTreeData: vscode.EventEmitter<Peer | undefined | void> = new vscode.EventEmitter<Peer | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<Peer | undefined | void> = this._onDidChangeTreeData.event;

    private peers : Peer [] = [];

	constructor() {
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: Peer): vscode.TreeItem {
        const item = new vscode.TreeItem(element.label!, element.collapsibleState);
		return item;
	}

	getChildren(element?: Peer): vscode.ProviderResult<Peer[]> {
		return this.peers;
	}

    addItem(peerId:string) {
        this.peers.push(new Peer(peerId));
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

var p2pShareProvider = new PeerNodeProvider();

export {p2pShareProvider};