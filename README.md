# README

Colab is a VS Code extension for code sharing. Colab is for code what Zoom is for video chats.

## Features

The extension has a menu, with all the functionalities

<img width="407" alt="image" src="https://user-images.githubusercontent.com/4147570/211206900-61de1bcc-2949-4d77-8237-064d23f28ace.png">

The buttons allow the following functionalities:

* Setup Publisher - create a new network and become the publisher (presenter)
* Setup Subscriber - join an existing network using the publisher's ID
* Disconnect - leave the network and destroy the session (automatic reconnection is impossible)
* Send project files - execute the current directory in a Docker container on a remote machine (requires Dockerfile)
* Destroy container - stops the remote Docker container

The bottom section is `Session`, which has information about which peers are connected to the network.
The first peer is always the current host.
The URLs listed are the IDs of the peer.

A common workflow is:

1. A Publisher starts
2. The Publisher copies their ID from the `Session` tab and shares it with others
3. Everyone else uses the ID to start a Subscriber
4. When starting a Subscriber you have the option to select "Sync Workspace" to fetch the latest state
5. The Publisher can now edit/create/delete files and they will be synced with the other peers

## Comparison to Live Share

|   | Colab | Live Share |
|---|-------|------------|
|Peer connection|p2p|Tries p2p but defaults to centralized cloud|
|Peers who can edit|Only 1 - the publisher|Everyone|
|Execute remotely|Yes with Docker|No|
|Edit permissions|No|Yes|
|Reconnect to network|Yes|No|
|Network dies after creator leaves|No|Yes|

## Known issues/Limitations

* The extension works only on local network
* When joining a network as a subscriber the opened workspace directory will be cleaned of all files
