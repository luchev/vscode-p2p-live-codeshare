import path from "path";
import {workspace} from "vscode";
import {logger} from "./logger";

export function getWorkspaceRelativePath(filePath: string) {
  const workspaceDir = workspace.workspaceFolders?.[0].uri.fsPath;
  if (workspaceDir === undefined) {
    logger().info("No active workspace. Please open a workspace first");
    throw new Error("no active workspace");
  }

  return path
    .resolve(filePath.replace(workspaceDir, ""))
    .split(path.sep)
    .filter((x) => x !== "");
}

export function getWorkspaceRoot() {
  return workspace.workspaceFolders?.[0].uri.fsPath!;
}
