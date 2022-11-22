import * as vscode from "vscode";
import * as fs from 'fs';
import * as path from 'path';

export function readSettingsFile(ctx: vscode.ExtensionContext, file:string) {
    if (fs.existsSync(path.join(ctx.extensionPath, file))) {
        const json = fs.readFileSync(path.join(ctx.extensionPath, file), 'utf8');
        const obj = JSON.parse(json);
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