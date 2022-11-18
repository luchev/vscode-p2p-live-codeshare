import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { log, logger } from './logger';
import { Stream } from '@libp2p/interface-connection';

import { pipe } from 'it-pipe';
import map from 'it-map';
import * as lp from 'it-length-prefixed';
import { pushable, Pushable } from 'it-pushable'
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";

export class Docker {
    private static push: Pushable<string>;
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
        this.push = pushable<string>({objectMode: true});

        pipe(
            this.push,
            (source) => {
                return (async function* () {
                  for await (const msg of source) {yield uint8ArrayFromString(msg)};
                })();
              },
            stream
        );
        // Kill possible container with same name.
        this.spawnSync("powershell.exe", [`docker rm -f ${containerName}`], shellOpts);

        // Build new image
        this.spawnSync("powershell.exe", [`docker build -t ${containerName} ${relativeFolderPath}`], shellOpts);

        // Run the image
        //this.spawn("powershell.exe", [`docker run -p "80" --name ${containerName} ${containerName}`], shellOpts, stream);
    }

    @log()
    public static spawnSync(cmd: string, args: any[], opts: cp.SpawnOptions) {
        const spawn = cp.spawnSync(cmd, args, opts);
        if (spawn.error) {
            const errorMsg = `ERROR: ${spawn.error}\n`;
            //console.log(errorMsg);
            this.push.push(errorMsg);
        }
        const stdOutMsg = `stdout: ${spawn.stdout.toString()}\n`;
        //console.log(stdOutMsg);
        this.push.push(stdOutMsg);

        const stdErrMsg = `stderr: ${spawn.stderr.toString()}\n`;
        //console.log(stdErrMsg);
        this.push.push(stdErrMsg);

        const exitCodeMsg = `exit code: ${spawn.status}\n`;
        //console.log(exitCodeMsg);
        this.push.push(exitCodeMsg);
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