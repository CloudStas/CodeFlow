import { createSignal, Show, createEffect } from "solid-js";
import { lazy } from "solid-js";
import { Suspense } from "solid-js";

type NodeData = {
  id: string;
  label: string;
  type: string;
  fullLabel?: string;
  details?: string;
  count?: number;
};
import { NoHydration } from "solid-js/web";
import FileExplorer from "~/components/FileExplorer";
const DemoChart = lazy(() => import("~/components/DemoChart"));
const ShikiEditor = lazy(() => import("~/components/Editor"));

export default function Demo() {

  const layouts = {
    vertical:   { name: 'dagre', rankDir: 'TB', nodeSep: 50, rankSep: 90 },
    horizontal: { name: 'dagre', rankDir: 'LR', nodeSep: 60, rankSep: 100 },
    compact:    { name: 'dagre', rankDir: 'TB', nodeSep: 30, rankSep: 60, spacingFactor: 0.9 },
    fcose:      { name: 'fcose', quality: 'proof', animate: false }
  };

  type Graph = {
    elements: any[];
    style: any[];
    layout: any;
    run: () => void;
  };

  const [graphData, setGraphData] = createSignal<Graph>({
    elements: [],
    style: [],
    layout: {},
    run: () => {}
  });

  const [leftWidth, setLeftWidth] = createSignal(400);
 
  const defaultCode = `# Sample Python Code
x = 10
y = 20
z = x + y

if z > 25:
    print("Greater than 25")
else:
    print("Less than or equal to 25")

for i in range(5):
    print(i)`;
  const [code, setCode] = createSignal(defaultCode);

  const groupConsecutiveStatements = (lines: string[], startIndex: number, groupType: string) => {
    const grouped: string[] = [];
    let i = startIndex;
    while (i < lines.length) {
      const trimmed = lines[i].trim();
      if (!trimmed || trimmed.startsWith('#')) {
        i++;
        continue;
      }
      
      let lineType = "statement";
      if (trimmed.startsWith("if ") || trimmed.startsWith("for ") || trimmed.startsWith("while ")) {
        lineType = "control";
      } else if (trimmed.startsWith("return ")) {
        lineType = "return";
      } else if (trimmed.includes("=")) {
        lineType = "variable";
      }
      
      if (lineType === groupType) {
        grouped.push(trimmed);
        i++;
      } else {
        break;
      }
    }
    return { grouped, nextIndex: i };
  };

  function parseCodeToFlowchart(pythonCode: string) {
    const elements: any[] = [];
    const lines = pythonCode.split('\n');

    elements.push({ data: { id: 'start', label: 'Start', type: 'start' } });

    let prevId = 'start';
    let i = 0;
    let currentIndent = 0;
    const stack: string[] = [];

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        i++;
        continue;
      }

      const indent = line.length - line.trimStart().length;
      const isDedent = indent < currentIndent;

      while (isDedent && stack.length > 0) {
        const parentId = stack.pop()!;
        currentIndent = indent;
      }

      let id = `n_${i}`;
      let type = 'statement';
      let label = trimmed.substring(0, 60) + (trimmed.length > 60 ? '...' : '');

      if (trimmed.startsWith('if ') || trimmed.startsWith('elif ')) {
        type = 'decision';
        elements.push({ data: { id, label, type, fullLabel: trimmed } });
        elements.push({ data: { source: prevId, target: id } });

        stack.push(id);
        prevId = id;
        currentIndent = indent;
        i++;
        continue;
      }

      if (trimmed.startsWith('else:')) {
        type = 'decision';
        label = 'else';
        const parentDecision = stack[stack.length - 1];
        elements.push({ data: { id, label, type: 'else', fullLabel: trimmed } });
        elements.push({ data: { source: parentDecision, target: id, label: 'no' } });
        prevId = id;
        i++;
        continue;
      }

      if (trimmed.startsWith('for ') || trimmed.startsWith('while ')) {
        type = 'loop';
        elements.push({ data: { id, label, type, fullLabel: trimmed } });
        elements.push({ data: { source: prevId, target: id } });
        stack.push(id);
        prevId = id;
        currentIndent = indent;
        i++;
        continue;
      }

      if (trimmed.startsWith('return ') || trimmed.startsWith('raise ')) {
        type = trimmed.startsWith('return') ? 'return' : 'raise';
        elements.push({ data: { id, label, type, fullLabel: trimmed } });
        elements.push({ data: { source: prevId, target: id } });
        prevId = id;
        i++;
        continue;
      }

      if (trimmed.includes('=') && !trimmed.includes('if ') && !trimmed.includes('for ') && !trimmed.includes('while ')) {
        const group: string[] = [trimmed];
        i++;

        while (i < lines.length) {
          const nextLine = lines[i].trim();
          if (!nextLine || nextLine.startsWith('#')) { i++; continue; }
          if (!nextLine.includes('=') || nextLine.startsWith('if ') || nextLine.startsWith('for ') || nextLine.startsWith('while ') || nextLine.startsWith('return ') || nextLine.startsWith('else') || nextLine.startsWith('elif')) {
            break;
          }
          group.push(nextLine);
          i++;
        }

        id = `vars_${prevId}_${group.length}`;
        label = group.length === 1 ? group[0].substring(0, 55) : `${group.length} assignments`;
        elements.push({
          data: {
            id,
            label,
            type: 'group',
            details: group.join('\n'),
            count: group.length
          }
        });
        elements.push({ data: { source: prevId, target: id } });
        prevId = id;
        continue;
      }

      elements.push({ data: { id, label, type, fullLabel: trimmed } });
      elements.push({ data: { source: prevId, target: id } });
      prevId = id;
      i++;
    }

    while (stack.length > 0) {
      stack.pop();
    }

    elements.push({ data: { id: 'end', label: 'End', type: 'end' } });
    elements.push({ data: { source: prevId, target: 'end' } });

    return elements;
  }

  const runFlowchart = () => {
    console.log('Running flowchart with code:', code());
    const elements = parseCodeToFlowchart(code());
    console.log('Generated elements:', elements);
    
    setGraphData({
      elements: elements,
      style: [
        {
          selector: 'node[type="start"]',
          style: {
            "background-color": "#10b981",
            "label": "data(label)",
            "color": "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "14px",
            "font-weight": "bold",
            "width": "80px",
            "height": "80px",
            "shape": "ellipse"
          }
        },
        {
          selector: 'node[type="end"]',
          style: {
            "background-color": "#ef4444",
            "label": "data(label)",
            "color": "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "14px",
            "font-weight": "bold",
            "width": "80px",
            "height": "80px",
            "shape": "ellipse"
          }
        },
        {
          selector: 'node[type="group"]',
          style: {
            "background-color": "#06b6d4",
            "label": "data(label)",
            "color": "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "13px",
            "font-weight": "bold",
            "width": "150px",
            "height": "70px",
            "shape": "round-rectangle",
            "border-width": "2px",
            "border-color": "#0891b2"
          }
        },
        {
          selector: 'node[type="decision"]',
          style: {
            "background-color": "#f97316",
            "label": "data(label)",
            "color": "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            "width": "100px",
            "height": "100px",
            "shape": "diamond"
          }
        },
        {
          selector: 'node[type="loop"]',
          style: {
            "background-color": "#8b5cf6",
            "label": "data(label)",
            "color": "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            "width": "100px",
            "height": "80px",
            "shape": "hexagon"
          }
        },
        {
          selector: 'node[type="return"]',
          style: {
            "background-color": "#ec4899",
            "label": "data(label)",
            "color": "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            "width": "110px",
            "height": "60px",
            "shape": "round-rectangle"
          }
        },
        {
          selector: 'node[type="statement"]',
          style: {
            "background-color": "#4f46e5",
            "label": "data(label)",
            "color": "#fff",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            "width": "120px",
            "height": "60px",
            "shape": "round-rectangle"
          }
        },
        {
          selector: "edge",
          style: {
            "width": 2,
            "line-color": "#6b7280",
            "target-arrow-color": "#6b7280",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier"
          }
        }
      ],
      layout: {
        name: 'dagre',
        rankDir: 'TB',
        nodeSep: 40,
        rankSep: 80,
        edgeSep: 20,
        padding: 40,
        spacingFactor: 1.1,
        animate: false,
        animationDuration: 0
      },
      run: runFlowchart
    });
  };

  // Run flowchart on initial load with default code
  createEffect(() => {
    if (!code()) return;

    const timer = setTimeout(() => {
      runFlowchart();
    }, 300);

    return () => clearTimeout(timer);
  });

  const startDragging = (e: MouseEvent) => {
    const startX = e.clientX;
    const startWidth = leftWidth();

    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startX;
      setLeftWidth(Math.max(200, startWidth + delta));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const [selectedNode, setSelectedNode] = createSignal<NodeData | null>(null);

  return (
    <main class="w-full h-screen flex overflow-hidden">
      {/* 1. File Explorer - fixed width sidebar */}
      <div class="h-full w-72 bg-[#1e1e1e] border-r border-gray-800 overflow-hidden flex flex-col">
        <FileExplorer />
      </div>

      {/* 2. Resizer between explorer and editor */}
      <div
        class="w-2 cursor-col-resize bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
        onMouseDown={startDragging} // Reuse or create separate drag for this panel if needed
      />

      {/* 3. Editor panel - resizable */}
      <div
        class="h-full bg-[#1e1e1e] text-gray-200 p-0 overflow-hidden"
        style={{ width: `${leftWidth()}px` }}
      >
        <Suspense fallback={
          <div class="h-full flex items-center justify-center text-gray-400">
            Loading editor...
          </div>
        }>
          <ShikiEditor code={code()} onCodeChange={setCode} />
        </Suspense>
      </div>

      {/* 4. Resizer between editor and chart */}
      <div
        class="w-2 cursor-col-resize bg-gray-300 hover:bg-gray-400 active:bg-gray-500"
        onMouseDown={startDragging} // same handler for now; extend logic later for multi-panel
      />

      {/* 5. Chart area - takes remaining space */}
      <div class="flex-1 h-full overflow-hidden relative">
        <NoHydration>
          <Suspense fallback={
            <div class="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-300 text-lg">
              Generating flowchart...
            </div>
          }>
            <DemoChart
              graph={graphData()}
              onRunClick={runFlowchart}
              onNodeClick={setSelectedNode}
            />
          </Suspense>
        </NoHydration>

        {/* Node details sidebar - absolute on right of chart area */}
        <div
          class={`absolute top-0 right-0 bottom-0 w-96 bg-white border-l border-gray-200 shadow-2xl overflow-y-auto
                transition-transform duration-300 ease-in-out z-10
                ${selectedNode() ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ "min-width": "340px" }}
        >
          <Show when={selectedNode()}>
            <div class="p-5">
              <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <h3 class="text-xl font-semibold text-gray-900 truncate max-w-[260px]">
                  {selectedNode()?.label || 'Node Details'}
                </h3>
                <button
                  class="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-2 transition-colors"
                  onClick={() => setSelectedNode(null)}
                  title="Close"
                >
                  <span class="text-2xl leading-none">×</span>
                </button>
              </div>
              <div class="space-y-6 text-gray-700 text-sm">
                <div class="flex items-center gap-3">
                  <span class="font-medium text-gray-600">Type:</span>
                  <span class="inline-block px-3 py-1 bg-gray-100 text-gray-800 font-mono rounded-full text-xs uppercase tracking-wide">
                    {selectedNode()?.type}
                  </span>
                </div>
                <Show when={selectedNode()?.fullLabel}>
                  <div>
                    <p class="font-medium text-gray-600 mb-2">Full code:</p>
                    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm whitespace-pre-wrap break-words">
                      {selectedNode()?.fullLabel}
                    </div>
                  </div>
                </Show>
                <Show when={selectedNode()?.details} keyed>
                  {(details: string) => (
                    <div>
                      <p class="font-medium text-gray-600 mb-2">
                        Variables ({selectedNode()?.count ?? '—'})
                      </p>
                      <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 font-mono text-sm space-y-2">
                        {details.split('\n').map((line: string, idx: number) => (
                          <div class="break-all leading-relaxed">
                            {line}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Show>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </main>
  );
}