import { TNodeTreeData, TNodeUid } from "@_node/types";

import { TTreeViewState } from "../types";
import { TCodeSelection } from "@_components/main/codeView";

export type TNodeTreeReducerState = {
  nodeTree: TNodeTreeData;
  validNodeTree: TNodeTreeData;

  needToSelectNodePaths: string[] | null;
  needToSelectCode: TCodeSelection | null;
  needToExpandNodePaths: string[] | null;

  nodeTreeViewState: TTreeViewState;
  hoveredNodeUid: TNodeUid;
};
