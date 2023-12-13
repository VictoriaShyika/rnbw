import React, { useEffect } from "react";

import cx from "classnames";
import { Command } from "cmdk";
import { useDispatch } from "react-redux";

import { SVGIcon } from "@_components/common";
import { ActionsPanel, CodeView, StageView } from "@_components/main";
import { LogAllow } from "@_constants/global";
import { AddActionPrefix, RenameActionPrefix } from "@_constants/main";
import {
  confirmFileChanges,
  isUnsavedProject,
  TFileNodeData,
} from "@_node/file";
import { MainContext } from "@_redux/main";
import {
  setCmdkOpen,
  setCmdkPages,
  setCmdkSearchContent,
  setCurrentCommand,
} from "@_redux/main/cmdk";
import { setFileAction } from "@_redux/main/fileTree";
import { useAppState } from "@_redux/useAppState";
import { TCmdkContext, TCmdkKeyMap, TCmdkReference } from "@_types/main";

import { getCommandKey } from "../../services/global";
import {
  useCmdk,
  useCmdkModal,
  useCmdkReferenceData,
  useFileHandlers,
  useHandlers,
  useInit,
  usePanels,
  useRecentProjects,
  useReferenceData,
  useReferneces,
  useRunningActions,
} from "./hooks";
import Processor from "./processor";

export default function MainPage() {
  // redux
  const dispatch = useDispatch();
  const {
    osType,
    theme,

    currentFileUid,
    fileTree,

    fileAction,
    fileEventFutureLength,

    activePanel,

    showActionsPanel,

    autoSave,
    cmdkOpen,
    cmdkPages,
    currentCmdkPage,

    cmdkSearchContent,
  } = useAppState();

  // custom hooks
  const { addRunningActions, removeRunningActions } = useRunningActions();
  const {
    projectHandlers,
    setProjectHandlers,
    currentProjectFileHandle,
    setCurrentProjectFileHandle,
    fileHandlers,
    setFileHandlers,
  } = useFileHandlers();
  const {
    recentProjectContexts,
    recentProjectNames,
    recentProjectHandlers,
    setRecentProjectContexts,
    setRecentProjectNames,
    setRecentProjectHandlers,
  } = useRecentProjects();
  const { filesReferenceData, htmlReferenceData } = useReferenceData();
  const {
    cmdkReferenceData,
    cmdkReferenceJumpstart,
    cmdkReferenceActions,
    cmdkReferneceRecentProject,
    cmdkReferenceAdd,
    cmdkReferenceRename,
  } = useCmdkReferenceData({
    addRunningActions,
    removeRunningActions,

    recentProjectContexts,
    recentProjectNames,
    recentProjectHandlers,
    setRecentProjectContexts,
    setRecentProjectNames,
    setRecentProjectHandlers,

    htmlReferenceData,
  });
  const { importProject, closeNavigator } = useHandlers({
    setCurrentProjectFileHandle,
    setFileHandlers,

    recentProjectContexts,
    recentProjectNames,
    recentProjectHandlers,
    setRecentProjectContexts,
    setRecentProjectNames,
    setRecentProjectHandlers,
  });
  const { onJumpstart, onNew, onClear, onUndo, onRedo } = useCmdk({
    cmdkReferenceData,
    importProject,
  });
  useInit({ importProject, onNew });
  const {
    monacoEditorRef,
    setMonacoEditorRef,
    iframeRefRef,
    setIframeRefRef,
    isContentProgrammaticallyChanged,
    setIsContentProgrammaticallyChanged,
  } = useReferneces();
  const { validMenuItemCount, hoveredMenuItemDescription } = useCmdkModal();
  const {
    actionsPanelOffsetTop,
    actionsPanelOffsetLeft,
    actionsPanelWidth,
    codeViewOffsetTop,
    codeViewOffsetBottom,
    codeViewOffsetLeft,
    codeViewHeight,
    codeViewDragging,
    dragCodeView,
    dragEndCodeView,
    dropCodeView,
  } = usePanels();

  // file event hms
  useEffect(() => {
    // reset fileAction in the new history
    fileEventFutureLength === 0 &&
      fileAction.type !== null &&
      dispatch(setFileAction({ type: null }));
  }, [fileEventFutureLength]);

  // web-tab close event handler
  useEffect(() => {
    window.onbeforeunload = isUnsavedProject(fileTree) ? () => "changed" : null;
    return () => {
      window.onbeforeunload = null;
    };
  }, [fileTree]);

  // open Jumpstart menu on startup
  useEffect(() => {
    Object.keys(cmdkReferenceJumpstart).length !== 0 && onJumpstart();
  }, [cmdkReferenceJumpstart]);

  return (
    <>
      <MainContext.Provider
        value={{
          addRunningActions,
          removeRunningActions,

          filesReferenceData,
          htmlReferenceData,
          cmdkReferenceData,

          projectHandlers,
          setProjectHandlers,
          currentProjectFileHandle,
          setCurrentProjectFileHandle,
          fileHandlers,
          setFileHandlers,

          monacoEditorRef,
          setMonacoEditorRef,
          iframeRefRef,
          setIframeRefRef,
          isContentProgrammaticallyChanged,
          setIsContentProgrammaticallyChanged,

          importProject,
          onUndo,
          onRedo,
        }}
      >
        <Processor></Processor>
        <div
          id="MainPage"
          className={"view background-primary"}
          style={{ display: "relative" }}
          onClick={closeNavigator}
        >
          <StageView />
          <ActionsPanel
            top={actionsPanelOffsetTop}
            left={actionsPanelOffsetLeft}
            width={`${actionsPanelWidth}px`}
            height={`calc(100vh - ${actionsPanelOffsetTop * 2}px)`}
          />
          <CodeView
            offsetTop={`${codeViewOffsetTop}`}
            offsetBottom={codeViewOffsetBottom}
            offsetLeft={
              showActionsPanel
                ? actionsPanelOffsetLeft * 2 + actionsPanelWidth
                : codeViewOffsetLeft
            }
            width={`calc(100vw - ${
              (showActionsPanel
                ? actionsPanelWidth + actionsPanelOffsetLeft * 2
                : codeViewOffsetLeft) + codeViewOffsetLeft
            }px)`}
            height={`${codeViewHeight}vh`}
            dropCodeView={dropCodeView}
            dragCodeView={dragCodeView}
            dragEndCodeView={dragEndCodeView}
            codeViewDragging={codeViewDragging}
          />
        </div>

        <Command.Dialog
          open={cmdkOpen}
          className="background-primary radius-s shadow border"
          onOpenChange={(open: boolean) => dispatch(setCmdkOpen(open))}
          onKeyDown={(e: React.KeyboardEvent) => {
            const cmdk: TCmdkKeyMap = {
              cmd: getCommandKey(e as unknown as KeyboardEvent, osType),
              shift: e.shiftKey,
              alt: e.altKey,
              key: e.code,
              click: false,
            };
            if (cmdk.shift && cmdk.cmd && cmdk.key === "KeyR") {
              onClear();
            }
            if (
              e.code === "Escape" ||
              (e.code === "Backspace" && !cmdkSearchContent)
            ) {
              if (e.code === "Escape" && cmdkPages.length === 1) {
                dispatch(setCmdkPages([]));
                dispatch(setCmdkOpen(false));
              } else {
                cmdkPages.length !== 1 &&
                  dispatch(setCmdkPages(cmdkPages.slice(0, -1)));
              }
            }
            e.stopPropagation();
          }}
          filter={(value: string, search: string) => {
            return value.includes(search) !== false ? 1 : 0;
          }}
          loop={true}
          label={currentCmdkPage}
        >
          {/* search input */}
          <div
            className={cx(
              "gap-m box-l padding-m justify-start",
              validMenuItemCount === 0 ? "" : "border-bottom",
            )}
          >
            <Command.Input
              value={cmdkSearchContent}
              onValueChange={(str: string) =>
                dispatch(setCmdkSearchContent(str))
              }
              className="justify-start padding-s gap-s text-l background-primary"
              placeholder={
                currentCmdkPage === "Jumpstart"
                  ? "Jumpstart..."
                  : currentCmdkPage === "Actions"
                  ? "Do something..."
                  : currentCmdkPage === "Add"
                  ? "Add something..."
                  : currentCmdkPage === "Turn into"
                  ? "Turn into..."
                  : ""
              }
            />
          </div>

          {/* modal content */}
          <div
            className={
              currentCmdkPage !== "Add" &&
              currentCmdkPage !== "Jumpstart" &&
              currentCmdkPage !== "Turn into"
                ? ""
                : "box-l direction-column align-stretch box"
            }
            style={{
              ...(currentCmdkPage !== "Add" &&
              currentCmdkPage !== "Jumpstart" &&
              currentCmdkPage !== "Turn into"
                ? { width: "100%" }
                : {}),
              ...(validMenuItemCount === 0
                ? { height: "0px", overflow: "hidden" }
                : {}),
            }}
          >
            {/* menu list - left panel */}
            <div className="padding-m box">
              <div className="direction-row align-stretch">
                <Command.List
                  style={{
                    maxHeight: "600px",
                    overflow: "auto",
                    width: "100%",
                  }}
                >
                  {/* <Command.Loading>Fetching commands reference data...</Command.Loading> */}

                  {/* <Command.Empty>No results found for "{cmdkSearch}".</Command.Empty> */}

                  {Object.keys(
                    currentCmdkPage === "Jumpstart"
                      ? cmdkReferenceJumpstart
                      : currentCmdkPage === "Actions"
                      ? cmdkReferenceActions
                      : currentCmdkPage === "Add"
                      ? cmdkReferenceAdd
                      : currentCmdkPage === "Turn into"
                      ? cmdkReferenceRename
                      : {},
                  ).map((groupName: string) => {
                    let groupNameShow = false;
                    (currentCmdkPage === "Jumpstart"
                      ? groupName !== "Recent"
                        ? cmdkReferenceJumpstart[groupName]
                        : cmdkReferneceRecentProject
                      : currentCmdkPage === "Actions"
                      ? cmdkReferenceActions[groupName]
                      : currentCmdkPage === "Add"
                      ? cmdkReferenceAdd[groupName]
                      : []
                    ).map((command: TCmdkReference) => {
                      const context = command.Context as TCmdkContext;
                      groupNameShow =
                        currentCmdkPage === "Jumpstart" ||
                        (currentCmdkPage === "Actions" &&
                          (command.Name === "Add" ||
                            context.all === true ||
                            (activePanel === "file" &&
                              (context["file"] === true || false)) ||
                            ((activePanel === "node" ||
                              activePanel === "stage") &&
                              ((fileTree[currentFileUid] &&
                                (fileTree[currentFileUid].data as TFileNodeData)
                                  .ext === "html" &&
                                context["html"] === true) ||
                                false)))) ||
                        currentCmdkPage === "Add";
                    });

                    return (
                      <Command.Group
                        key={groupName}
                        // heading={groupName}
                        value={groupName}
                      >
                        {/* group heading label */}
                        {groupNameShow ? (
                          <div className="padding-m gap-s">
                            <span className="text-s opacity-m">
                              {groupName}
                            </span>
                          </div>
                        ) : (
                          <></>
                        )}
                        {(currentCmdkPage === "Jumpstart"
                          ? groupName !== "Recent"
                            ? cmdkReferenceJumpstart[groupName]
                            : cmdkReferneceRecentProject
                          : currentCmdkPage === "Actions"
                          ? cmdkReferenceActions[groupName]
                          : currentCmdkPage === "Add"
                          ? cmdkReferenceAdd[groupName]
                          : currentCmdkPage === "Turn into"
                          ? cmdkReferenceRename[groupName]
                          : []
                        )?.map((command: TCmdkReference, index) => {
                          const context: TCmdkContext =
                            command.Context as TCmdkContext;
                          const show =
                            currentCmdkPage === "Jumpstart" ||
                            (currentCmdkPage === "Actions" &&
                              (command.Name === "Add" ||
                                command.Name === "Turn into" ||
                                context.all === true ||
                                (activePanel === "file" &&
                                  (context["file"] === true || false)) ||
                                ((activePanel === "node" ||
                                  activePanel === "stage") &&
                                  ((fileTree[currentFileUid] &&
                                    (
                                      fileTree[currentFileUid]
                                        .data as TFileNodeData
                                    ).ext === "html" &&
                                    context["html"] === true) ||
                                    false)))) ||
                            currentCmdkPage === "Add" ||
                            currentCmdkPage === "Turn into";
                          return show ? (
                            <Command.Item
                              key={`${command.Name}-${command.Context}-${index}`}
                              value={command.Name + index}
                              className="rnbw-cmdk-menu-item"
                              {...{
                                "rnbw-cmdk-menu-item-description":
                                  command.Description,
                              }}
                              onSelect={() => {
                                LogAllow && console.log("onSelect", command);

                                // keep modal open when toogling theme or go "Add" menu from "Actions" menu
                                command.Name !== "Theme" &&
                                  command.Name !== "Autosave" &&
                                  command.Name !== "Add" &&
                                  command.Name !== "Turn into" &&
                                  dispatch(setCmdkOpen(false));

                                if (command.Name === "Guide") {
                                  dispatch(
                                    setCurrentCommand({ action: "Guide" }),
                                  );
                                } else if (command.Group === "Add") {
                                  dispatch(
                                    setCurrentCommand({
                                      action: `${AddActionPrefix}-${command.Context}`,
                                    }),
                                  );
                                } else if (command.Group === "Turn into") {
                                  dispatch(
                                    setCurrentCommand({
                                      action: `${RenameActionPrefix}-${command.Context}`,
                                    }),
                                  );
                                } else if (
                                  currentCmdkPage === "Jumpstart" &&
                                  command.Group === "Recent"
                                ) {
                                  const index = Number(command.Context);
                                  const projectContext =
                                    recentProjectContexts[index];
                                  const projectHandler =
                                    recentProjectHandlers[index];

                                  confirmFileChanges(fileTree) &&
                                    importProject(
                                      projectContext,
                                      projectHandler,
                                    );
                                } else if (
                                  (currentCmdkPage === "Add" &&
                                    command.Group === "Recent") ||
                                  (currentCmdkPage === "Turn into" &&
                                    command.Group === "Recent")
                                ) {
                                } else {
                                  dispatch(
                                    setCurrentCommand({ action: command.Name }),
                                  );
                                }
                              }}
                            >
                              <div className="justify-stretch padding-s align-center">
                                <div className="gap-s align-center">
                                  {currentCmdkPage === "Jumpstart" &&
                                  command.Name === "Theme" ? (
                                    <>
                                      {/* detect Theme Group and render check boxes */}
                                      <div className="padding-xs">
                                        <div className="radius-m icon-xs align-center background-tertiary"></div>
                                      </div>
                                      <div className="gap-s align-center">
                                        <span className="text-m opacity-m">
                                          Theme
                                        </span>
                                        <span className="text-s opacity-m">
                                          /
                                        </span>
                                        <span className="text-m">{theme}</span>
                                      </div>
                                    </>
                                  ) : command.Name === "Autosave" ? (
                                    <>
                                      {/* detect Autosave */}
                                      <div className="padding-xs">
                                        <div className="radius-m icon-xs align-center background-tertiary"></div>
                                      </div>
                                      <div className="gap-s align-center">
                                        <span className="text-m opacity-m">
                                          Autosave
                                        </span>
                                        <span className="text-s opacity-m">
                                          /
                                        </span>
                                        <span className="text-m">
                                          {autoSave ? "On" : "Off"}
                                        </span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="padding-xs">
                                        {typeof command.Icon === "string" &&
                                        command["Icon"] !== "" ? (
                                          <SVGIcon {...{ class: "icon-xs" }}>
                                            {command["Icon"]}
                                          </SVGIcon>
                                        ) : (
                                          <div className="icon-xs"></div>
                                        )}
                                      </div>
                                      <span className="text-m">
                                        {command["Name"]}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="gap-s">
                                  {command["Keyboard Shortcut"] &&
                                    (
                                      command[
                                        "Keyboard Shortcut"
                                      ] as TCmdkKeyMap[]
                                    )?.map((keyMap, index) => (
                                      <div className="gap-s" key={index}>
                                        {keyMap.cmd && (
                                          <span className="text-m">⌘</span>
                                        )}
                                        {keyMap.shift && (
                                          <span className="text-m">⇧</span>
                                        )}
                                        {keyMap.alt && (
                                          <span className="text-m">Alt</span>
                                        )}
                                        {keyMap.key !== "" && (
                                          <span className="text-m">
                                            {keyMap.key[0].toUpperCase() +
                                              keyMap.key.slice(1) +
                                              (index !==
                                              (
                                                command[
                                                  "Keyboard Shortcut"
                                                ] as TCmdkKeyMap[]
                                              ).length -
                                                1
                                                ? ","
                                                : "")}
                                          </span>
                                        )}
                                        {keyMap.click && (
                                          <span className="text-m">Click</span>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </Command.Item>
                          ) : null;
                        })}
                      </Command.Group>
                    );
                  })}
                </Command.List>
              </div>
            </div>

            {/* description - right panel */}
            {(currentCmdkPage === "Add" || currentCmdkPage === "Jumpstart") &&
              false && (
                <div
                  className={cx(
                    "box align-center border-left padding-l text-l",
                    !!hoveredMenuItemDescription ? "" : "opacity-m",
                  )}
                >
                  {!!hoveredMenuItemDescription
                    ? hoveredMenuItemDescription
                    : "Description"}
                </div>
              )}
          </div>
        </Command.Dialog>
      </MainContext.Provider>
    </>
  );
}
