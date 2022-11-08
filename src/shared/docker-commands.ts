import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import { log, logger } from './logger';

export class Docker {
    constructor() {}

    @log()
    public static async buildAndStartDockerContainer(context: vscode.ExtensionContext, folderPath: string): Promise<void> {
        const shellOpts = { cwd: context.extensionPath };
			
        // Glob pattern to search for dockerfiles, under the workspace folder
        let dockerFilePattern = new vscode.RelativePattern(folderPath, '**/Dockerfile*');
        const dockerfiles = await vscode.workspace.findFiles(dockerFilePattern, null, 50);
    
        if(dockerfiles.length === 0) {
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
        this.spawnSync("powershell.exe", [`docker rm -f ${containerName}`], shellOpts);
        
        // Build new image
        this.spawnSync("powershell.exe", [`docker build -t ${containerName} ${relativeFolderPath}`], shellOpts);
        
        // Run the image
        this.spawn("powershell.exe", [`docker run -p "80" --name ${containerName} ${containerName}`], shellOpts);
    }

    @log()
    public static spawnSync(cmd: string, args: any[], opts: cp.SpawnOptions) {
        const spawn = cp.spawnSync(cmd, args, opts);
        if(spawn.error) {
            console.log("ERROR: ", spawn.error);
        }
        console.log("stdout: ", spawn.stdout.toString());
        console.log("stderr: ", spawn.stderr.toString());
        console.log("exit code: ", spawn.status);
    }

    @log()
    public static spawn(cmd: string, args: any[], opts: cp.SpawnOptions) {
        const runner = cp.spawn(cmd, args, opts);
    
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
}