import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { logger } from "./logger";

export function readSettingsFile(ctx: vscode.ExtensionContext, file:string): Thenable<[string, number]> {
    return new Promise((resolve, rejects) => {
        let peerId = "";
        let port = 0;
        if (fs.existsSync(path.join(ctx.extensionPath, file))) {
            const json = fs.readFileSync(path.join(ctx.extensionPath, file), 'utf8');
            const obj = JSON.parse(json);
            try {
                peerId = obj.peerId;
                port = obj.peerPort;
            } catch (error) {
                logger().error(error.message);
                rejects();
            }
        } else {
            rejects();
        }
        resolve([peerId, port]);
    });
}

export function writeSettingsFile(ctx: vscode.ExtensionContext, file:string, peerId:string, peerPort:number) {


    const settings = {peerId: peerId, peerPort: peerPort};
    const json = JSON.stringify(settings);
    fs.writeFileSync(path.join(ctx.extensionPath, file), json, 'utf8');
}