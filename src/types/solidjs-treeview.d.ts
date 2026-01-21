declare module "solidjs-treeview-component" {
  import { Component } from "solid-js";

  export interface TreeNode {
    id: string;
    label: string;
    children?: TreeNode[];
    path?: string;
    isFile?: boolean;
  }

  export default const TreeView: Component<{
    nodes: TreeNode[];
    onSelect?: (node: TreeNode) => void;
    defaultExpanded?: string[];
    renderLabel?: (node: TreeNode) => any;
    class?: string;
  }>;
}