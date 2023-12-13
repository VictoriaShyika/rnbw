import { useSelector } from "react-redux";

import { AppState } from "./_root";

export const useAppState = () => {
  const {
    global: { osType, theme },
    main: {
      fileTree: {
        workspace,
        project,
        initialFileUidToOpen,
        currentFileUid,
        prevFileUid,
        prevRenderableFileUid,
        fileTree,
        fileTreeViewState: {
          focusedItem: fFocusedItem,
          expandedItems: fExpandedItems,
          expandedItemsObj: fExpandedItemsObj,
          selectedItems: fSelectedItems,
          selectedItemsObj: fSelectedItemsObj,
        },
        hoveredFileUid,
        doingFileAction,
        lastFileAction,
      },
      fileEvent: {
        past: fileEventPast,
        present: { fileAction },
        future: fileEventFuture,
      },
      nodeTree: {
        nodeTree,
        validNodeTree,
        needToSelectNodePaths,
        nodeTreeViewState: {
          focusedItem: nFocusedItem,
          expandedItems: nExpandedItems,
          expandedItemsObj: nExpandedItemsObj,
          selectedItems: nSelectedItems,
          selectedItemsObj: nSelectedItemsObj,
        },
        hoveredNodeUid,
      },
      nodeEvent: {
        past: nodeEventPast,
        present: { currentFileContent, selectedNodeUids },
        future: nodeEventFuture,
      },
      stageView: {
        iframeSrc,
        iframeLoading,
        needToReloadIframe,
        linkToOpen,
        syncConfigs,
      },
      codeView: { codeViewTabSize },
      processor: {
        doingAction,
        navigatorDropdownType,
        favicon,
        activePanel,
        clipboardData,
        showActionsPanel,
        showCodeView,
        autoSave,
        didUndo,
        didRedo,
      },
      cmdk: {
        cmdkOpen,
        cmdkPages,
        currentCmdkPage,
        cmdkSearchContent,
        currentCommand,
      },
    },
  } = useSelector((state: AppState) => state);

  const fileEventPastLength = fileEventPast.length;
  const fileEventFutureLength = fileEventFuture.length;

  const nodeEventPastLength = nodeEventPast.length;
  const nodeEventFutureLength = nodeEventFuture.length;

  return {
    osType,
    theme,

    workspace,
    project,
    initialFileUidToOpen,
    currentFileUid,
    prevFileUid,
    prevRenderableFileUid,
    fileTree,

    fFocusedItem,
    fExpandedItems,
    fExpandedItemsObj,
    fSelectedItems,
    fSelectedItemsObj,
    hoveredFileUid,

    doingFileAction,
    lastFileAction,

    fileAction,
    fileEventPast,
    fileEventPastLength,
    fileEventFuture,
    fileEventFutureLength,

    nodeTree,
    validNodeTree,

    needToSelectNodePaths,

    nFocusedItem,
    nExpandedItems,
    nExpandedItemsObj,
    nSelectedItems,
    nSelectedItemsObj,
    hoveredNodeUid,

    currentFileContent,
    selectedNodeUids,

    nodeEventPast,
    nodeEventPastLength,
    nodeEventFuture,
    nodeEventFutureLength,

    iframeSrc,
    iframeLoading,
    needToReloadIframe,
    linkToOpen,
    syncConfigs,

    codeViewTabSize,

    doingAction,

    navigatorDropdownType,
    favicon,

    activePanel,
    clipboardData,

    showActionsPanel,
    showCodeView,

    autoSave,

    didUndo,
    didRedo,

    cmdkOpen,
    cmdkPages,
    currentCmdkPage,

    cmdkSearchContent,
    currentCommand,
  };
};
