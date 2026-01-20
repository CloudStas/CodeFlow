import type { APIEvent } from "@solidjs/start/server";
import { loadPythonParser } from "~/lib/pythonParser";

export async function POST({ request }: APIEvent) {
  const { code } = await request.json();

  const parser = await loadPythonParser();
  const tree = parser.parse(code);

  return new Response(
    JSON.stringify({ ast: tree.rootNode.toString() }),
    { headers: { "Content-Type": "application/json" } }
  );
}
