import { createEffect } from "solid-js";
import { codeToHtml } from "shiki";

export default function ShikiEditor(props: { code: string; onCodeChange: (c: string) => void }) {
  let textareaRef!: HTMLTextAreaElement;
  let highlightRef!: HTMLDivElement;
  let gutterRef!: HTMLDivElement;

  createEffect(async () => {
    const html = await codeToHtml(props.code, {
      lang: "python",
      theme: "github-dark",
    });
    highlightRef.innerHTML = html;

    const lines = props.code.split("\n").length;
    gutterRef.innerHTML = Array.from({ length: lines })
      .map((_, i) => `<div class="leading-6">${i + 1}</div>`)
      .join("");
  });

  const syncScroll = () => {
    const top = textareaRef.scrollTop;
    highlightRef.scrollTop = top;
    gutterRef.scrollTop = top;
  };

  return (
    <div class="relative w-full h-full font-mono text-sm flex bg-[#1e1e1e]">

      <div
        ref={gutterRef}
        class="select-none text-right pr-3 py-2 overflow-hidden text-gray-500"
        style={{ width: "3rem" }}
      />

      <div
        ref={highlightRef}
        class="absolute inset-0 left-[3rem] pointer-events-none p-2 overflow-auto"
      />

      <textarea
        ref={textareaRef}
        value={props.code}
        onInput={(e) => props.onCodeChange(e.currentTarget.value)}
        onScroll={syncScroll}
        spellcheck={false}
        class="absolute inset-0 left-[3rem] w-[calc(100%-3rem)] h-full bg-transparent text-transparent caret-white p-2 outline-none resize-none overflow-auto selection:bg-blue-500/30"
      />
    </div>
  );
}
