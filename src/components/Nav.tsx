import { useLocation } from "@solidjs/router";

export default function Nav() {
  const location = useLocation();
  const active = (path: string) =>
    path == location.pathname ? "border-sky-600" : "border-transparent hover:border-sky-600";
  return (
    <nav class="bg-sky-800 shadow-lg flex items-center justify-between">
      <div class="flex items-center justify-between px-6 py-4">
        <h1 class="text-3xl text-sky-200 font-bold font-['JetBrains_Mono']">CodeFlow</h1>
        <ul class="flex items-center gap-8 text-gray-200">
          <li class={`pb-2 ml-4 mt-4 border-b-2 transition-colors ${active("/")} hover:text-sky-200`}>
            <a href="/" class="text-lg font-medium">Home</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
