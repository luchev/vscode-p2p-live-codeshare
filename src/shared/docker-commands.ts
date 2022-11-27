import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { log, logger } from './logger';
import { Stream } from '@libp2p/interface-connection';

import { pipe } from 'it-pipe';
import { pushable, Pushable } from 'it-pushable';
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { CommandMessage, DestroyContainerMessage } from '../models/DockerFilesMessage';
import * as glob from 'glob';

export class Docker {
    private consoleOutput: Pushable<string> = pushable<string>({ objectMode: true });
    private runner: cp.ChildProcess | undefined;
    constructor() { }

    @log()
    public async buildAndStartDockerContainer(context: vscode.ExtensionContext, folderPath: string, stream: Stream): Promise<void> {
        const shellOpts: cp.SpawnOptions = { cwd: context.extensionPath };

        // Glob pattern to search for dockerfiles, under the workspace folder
        let dockerfiles = glob.sync('**/Dockerfile*', { cwd: folderPath });

        if (dockerfiles.length === 0) {
            let errorMsg = 'Could not find any dockerfiles :(';
            logger().error(errorMsg);
            vscode.window.showErrorMessage(errorMsg);
            return;
        }

        logger().info('dockerfiles', dockerfiles);

        // Use first Dockerfile found
        let dockerfileUri = dockerfiles[0];

        // Find where Dockerfile is relative to Workspace folder.
        // let relative = vscode.workspace.asRelativePath(dockerfileUri.path);
        let relative = path.relative(context.extensionUri.fsPath, folderPath + "\\" + dockerfileUri);

        // Remove /Dockerfile from that path
        const relativeFolderPath = relative.substring(0, relative.indexOf("\\Dockerfile")).toLowerCase().replaceAll('\\', '/');

        // Container name will be folders relative to workspace folder, with '-' instead of '/'. ex: 'milestone3-web'
        const containerName = relativeFolderPath.replaceAll('/', '-');

        // Pipe console output into the stream (aka. back to peer)
        pipe(
            this.consoleOutput,
            (source) => {
                return (async function* () {
                    for await (const msg of source) { yield uint8ArrayFromString(msg); };
                })();
            },
            stream
        );

        pipe(
            stream,
            (source) => {
                return (async function* () {
                    for await (const buf of source) { yield uint8ArrayToString(buf.subarray()); }
                })();
            },
            async (source) => {
                for await (const msg of source) {
                    let data = JSON.parse(msg);
                    if (CommandMessage.isCommandMessage(data)) {
                        this.runner!.stdin?.write(data.command + '\n\r');
                    } else if (DestroyContainerMessage.isDestroyContainerMessage(data)) {
                        this.runner!.kill();
                    }
                }
            }
        );

        // Kill possible container with same name.
        this.spawnSync("powershell.exe", [`docker rm -f ${containerName}`], shellOpts);

        // Build new image
        this.spawnSync("powershell.exe", [`docker build -t ${containerName} ${relativeFolderPath}`], shellOpts);

        // Run the image
        this.spawn("powershell.exe", [`docker run -i -p "8080" --name ${containerName} ${containerName}`], shellOpts);
    }

    @log()
    public spawnSync(cmd: string, args: any[], opts: cp.SpawnOptions) {
        const spawn = cp.spawnSync(cmd, args, opts);
        if (spawn.error) {
            const errorMsg = `ERROR: ${spawn.error}\n`;
            //console.log(errorMsg);
            this.consoleOutput.push(errorMsg);
        }
        const stdOutMsg = `${spawn.stdout.toString()}\n`;
        //console.log(stdOutMsg);
        this.consoleOutput.push(stdOutMsg);

        const stdErrMsg = `${spawn.stderr.toString()}\n`;
        //console.log(stdErrMsg);
        this.consoleOutput.push(stdErrMsg);

        const exitCodeMsg = `exit code: ${spawn.status}\n`;
        //console.log(exitCodeMsg);
        this.consoleOutput.push(exitCodeMsg);
    }

    @log()
    public spawn(cmd: string, args: any[], opts: cp.SpawnOptions) {
        this.runner = cp.spawn(cmd, args, opts);

        // Pipe outputs.
        this.runner.stdout!.on('data', (data) => {
            //console.log(`stdout: ${data}`);
            this.consoleOutput.push(`${data}`);
        });

        this.runner.stderr!.on('data', (data) => {
            //console.error(`stderr: ${data}`);
            this.consoleOutput.push(`${data}`);
        });

        this.runner.on('close', (code) => {
            //console.log(`child process exited with code ${code}`);
            this.consoleOutput.push(`child process exited with code ${code}`);
        });
    }
}