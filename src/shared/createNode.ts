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
import { logger } from './logger';
import emitter from './events';


export const createNode = async (peerId?: any, port?: number) => {
    const node = await createLibp2p({
        peerId: peerId,
        addresses: {
            listen: [`/ip4/0.0.0.0/tcp/${port ? port : 0}`]
        },
        transports: [tcp()],
        streamMuxers: [mplex()],
        connectionEncryption: [noise()],
        pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    });
    await node.start();
    return node;
};


export async function addCommonListeners(ctx: vscode.ExtensionContext, node: Libp2p) {
    var em = emitter;
    const answer = await vscode.window.showInformationMessage("Do you have Docker installed & running?", "Yes", "No");
    node.connectionManager.addEventListener("peer:connect", async (evt) => {
        const connection = evt.detail as Connection;
        logger().info(`${node.peerId}: Connected to ${connection.remotePeer.toString()}`); // Log connected peer

        // Contact connected peer, to let them know, that i am dockerable.
        if (answer === 'Yes') {
            let stream = await connection.newStream('/docker');
            stream.reset();
        }
    });

    node.addEventListener("peer:discovery", async (evt) => {
        let peerInfo = evt.detail as PeerInfo;
        logger().info(`${node.peerId}: Discovered to ${peerInfo.id.toString()}`); // Log discovered peer
        //console.log('protocols', peerInfo.protocols.join("\n"));
    });

    node.handle('/docker', ({ stream, connection }) => {
        logger().info(`${node.peerId}: Peer ${connection.remotePeer.toString()} is Dockerable`); // Log discovered peer
        node.peerStore.tagPeer(connection.remotePeer, "dockerable").then((value) => {
            console.log(value);
        }).catch((reason) => {
            console.log(reason);
        }).finally(() => null);
    });

    node.handle('/zip', async ({ stream, connection }) => {
        logger().info(`${node.peerId}: Zip files from ${connection.remotePeer}`);
        setInterval(() => {
            node.ping(connection.remotePeer);
        }, 5000);
        pipe(
            stream,
            (source) => {
				return (async function* () {
					for await (const buf of source) { yield uint8ArrayToString(buf.subarray()); }
				})();
			},
			async (source) => {
				for await (const msg of source) {
                    console.log(msg);
                    if (msg.includes('{"command":')) {
                        em.emit('CommandEvent', JSON.parse(msg));
                        continue;
                    } else{
                        handleReceivedDockerContent(ctx, uint8ArrayFromString(msg), stream);
                    }
				}
			}
        );
    });
}