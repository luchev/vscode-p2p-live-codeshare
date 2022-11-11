import { createLibp2p } from 'libp2p';
import { gossipsub } from '@chainsafe/libp2p-gossipsub';
import { tcp } from '@libp2p/tcp';
import { mplex } from '@libp2p/mplex';
import { noise } from '@chainsafe/libp2p-noise';

export const createNode = async (peerId?: any) => {
    const node = await createLibp2p({
        peerId: peerId,
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/30104']
        },
        transports: [tcp()],
        streamMuxers: [mplex()],
        connectionEncryption: [noise()],
        pubsub: gossipsub({ allowPublishToZeroPeers: true }),
    });

    await node.start();
    return node;
};
