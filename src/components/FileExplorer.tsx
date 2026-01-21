import { createSignal, For, Show } from "solid-js";

type FileNode = {
  id: string;
  label: string;
  children?: FileNode[];
  path?: string;
  isFile?: boolean;
};

export default function FileExplorer() {
  const [selectedPath, setSelectedPath] = createSignal<string | null>(null);
  const [expanded, setExpanded] = createSignal(new Set<string>());

  const fileTree: FileNode[] = [
    {
      id: "demo-folder",
      label: "Demo",
      children: [
        {
          id: "main-py",
          label: "main.py",
          path: "/Demo/main.py",
          isFile: true,
        },
      ],
    },
  ];

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClick = (node: FileNode) => {
    if (node.children) {
      toggle(node.id);
    }
    if (node.isFile && node.path) {
      setSelectedPath(node.path);
      console.log("Selected file:", node.path);
    }
  };

  const renderNode = (node: FileNode, level = 0) => (
    <>
      <div
        class="flex items-center gap-1.5 py-0.5 px-2 hover:bg-gray-800 rounded cursor-pointer select-none"
        style={{ "padding-left": `${level * 1.25}rem` }}
        onClick={() => handleClick(node)}
      >
        {node.children ? (
          expanded().has(node.id) ? "▼" : "▶"
        ) : (
          <span class="w-4 inline-block" />
        )}
        <span class={node.isFile ? "text-blue-400" : "text-yellow-400 font-medium"}>
          {node.label}
        </span>
      </div>

      <Show when={node.children && expanded().has(node.id)}>
        <For each={node.children}>
          {child => renderNode(child, level + 1)}
        </For>
      </Show>
    </>
  );

  return (
    <div class="h-full overflow-auto bg-[#1e1e1e] text-gray-300 text-sm">
      <div class="p-2 font-semibold uppercase tracking-wide text-xs text-gray-500 border-b border-gray-800">
        EXPLORER
      </div>
      <div class="p-1">
        <For each={fileTree}>{node => renderNode(node)}</For>
      </div>
    </div>
  );
}