import AdmZip from "adm-zip";
import { SyncWorkspaceResponseEvent } from "../../events/workspace";
import { WorkspaceEvent } from "../../events/workspace/event";
import { setWorkspaceSynced } from "../../state/peer";
import {getWorkspaceRoot} from "../../workspace-path";

export async function handleSyncWorkspaceResponse(message: WorkspaceEvent) {
  setWorkspaceSynced(true);
  const data = (message as SyncWorkspaceResponseEvent).data;
  
  let zip2 = new AdmZip(Buffer.from(data, 'base64'));
  zip2.extractAllTo(getWorkspaceRoot(), true);
}
