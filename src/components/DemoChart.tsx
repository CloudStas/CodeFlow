import { createEffect, onCleanup } from "solid-js";
import cytoscape from "cytoscape";
// @ts-expect-error - cytoscape-dagre uses CommonJS exports
import dagre from 'cytoscape-dagre';

cytoscape.use(dagre);

export type NodeData = {
  id: string;
  label: string;
  type: string;
  fullLabel?: string;
  details?: string;
  count?: number;
};

export type DemoChartProps = {
  graph: {
    elements: any[];
    style: any[];
    layout: any;
  };
  onRunClick: () => void;
  onNodeClick?: (node: NodeData | null) => void;
};

export default function DemoChart(props: DemoChartProps) {
  let containerRef: HTMLDivElement | undefined;
  let cyInstance: cytoscape.Core | null = null;

  createEffect(() => {
    console.log('DemoChart effect running');
    console.log('containerRef:', containerRef);
    console.log('props.graph:', props.graph);
    console.log('elements:', props.graph?.elements);

    if (!containerRef) {
      console.log('No container ref');
      return;
    }

    if (!props.graph || !props.graph.elements.length) {
      console.log('No graph or elements');
      return;
    }

    if (cyInstance) {
      console.log('Destroying previous instance');
      cyInstance.destroy();
    }

    console.log('Creating cytoscape instance');
    cyInstance = cytoscape({
      container: containerRef,
      elements: props.graph.elements,
      style: props.graph.style,
      layout: props.graph.layout
    });

    console.log('Cytoscape instance created:', cyInstance);

    cyInstance.on('tap', 'node', (evt: cytoscape.EventObject) => {
      const node = evt.target;
      const data = node.data() as NodeData;
      if (data.type && data.type !== "start" && data.type !== "end") {
        props.onNodeClick?.(data);
      } else {
        props.onNodeClick?.(null);
      }
    });

    cyInstance.on('tap', (evt: cytoscape.EventObject) => {
      if (evt.target === cyInstance) {
        props.onNodeClick?.(null);
      }
    });
  });

  onCleanup(() => {
    if (cyInstance) {
      cyInstance.destroy();
      cyInstance = null;
    }
  });

  return (
    <div class="w-full h-full flex gap-4 bg-white border border-gray-300 rounded overflow-hidden">
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="p-2 text-lg font-semibold border-b flex items-center justify-between">
          <span>Flowchart</span>
          <button
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 active:bg-blue-800"
            onClick={props.onRunClick}
          >
            Run
          </button>
        </div>
        <div
          ref={containerRef}
          class="flex-1 overflow-hidden"
        />
      </div>
    </div>
  );
}