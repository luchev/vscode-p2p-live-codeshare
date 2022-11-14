import * as vscode from "vscode";
import { logger } from "./shared/logger";

// TODO: we might need to change the type annotation if the deserialized messages
// cannot be simply loaded into a new instancee
export async function copyEdit(e: vscode.TextDocumentChangeEvent) {
  // no contentChanges means there is nothing to copy
  if (e.contentChanges.length === 0) {
    return;
  }

  // TODO: file search has to be adapted
  vscode.workspace
    .findFiles(e.document.fileName.replace(/^.*[\\\/]/, ""))
    .then(
      (uris) => {
        // only change one file
        if (uris.length === 1) {
          const wsedit = new vscode.WorkspaceEdit();
          for (let contentChange of e.contentChanges) {
            vscode.workspace.openTextDocument(uris[0]).then(
              (a: vscode.TextDocument) => {
                vscode.window.showTextDocument(a, 1, false).then((e) => {
                  e.edit((edit) => {
                    logger().info("-----", {'x': contentChange.range.start});
                    edit.replace(new vscode.Position(0, 0), contentChange.text);
                    //   edit.replace(contentChange.range.start, contentChange.text);
                  });
                });
              },
              (error: any) => {
                console.error(error);
                debugger;
              }
            );

            // try {
            //   wsedit.insert(uris[0], contentChange.range.start, contentChange.text);
            //   vscode.workspace.applyEdit(wsedit);
            // } catch (err) {
            //   logger().error("-------", err);
            // }
          }
          logger().info(`Applied file edit to ${uris[0]}`);
        } else {
          logger().warn(
            `Could not apply file edits. Number of uris does not equal one: ${uris.length}`
          );
        }
      },
      (err) => {
        logger().error(err);
      }
    )
    .then(undefined, (err) => {
      logger().error("INSIDE");
      logger().error(err);
    });
}
