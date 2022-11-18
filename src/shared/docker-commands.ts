import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { log, logger } from './logger';
import { Stream } from '@libp2p/interface-connection';

import { pipe } from 'it-pipe';
import map from 'it-map';
import * as lp from 'it-length-prefixed'
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";

export class Docker {
    constructor() { }

    @log()
    public static async buildAndStartDockerContainer(context: vscode.ExtensionContext, folderPath: string, stream: Stream): Promise<void> {
        const shellOpts = { cwd: context.extensionPath };

        // Glob pattern to search for dockerfiles, under the workspace folder
        let dockerFilePattern = new vscode.RelativePattern(folderPath, '**/Dockerfile*');
        const dockerfiles = await vscode.workspace.findFiles(dockerFilePattern, null, 50);

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
        let relative = path.relative(context.extensionUri.path, dockerfileUri.path);

        // Remove /Dockerfile from that path
        const relativeFolderPath = relative.substring(0, relative.indexOf("\\Dockerfile")).toLowerCase().replaceAll('\\', '/');

        // Container name will be folders relative to workspace folder, with '-' instead of '/'. ex: 'milestone3-web'
        const containerName = relativeFolderPath.replaceAll('/', '-');

        // Kill possible container with same name.
        await this.spawnSync("powershell.exe", [`docker rm -f ${containerName}`], shellOpts, stream);

        // Build new image
        await this.spawnSync("powershell.exe", [`docker build -t ${containerName} ${relativeFolderPath}`], shellOpts, stream);

        // Run the image
        //this.spawn("powershell.exe", [`docker run -p "80" --name ${containerName} ${containerName}`], shellOpts, stream);
    }

    @log()
    public static async spawnSync(cmd: string, args: any[], opts: cp.SpawnOptions, stream: Stream) {
        const spawn = cp.spawnSync(cmd, args, opts);
        if (spawn.error) {
            const errorMsg = `ERROR: ${spawn.error}`;
            //console.log(errorMsg);
            this.send(stream, errorMsg);
        }
        const stdOutMsg = `stdout: ${spawn.stdout.toString()}`;
        //console.log(stdOutMsg);
        this.send(stream, stdOutMsg);

        const stdErrMsg = `stderr: ${spawn.stderr.toString()}`;
        //console.log(stdErrMsg);
        this.send(stream, stdErrMsg);

        const exitCodeMsg = `exit code: ${spawn.status}`;
        //console.log(exitCodeMsg);
        this.send(stream, exitCodeMsg);
    }

    @log()
    public static spawn(cmd: string, args: any[], opts: cp.SpawnOptions, stream: Stream) {
        const runner = cp.spawn(cmd, args, opts);

        pipe(
            runner.stdout || '',
            (source) => map(source, (buf) => uint8ArrayFromString(buf.subarray())),
            stream
        );

        // Pipe outputs.
        runner.stdout!.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        runner.stderr!.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        runner.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    }

    private static send(stream: Stream, content: string) {
        pipe(
            [uint8ArrayFromString(content)],
            stream
        );
    }
}