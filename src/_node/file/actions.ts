import { LogAllow } from "@_constants/global";

import {
  TFileApiPayload,
  TFileHandlerCollection,
  TFileNodeTreeData,
  TNodeUid,
} from "../";
import { TProjectContext } from "@_redux/main/fileTree";
import { FileSystemApis } from "./FileSystemApis";

const create = () => {};
const remove = async ({
  projectContext,
  uids,
  fileTree,
  fileHandlers,
}: {
  projectContext: TProjectContext;
  uids: TNodeUid[];
  fileTree: TFileNodeTreeData;
  fileHandlers?: TFileHandlerCollection;
}): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    try {
      let allDone = true;
      uids.map((uid) => {
        const done = FileSystemApis[projectContext].removeSingleDirectoryOrFile(
          {
            uid,
            fileTree,
            fileHandlers: fileHandlers || {},
          },
        );
        if (!done) allDone = false;
      });
      resolve(allDone);
    } catch (err) {
      reject(err);
    }
  });
};
const cut = () => {};
const copy = () => {};
const duplicate = () => {};
const move = () => {};
const rename = () => {};

export const doFileActions = async (
  params: TFileApiPayload,
  fb?: (...params: any[]) => void,
  cb?: (...params: any[]) => void,
) => {
  try {
    const {
      projectContext,
      action,
      uids,
      fileTree,
      fileHandlers,
      osType = "Windows",
    } = params;

    let allDone = true;
    switch (action) {
      case "create":
        create();
        break;
      case "remove":
        allDone = await remove({
          projectContext,
          uids,
          fileTree,
          fileHandlers,
        });
        break;
      case "cut":
        cut();
        break;
      case "copy":
        copy();
        break;
      case "duplicate":
        duplicate();
        break;
      case "move":
        move();
        break;
      case "rename":
        rename();
        break;
      default:
        break;
    }

    cb && cb(allDone);
  } catch (err) {
    LogAllow && console.error(err);
    fb && fb();
  }
};
