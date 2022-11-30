import * as vscode from 'vscode';

class PeerNodeProvider implements vscode.TreeDataProvider<PeerData> {

	private _onDidChangeTreeData: vscode.EventEmitter<PeerData | undefined | void> = new vscode.EventEmitter<PeerData | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<PeerData | undefined | void> = this._onDidChangeTreeData.event;

    private peers : PeerData [];

	constructor() {
		this.peers = [];
		vscode.commands.registerCommand('session.refresh', () => this.refresh());
		vscode.commands.registerCommand('session.itemClicked', e => this.itemClicked(e));
	}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	itemClicked(element: PeerData) {
		vscode.env.clipboard.writeText(element.label!.toString());
	}

	getTreeItem(element: PeerData): vscode.TreeItem |Thenable<vscode.TreeItem>{
        const item = new vscode.TreeItem(element.label!, element.collapsibleState);
		item.command = { command: 'session.itemClicked', title : "title", arguments: [element] };
		return item;
	}

	getChildren(element: PeerData | undefined): vscode.ProviderResult<PeerData[]> {
		if (element === undefined) {
			return this.peers;
		} else {
			return element.properties;
		}
	}

    addItem(peerId:string, properties:string[]) {
		const peer = new PeerData(peerId);
		for (const property in properties){
			peer.addChild(new PeerData(properties[property]));
		}
        this.peers.push(peer);
		this.refresh();
    }

	addPropertyToItem(label:string, property:string) {
		let peerFound = this.findPeerDataByLabel(label);
		if (peerFound) {
			peerFound.addChild(new PeerData(property));
		}
		this.refresh();
	}

	findPeerDataByLabel(label:string) {
		return this.peers.find(
			(peer) => 
				{
					return peer.label === label;
				}
		);
	}

	reset() {
		this.peers = [];
	}
}

class PeerData extends vscode.TreeItem {

	public properties: PeerData[] = [];

	constructor(label:string) {
		super(label, vscode.TreeItemCollapsibleState.None);
		this.collapsibleState = vscode.TreeItemCollapsibleState.None;
	}

	public addChild(child:PeerData) {
		this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
		this.properties.push(child);
	}

	contextValue = 'peer';
}

const p2pShareProvider = new PeerNodeProvider();

export {p2pShareProvider};