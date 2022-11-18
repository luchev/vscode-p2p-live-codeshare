import * as vscode from 'vscode';
import { createLibp2p, Libp2p } from 'libp2p';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { tcp } from '@libp2p/tcp';
import { webSockets } from '@libp2p/websockets';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';
import { Connection } from '@libp2p/interface-connection';
import { PeerInfo } from '@libp2p/interface-peer-info';
import { pipe } from 'it-pipe';
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { handleReceivedDockerContent } from './dockerfiles-receiver';


export const createNode = async (peerId?: any, port?: number) => {
    const node = await createLibp2p({
        peerId: peerId,
        addresses: {
            listen: [`/ip4/0.0.0.0/tcp/${port ? port : 0}`]
        },
        transports: [tcp(), webSockets()],
        streamMuxers: [mplex()],
        connectionEncryption: [noise()],
        pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    });

    await node.start();
    return node;
};


export async function addCommonListeners(ctx: vscode.ExtensionContext, node: Libp2p) {
    const answer = await vscode.window.showInformationMessage("Do you have Docker installed & running?", "Yes", "No");
    node.connectionManager.addEventListener("peer:connect", async (evt) => {
        const connection = evt.detail as Connection;
        console.log(`${node.peerId}: Connected to ${connection.remotePeer.toString()}`); // Log connected peer
        console.log('streams', connection.streams);

        if (answer === 'Yes') {
            let stream = await connection.newStream('/docker');
            stream.close();
        }
        //const stream = await connection.newStream("/zip");
        //pipe(
        //	[uint8ArrayFromString("hello")],
        //	stream);
    });

    node.addEventListener("peer:discovery", async (evt) => {
        let peerInfo = evt.detail as PeerInfo;
        console.log(`${node.peerId}: Discovered to ${peerInfo.id.toString()}`); // Log discovered peer
        console.log('protocols', peerInfo.protocols.join("\n"));
    });

    node.handle('/docker', ({ stream, connection }) => {
        console.log(`${node.peerId}: Peer ${connection.remotePeer.toString()} is Dockerable`); // Log discovered peer
        node.peerStore.tagPeer(connection.remotePeer, "dockerable");
    });

    node.handle('/zip', async ({ stream, connection }) => {
        console.log(`${node.peerId}: Zip files from ${connection.remotePeer}`);
        await pipe(
            stream,
            async function (source) {
                let str = '';
                for await (const msg of source) {
                    str += uint8ArrayToString(msg.subarray());
                    console.log(uint8ArrayToString(msg.subarray()));
                }
                await handleReceivedDockerContent(ctx, uint8ArrayFromString(str), stream);
            }
        );
    });
}