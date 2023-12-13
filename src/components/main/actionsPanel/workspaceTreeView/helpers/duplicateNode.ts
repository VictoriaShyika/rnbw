import { TFileHandlerCollection, TFileNodeData } from "@_node/file";
import { TNodeTreeData, TNodeUid } from "@_node/types";
import { verifyFileHandlerPermission } from "@_services/main";
import { TToast } from "@_types/global";

import { duplicatingWarning, invalidDirError } from "../errors";
import { generateNewNodeName } from "./";
import { moveActions } from "./moveActions";

export const duplicateNode = async (
  uid: TNodeUid,
  isCopy: boolean,
  ffTree: TNodeTreeData,
  fileHandlers: TFileHandlerCollection,
  addMessage: (message: TToast) => void,
  addInvalidNodes: any,
  invalidNodes: { [uid: string]: boolean },
) => {
  const { moveLocalFF } = moveActions(addMessage);

  const node = ffTree[uid];
  if (!node) return;

  const nodeData = node.data as TFileNodeData;
  const parentNode = ffTree[node.parentUid as TNodeUid];
  if (!parentNode) return;

  const parentHandler = fileHandlers[
    parentNode.uid
  ] as FileSystemDirectoryHandle;

  if (!(await verifyFileHandlerPermission(parentHandler))) {
    addMessage(invalidDirError);
    return;
  }

  const newName = await generateNewNodeName(
    parentHandler,
    nodeData.name,
    nodeData.kind === "directory",
    nodeData.ext,
  );

  const newUid = `${node.parentUid}/${newName}`;
  addInvalidNodes({ ...invalidNodes, [uid]: true, [newUid]: true });

  try {
    await moveLocalFF(
      fileHandlers[uid],
      parentHandler,
      parentHandler,
      newName,
      true,
    );
  } catch (err) {
    addMessage(duplicatingWarning);
  }

  delete invalidNodes[uid];
  delete invalidNodes[newUid];
  addInvalidNodes({ ...invalidNodes });

  return { uid, name: newName };
};
