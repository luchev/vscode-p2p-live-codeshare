import * as vscode from 'vscode';
import {createLibp2p} from 'libp2p';
import {gossipsub} from '@chainsafe/libp2p-gossipsub'
import {tcp} from '@libp2p/tcp'
import {mplex} from '@libp2p/mplex'
import {noise} from '@chainsafe/libp2p-noise'
import {fromString as uint8ArrayFromString} from "uint8arrays/from-string";
import {toString as uint8ArrayToString} from "uint8arrays/to-string";

const createNode = async () => {
	const node = await createLibp2p({
		addresses: {
			listen: ['/ip4/0.0.0.0/tcp/0']
		},
		transports: [tcp()],
		streamMuxers: [mplex()],
		connectionEncryption: [noise()],
		pubsub: gossipsub({allowPublishToZeroPeers: true}),
	})

	await node.start()
	return node
}

const topics = ['change_file']

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('p2p-share.setupPublisher', async () => {
		const topic = 'changed-files'
		const [node1, node2] = await Promise.all([
			createNode(),
			createNode()
		])
		await node1.peerStore.addressBook.set(node2.peerId, node2.getMultiaddrs())
		await node1.dial(node2.peerId)

		node1.pubsub.addEventListener("message", (evt) => {
			console.log(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
			vscode.window.showInformationMessage(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`);
		})
		node1.pubsub.subscribe(topic)

		node2.pubsub.addEventListener("message", (evt) => {
			console.log(`node2 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
			vscode.window.showInformationMessage(`node2 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`);
		})
		node2.pubsub.subscribe(topic)

		setInterval(() => {
			node2.pubsub.publish(topic, uint8ArrayFromString('Bird bird bird, bird is the word!')).catch(err => {
				console.error(err)
				vscode.window.showInformationMessage(err);
			})
		}, 1000)
		vscode.window.showInformationMessage('Hello World from libp2p-example!');
	});

	context.subscriptions.push(disposable);
}

export function setupSubscriber(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('p2p-share.setupSubscriber', async () => {
		const topic = 'changed-files'
		const [node1, node2] = await Promise.all([
			createNode(),
			createNode()
		])
		await node1.peerStore.addressBook.set(node2.peerId, node2.getMultiaddrs())
		await node1.dial(node2.peerId)

		node1.pubsub.addEventListener("message", (evt) => {
			console.log(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
			vscode.window.showInformationMessage(`node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`);
		})
		node1.pubsub.subscribe(topic)

		node2.pubsub.addEventListener("message", (evt) => {
			console.log(`node2 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`)
			vscode.window.showInformationMessage(`node2 received: ${uint8ArrayToString(evt.detail.data)} on topic ${evt.detail.topic}`);
		})
		node2.pubsub.subscribe(topic)

		setInterval(() => {
			node2.pubsub.publish(topic, uint8ArrayFromString('Bird bird bird, bird is the word!')).catch(err => {
				console.error(err)
				vscode.window.showInformationMessage(err);
			})
		}, 1000)
		vscode.window.showInformationMessage('Hello World from libp2p-example!');
	});

	context.subscriptions.push(disposable);
}
