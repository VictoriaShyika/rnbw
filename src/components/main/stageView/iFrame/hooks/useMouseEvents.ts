import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { StageNodeIdAttr } from "@_node/file";
import { getValidNodeUids } from "@_node/helpers";
import { TNodeTreeData, TNodeUid } from "@_node/types";
import { setHoveredNodeUid } from "@_redux/main/nodeTree";
import { setSelectedNodeUids } from "@_redux/main/nodeTree/event";
import { getValidElementWithUid, selectAllText } from "../helpers";
import { THtmlNodeData } from "@_node/node";
import { setActivePanel } from "@_redux/main/processor";

interface IUseMouseEventsProps {
  contentRef: HTMLIFrameElement | null;
  nodeTreeRef: React.MutableRefObject<TNodeTreeData>;
  focusedItemRef: React.MutableRefObject<TNodeUid>;
  selectedItemsRef: React.MutableRefObject<TNodeUid[]>;
  contentEditableUidRef: React.MutableRefObject<TNodeUid>;
  isEditingRef: React.MutableRefObject<boolean>;
  linkTagUidRef: React.MutableRefObject<TNodeUid>;
}

export const useMouseEvents = ({
  contentRef,
  nodeTreeRef,
  focusedItemRef,
  selectedItemsRef,
  contentEditableUidRef,
  isEditingRef,
  linkTagUidRef,
}: IUseMouseEventsProps) => {
  const dispatch = useDispatch();

  // hoveredNodeUid
  const onMouseEnter = useCallback((e: MouseEvent) => {}, []);
  const onMouseMove = useCallback((e: MouseEvent) => {
    const { uid } = getValidElementWithUid(e.target as HTMLElement);
    uid && dispatch(setHoveredNodeUid(uid));
  }, []);
  const onMouseLeave = (e: MouseEvent) => {
    dispatch(setHoveredNodeUid(""));
  };

  // click, dblclick handlers
  const onClick = useCallback(
    (e: MouseEvent) => {
      dispatch(setActivePanel("stage"));

      const { uid, element } = getValidElementWithUid(e.target as HTMLElement);
      if (uid) {
        // update selectedNodeUids
        (() => {
          const uids = e.shiftKey
            ? getValidNodeUids(
                nodeTreeRef.current,
                Array(...new Set([...selectedItemsRef.current, uid])),
              )
            : [uid];

          // check if it's a new state
          let same = false;
          if (selectedItemsRef.current.length === uids.length) {
            same = true;
            for (
              let index = 0, len = selectedItemsRef.current.length;
              index < len;
              ++index
            ) {
              if (selectedItemsRef.current[index] !== uids[index]) {
                same = false;
                break;
              }
            }
          }

          !same && dispatch(setSelectedNodeUids(uids));
        })();

        // content-editable operation
        if (
          contentEditableUidRef.current &&
          contentEditableUidRef.current !== uid &&
          contentRef
        ) {
          const contentEditableElement =
            contentRef.contentWindow?.document.querySelector(
              `[${StageNodeIdAttr}="${contentEditableUidRef.current}"]`,
            );
          if (contentEditableElement) {
            contentEditableElement.setAttribute("contenteditable", "false");
            contentEditableUidRef.current = "";

            const node = nodeTreeRef.current[uid];
            console.log(
              "content-edited node",
              node,
              contentEditableElement.innerHTML,
            );
          }
        }
      }
    },
    [contentRef],
  );
  const onDblClick = useCallback((e: MouseEvent) => {
    const ele = e.target as HTMLElement;
    const uid: TNodeUid | null = ele.getAttribute(StageNodeIdAttr);

    if (!uid) {
      // when dbl-click on a web component
      /* const { uid: validUid, element: validElement } = getValidElementWithUid(
        e.target as HTMLElement,
      ); */
      isEditingRef.current = false;
    } else {
      const node = nodeTreeRef.current[uid];
      const nodeData = node.data as THtmlNodeData;
      if (["html", "head", "body", "img", "div"].includes(nodeData.name))
        return;

      isEditingRef.current = true;
      contentEditableUidRef.current = uid;
      ele.setAttribute("contenteditable", "true");
      ele.focus();
      selectAllText(contentRef, ele);
    }
  }, []);

  return {
    onMouseLeave,
    onMouseMove,
    onMouseEnter,
    onClick,
    onDblClick,
  };
};
