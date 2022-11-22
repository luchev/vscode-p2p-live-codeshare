import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';
import { createFromProtobuf } from "@libp2p/peer-id-factory";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";

export async function readSettingsFile(ctx: vscode.ExtensionContext, file:string) {
    if (fs.existsSync(path.join(ctx.extensionPath, file))) {
        const json = fs.readFileSync(path.join(ctx.extensionPath, file), 'utf8');
        const obj = JSON.parse(json);
        obj.peerId = await createFromProtobuf(uint8ArrayFromString(obj.peerId, "base64"));
        return Promise.resolve(obj);

    } else {
        return Promise.reject();
    }
}

export function writeSettingsFile(ctx: vscode.ExtensionContext, filename:string, peerId:string, port:number) {
    const settings = {peerId: peerId, port: port};
    const json = JSON.stringify(settings);
    fs.writeFileSync(path.join(ctx.extensionPath, filename), json, 'utf8');
}