import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { createFromProtobuf , exportToProtobuf} from "@libp2p/peer-id-factory";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as stringFromUint8Array} from "uint8arrays/to-string";
import type { PeerId } from '@libp2p/interface-peer-id';

export async function readSettingsFile(ctx: vscode.ExtensionContext, file:string) {
    if (fs.existsSync(path.join(ctx.extensionPath, file))) {
        const reconnect = (await vscode.window.showInformationMessage(
            "Do you want to reconnect?",
            "Yes",
            "No"
          )) === 'Yes';
        if (reconnect) {
            const json = fs.readFileSync(path.join(ctx.extensionPath, file), 'utf8');
            const obj = JSON.parse(json);
            obj.peerId = await createFromProtobuf(uint8ArrayFromString(obj.peerId, "base64"));
            return Promise.resolve(obj);
        }
    }
    return Promise.reject();
}

export function writeSettingsFile(ctx: vscode.ExtensionContext, filename:string, peerId:PeerId, port:number) {
    const settings = {peerId: stringFromUint8Array(exportToProtobuf(peerId), "base64"), port: port};
    const json = JSON.stringify(settings);
    fs.writeFileSync(path.join(ctx.extensionPath, filename), json, 'utf8');
}