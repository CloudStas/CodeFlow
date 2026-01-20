import { A } from "@solidjs/router";

export default function Home() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="text-3xl font-bold font-['JetBrains_Mono']">Welcome to CodeFlow</h1>
      <h2 class="text-xl font-semibold mt-4">The Ultimate code visualization tool</h2>
      <button id="demobutton" class="mt-6 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors">
        <A href="/Demo">Demo</A>
      </button>
    </main>
  );
}
