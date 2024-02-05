import { useContext } from "react";

import { DraggingPosition, TreeItem, TreeItemIndex } from "react-complex-tree";

import { getValidNodeUids } from "@_node/helpers";
import { TNodeUid } from "@_node/types";
import { MainContext } from "@_redux/main";
import { useAppState } from "@_redux/useAppState";

import { useNodeActionHandlers } from "./useNodeActionHandlers";
import { useNodeViewState } from "./useNodeViewState";

export const useNodeTreeCallback = (
  isDragging: React.MutableRefObject<boolean>,
) => {
  const { validNodeTree, nExpandedItems: expandedItems } = useAppState();
  const { htmlReferenceData } = useContext(MainContext);

  const { onMove } = useNodeActionHandlers();
  const { cb_focusNode, cb_selectNode, cb_expandNode, cb_collapseNode } =
    useNodeViewState();

  const onSelectItems = (items: TreeItemIndex[]) => {
    cb_selectNode(items as TNodeUid[]);
  };
  const onFocusItem = (item: TreeItem) => {
    cb_focusNode(item.index as TNodeUid);
  };
  const onExpandItem = (item: TreeItem) => {
    cb_expandNode(item.index as TNodeUid);
  };
  const onCollapseItem = (item: TreeItem) => {
    cb_collapseNode(item.index as TNodeUid);
  };

  const onDrop = (
    items: TreeItem[],
    target: DraggingPosition & {
      parentItem?: TreeItemIndex;
      targetItem?: TreeItemIndex;
    },
  ) => {
    const isBetween = target.targetType === "between-items";
    const targetUid = (
      target.targetType === "item" ? target.targetItem : target.parentItem
    ) as TNodeUid;
    const position = isBetween ? target.childIndex : 0;

    const validUids = getValidNodeUids(
      validNodeTree,
      items.map((item) => item.data.uid),
      targetUid,
      "html",
      htmlReferenceData,
    );
    if (validUids.length === 0) return;

    if (target.parentItem === "ROOT") return;

    // const droppedNodes = items;
    // console.log(droppedNodes, "droppedNodes");
    // const newExpandedItemPath: string[] = [];

    // nExpandedItems.map((expandedUid: string, index) => {
    //   const expandedNode = validNodeTree[expandedUid];
    //   const targetNode = validNodeTree[targetUid];

    //   if (expandedNode.parentUid === targetUid) {
    //     const expandedNodeParent = validNodeTree[expandedNode.parentUid];
    //     const childIndex = expandedNodeParent.children.indexOf(expandedUid);
    //     const newNodeChildIndex =
    //       position <= childIndex ? childIndex + 1 : childIndex;
    //     const newExpandedNodePath = `${expandedNodeParent.data.path}${NodePathSplitter}${expandedNode.data.tagName}-${newNodeChildIndex}`;
    //     newExpandedItemPath.push(newExpandedNodePath);
    //   }

    //   const newExpandedItem = droppedNodes.map((droppedNode) => {
    //     if (droppedNode.data.parentUid === expandedNode.parentUid) {
    //       const expandedNodeParent = validNodeTree[expandedNode.parentUid!];
    //       const expandedChildIndex =
    //         expandedNodeParent.children.indexOf(expandedUid);
    //       const droppedChildIndex = expandedNodeParent.children.indexOf(
    //         droppedNode.data.uid,
    //       );

    //       const newNodeChildIndex =
    //         droppedChildIndex < expandedChildIndex
    //           ? expandedChildIndex - 1
    //           : expandedChildIndex;
    //       const newExpandedNodePath = `${expandedNodeParent.data.path}${NodePathSplitter}${expandedNode.data.tagName}-${newNodeChildIndex}`;
    //       newExpandedItemPath.push(newExpandedNodePath);
    //     }
    //   });

    // });

    // console.log(newExpandedItemPath, "newExpandedItem");

    // const needToExpandUids = getNodeUidsFromPaths(
    //   validNodeTree,
    //   newExpandedItemPath,
    // );
    // dispatch(
    //   setExpandedNodeTreeNodes([...needToExpandUids, ...nExpandedItems]),
    // );

    onMove({
      selectedUids: validUids,
      targetUid: targetUid as TNodeUid,
      isBetween,
      position,
      expandedItems,
    });

    // const needToSelectNodePaths = (() => {
    //   const needToSelectNodePaths: string[] = [];
    //   //  const validNodeTree = getValidNodeTree(nodeTree);
    //   const targetNode = validNodeTree[targetUid];

    //   let directChildCount = 0;
    //   //  selectedUids.map((uid) => {
    //   //    const node = validNodeTree[uid];
    //   //    if (node.parentUid === targetUid) {
    //   //      const nodeChildeIndex = getNodeChildIndex(targetNode, node);
    //   //      isBetween
    //   //        ? nodeChildeIndex < position
    //   //          ? directChildCount++
    //   //          : null
    //   //        : 0;
    //   //    }
    //   //  });

    // dispatch(setNeedToSelectNodePaths(needToSelectNodePaths));

    isDragging.current = false;
  };

  return {
    onSelectItems,
    onFocusItem,
    onExpandItem,
    onCollapseItem,
    onDrop,
  };
};
