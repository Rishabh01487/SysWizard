import type { Category } from "./types";

/**
 * Full-Stack Web Development
 * Comprehensive coverage of frontend frameworks, web platform APIs,
 * performance, frontend engineering, full-stack integration, and auth.
 */
export const FULLSTACK: Category = {
  id: "fullstack",
  name: "Full-Stack Web Development",
  icon: "🌐",
  level: "intermediate",
  topics: [
    // ───────────────────────── Frontend Frameworks & Rendering ─────────────────────────
    {
      id: "react-fundamentals",
      title: "React Fundamentals",
      icon: "⚛️",
      description: "Components, JSX, props, state, and the core hooks.",
      tags: ["React", "JSX", "Hooks"],
      hasAnimation: true,
      content: {
        overview:
          "React builds UIs from <strong>declarative components</strong> rendered with JSX. Components receive <strong>props</strong> (immutable inputs) and hold <strong>state</strong> (mutable data); re-renders trigger when state changes. Core hooks — useState, useEffect, useMemo, useCallback, useRef — cover the vast majority of real use cases.",
        howItWorks: [
          "JSX compiles to React.createElement() calls producing virtual element trees",
          "Renderer reconciles the new tree against previous → computes minimal DOM mutations",
          "useState returns [value, setter]; calling setter schedules a re-render",
          "useEffect runs side effects after paint; cleanup runs before the next effect",
          "useMemo/useCallback memoize expensive values & callbacks across renders",
          "useRef persists mutable values without triggering re-render",
        ],
        keyConcepts: [
          "<strong>One-way data flow</strong> — Props down, events up; no two-way binding",
          "<strong>Reconciliation</strong> — Diffing algorithm decides what DOM to change",
          "<strong>Hooks rules</strong> — Only call at top level, only from React functions",
          "<strong>Derived state</strong> — Compute during render instead of syncing with effect",
          "<strong>Keys</strong> — Stable identity for list items so React can match them",
        ],
        realWorld:
          "Meta built React for the Facebook News Feed. Instagram, WhatsApp Web, the Vercel dashboard, and modern SaaS UIs (Linear, Notion clones) are all React.",
        tradeoffs: {
          pros: ["Declarative & component-based", "Massive ecosystem & tooling", "Unidirectional data flow is predictable"],
          cons: ["Bundle includes the runtime (~45KB)", "Plain React needs add-ons for routing/data", "Re-render perf requires memoization discipline"],
        },
        codeExample: `import { useState, useEffect, useMemo, useCallback, useRef } from "react";

export function SearchBox({ items }: { items: string[] }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const hits = useRef(0); // mutable, no re-render

  // Debounce query → debounced state
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(id); // cleanup before next effect
  }, [query]);

  // Memoize filtered list (only recompute when inputs change)
  const filtered = useMemo(
    () => items.filter((i) => i.toLowerCase().includes(debounced.toLowerCase())),
    [items, debounced],
  );

  const reset = useCallback(() => setQuery(""), []);
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <ul>{filtered.map((i) => <li key={i}>{i}</li>)}</ul>
      <button onClick={reset}>Reset</button>
    </>
  );
}`,
        interviewTips: [
          "Explain why React is declarative and what benefits that brings",
          "Walk through useEffect cleanup and dependency arrays",
          "Know when NOT to use useMemo — small arrays don't need it",
        ],
      },
    },
    {
      id: "react-server-components",
      title: "React Server Components",
      icon: "🚀",
      description: "Components that render only on the server with zero JS shipped.",
      tags: ["React", "RSC", "Next.js"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>React Server Components (RSC)</strong> render exclusively on the server and never ship their code to the browser. They can read databases, files, and secrets directly — but cannot use state, effects, or browser APIs. <strong>Client Components</strong> ('use client') handle interactivity. RSC payloads stream over the network as serialized React trees.",
        howItWorks: [
          "Server renders the component tree; Server Components produce RSC payload (JSON)",
          "Client Components appear as placeholders in the payload — their JS is shipped separately",
          "Client stitches together the streamed payload into a live tree",
          "Server Components can await async data fetches inline (no useEffect)",
          "Navigation re-fetches only changed segments — cached & streamed",
        ],
        keyConcepts: [
          "<strong>Server Component</strong> — Default in App Router; no JS shipped to client",
          "<strong>Client Component</strong> — Declared with 'use client'; needed for state/effects",
          "<strong>Streaming</strong> — Suspense boundaries allow incremental HTML/payload delivery",
          "<strong>Server Actions</strong> — Functions called from client that execute on server",
          "<strong>Passing data</strong> — Server → client via props (must be serializable)",
        ],
        realWorld:
          "Next.js App Router uses RSC by default. Vercel's site, the new React docs, and Stripe's marketing pages ship RSC for fast initial loads.",
        tradeoffs: {
          pros: ["Zero JS for static/server-only components", "Direct DB/filesystem access without API layer", "Smaller client bundles & faster TTI"],
          cons: ["Mental model split between server/client", "Cannot use React DevTools for server tree", "Ecosystem still catching up (libraries need 'use client')"],
        },
        codeExample: `// app/page.tsx (Server Component — default)
import { db } from "@/lib/db";
import { CartButton } from "./CartButton"; // 'use client'

export default async function Page() {
  // Direct DB access — no API needed
  const products = await db.product.findMany({ take: 20 });
  return (
    <main>
      {products.map((p) => (
        <article key={p.id}>{p.name} — \${p.price}</article>
      ))}
      <CartButton count={products.length} />
    </main>
  );
}

// app/CartButton.tsx
"use client";
import { useState } from "react";
export function CartButton({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  return <button onClick={() => setOpen(!open)}>{count} items</button>;
}`,
        interviewTips: [
          "Be clear: RSC ≠ SSR — SSR produces HTML, RSC produces a serializable tree",
          "Know the 'use client' boundary and what forces a component to be client",
          "Server → client props must be serializable (no functions, no classes)",
        ],
      },
    },
    {
      id: "virtual-dom",
      title: "Virtual DOM & Reconciliation",
      icon: "🌳",
      description: "React's in-memory tree diffing to minimize DOM mutations.",
      tags: ["React", "Diffing", "Performance"],
      hasAnimation: true,
      content: {
        overview:
          "The <strong>Virtual DOM</strong> is a lightweight JS object tree mirroring the real DOM. On state change, React builds a new tree and <strong>diffs</strong> it against the previous one, then applies only the resulting DOM mutations. The <strong>reconciliation</strong> algorithm is O(n) by assuming same-position elements are the same component type.",
        howItWorks: [
          "Render produces a tree of React elements (plain objects)",
          "Renderer compares new tree with previous using heuristics",
          "Same type at same position → keep instance, update props",
          "Different type → unmount old subtree, mount new",
          "List items use key to match elements across renders",
          "Computed diff is applied as batched DOM operations",
        ],
        keyConcepts: [
          "<strong>O(n) heuristic diff</strong> — Not a full tree diff (which is O(n³))",
          "<strong>key prop</strong> — Stable identity so list reordering is efficient",
          "<strong>Reconciliation</strong> — The diff + apply phase",
          "<strong>Fiber</strong> — React 16+ internal data structure enabling pausable rendering",
          "<strong>Bubbling updates</strong> — Children update before parents",
        ],
        realWorld:
          "React, Preact, and Inferno use a VDOM. Vue uses one too. Solid.js & Svelte moved away to fine-grained reactivity for even less work.",
        tradeoffs: {
          pros: ["Declarative UI model", "Batches DOM writes", "Cross-platform (React Native, Three.js)"],
          cons: ["Memory overhead of double tree", "Diff still costs O(n) each render", "Not always optimal — fine-grained reactivity can skip more"],
        },
        codeExample: `// BAD: index as key → re-renders all items on insert/delete
{items.map((item, i) => <Row key={i} item={item} />)}

// GOOD: stable unique key → React matches & moves existing DOM
{items.map((item) => <Row key={item.id} item={item} />)}

// Manual bailout: React.memo skips re-render if props are equal
const Row = React.memo(
  function Row({ item }: { item: Item }) {
    return <li>{item.name}</li>;
  },
  (prev, next) => prev.item.id === next.item.id,
);

// Why it matters: removing index 0 with index keys re-mounts every Row.
// With stable ids, React moves the DOM node — preserving state & inputs.`,
        interviewTips: [
          "Explain why index keys break on list mutations",
          "Mention React Fiber and concurrent rendering as evolution",
          "Compare with Solid.js/Svelte's compile-time reactivity",
        ],
      },
    },
    {
      id: "hydration",
      title: "Hydration",
      icon: "💧",
      description: "Attaching client JS to server-rendered HTML to make it interactive.",
      tags: ["React", "SSR", "Hydration"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Hydration</strong> is the process where the browser receives server-rendered HTML and React attaches event handlers to make it interactive — without re-rendering the DOM. <strong>Hydration mismatches</strong> occur when server and client trees differ, causing errors and forced re-renders of the affected subtree.",
        howItWorks: [
          "Server renders HTML string with initial data baked in",
          "Browser parses HTML — user sees content immediately",
          "React JS bundle downloads & executes",
          "React walks the DOM, building its fiber tree from existing nodes",
          "Event handlers attached — page is now interactive",
          "If server/client markup differs → mismatch warning + full re-render of subtree",
        ],
        keyConcepts: [
          "<strong>SSR</strong> — Server renders HTML; client hydrates (vs re-render from scratch)",
          "<strong>Hydration mismatch</strong> — Different markup from server vs client",
          "<strong>Selective hydration</strong> — React 18 hydrates subtrees on interaction",
          "<strong>Progressive hydration</strong> — Hydrate parts of page over time",
          "<strong>Islands architecture</strong> — Only hydrate interactive widgets (Astro)",
        ],
        realWorld:
          "Next.js pages get HTML on first load then hydrate. Astro popularized islands. React 18 brought selective & progressive hydration.",
        tradeoffs: {
          pros: ["Fast First Contentful Paint with SEO content", "Single render path (server + client)", "Page becomes interactive after JS loads"],
          cons: ["Twin cost: HTML + JS bundle both shipped", "Mismatch errors are common & confusing", "Heavy JS = long time-to-interactive"],
        },
        codeExample: `// Common mismatch source: time differs between server & client
function Clock() {
  // BAD: server renders T0, client renders T0+x → mismatch warning
  // const [now] = useState(() => new Date());

  // FIX: render placeholder, set after hydration
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <time>{now ? now.toLocaleTimeString() : "Loading..."}</time>;
}

// suppressHydrationWarning for intentional differences (theme, dark mode)
<div suppressHydrationWarning className={theme}>...</div>`,
        interviewTips: [
          "Explain hydration mismatch causes: time, Math.random, window checks",
          "Know selective hydration & islands architecture",
          "RSC reduces hydration cost — less JS to attach",
        ],
      },
    },
    {
      id: "ssr-csr-ssg-isr",
      title: "Rendering Strategies: SSR / CSR / SSG / ISR",
      icon: "🎨",
      description: "Choose the right rendering strategy per route.",
      tags: ["Rendering", "Next.js", "Performance"],
      hasAnimation: true,
      content: {
        overview:
          "Modern frameworks let you choose <strong>per-route rendering</strong>: <strong>CSR</strong> (render in browser), <strong>SSR</strong> (render on request), <strong>SSG</strong> (render at build), <strong>ISR</strong> (SSG + background regeneration), and <strong>Edge SSR</strong> (render at CDN edge). The right choice balances SEO, freshness, latency, and cost.",
        howItWorks: [
          "CSR: server ships empty HTML + JS bundle; browser renders after hydration",
          "SSR: server renders full HTML per request — fresh content, slower TTFB",
          "SSG: build-time renders HTML pages — fastest, but content static until rebuild",
          "ISR: cached static page served instantly; regenerated in background on stale",
          "Edge SSR: render at nearest CDN edge POP — lowest latency worldwide",
          "Hybrid: each route can pick its strategy in Next.js App Router",
        ],
        keyConcepts: [
          "<strong>CSR (Client-Side Rendering)</strong> — SPA model, poor SEO without prerender",
          "<strong>SSR (Server-Side Rendering)</strong> — Fresh HTML per request, good SEO",
          "<strong>SSG (Static Site Generation)</strong> — Build-time HTML, served from CDN",
          "<strong>ISR (Incremental Static Regeneration)</strong> — Stale-while-revalidate for pages",
          "<strong>Streaming SSR</strong> — Send HTML chunks as ready via Suspense",
          "<strong>Edge runtime</strong> — V8 isolates at edge POPs, near-zero cold start",
        ],
        realWorld:
          "Next.js & Astro support all four. Vercel & Netlify serve SSG from CDN edge. E-commerce uses ISR for product pages. Dashboards use CSR.",
        tradeoffs: {
          pros: ["Per-route optimization", "SSG + ISR = CDN-fast with freshness", "Edge SSR cuts global latency"],
          cons: ["SSR adds server cost per request", "SSG rebuilds are slow for large sites", "Edge runtime has API & memory limits"],
        },
        codeExample: `// Next.js App Router — choose per route
// app/page.tsx — SSG (default for static)
export default function Page() { return <Home />; }

// app/products/[id]/page.tsx — ISR
export const revalidate = 60; // regenerate every 60s in background
export default async function Product({ params }) {
  const p = await db.product.findUnique({ where: { id: params.id } });
  return <ProductView p={p} />;
}

// app/dashboard/page.tsx — SSR (dynamic, no cache)
export const dynamic = "force-dynamic";
export default async function Dashboard() {
  const stats = await db.stats(); // fresh every request
  return <Chart stats={stats} />;
}

// app/edge-api/route.ts — Edge runtime
export const runtime = "edge";
export async function GET() {
  return Response.json({ geo: (request as any).geo });
}`,
        interviewTips: [
          "Map each strategy to a real-world use case (blog=SSG, dashboard=SSR, product=ISR)",
          "Explain ISR as stale-while-revalidate for full pages",
          "Mention edge runtime limits (no Node APIs, smaller memory)",
        ],
      },
    },
    {
      id: "nextjs-architecture",
      title: "Next.js App Router Architecture",
      icon: "🔺",
      description: "App Router: layouts, route handlers, middleware, server actions.",
      tags: ["Next.js", "Routing", "Full-Stack"],
      hasAnimation: true,
      content: {
        overview:
          "Next.js <strong>App Router</strong> (the /app directory) organizes routes by filesystem with nested <strong>layouts</strong>, <strong>pages</strong>, <strong>loading</strong>, and <strong>error</strong> files. <strong>Route Handlers</strong> expose APIs, <strong>Middleware</strong> intercepts requests at the edge, and <strong>Server Actions</strong> let client components call server functions directly without writing endpoints.",
        howItWorks: [
          "Filesystem maps to routes: /app/dashboard/settings/page.tsx → /dashboard/settings",
          "layout.tsx wraps child routes — persists across navigation (no re-render)",
          "page.tsx is the leaf — defines the route's UI",
          "loading.tsx shows during Suspense; error.tsx catches errors",
          "middleware.ts runs on edge before route — auth, redirects, headers",
          "route.ts (Route Handler) returns Response objects — like a fetch endpoint",
          "Server Actions: async functions called from forms — POST automatically",
        ],
        keyConcepts: [
          "<strong>Nested layouts</strong> — Shared UI preserved across child navigation",
          "<strong>Route groups</strong> — (folder) doesn't affect URL, just organizes",
          "<strong>Parallel routes</strong> — @slots render multiple pages in one layout",
          "<strong>Middleware</strong> — Edge runtime; runs before every matched request",
          "<strong>Server Actions</strong> — Type-safe RPC from client to server function",
        ],
        realWorld:
          "Vercel.com is built on Next.js App Router. T3 stack, Cal.com, and many SaaS dashboards use App Router + server actions for full-stack TypeScript.",
        tradeoffs: {
          pros: ["Full-stack in one codebase", "Server Actions eliminate boilerplate API code", "Layouts preserve UI state across navigation"],
          cons: ["Mental model is server/client component split", "Edge runtime API limits", "Cache layers can be confusing"],
        },
        codeExample: `// app/dashboard/layout.tsx — wraps all /dashboard routes
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await auth();
  if (!user) redirect("/login");
  return (
    <div className="flex">
      <Sidebar user={user} />
      <main>{children}</main>
    </div>
  );
}

// app/todos/actions.ts — Server Action
"use server";
import { revalidatePath } from "next/cache";
export async function addTodo(formData: FormData) {
  await db.todo.create({ data: { text: formData.get("text") as string } });
  revalidatePath("/todos"); // refresh cached page
}

// app/todos/page.tsx — form invokes Server Action directly
export default function Page() {
  return (
    <form action={addTodo}>
      <input name="text" />
      <button>Add</button>
    </form>
  );
}`,
        interviewTips: [
          "Explain layout persistence vs page re-render",
          "Know server actions are POST endpoints under the hood",
          "Mention revalidatePath / revalidateTag for cache invalidation",
        ],
      },
    },
    {
      id: "state-management",
      title: "State Management",
      icon: "🗄️",
      description: "Redux vs Zustand vs Jotai vs Context — pick the right tool.",
      tags: ["State", "Redux", "Zustand"],
      hasAnimation: true,
      content: {
        overview:
          "Frontend state falls into <strong>server state</strong> (use React Query/SWR) and <strong>client state</strong> (UI, theme, cart). For client state, options span <strong>Context</strong> (built-in, but re-renders), <strong>Redux</strong> (heavy, strict, devtools), <strong>Zustand</strong> (lightweight store), <strong>Jotai</strong> (atomic), and <strong>Recoil</strong> (Meta's atomic model).",
        howItWorks: [
          "Identify the state type — server vs client",
          "Server state → React Query/SWR handles fetch/cache/invalidation",
          "Client global state → store (Zustand) or atoms (Jotai)",
          "Components subscribe to slices; only those re-render on change",
          "Actions/mutations update the store immutably",
          "Selectors derive computed values, memoized",
        ],
        keyConcepts: [
          "<strong>Redux</strong> — Single store, actions → reducer → state; great devtools, verbose",
          "<strong>Zustand</strong> — Tiny store with hooks; no boilerplate, no providers",
          "<strong>Jotai</strong> — Atomic state; components subscribe to individual atoms",
          "<strong>Context</strong> — Built-in, but every consumer re-renders on any change",
          "<strong>Redux Toolkit</strong> — Modern Redux with createSlice, RTK Query",
        ],
        realWorld:
          "Figma uses Zustand for canvas state. Notion uses Redux. Linear uses Zustand + Jotai. Most modern apps pair Zustand + React Query.",
        tradeoffs: {
          pros: ["Zustand: 1KB, no providers, ergonomic", "Jotai: fine-grained subscriptions = perf", "Redux: best devtools & middleware ecosystem"],
          cons: ["Context: re-render perf is bad for high-frequency updates", "Redux: boilerplate & bundle size", "Splitting state across tools adds complexity"],
        },
        codeExample: `// Zustand — 1KB, no providers needed
import { create } from "zustand";

interface CartStore {
  items: CartItem[];
  add: (item: CartItem) => void;
  total: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  add: (item) => set((s) => ({ items: [...s.items, item] })),
  total: () => get().items.reduce((sum, i) => sum + i.price, 0),
}));

// Component — only re-renders when 'items' reference changes
function Cart() {
  const items = useCart((s) => s.items); // selector subscription
  return <ul>{items.map((i) => <li key={i.id}>{i.name}</li>)}</ul>;
}

// Jotai — atomic, fine-grained
import { atom, useAtom } from "jotai";
const countAtom = atom(0);
const doubleAtom = atom((get) => get(countAtom) * 2); // derived`,
        interviewTips: [
          "First ask: is this server state? If yes, React Query — not Redux",
          "Compare Context vs Zustand re-render behavior",
          "Know Jotai's atomic model avoids unnecessary re-renders",
        ],
      },
    },
    {
      id: "react-query-swr",
      title: "React Query & SWR",
      icon: "🔄",
      description: "Server state: caching, stale-while-revalidate, optimistic updates.",
      tags: ["React Query", "SWR", "Caching"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>React Query</strong> (TanStack Query) and <strong>SWR</strong> (Vercel) manage <strong>server state</strong>: fetching, caching, deduplication, and background revalidation. They implement <strong>stale-while-revalidate</strong> — show cached data immediately, then refresh in the background. Both handle retries, optimistic updates, and pagination with minimal boilerplate.",
        howItWorks: [
          "Component calls useQuery(queryKey, fetcher)",
          "Library checks cache for matching key → returns cached data instantly",
          "If stale (per staleTime), background refetch fires",
          "Multiple components with same key → single deduped request",
          "On mutation, invalidate query keys to trigger refetch",
          "Optimistic update: update cache immediately, rollback on error",
        ],
        keyConcepts: [
          "<strong>Query Key</strong> — Array identifying the query; nested for hierarchy",
          "<strong>staleTime</strong> — How long data is fresh (no refetch)",
          "<strong>gcTime/cacheTime</strong> — When unused cache is garbage collected",
          "<strong>Invalidation</strong> — Mark keys stale to refetch (queryClient.invalidateQueries)",
          "<strong>Optimistic update</strong> — onMutate updates cache before server responds",
        ],
        realWorld:
          "Vercel dashboard & Next.js docs use SWR. Linear, GitHub, and countless dashboards use React Query. The pattern replaced hand-rolled Redux thunks.",
        tradeoffs: {
          pros: ["Removes 90% of state boilerplate", "Built-in caching, retries, dedup", "Works with any fetcher (REST, GraphQL)"],
          cons: ["Cache invalidation still requires thought", "Bundle size (~13KB)", "Devtools needed to debug cache state"],
        },
        codeExample: `import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function TodoList() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: () => fetch("/api/todos").then((r) => r.json()),
    staleTime: 30_000, // fresh for 30s
  });

  const add = useMutation({
    mutationFn: (text: string) =>
      fetch("/api/todos", { method: "POST", body: JSON.stringify({ text }) }),
    onMutate: async (text) => {
      await qc.cancelQueries({ queryKey: ["todos"] });
      const prev = qc.getQueryData<Todo[]>(["todos"]);
      qc.setQueryData<Todo[]>(["todos"], (old = []) => [
        ...old, { id: "tmp", text, done: false },
      ]);
      return { prev }; // context for rollback
    },
    onError: (_e, _t, ctx) => qc.setQueryData(["todos"], ctx?.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["todos"] }),
  });

  return <button onClick={() => add.mutate("New item")}>Add</button>;
}`,
        interviewTips: [
          "Explain staleTime vs gcTime — common confusion",
          "Walk through optimistic mutation flow with rollback",
          "Compare React Query vs SWR (similar; RQ has more features)",
        ],
      },
    },
    {
      id: "suspense-concurrent",
      title: "Suspense & Concurrent React",
      icon: "⏸️",
      description: "Suspense, transitions, useTransition, concurrent rendering.",
      tags: ["React", "Suspense", "Concurrent"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Concurrent React</strong> lets the renderer pause, interrupt, and resume work — keeping the UI responsive. <strong>Suspense</strong> declaratively shows fallbacks while async work (data, code) loads. <strong>useTransition</strong> marks updates as non-urgent so urgent input stays smooth while heavy list filtering runs in the background.",
        howItWorks: [
          "Component throws a promise (suspends) when data isn't ready",
          "Nearest Suspense boundary catches it, shows fallback UI",
          "When promise resolves, React retries the suspended component",
          "useTransition wraps a setState — marks it as low priority",
          "React can interrupt low-priority work for high-priority (typing) updates",
          "useDeferredValue throttles a value — re-renders at lower priority",
        ],
        keyConcepts: [
          "<strong>Suspense boundary</strong> — Wraps async subtrees, shows fallback",
          "<strong>Concurrent rendering</strong> — React can yield between renders",
          "<strong>useTransition</strong> — Mark updates non-urgent; returns isPending",
          "<strong>useDeferredValue</strong> — Defer re-render of expensive component",
          "<strong>Streaming SSR</strong> — Server sends HTML chunks as Suspense resolves",
        ],
        realWorld:
          "Next.js App Router uses Suspense for streaming SSR & loading.tsx. React Query 5+ supports Suspense. useTransition powers smooth search/filter UIs.",
        tradeoffs: {
          pros: ["Declarative loading states", "UI stays responsive during heavy updates", "Works with RSC streaming"],
          cons: ["Concurrent mode behavior can surprise you", "Suspense + error boundaries needed for robustness", "Some libs don't yet support suspense data"],
        },
        codeExample: `import { Suspense, useTransition, useDeferredValue, useState } from "react";

function SearchResults({ query }: { query: string }) {
  // Suspends while fetching (React Query 5 / RSC)
  const data = useSuspenseQuery({
    queryKey: ["search", query],
    queryFn: () => fetch(\`/api?q=\${query}\`).then((r) => r.json()),
  });
  return <List items={data.items} />;
}

export function SearchPage() {
  const [query, setQuery] = useState("");
  // Defer the expensive list re-render — typing stays smooth
  const deferred = useDeferredValue(query);

  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Suspense fallback={<Spinner />}>
        <SearchResults query={deferred} />
      </Suspense>
    </>
  );
}`,
        interviewTips: [
          "Distinguish useTransition vs useDeferredValue — both defer, different ergonomics",
          "Mention Suspense works for data AND code (React.lazy)",
          "Concurrent features require React 18+ & opt-in",
        ],
      },
    },
    {
      id: "forms-validation",
      title: "Forms & Validation",
      icon: "📝",
      description: "Controlled vs uncontrolled, Zod schemas, react-hook-form.",
      tags: ["Forms", "Zod", "react-hook-form"],
      hasAnimation: true,
      content: {
        overview:
          "Forms use <strong>controlled</strong> components (state per keystroke) or <strong>uncontrolled</strong> (DOM holds state, read on submit). <strong>react-hook-form</strong> favors uncontrolled with refs for performance. <strong>Zod</strong> defines schemas that validate input client-side and infer TypeScript types, often paired with react-hook-form's zodResolver.",
        howItWorks: [
          "User types → controlled component updates state → re-render; or uncontrolled leaves DOM untouched",
          "Submit triggers validation against schema (Zod parse)",
          "Errors map to fields; display under inputs",
          "On success, call onSubmit with typed values",
          "Server repeats validation — never trust the client",
          "Server Action returns field errors → form re-renders",
        ],
        keyConcepts: [
          "<strong>Controlled</strong> — value={state} onChange updates state (re-render per key)",
          "<strong>Uncontrolled</strong> — defaultValue + ref; read on submit (no re-render)",
          "<strong>Zod schema</strong> — z.object({...}); infer types with z.infer",
          "<strong>react-hook-form</strong> — register fields, useController for complex",
          "<strong>Progressive enhancement</strong> — Plain HTML form works without JS",
        ],
        realWorld:
          "Stripe's checkout form uses Zod + react-hook-form. Vercel signup, Linear issue forms. Remix/Next server actions push schemas to the server.",
        tradeoffs: {
          pros: ["Zod gives runtime validation + TS types from one source", "react-hook-form minimizes re-renders", "Server Action + form = progressive enhancement"],
          cons: ["Controlled inputs can lag at scale (typing)", "Two validation layers (client + server)", "Schema duplication risk if not shared"],
        },
        codeExample: `import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 chars"),
});
type FormData = z.infer<typeof schema>; // typed from schema

export function SignupForm() {
  const { register, handleSubmit, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    await fetch("/api/signup", {
      method: "POST", body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      <input type="password" {...register("password")} />
      {errors.password && <p>{errors.password.message}</p>}
      <button>Sign up</button>
    </form>
  );
}`,
        interviewTips: [
          "Mention Zod's parse + infer pattern as single source of truth",
          "Compare controlled vs uncontrolled re-render cost",
          "Always validate on server too — client can be bypassed",
        ],
      },
    },
    {
      id: "css-architecture",
      title: "CSS Architecture",
      icon: "🎨",
      description: "BEM, CSS Modules, CSS-in-JS, Tailwind utility-first.",
      tags: ["CSS", "Tailwind", "Architecture"],
      hasAnimation: true,
      content: {
        overview:
          "Modern CSS spans <strong>BEM</strong> (naming convention), <strong>CSS Modules</strong> (scoped class names), <strong>CSS-in-JS</strong> (styled-components, emotion — runtime styles), <strong>zero-runtime CSS-in-JS</strong> (Vanilla Extract, Linaria), and <strong>utility-first</strong> (Tailwind). Each trades off scoping, performance, ergonomics, and bundle size differently.",
        howItWorks: [
          "BEM: .block__element--modifier naming avoids global conflicts by convention",
          "CSS Modules: class names hashed at build → unique per file",
          "CSS-in-JS: styles defined as JS; runtime injects <style> tags",
          "Zero-runtime: styles extracted at build, hashed classes, no runtime cost",
          "Tailwind: pre-built utility classes composed inline → minimal final CSS",
          "All aim to solve: scoping, dead code, reusability",
        ],
        keyConcepts: [
          "<strong>BEM</strong> — block__element--modifier; convention-based scoping",
          "<strong>CSS Modules</strong> — Auto-hashed class names, file-scoped",
          "<strong>CSS-in-JS</strong> — styled-components/emotion; runtime cost, dynamic styles",
          "<strong>Tailwind</strong> — Utility-first; constrained design tokens, JIT compilation",
          "<strong>Cascade layers</strong> — @layer for explicit specificity ordering",
        ],
        realWorld:
          "Tailwind powers Vercel, GitHub's redesign, Linear, and shadcn/ui. CSS Modules are Next.js's built-in option. styled-components ran Spotify's old UI.",
        tradeoffs: {
          pros: ["Tailwind: tiny final CSS, consistent design system, no naming", "CSS Modules: native, no runtime", "BEM: works anywhere, no tooling needed"],
          cons: ["Tailwind: verbose JSX, learning curve", "CSS-in-JS: runtime cost (some libs deprecated for RSC)", "BEM: easy to drift from convention"],
        },
        codeExample: `// Tailwind utility-first (most popular in 2024+)
export function Button({ variant = "primary" }: { variant?: "primary" | "ghost" }) {
  return (
    <button
      className={[
        "px-4 py-2 rounded-md font-medium transition",
        variant === "primary"
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "text-gray-700 hover:bg-gray-100",
      ].join(" ")}
    >
      Click me
    </button>
  );
}

// CSS Modules — file-scoped
import styles from "./Button.module.css";
<button className={styles.button} />;

// styled-components (client only — 'use client')
// const Btn = styled.button\`background: \${({$primary}) => $primary ? "blue" : "transparent"};\`;`,
        interviewTips: [
          "Explain why styled-components struggle in RSC (runtime + 'use client')",
          "Know Tailwind's JIT & how it keeps CSS tiny",
          "Mention @layer / cascade layers as modern specificity control",
        ],
      },
    },
    {
      id: "css-grid-flexbox",
      title: "CSS Grid & Flexbox",
      icon: "📐",
      description: "2D vs 1D layout — when to use which.",
      tags: ["CSS", "Grid", "Flexbox"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Flexbox</strong> is a one-dimensional layout model — items flow along a row OR column. <strong>CSS Grid</strong> is two-dimensional — you control rows AND columns simultaneously. Use Flex for nav bars, button rows; use Grid for full page layouts, dashboards, galleries.",
        howItWorks: [
          "Flex: parent is display:flex; children flex along main axis (row/column)",
          "justify-content aligns on main axis; align-items on cross axis",
          "flex: 1 grows to fill; flex-shrink/grow/basis tune behavior",
          "Grid: parent is display:grid; define columns/rows via grid-template",
          "Children placed via grid-column/row lines or named areas",
          "auto-fit / minmax create responsive grids without media queries",
        ],
        keyConcepts: [
          "<strong>Main vs cross axis</strong> — Flex direction determines layout axis",
          "<strong>grid-template-areas</strong> — Named regions for visual layout",
          "<strong>minmax() + auto-fit</strong> — Responsive grid without media queries",
          "<strong>gap</strong> — Unified property for both flex & grid spacing",
          "<strong>Subgrid</strong> — Nested grid inherits parent tracks (now widely supported)",
        ],
        realWorld:
          "Netflix homepage rows are Flex; Pinterest masonry is Grid. GitHub's PR layout uses Grid. Most design systems use Grid for page skeletons.",
        tradeoffs: {
          pros: ["Grid: full 2D control, alignment easier", "Flex: perfect for components & nav bars", "gap property simplifies spacing"],
          cons: ["Grid: more boilerplate for simple layouts", "Flex: alignment surprises when wrapping", "Old browsers may need fallbacks"],
        },
        codeExample: `/* Grid: 3-column responsive auto-fit dashboard */
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

/* Named grid areas for page layout */
.page {
  display: grid;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  grid-template-columns: 200px 1fr 240px;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
.header { grid-area: header; }
.nav    { grid-area: nav; }

/* Flex: button group / nav bar */
.navbar {
  display: flex;
  justify-content: space-between; /* main axis */
  align-items: center;            /* cross axis */
  gap: 1rem;
}
.navbar .logo   { flex: 0 0 auto; }
.navbar .search { flex: 1 1 auto; } /* grow to fill */`,
        interviewTips: [
          "1D → Flex; 2D → Grid is the rule of thumb",
          "Know minmax + auto-fit for responsive cards",
          "Mention gap (formerly grid-gap) works in both now",
        ],
      },
    },
    {
      id: "css-animations",
      title: "CSS Animations & Transitions",
      icon: "✨",
      description: "Transforms, transitions, keyframes, FLIP, Framer Motion.",
      tags: ["CSS", "Animation", "Framer Motion"],
      hasAnimation: true,
      content: {
        overview:
          "Smooth 60fps animation uses <strong>transforms</strong> (translate/scale/rotate) and <strong>opacity</strong> — these run on the compositor thread without layout. <strong>Transitions</strong> animate between states; <strong>keyframes</strong> define multi-step sequences. The <strong>FLIP technique</strong> (First, Last, Invert, Play) animates layout changes by computing the diff and applying an inverse transform.",
        howItWorks: [
          "First: record element's start position/size",
          "Last: apply layout change, record end position",
          "Invert: apply transform that puts element back at start visually",
          "Play: transition transform back to 0 → element animates to new position",
          "Browser composites transform/opacity on GPU → no main-thread work",
          "Framer Motion wraps this with declarative animate props",
        ],
        keyConcepts: [
          "<strong>Transform & opacity</strong> — Compositor-friendly; cheap 60fps",
          "<strong>Layout/paint properties</strong> — top/left/width trigger reflow = jank",
          "<strong>FLIP</strong> — First/Last/Invert/Play for layout animations",
          "<strong>will-change</strong> — Hint browser to promote to its own layer",
          "<strong>Framer Motion</strong> — React lib with layout animations built in",
        ],
        realWorld:
          "Framer Motion powers Vercel & Linear animations. Apple.com uses CSS transforms heavily. The Photos app grid reorders via FLIP.",
        tradeoffs: {
          pros: ["Transform/opacity = GPU, no jank", "FLIP enables complex reorder animations", "Framer Motion: declarative, exit animations"],
          cons: ["will-change overuse = memory bloat", "Animating width/top = reflow jank", "Library bundle size (~50KB for Framer)"],
        },
        codeExample: `import { motion, AnimatePresence } from "framer-motion";

export function Toast({ message, show }: { message: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          // transform + opacity only = 60fps on compositor
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* CSS: prefer transform over top/left */
.toast { transition: transform 0.2s, opacity 0.2s; }
.toast.hidden { transform: translateY(20px) scale(0.9); opacity: 0; }`,
        interviewTips: [
          "Always animate transform & opacity — never width/top/left",
          "Explain FLIP — it's the secret behind reorder animations",
          "will-change should be removed after animation, not left permanently",
        ],
      },
    },
    {
      id: "design-systems",
      title: "Design Systems & Component Libraries",
      icon: "🎨",
      description: "Tokens, theme systems, accessible component libraries.",
      tags: ["Design System", "Tokens", "Accessibility"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>design system</strong> is a shared language of <strong>design tokens</strong> (colors, spacing, typography), <strong>component primitives</strong>, and documentation. Component libraries (Radix UI, shadcn/ui, Material UI) provide accessible, themed building blocks. Tokens flow from Figma → CSS variables → component styles for consistent UI across products.",
        howItWorks: [
          "Designers define tokens (color-bg-primary, spacing-md) in Figma",
          "Tokens exported as CSS variables / TS constants (Style Dictionary)",
          "Component primitives (Button, Dialog) consume tokens via CSS vars",
          "Theme provider swaps CSS variables at runtime (dark mode)",
          "Apps compose primitives — consistent look, accessibility baked in",
          "Storybook documents each variant & states",
        ],
        keyConcepts: [
          "<strong>Design tokens</strong> — Atomic design decisions (color, space, radius)",
          "<strong>Component primitives</strong> — Unstyled, accessible (Radix, Headless UI)",
          "<strong>shadcn/ui</strong> — Copy-paste components you own (not a package dep)",
          "<strong>CSS variables</strong> — Enable runtime theming (dark mode)",
          "<strong>Storybook</strong> — Component catalog & visual regression testing",
        ],
        realWorld:
          "Google's Material Design, Atlassian Design System, Shopify Polaris. Vercel uses Geist (now open source). shadcn/ui is the most popular React+Tailwind system.",
        tradeoffs: {
          pros: ["Consistency across products", "Accessibility built into primitives", "Tokens enable theming & dark mode"],
          cons: ["Up-front investment to build & maintain", "Generic look unless customized", "Token naming across teams needs governance"],
        },
        codeExample: `/* tokens.css — design tokens as CSS variables */
:root {
  --color-bg: #ffffff;
  --color-fg: #0a0a0a;
  --color-primary: #2563eb;
  --radius-md: 0.5rem;
  --spacing-4: 1rem;
}
[data-theme="dark"] {
  --color-bg: #0a0a0a;
  --color-fg: #fafafa;
  --color-primary: #3b82f6;
}

/* Component consumes tokens */
.btn {
  background: var(--color-primary);
  border-radius: var(--radius-md);
  padding: var(--spacing-4);
  color: var(--color-fg);
}`,
        interviewTips: [
          "Distinguish tokens (decisions) from components (implementations)",
          "Mention Radix as unstyled primitive + Tailwind as styling layer (shadcn recipe)",
          "CSS variables enable runtime theming vs SASS variables (build-time)",
        ],
      },
    },

    // ───────────────────────── Modern Web Platform APIs ─────────────────────────
    {
      id: "web-workers",
      title: "Web Workers",
      icon: "🔧",
      description: "Off-main-thread compute: dedicated, shared workers, comlink.",
      tags: ["Web Platform", "Workers", "Performance"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Web Workers</strong> run JavaScript on background threads, keeping the main thread free for UI. <strong>Dedicated workers</strong> are tied to one tab; <strong>Shared workers</strong> serve multiple tabs of the same origin. <strong>Comlink</strong> wraps workers with a Promise-based RPC so you call worker functions like they're local.",
        howItWorks: [
          "Main thread creates Worker: new Worker('worker.js')",
          "Worker runs in separate thread — cannot touch DOM",
          "Communication via postMessage — messages are copied (structured clone)",
          "Transferable objects (ArrayBuffer, ImageBitmap) move ownership with zero copy",
          "Comlink exposes worker functions as async proxies",
          "SharedWorker allows multiple tabs to share one worker instance",
        ],
        keyConcepts: [
          "<strong>Dedicated Worker</strong> — One tab; most common",
          "<strong>Shared Worker</strong> — Multiple tabs of same origin share",
          "<strong>Transferable objects</strong> — Zero-copy ArrayBuffer transfer",
          "<strong>Comlink</strong> — Promise RPC over postMessage",
          "<strong>OffscreenCanvas</strong> — Render canvas in worker thread",
        ],
        realWorld:
          "Photoshop web uses workers for image processing. Figma's renderer runs in a worker. Chrome's docs use comlink for search indexing.",
        tradeoffs: {
          pros: ["Unblocks main thread → smooth UI", "Harness multi-core CPUs", "Comlink makes API ergonomic"],
          cons: ["postMessage serialization cost", "No DOM access", "Bundler config can be tricky (Vite ?worker syntax)"],
        },
        codeExample: `// worker.ts — heavy CPU work
export function mandelbrot(width: number, height: number): Float32Array {
  const data = new Float32Array(width * height);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      // ... escape-time computation ...
    }
  return data;
}

// main.ts — via Comlink
import * as Comlink from "comlink";
const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
const api = Comlink.wrap<typeof import("./worker")>(worker);

async function render() {
  // Looks like a local call — actually runs on worker thread
  const data = await api.mandelbrot(800, 600);
  drawToCanvas(data);
}

// Vanilla: worker.postMessage(data, [data.buffer]); // transfer ownership`,
        interviewTips: [
          "Explain transferable objects avoid copy cost",
          "Mention Comlink as the ergonomic layer",
          "Know SharedWorkers serve multiple tabs (e.g., one WebSocket connection)",
        ],
      },
    },
    {
      id: "service-workers",
      title: "Service Workers & PWA",
      icon: "🛡️",
      description: "Offline, caching, background sync, push notifications.",
      tags: ["PWA", "Service Worker", "Offline"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>Service Worker</strong> is a programmable proxy between the browser and network, running in a separate thread. It intercepts <strong>fetch events</strong> to serve cached responses (offline), handles <strong>push events</strong> for notifications, and <strong>background sync</strong> retries failed requests. It's the engine behind <strong>PWAs</strong>.",
        howItWorks: [
          "Register SW: navigator.serviceWorker.register('/sw.js')",
          "Browser installs SW → caches key assets (install event)",
          "On activation, old SWs are cleaned up",
          "SW intercepts all fetch events for its scope",
          "Cache strategies: cache-first, network-first, stale-while-revalidate",
          "Push events wake SW even when tab closed → show notifications",
        ],
        keyConcepts: [
          "<strong>Lifecycle</strong> — install → activate → fetch/push/sync events",
          "<strong>Cache API</strong> — Key-value store of Response objects",
          "<strong>Cache strategies</strong> — cache-first, network-first, SWR",
          "<strong>Background Sync</strong> — Retry failed requests when online",
          "<strong>Push API</strong> — Server sends push → SW shows notification",
        ],
        realWorld:
          "Twitter/X, Pinterest, and Uber are installable PWAs. Workbox (Google) is the standard SW helper library. Starbucks PWA works offline for ordering.",
        tradeoffs: {
          pros: ["True offline support", "Background sync & push notifications", "Serves from cache = instant loads"],
          cons: ["HTTPS required (except localhost)", "Cache invalidation is hard", "SW updates can be slow to activate"],
        },
        codeExample: `// sw.js
const CACHE = "v3";
const ASSETS = ["/", "/app.js", "/styles.css"];

self.addEventListener("install", (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))),
);

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request).then((res) => {
        // Stale-while-revalidate: update cache in background
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      });
      return cached || network; // fallback to network
    }),
  );
});

// Push notification
self.addEventListener("push", (e) => {
  e.waitUntil(
    self.registration.showNotification("New message", {
      body: e.data?.text(),
    }),
  );
});`,
        interviewTips: [
          "Know the SW lifecycle: install, activate, fetch",
          "Explain cache-first vs network-first vs SWR trade-offs",
          "Mention Workbox as Google's standard library",
        ],
      },
    },
    {
      id: "webassembly",
      title: "WebAssembly (WASM)",
      icon: "⚡",
      description: "Near-native speed in the browser from Rust, C++, Go.",
      tags: ["WASM", "Performance", "Cross-platform"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>WebAssembly</strong> is a low-level binary instruction format that runs at <strong>near-native speed</strong> in the browser alongside JS. Languages like Rust, C++, and Go compile to WASM. It's used for compute-heavy workloads (image/video processing, games, ML) where JS is too slow, while still sandboxed for security.",
        howItWorks: [
          "Source (Rust/C++) compiled to .wasm binary via LLVM or emscripten",
          "Browser fetches & compiles WASM module (faster than JS parse)",
          "JS loads module: WebAssembly.instantiate(bytes, imports)",
          "WASM functions called from JS like regular functions",
          "Memory is a shared ArrayBuffer — JS & WASM read/write directly",
          "WASM cannot call DOM directly — JS acts as bridge",
        ],
        keyConcepts: [
          "<strong>Linear memory</strong> — WASM heap as ArrayBuffer shared with JS",
          "<strong>Sandboxed</strong> — Same origin model, no direct I/O",
          "<strong>WASI</strong> — WebAssembly System Interface (runs outside browsers too)",
          "<strong>JS bridge</strong> — WASM can't touch DOM; JS wraps calls",
          "<strong>Multi-memory & threads</strong> — Recent features enable true parallelism",
        ],
        realWorld:
          "Figma's renderer runs in WASM (C++). Photoshop web version uses WASM. Google Earth, Skia, and many image-processing libraries ship WASM.",
        tradeoffs: {
          pros: ["Near-native performance for compute", "Reuses existing C++/Rust codebases", "Cross-platform: same binary in browser & server"],
          cons: ["Larger binary than JS for small tasks", "No DOM access — JS glue needed", "Debugging & DevTools less mature"],
        },
        codeExample: `// Rust (src/lib.rs) compiled to WASM
// #[wasm_bindgen]
// pub fn mandelbrot(w: u32, h: u32) -> Vec<u8> { ... }

// TS consumer
import init, { mandelbrot } from "./pkg/mandelbrot.js";

async function main() {
  await init(); // load WASM module
  const pixels: Uint8Array = mandelbrot(800, 600); // near-native speed
  // Draw to canvas via ImageData
  const ctx = canvas.getContext("2d")!;
  const img = new ImageData(new Uint8ClampedArray(pixels), 800, 600);
  ctx.putImageData(img, 0, 0);
}
main();`,
        interviewTips: [
          "Explain why WASM is fast: binary, low-level, near-native compilation",
          "Mention the JS bridge limitation — WASM can't touch DOM directly",
          "Know WASI enables running WASM in servers/edge (Cloudflare, Spin)",
        ],
      },
    },
    {
      id: "web-components",
      title: "Web Components",
      icon: "🧩",
      description: "Custom Elements, Shadow DOM, HTML templates — native & framework-agnostic.",
      tags: ["Web Platform", "Web Components", "Shadow DOM"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Web Components</strong> are native browser APIs for creating reusable UI elements: <strong>Custom Elements</strong> (define new HTML tags), <strong>Shadow DOM</strong> (style & DOM isolation), and <strong>HTML Templates</strong> (reusable markup). They're framework-agnostic — work in React, Vue, or plain HTML.",
        howItWorks: [
          "Define class extending HTMLElement: customElements.define('my-tag', class)",
          "Lifecycle callbacks: connectedCallback, disconnectedCallback, attributeChangedCallback",
          "Attach Shadow DOM: this.attachShadow({mode:'open'}) for style isolation",
          "Render template content into shadow root",
          "Styles in shadow root don't leak out; external styles don't leak in",
          "Use as <my-tag> anywhere — even inside React/Vue",
        ],
        keyConcepts: [
          "<strong>Custom Elements</strong> — Define <my-tag> with JS class",
          "<strong>Shadow DOM</strong> — Encapsulated DOM + styles",
          "<strong>HTML Templates</strong> — <template> + slots for reusable markup",
          "<strong>open vs closed</strong> — Shadow root accessibility from outside",
          "<strong>Constructable Stylesheets</strong> — Shared stylesheets across shadow roots",
        ],
        realWorld:
          "GitHub uses Web Components for time/relative-time elements. YouTube, Twitter embeds. Lit (Google) is the most popular helper library. Adobe's Spectrum uses them.",
        tradeoffs: {
          pros: ["Framework-agnostic — outlives any framework", "True style encapsulation via Shadow DOM", "Works everywhere with native support"],
          cons: ["Verbose vs React component", "SSR is tricky (Declarative Shadow DOM)", "Styling inside shadow root has gotchas (CSS custom props leak)"],
        },
        codeExample: `class MyTooltip extends HTMLElement {
  static observedAttributes = ["text"];
  private root!: ShadowRoot;

  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.root.innerHTML = \`
      <style>
        :host { position: relative; display: inline-block; }
        .tip { opacity: 0; transition: opacity 0.2s; }
        :host(:hover) .tip { opacity: 1; }
      </style>
      <slot></slot>
      <span class="tip">\${this.getAttribute("text")}</span>
    \`;
  }

  attributeChangedCallback(name: string, _: string, val: string) {
    if (name === "text") {
      this.root.querySelector(".tip")!.textContent = val;
    }
  }
}
customElements.define("my-tooltip", MyTooltip);

// Use anywhere — even inside React: <my-tooltip text="Hello">Hover</my-tooltip>`,
        interviewTips: [
          "Explain Shadow DOM provides style & DOM isolation",
          "Mention Declarative Shadow DOM for SSR (with caveats)",
          "Web Components shine for design systems shared across framework teams",
        ],
      },
    },
    {
      id: "micro-frontends",
      title: "Micro-Frontends",
      icon: "🧱",
      description: "Module Federation, single-spa, iframes — split frontend across teams.",
      tags: ["Architecture", "Micro-Frontends", "Module Federation"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Micro-Frontends</strong> split a large UI into independently deployable pieces owned by different teams — like microservices for frontend. Approaches: <strong>iframes</strong> (simplest, isolated), <strong>single-spa</strong> (orchestrates multiple frameworks), and <strong>Module Federation</strong> (Webpack 5 / Vite — share live modules at runtime across builds).",
        howItWorks: [
          "Each team owns a sub-app (e.g., checkout, catalog) with own build & deploy",
          "Container app loads remote modules at runtime via Module Federation",
          "Remote exposes: expose './Widget' → consumer imports remote/Widget",
          "Shared dependencies (React) deduplicated across remotes",
          "single-spa mounts/unmounts apps on route change",
          "iframes provide hard isolation but with UX limitations",
        ],
        keyConcepts: [
          "<strong>Module Federation</strong> — Webpack 5 runtime module sharing",
          "<strong>Host/Remote</strong> — Container loads exposed modules from remotes",
          "<strong>single-spa</strong> — Lifecycle-based mounting of independent apps",
          "<strong>iframe isolation</strong> — Total isolation but poor UX (focus, modals)",
          "<strong>Shared dependencies</strong> — Single React copy shared across remotes",
        ],
        realWorld:
          "Shopify, IKEA, Spotify use micro-frontends. Module Federation is the modern approach (Vite plugin & native federation emerging).",
        tradeoffs: {
          pros: ["Independent teams & deploys", "Mix frameworks (migration path)", "Scales organizations"],
          cons: ["Bundle duplication if shared deps not configured", "UX complexity (cross-app nav, modals)", "Operational & tooling complexity"],
        },
        codeExample: `// webpack.config.js — Remote (exposes widget)
new ModuleFederationPlugin({
  name: "checkout",
  filename: "remoteEntry.js",
  exposes: { "./Cart": "./src/Cart" },
  shared: { react: { singleton: true }, "react-dom": { singleton: true } },
});

// Host — consumes remote at runtime
new ModuleFederationPlugin({
  remotes: { checkout: "checkout@/cdn/remoteEntry.js" },
  shared: { react: { singleton: true } },
});

// Host loads remote component
import Cart from "checkout/Cart";
<Cart items={items} onCheckout={...} />

// single-spa — register apps by route
registerApplication({
  name: "@org/cart",
  app: () => import("@org/cart"),
  activeWhen: "/checkout",
});`,
        interviewTips: [
          "Compare iframe (simplest isolation, worst UX) vs Module Federation (best ergonomics)",
          "Mention shared singleton deps to avoid duplicate React",
          "Discuss when NOT to use — single team shouldn't adopt MFE",
        ],
      },
    },
    {
      id: "progressive-web-apps",
      title: "Progressive Web Apps (PWA)",
      icon: "📱",
      description: "Installable, offline-capable web apps with push notifications.",
      tags: ["PWA", "Service Worker", "Installable"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>PWAs</strong> are web apps that feel native: installable to home screen, work offline via service worker, send push notifications, and integrate with device features. They're built from a <strong>web manifest</strong>, a <strong>service worker</strong>, and HTTPS. iOS, Android, and desktop all support installation.",
        howItWorks: [
          "Add manifest.json: name, icons, theme_color, display:standalone",
          "Link manifest in HTML: <link rel='manifest' href='/manifest.json'>",
          "Register service worker that caches assets for offline",
          "Browser shows 'Add to Home Screen' prompt when criteria met",
          "Installed PWA runs in standalone window (no browser chrome)",
          "Push notifications work even when app closed (via service worker)",
        ],
        keyConcepts: [
          "<strong>Web App Manifest</strong> — JSON describing install metadata",
          "<strong>Service Worker</strong> — Provides offline + push (required for PWA)",
          "<strong>display: standalone</strong> — Hide browser UI when installed",
          "<strong>beforeinstallprompt</strong> — Custom install button event",
          "<strong>HTTPS required</strong> — Service workers need secure context",
        ],
        realWorld:
          "Twitter Lite, Pinterest, Starbucks, Uber m.uber are PWAs. Microsoft Teams runs as PWA on desktop. next-pwa simplifies Next.js PWA setup.",
        tradeoffs: {
          pros: ["One codebase, installable everywhere", "Offline + push like native", "No app store review"],
          cons: ["iOS push limited until recently", "Less hardware access than native", "Discovery via app store missing"],
        },
        codeExample: `// public/manifest.json
{
  "name": "My App",
  "short_name": "MyApp",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#2563eb"
}`,
        interviewTips: [
          "List the three PWA requirements: manifest, service worker, HTTPS",
          "Mention iOS still has some PWA gaps (push only in 16.4+)",
          "Know beforeinstallprompt lets you trigger install from a button",
        ],
      },
    },
    {
      id: "web-storage",
      title: "Web Storage: localStorage, IndexedDB, Cookies",
      icon: "💾",
      description: "When to use each: localStorage, sessionStorage, IndexedDB, cookies, Cache API.",
      tags: ["Storage", "IndexedDB", "Cookies"],
      hasAnimation: true,
      content: {
        overview:
          "The browser has multiple stores: <strong>localStorage</strong> (small sync KV), <strong>sessionStorage</strong> (per-tab KV), <strong>IndexedDB</strong> (large async NoSQL), <strong>cookies</strong> (sent with every HTTP request), and <strong>Cache API</strong> (Response objects for service workers). Pick by size, sync/async, and whether data should travel to server.",
        howItWorks: [
          "localStorage: 5-10MB, synchronous, per-origin, survives tab close",
          "sessionStorage: same but cleared when tab closes",
          "IndexedDB: large (often >50% of disk), async, stores objects + indexes",
          "Cookies: 4KB each, sent with every matching HTTP request → server-readable",
          "Cache API: stores Response objects, used by service workers for offline",
          "All origin-scoped; cookies have broader domain rules",
        ],
        keyConcepts: [
          "<strong>localStorage</strong> — Sync, 5MB, strings only, blocks main thread",
          "<strong>IndexedDB</strong> — Async NoSQL; transactions, indexes, large data",
          "<strong>Cookies</strong> — HTTP-only option, SameSite, Secure, HttpOnly flags",
          "<strong>Cache API</strong> — For service worker offline caches",
          "<strong>Storage quota</strong> — Per-origin; navigator.storage.estimate()",
        ],
        realWorld:
          "Auth tokens (httpOnly cookies preferred). Cart & preferences (localStorage). Offline drafts & cached API data (IndexedDB). PWAs use Cache API.",
        tradeoffs: {
          pros: ["localStorage: trivial API for small data", "IndexedDB: huge capacity + indexes", "Cookies: server-readable, works without JS"],
          cons: ["localStorage: sync = blocks main thread, 5MB cap", "IndexedDB: complex API (use idb-keyval/Dexie)", "Cookies: sent on every request = bloat"],
        },
        codeExample: `// localStorage — small sync data (preferences, theme)
localStorage.setItem("theme", "dark");
const theme = localStorage.getItem("theme");

// IndexedDB — large async via idb-keyval (thin wrapper)
import { get, set } from "idb-keyval";
await set("draft-post", longText); // any structured value
const draft = await get("draft-post");

// Cookies — httpOnly set by server, readable by JS only if not HttpOnly
// Server (Express): res.cookie("session", token, {
//   httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400_000
// });

// Cache API (in service worker)
const cache = await caches.open("v1");
await cache.add("/api/data"); // caches a Response
const matched = await cache.match("/api/data");

// Quota check
const { usage, quota } = await navigator.storage.estimate();
console.log("Using " + usage + " of " + quota + " bytes");`,
        interviewTips: [
          "Don't store auth tokens in localStorage — XSS can steal them; use httpOnly cookies",
          "Know IndexedDB async + capacity vs localStorage sync + tiny",
          "Mention navigator.storage.persist() to prevent eviction",
        ],
      },
    },
    {
      id: "server-sent-events",
      title: "Server-Sent Events (SSE)",
      icon: "📡",
      description: "One-way streaming from server to browser via EventSource.",
      tags: ["SSE", "Streaming", "Real-time"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Server-Sent Events</strong> stream updates from server to browser over a long-lived HTTP connection. The browser uses <strong>EventSource</strong> API to subscribe; the server pushes text/event-stream chunks. SSE is one-way (server→client), simpler than WebSocket, auto-reconnects, and uses plain HTTP.",
        howItWorks: [
          "Client opens EventSource('url') — long-lived HTTP GET",
          "Server sets Content-Type: text/event-stream",
          "Server writes chunks: data: ...\\n\\n (each event followed by blank line)",
          "Browser fires onmessage on each event (or named events)",
          "Connection auto-reconnects with Last-Event-ID header for resume",
          "Close with eventSource.close()",
        ],
        keyConcepts: [
          "<strong>EventSource</strong> — Built-in browser API for SSE",
          "<strong>text/event-stream</strong> — MIME type for SSE responses",
          "<strong>Named events</strong> — event: foo lets client addEventListener('foo')",
          "<strong>Last-Event-ID</strong> — Sent on reconnect for resume",
          "<strong>HTTP/1.1 limit</strong> — Max 6 connections per origin (gone with HTTP/2)",
        ],
        realWorld:
          "ChatGPT streams responses via SSE. Twitter live updates, GitHub Actions live logs. Vercel build logs use SSE.",
        tradeoffs: {
          pros: ["Simple HTTP — no special protocol", "Auto-reconnect built in", "Works through proxies that block WS"],
          cons: ["One-way only (server→client)", "Text only (binary needs base64)", "Connection limits on HTTP/1.1"],
        },
        codeExample: `// Server (Next.js Route Handler)
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      let id = 0;
      const timer = setInterval(() => {
        // SSE wire format: id: ...\\nevent: ...\\ndata: ...\\n\\n
        const payload =
          "id: " + (id++) + "\\n" +
          "event: tick\\n" +
          "data: " + JSON.stringify({ time: Date.now() }) + "\\n\\n";
        controller.enqueue(enc.encode(payload));
      }, 1000);
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

// Client
const es = new EventSource("/api/ticks");
es.addEventListener("tick", (e) => {
  const data = JSON.parse(e.data);
  console.log(data.time);
});
es.onerror = () => es.close(); // auto-reconnects by default`,
        interviewTips: [
          "SSE is one-way — pick WebSocket for bidirectional (chat)",
          "Mention auto-reconnect & Last-Event-ID for resume",
          "SSE works great for AI token streaming (ChatGPT pattern)",
        ],
      },
    },
    {
      id: "long-polling",
      title: "Polling, Long Polling & WebSocket Comparison",
      icon: "🔁",
      description: "Short polling vs long polling vs SSE vs WebSocket.",
      tags: ["Polling", "WebSocket", "Real-time"],
      hasAnimation: true,
      content: {
        overview:
          "Real-time updates have four common strategies: <strong>short polling</strong> (request every Ns — wasteful), <strong>long polling</strong> (server holds request until data — better), <strong>SSE</strong> (server→client stream), and <strong>WebSocket</strong> (full duplex). Pick by bidirectionality, latency tolerance, and infrastructure.",
        howItWorks: [
          "Short polling: client requests every X seconds — simple, wasteful",
          "Long polling: server holds request open until update or timeout",
          "On response, client immediately opens next request (loop)",
          "SSE: one long-lived connection, server pushes events",
          "WebSocket: handshake upgrades to bidirectional TCP-like frame protocol",
          "WebSocket is the only true full-duplex option",
        ],
        keyConcepts: [
          "<strong>Short polling</strong> — setInterval + fetch; simple, latency = interval",
          "<strong>Long polling</strong> — Server holds until event; near-real-time",
          "<strong>SSE</strong> — Server→client only; auto-reconnect",
          "<strong>WebSocket</strong> — Bidirectional, low overhead, persistent",
          "<strong>Reconnection</strong> — Every strategy needs a resume plan",
        ],
        realWorld:
          "Gmail used long polling pre-WebSocket. Slack & Discord use WebSocket. ChatGPT uses SSE for token streaming. Most legacy dashboards use short polling.",
        tradeoffs: {
          pros: ["Short polling: trivial to implement", "Long polling: works through any proxy", "WebSocket: most efficient for high-frequency bidirectional"],
          cons: ["Short polling: wastes bandwidth, high latency", "Long polling: header overhead, holds connections", "WebSocket: infrastructure & reconnection complexity"],
        },
        codeExample: `// Short polling — request every 5s
setInterval(() => fetch("/api/messages").then(r => r.json()).then(render), 5000);

// Long polling — re-request immediately after response
async function poll() {
  const res = await fetch("/api/messages?since=" + lastId);
  const msgs = await res.json();
  render(msgs);
  poll(); // immediately reconnect
}
poll();

// SSE — one connection, server pushes
const es = new EventSource("/api/messages");
es.onmessage = (e) => render(JSON.parse(e.data));

// WebSocket — full duplex
const ws = new WebSocket("wss://chat.example.com");
ws.onmessage = (e) => render(JSON.parse(e.data));
ws.onclose = () => reconnect(ws); // custom reconnect logic
ws.send(JSON.stringify({ text: "hi" })); // send to server`,
        interviewTips: [
          "Pick by bidirectionality: one-way → SSE; two-way → WebSocket",
          "Mention long polling still useful when proxies block WS",
          "Know WebSocket handshake upgrades HTTP to ws:// protocol",
        ],
      },
    },
    {
      id: "webrtc",
      title: "WebRTC",
      icon: "📹",
      description: "P2P video, audio, and data in the browser — STUN, TURN, ICE.",
      tags: ["WebRTC", "P2P", "Streaming"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>WebRTC</strong> enables peer-to-peer audio, video, and data channels between browsers without server relay (after setup). It uses <strong>ICE</strong> to find connectivity candidates, <strong>STUN</strong> servers to discover public IPs, and <strong>TURN</strong> servers as relays when direct connection fails. A signaling server (any transport) exchanges SDP offers/answers.",
        howItWorks: [
          "Each peer creates RTCPeerConnection with STUN/TURN config",
          "Caller creates an SDP offer → sent via signaling server",
          "Callee answers with SDP answer → sent back via signaling",
          "ICE candidates (network paths) exchanged via signaling",
          "Peers connect directly (or via TURN relay if NAT blocks)",
          "Media streams flow P2P; data channels send arbitrary bytes",
        ],
        keyConcepts: [
          "<strong>SDP (Session Description Protocol)</strong> — Codec/media description exchanged",
          "<strong>ICE</strong> — Framework to find best connection path",
          "<strong>STUN</strong> — Helps peer discover its public IP (cheap, free servers exist)",
          "<strong>TURN</strong> — Relays traffic when direct P2P fails (costs bandwidth)",
          "<strong>DataChannel</strong> — Bidirectional binary/text P2P channel (low latency)",
        ],
        realWorld:
          "Google Meet, Zoom web, Discord voice, Twitch. Cloudflare Stream & LiveKit host WebRTC infra. Many multiplayer games use DataChannels.",
        tradeoffs: {
          pros: ["Low latency P2P media", "No server bandwidth for media", "DataChannels near-game latency"],
          cons: ["Complex signaling & ICE debugging", "TURN costs money for symmetric NAT cases", "SFU needed for multi-party (mesh doesn't scale)"],
        },
        codeExample: `// Caller side — sets up connection + sends offer
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "turn:turn.example.com", username: "u", credential: "p" },
  ],
});

// Add local camera
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
stream.getTracks().forEach((t) => pc.addTrack(t, stream));

// Send ICE candidates to remote peer via signaling (WebSocket/SSE)
pc.onicecandidate = (e) => {
  if (e.candidate) signaling.send({ candidate: e.candidate });
};

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signaling.send({ sdp: offer }); // remote peer answers

// DataChannel — P2P binary channel
const dc = pc.createDataChannel("chat");
dc.onopen = () => dc.send("Hello peer!");
dc.onmessage = (e) => console.log("Got:", e.data);`,
        interviewTips: [
          "Explain STUN vs TURN: STUN reveals IP, TURN relays when blocked",
          "Signaling is NOT part of WebRTC — you pick (WS, HTTP, etc.)",
          "Multi-party needs an SFU (Selective Forwarding Unit), not mesh P2P",
        ],
      },
    },
    {
      id: "webtransport-http3",
      title: "HTTP/3, QUIC & WebTransport",
      icon: "🚄",
      description: "QUIC over UDP, HTTP/3 multiplexing, WebTransport for client-server streaming.",
      tags: ["HTTP/3", "QUIC", "WebTransport"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>HTTP/3</strong> runs over <strong>QUIC</strong>, a UDP-based encrypted transport that eliminates head-of-line blocking and speeds up connection setup (1-RTT, even 0-RTT resume). <strong>WebTransport</strong> builds on HTTP/3 to provide client-server bidirectional streams and datagrams with lower latency than WebSocket.",
        howItWorks: [
          "QUIC runs over UDP with TLS 1.3 built in — fast handshake",
          "Each stream is independent — losing one doesn't block others",
          "Connection migration: IP changes (Wi-Fi→cellular) don't break QUIC",
          "HTTP/3 maps HTTP semantics onto QUIC streams",
          "WebTransport opens a session over HTTP/3 — bi-directional streams + datagrams",
          "Datagrams are unreliable & unordered — like UDP, low latency",
        ],
        keyConcepts: [
          "<strong>QUIC</strong> — UDP + TLS 1.3 + multiplexed streams",
          "<strong>0-RTT</strong> — Resume session with cached keys, no round-trip",
          "<strong>No head-of-line blocking</strong> — Lost packet doesn't block other streams",
          "<strong>WebTransport</strong> — Bi-directional streams + unreliable datagrams over HTTP/3",
          "<strong>Connection migration</strong> — Survives network changes (mobile handoff)",
        ],
        realWorld:
          "Google & Cloudflare serve HTTP/3 by default. WebTransport used in cloud gaming & live streaming. HTTP/3 is in all major browsers (Chrome, Firefox, Safari).",
        tradeoffs: {
          pros: ["Faster connection setup (1-RTT, 0-RTT resume)", "No HOL blocking across streams", "Survives network changes"],
          cons: ["UDP may be blocked on some networks/corporate firewalls", "CPU cost — QUIC is in user-space not kernel", "WebTransport browser support still maturing"],
        },
        codeExample: `// WebTransport client — bidirectional, low-latency
async function connect() {
  const transport = new WebTransport("https://api.example.com/webtransport");
  await transport.ready; // session established (0-RTT possible)

  // Send a datagram (unreliable, low latency — great for game inputs)
  const dg = transport.datagrams;
  const w = dg.writable.getWriter();
  w.write(new TextEncoder().encode("ping"));

  // Open a bidirectional stream (reliable, ordered)
  const bidi = await transport.createBidirectionalStream();
  const writer = bidi.writable.getWriter();
  writer.write(new TextEncoder().encode("frame-1"));
  for await (const chunk of bidi.readable) {
    console.log("server:", new TextDecoder().decode(chunk));
  }
  transport.close();
}`,
        interviewTips: [
          "QUIC over UDP avoids TCP head-of-line blocking",
          "Mention 0-RTT resume — huge perf win for repeat visits",
          "WebTransport = WebSocket successor with datagrams + streams",
        ],
      },
    },

    // ───────────────────────── Performance & Optimization ─────────────────────────
    {
      id: "core-web-vitals",
      title: "Core Web Vitals",
      icon: "📊",
      description: "LCP, INP, CLS — Google's ranking signals.",
      tags: ["Performance", "CWV", "SEO"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Core Web Vitals</strong> are Google's three metrics for UX quality: <strong>LCP</strong> (Largest Contentful Paint — loading, target <2.5s), <strong>INP</strong> (Interaction to Next Paint — interactivity, target <200ms), and <strong>CLS</strong> (Cumulative Layout Shift — visual stability, target <0.1). They affect Google search ranking.",
        howItWorks: [
          "LCP: time until largest visible element (image/heading) renders",
          "INP: max latency across all interactions during page lifetime (replaced FID 2024)",
          "CLS: sum of layout shift scores (elements jumping after load)",
          "Field data: Chrome UX Report collects real-user metrics (origin-level)",
          "Lab data: Lighthouse simulates — useful for local testing",
          "Search Console shows CWV per page & URLs failing",
        ],
        keyConcepts: [
          "<strong>LCP</strong> — Largest Contentful Paint; optimize hero image & fonts",
          "<strong>INP</strong> — Interaction to Next Paint; long tasks block it",
          "<strong>CLS</strong> — Cumulative Layout Shift; reserve space for ads/images",
          "<strong>Field vs Lab</strong> — Real users vs simulated — both matter",
          "<strong>web-vitals library</strong> — onCLS, onLCP, onINP report to analytics",
        ],
        realWorld:
          "Vercel Speed Insights, Cloudflare Real User Monitoring, Akamai mPulse all track CWV. Google Search Console flags pages failing CWV.",
        tradeoffs: {
          pros: ["Quantifies UX in three numbers", "Affects search ranking → ROI clear", "Library makes measurement easy"],
          cons: ["Field data lags 28 days (Chrome UX Report)", "Lab ≠ real users — Lighthouse can mislead", "Optimizing one metric may hurt another"],
        },
        codeExample: `import { onCLS, onLCP, onINP, onFCP, onTTFB } from "web-vitals";

function send(metric: any) {
  // Send to analytics — beacon doesn't block unload
  navigator.sendBeacon(
    "/api/vitals",
    JSON.stringify({
      name: metric.name,
      value: metric.value,
      id: metric.id,
    }),
  );
}

onCLS(send);  // Cumulative Layout Shift
onLCP(send);  // Largest Contentful Paint
onINP(send);  // Interaction to Next Paint (replaced FID in 2024)
onFCP(send);  // First Contentful Paint
onTTFB(send); // Time to First Byte

// Targets: LCP < 2500ms | INP < 200ms | CLS < 0.1 — Good`,
        interviewTips: [
          "List the three: LCP, INP (replaced FID), CLS + their targets",
          "Know field data comes from CrUX — lab ≠ real users",
          "Common fixes: image optimization (LCP), defer long tasks (INP), reserve dims (CLS)",
        ],
      },
    },
    {
      id: "bundle-size-tree-shaking",
      title: "Bundling, Tree Shaking & Code Splitting",
      icon: "📦",
      description: "Webpack/Vite bundling, ESM tree shaking, code splitting, dynamic imports.",
      tags: ["Bundling", "Tree Shaking", "Vite"],
      hasAnimation: true,
      content: {
        overview:
          "Bundlers (Webpack, Vite, Rollup, esbuild) combine modules into optimized bundles. <strong>Tree shaking</strong> removes unused exports (ESM only, must be side-effect-free). <strong>Code splitting</strong> breaks the bundle into smaller chunks loaded on demand. <strong>Dynamic imports</strong> (import()) create split points loaded lazily.",
        howItWorks: [
          "ESM imports form a static graph — bundler analyzes it",
          "Tree shaking: exports not imported anywhere are dropped (if sideEffects:false)",
          "Code splitting: dynamic import('...') creates a separate chunk",
          "Commons chunking: shared modules across entry points extracted",
          "Minification (Terser/esbuild) removes dead code & shortens identifiers",
          "Output: hashed filenames for long-term caching",
        ],
        keyConcepts: [
          "<strong>ESM static analysis</strong> — Required for tree shaking (CommonJS can't)",
          "<strong>sideEffects: false</strong> — package.json flag enabling aggressive shake",
          "<strong>Dynamic import</strong> — import('./mod') → split chunk loaded lazily",
          "<strong>Webpack vs Vite</strong> — Vite uses native ESM in dev, Rollup for build",
          "<strong>Bundle analysis</strong> — webpack-bundle-analyzer / source-map-explorer",
        ],
        realWorld:
          "Vite is the modern default for new apps. Webpack still powers most enterprise. esbuild is fastest bundler. Lodash imports without / per-method are a classic tree-shake footgun.",
        tradeoffs: {
          pros: ["Smaller bundles = faster load", "Code splitting trims initial payload", "Tree shaking eliminates dead library code"],
          cons: ["Bundlers are complex config", "Wrong imports (e.g., lodash) bloat bundles silently", "Too many chunks hurt HTTP/1.1 (ok with HTTP/2)"],
        },
        codeExample: `// Tree-shake friendly: named imports from ESM
import { debounce } from "lodash-es"; // ✅ tree-shakes to one function
import _ from "lodash";               // ❌ ships entire lodash (~70KB)

// package.json — enable aggressive tree shaking
// { "sideEffects": false }   // or list files with side effects

// Dynamic import — creates a split chunk
async function showChart() {
  const { Chart } = await import("recharts"); // loaded on demand
  return <Chart data={data} />;
}

// React.lazy + Suspense — route-based splitting
const Settings = lazy(() => import("./Settings"));
<Suspense fallback={<Spinner />}><Settings /></Suspense>;

// Vite config: manualChunks for vendor splitting
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: { react: ["react", "react-dom"], vendor: ["zod"] },
      },
    },
  },
});`,
        interviewTips: [
          "Explain why ESM enables tree shaking (static imports vs CommonJS dynamic)",
          "Mention sideEffects: false in package.json",
          "Know import() and React.lazy for code splitting",
        ],
      },
    },
    {
      id: "lazy-loading-code-splitting",
      title: "Lazy Loading & Code Splitting",
      icon: "✂️",
      description: "React.lazy, Suspense, route splitting, prefetch.",
      tags: ["Performance", "React.lazy", "Code Splitting"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Lazy loading</strong> delays loading code or assets until needed — shrinking the initial bundle. In React, <strong>React.lazy</strong> + <strong>Suspense</strong> split components into separate chunks loaded on first render. Route-based splitting is the highest-leverage form. <strong>Prefetching</strong> loads likely-needed chunks during idle time.",
        howItWorks: [
          "React.lazy(() => import('./Comp')) creates a deferred component",
          "First render throws a promise → Suspense shows fallback",
          "Chunk downloads → component mounts",
          "Next.js auto-splits per route (file-based)",
          "Link prefetching: next/link loads route chunk on hover/viewport",
          "Webpack magic comments customize chunk name & prefetch",
        ],
        keyConcepts: [
          "<strong>React.lazy</strong> — Wraps dynamic import in a component",
          "<strong>Suspense</strong> — Shows fallback while lazy component loads",
          "<strong>Route splitting</strong> — One chunk per route (highest ROI)",
          "<strong>Prefetch</strong> — Load chunks before user clicks (hover/visible)",
          "<strong>webpackPrefetch</strong> — Magic comment to hint browser",
        ],
        realWorld:
          "Next.js auto-codesplits routes. Vite does too. LinkedIn & Twitter lazy-load below-the-fold sections. Most SaaS dashboards split admin & user routes.",
        tradeoffs: {
          pros: ["Cuts initial JS bundle dramatically", "Faster first load → better LCP", "Per-route chunks = parallel loading"],
          cons: ["First click has loading delay (mitigate via prefetch)", "More HTTP requests (HTTP/2 handles this)", "Waterfall risk with nested lazy"],
        },
        codeExample: `import { lazy, Suspense, useEffect, useRef, useState } from "react";

// Route-based split — each route is its own chunk
const Dashboard = lazy(() => import("./Dashboard"));
const Settings = lazy(() => import("./Settings"));

export function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {route === "/dashboard" && <Dashboard />}
      {route === "/settings" && <Settings />}
    </Suspense>
  );
}

// Prefetch on hover (Vite/Webpack magic comment)
const Admin = lazy(() =>
  import(/* webpackPrefetch: true, webpackChunkName: "admin" */ "./Admin"),
);

// Next.js — automatic route split + link prefetch on hover
import Link from "next/link";
<Link href="/dashboard" prefetch>Go to dashboard</Link>;

// Below-the-fold lazy mount with IntersectionObserver
function LazyMount({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true));
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{show && children}</div>;
}`,
        interviewTips: [
          "Route-level splitting is the biggest win — start there",
          "Prefetch on hover/visible to mask latency",
          "Mention Next.js auto-splits & prefetches links",
        ],
      },
    },
    {
      id: "image-optimization",
      title: "Image Optimization",
      icon: "🖼️",
      description: "WebP/AVIF, srcset, lazy load, Next.js Image, CDN transforms.",
      tags: ["Images", "Performance", "CDN"],
      hasAnimation: true,
      content: {
        overview:
          "Images are usually the heaviest page asset. Optimize with <strong>modern formats</strong> (WebP, AVIF — ~50% smaller than JPEG), <strong>responsive srcset</strong> (right size per device), <strong>lazy loading</strong> (loading=lazy), proper <strong>sizing</strong> (avoid sending 4000px to mobile), and CDN on-the-fly transforms. Next.js Image handles all this automatically.",
        howItWorks: [
          "Encode as AVIF (best) or WebP (universal) — single file, modern browsers",
          "Generate multiple sizes; browser picks via srcset",
          "loading='lazy' defers offscreen images",
          "Set width/height (or aspect-ratio) to prevent CLS",
          "CDN transforms on URL params (?w=400&q=80) — cache variants",
          "<picture> element with source for art direction / format fallback",
        ],
        keyConcepts: [
          "<strong>AVIF</strong> — Best compression, 2020+ browsers",
          "<strong>WebP</strong> — Universal modern format",
          "<strong>srcset + sizes</strong> — Browser picks optimal image",
          "<strong>loading='lazy'</strong> — Defer offscreen images",
          "<strong>Next.js Image</strong> — Auto-resize, format, lazy, blur placeholder",
        ],
        realWorld:
          "Vercel Image Optimization, Cloudflare Images, Imgix, Cloudinary. Netflix, Spotify all use AVIF/WebP. Next.js Image is the React ecosystem standard.",
        tradeoffs: {
          pros: ["AVIF/WebP cut bytes ~50% vs JPEG", "srcset sends right size to each device", "Lazy load saves bandwidth on long pages"],
          cons: ["AVIF encoding is CPU-heavy (server-side)", "Generating variants needs tooling", "<picture> markup is verbose"],
        },
        codeExample: `// Native responsive image
<img
  src="/hero-800.jpg"
  srcSet="/hero-400.jpg 400w, /hero-800.jpg 800w, /hero-1600.jpg 1600w"
  sizes="(max-width: 600px) 400px, 800px"
  width="800" height="600" /* prevents CLS */
  loading="lazy"
  decoding="async"
  alt="Hero"
/>

// <picture> for format fallback & art direction
<picture>
  <source type="image/avif" srcSet="/hero.avif" />
  <source type="image/webp" srcSet="/hero.webp" />
  <img src="/hero.jpg" alt="Hero" width={800} height={600} />
</picture>

// Next.js Image — handles all of the above automatically
import Image from "next/image";
<Image src="/hero.jpg" alt="Hero" width={800} height={600} priority /* LCP */ />`,
        interviewTips: [
          "Know AVIF > WebP > JPEG in compression ratio",
          "Always set width/height or aspect-ratio to avoid CLS",
          "Next.js Image handles resize, format negotiation, lazy — use priority for LCP",
        ],
      },
    },
    {
      id: "font-optimization",
      title: "Font Optimization",
      icon: "🔤",
      description: "FOUT/FOIT, font-display, woff2, variable fonts, preload.",
      tags: ["Fonts", "Performance", "Typography"],
      hasAnimation: true,
      content: {
        overview:
          "Fonts block text render. Without optimization you get <strong>FOIT</strong> (Flash of Invisible Text) — blank text until font loads. Use <strong>font-display: swap</strong> for <strong>FOUT</strong> (show fallback immediately), <strong>woff2</strong> (best compression), <strong>preload</strong> critical fonts, and <strong>variable fonts</strong> (one file, many weights).",
        howItWorks: [
          "Browser parses HTML, sees @font-face, starts font download",
          "font-display: swap → fallback shown immediately, swap when ready (FOUT)",
          "font-display: block → invisible up to 3s, then fallback (FOIT)",
          "preload key fonts: <link rel='preload' as='font'>",
          "Self-host woff2 (or use next/font) to skip Google Fonts redirect chain",
          "Variable fonts: single file covers weight 100-900",
        ],
        keyConcepts: [
          "<strong>FOIT</strong> — Flash of Invisible Text (block period)",
          "<strong>FOUT</strong> — Flash of Unstyled Text (swap immediately)",
          "<strong>font-display</strong> — auto/swap/block/fallback/optional",
          "<strong>woff2</strong> — ~30% smaller than woff, Brotli-compressed",
          "<strong>Variable fonts</strong> — One file, continuous weight axis",
          "<strong>size-adjust</strong> — Match fallback metrics to web font to reduce shift",
        ],
        realWorld:
          "next/font (Vercel) optimizes automatically — self-hosts, no layout shift. Stripe, Linear, Vercel self-host variable fonts. Avoid Google Fonts <link> for performance.",
        tradeoffs: {
          pros: ["FOUT shows text instantly — better UX", "woff2 is small & universal", "Variable fonts cut multiple weight files to one"],
          cons: ["FOIT looks cleaner but blocks — pick FOUT for perf", "Self-hosting font requires setup", "Variable fonts larger than single weight"],
        },
        codeExample: `/* font-display: swap = FOUT (text visible, swap when ready) */
@font-face {
  font-family: "Inter";
  src: url("/fonts/inter.woff2") format("woff2-variations");
  font-weight: 100 900; /* variable font range */
  font-display: swap;
  size-adjust: 100%; /* tune fallback metrics */
}`,
        interviewTips: [
          "Pick swap (FOUT) over block (FOIT) for performance",
          "Mention next/font eliminates Google Fonts redirect cost",
          "Preload only critical fonts (LCP hero font) — not all",
        ],
      },
    },
    {
      id: "critical-rendering-path",
      title: "Critical Rendering Path",
      icon: "🛤️",
      description: "DOM → CSSOM → Render Tree → Layout → Paint → Composite.",
      tags: ["Browser", "Rendering", "Performance"],
      hasAnimation: true,
      content: {
        overview:
          "The browser transforms HTML/CSS/JS into pixels through the <strong>Critical Rendering Path</strong>: parse HTML → <strong>DOM</strong>, parse CSS → <strong>CSSOM</strong>, combine into <strong>Render Tree</strong>, run <strong>Layout</strong> (compute geometry), <strong>Paint</strong> (fill pixels), <strong>Composite</strong> (combine layers). CSS & render-blocking JS delay First Paint.",
        howItWorks: [
          "HTML parser builds DOM tree incrementally",
          "CSS parser builds CSSOM (all rules must load — render blocking)",
          "DOM + CSSOM → Render Tree (only visible nodes)",
          "Layout: compute x/y/w/h for each render tree node (reflow)",
          "Paint: fill pixels for each layer",
          "Composite: GPU combines layers → final screen",
          "JS can interrupt: parser-blocking scripts wait for download+exec",
        ],
        keyConcepts: [
          "<strong>Render-blocking CSS</strong> — All CSS must load before First Paint",
          "<strong>Parser-blocking JS</strong> — <script> without defer/async block HTML parse",
          "<strong>Layout/Reflow</strong> — Geometry recalculation (expensive)",
          "<strong>Repaint</strong> — Pixel recalculation without geometry change",
          "<strong>Composite</strong> — GPU combines layers (cheap — animate transform)",
        ],
        realWorld:
          "Inline critical CSS for above-the-fold, defer the rest. Load scripts with defer. Lighthouse audits the CRP. WebPageTest shows waterfall of DOM/CSSOM/First Paint.",
        tradeoffs: {
          pros: ["Understanding CRP lets you cut First Paint time", "defer/async unblock HTML parse", "Animating only transform/opacity skips layout/paint"],
          cons: ["Inlining CSS bloats HTML cache", "Async scripts execute in undefined order", "Layout thrashing kills perf if reads+writes interleave"],
        },
        codeExample: `<!-- Inline critical above-the-fold CSS -->
<style>
  body { font-family: system-ui; }
  .hero { height: 50vh; background: #f3f4f6; }
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="/styles.css" as="style"
      onload="this.rel='stylesheet'" />
<noscript><link rel="stylesheet" href="/styles.css" /></noscript>

<!-- Scripts: defer preserves order, async doesn't -->
<script src="/app.js" defer></script>
<script src="/analytics.js" async></script>

<!-- Resource hints to speed CRP -->
<link rel="preconnect" href="https://cdn.example.com" />
<link rel="dns-prefetch" href="https://cdn.example.com" />
<link rel="preload" href="/fonts/inter.woff2" as="font"
      type="font/woff2" crossorigin />`,
        interviewTips: [
          "Walk the path: DOM → CSSOM → Render Tree → Layout → Paint → Composite",
          "Explain why CSS is render-blocking but defer unblocks JS",
          "Mention transform/opacity skip layout & paint — composite only",
        ],
      },
    },
    {
      id: "rendering-performance",
      title: "Rendering Performance & 60fps",
      icon: "🎬",
      description: "60fps budget, requestAnimationFrame, compositing layers, layout thrashing.",
      tags: ["Performance", "60fps", "Rendering"],
      hasAnimation: true,
      content: {
        overview:
          "Smooth UI requires <strong>60fps</strong> — that's a <strong>16ms budget per frame</strong>. The main thread must do all JS, layout, paint within 16ms or frames drop. Use <strong>requestAnimationFrame</strong> for animations (synced to refresh), <strong>will-change</strong> to promote layers, avoid <strong>layout thrashing</strong> (read-then-write layout), and offload heavy work to Web Workers.",
        howItWorks: [
          "Browser refreshes ~60 times/sec → 16ms per frame budget",
          "JS runs → triggers layout if needed → paint → composite",
          "If a frame takes >16ms, that frame is dropped (jank)",
          "requestAnimationFrame schedules work right before paint",
          "Forcing layout (reading offsetWidth after writing) = layout thrashing",
          "Compositing layers (will-change/transform: translateZ) skip layout/paint",
        ],
        keyConcepts: [
          "<strong>16ms budget</strong> — All frame work must fit for 60fps",
          "<strong>Layout thrashing</strong> — Interleaved read/write forces sync layout",
          "<strong>requestAnimationFrame</strong> — Sync animation to refresh rate",
          "<strong>will-change</strong> — Hint browser to promote to own layer",
          "<strong>Long tasks</strong> — Tasks >50ms hurt INP; break up with scheduler",
        ],
        realWorld:
          "Chrome DevTools Performance tab shows frame timeline. Figma, Linear optimize for 60fps canvas. React 19's useTransition helps keep main thread responsive.",
        tradeoffs: {
          pros: ["rAF = buttery animations synced to display", "Layer promotion skips layout/paint", "Workers keep main thread free"],
          cons: ["Excessive will-change = memory bloat", "Workers have postMessage cost", "Profiler overhead skews measurements"],
        },
        codeExample: `// BAD: layout thrashing (read-write loop)
for (const el of elements) {
  const width = el.offsetWidth;        // forces layout (read)
  el.style.width = width + 10 + "px";  // invalidates layout (write)
  // next iteration's read forces sync layout → thrash
}

// GOOD: batch reads then writes
const widths = elements.map((el) => el.offsetWidth); // all reads first
elements.forEach((el, i) => (el.style.width = widths[i] + 10 + "px"));

// Animate with rAF (synced to refresh)
function animate(cb: (t: number) => void) {
  function frame(time: number) {
    cb(time);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Break up long tasks (scheduler.yield is new)
async function process(items: Item[]) {
  for (const chunk of chunkArray(items, 100)) {
    doWork(chunk);
    await (globalThis as any).scheduler?.yield?.(); // yield between chunks
  }
}`,
        interviewTips: [
          "Explain 16ms budget and what eats into it",
          "Layout thrashing: batch DOM reads, then writes",
          "Use rAF for animations — never setInterval for visuals",
        ],
      },
    },

    // ───────────────────────── Frontend Engineering ─────────────────────────
    {
      id: "frontend-testing",
      title: "Frontend Testing",
      icon: "🧪",
      description: "Jest, React Testing Library, Cypress, Playwright — unit/integration/e2e.",
      tags: ["Testing", "Jest", "Playwright"],
      hasAnimation: true,
      content: {
        overview:
          "Frontend testing spans <strong>unit</strong> (Jest/Vitest — functions/components in isolation), <strong>integration</strong> (component + interactions via React Testing Library), and <strong>e2e</strong> (Cypress/Playwright — real browser simulating user). The Testing Trophy model recommends most tests in the integration layer.",
        howItWorks: [
          "Unit: test pure functions & hooks with renderHook",
          "Integration: render components, fire events, assert DOM (RTL)",
          "Mock network with MSW (Mock Service Worker) intercepting fetch",
          "E2E: Playwright launches headless browser, executes test scenarios",
          "Visual regression: Storybook + Chromatic snapshot per component",
          "CI runs on every PR; pre-deploy runs e2e against preview URL",
        ],
        keyConcepts: [
          "<strong>Vitest</strong> — Modern Jest alternative, faster, Vite-native",
          "<strong>React Testing Library</strong> — Queries by role/text (user perspective)",
          "<strong>MSW</strong> — Mock Service Worker intercepts network in tests",
          "<strong>Playwright</strong> — Cross-browser e2e (Chromium, Firefox, WebKit)",
          "<strong>Testing Trophy</strong> — Mostly integration, fewer e2e, fewest unit",
        ],
        realWorld:
          "Vercel & Linear run Playwright on every PR. Stripe uses Cypress. Storybook + Chromatic for visual regression at Atlassian & Shopify.",
        tradeoffs: {
          pros: ["RTL tests user behavior, not implementation", "Playwright cross-browser & parallel", "MSW mocks at network edge — reusable for Storybook"],
          cons: ["E2E is slow & flaky in CI", "Snapshot tests are noisy", "High coverage ≠ good tests — behavior matters"],
        },
        codeExample: `// React Testing Library + Vitest — integration test
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { SearchBox } from "./SearchBox";

const server = setupServer(
  http.get("/api/search", () =>
    HttpResponse.json([{ id: 1, title: "Apple" }]),
  ),
);
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("shows results when typing", async () => {
  const user = userEvent.setup();
  render(<SearchBox />);
  await user.type(screen.getByRole("textbox"), "app");
  expect(await screen.findByText("Apple")).toBeInTheDocument();
});

// Playwright e2e
import { test, expect } from "@playwright/test";
test("user can log in", async ({ page }) => {
  await page.goto("/login");
  await page.fill("[name=email]", "user@example.com");
  await page.fill("[name=password]", "secret");
  await page.click("button[type=submit]");
  await expect(page).toHaveURL("/dashboard");
});`,
        interviewTips: [
          "RTL philosophy: test behavior, not internals — query by role",
          "MSW for network mocking works in tests, Storybook, dev",
          "Playwright > Cypress for cross-browser & speed",
        ],
      },
    },
    {
      id: "frontend-accessibility",
      title: "Frontend Accessibility (a11y)",
      icon: "♿",
      description: "WCAG, ARIA, semantic HTML, keyboard nav, focus management.",
      tags: ["Accessibility", "WCAG", "ARIA"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Accessibility (a11y)</strong> ensures UIs work for everyone — keyboard, screen reader, low vision. Start with <strong>semantic HTML</strong> (button, nav, main) which gives free accessibility. Add <strong>ARIA</strong> only when semantics aren't enough. Manage <strong>focus</strong> for modals/routes. Follow <strong>WCAG</strong> (A/AA/AAA) — AA is the legal bar in most jurisdictions.",
        howItWorks: [
          "Use semantic HTML: <button>, <nav>, <main>, <header> — built-in a11y",
          "Keyboard: every interactive element reachable via Tab; visible focus ring",
          "Screen readers announce via accessible name (aria-label/visible text)",
          "Modals: trap focus inside, return focus on close, ESC to dismiss",
          "Color contrast ≥ 4.5:1 for body text (WCAG AA)",
          "Test with axe-core & manual screen reader pass (NVDA/VoiceOver)",
        ],
        keyConcepts: [
          "<strong>Semantic HTML</strong> — First rule of ARIA: don't use it if native works",
          "<strong>ARIA roles/states</strong> — role, aria-label, aria-expanded, aria-hidden",
          "<strong>Focus management</strong> — Move focus into modal, restore on close",
          "<strong>Keyboard nav</strong> — Tab order, skip links, Enter/Space on buttons",
          "<strong>WCAG levels</strong> — A (basic), AA (legal target), AAA (gold)",
        ],
        realWorld:
          "Apple, Microsoft, Google invest heavily in a11y (legal requirement). Radix UI components are accessible by default. axe DevTools audits pages. Target paid $6M ADA settlement.",
        tradeoffs: {
          pros: ["Wider audience (15%+ has disability)", "Often legally required (ADA)", "Improves SEO & UX for all"],
          cons: ["ARIA misuse can worsen screen reader UX", "Custom components need careful testing", "Full compliance is time-intensive"],
        },
        codeExample: `// GOOD: semantic button with keyboard support baked in
<button onClick={save} aria-label="Save document">💾</button>

// BAD: div as button — no keyboard, no role
<div onClick={save} className="btn">💾</div>

// Accessible modal (focus trap + restore)
import { useEffect, useRef } from "react";
export function Modal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement;
    ref.current?.focus(); // move focus into modal
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      prev?.focus(); // restore focus on close
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="title"
         tabIndex={-1} ref={ref}>
      <h2 id="title">{title}</h2>
      {children}
    </div>
  );
}`,
        interviewTips: [
          "First rule of ARIA: don't use ARIA if native HTML works",
          "Modal needs: focus trap, ESC, restore focus, aria-modal",
          "Color contrast ≥ 4.5:1 body, 3:1 large text — WCAG AA",
        ],
      },
    },
    {
      id: "internationalization-i18n",
      title: "Internationalization (i18n)",
      icon: "🌍",
      description: "i18next, message format, RTL, locale, plurals.",
      tags: ["i18n", "i18next", "Localization"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Internationalization (i18n)</strong> adapts apps for multiple locales — translations, <strong>pluralization</strong>, date/number formatting (Intl API), and <strong>RTL</strong> layout for Arabic/Hebrew. Libraries like <strong>i18next</strong> & next-intl load locale bundles, interpolate variables, and handle plurals/gender. <strong>Localization (l10n)</strong> is the act of translating for a specific locale.",
        howItWorks: [
          "Detect locale: URL (/fr/), cookie, or Accept-Language header",
          "Load message bundle for locale (JSON: key → translation)",
          "t('key') returns translation; variables interpolated ({name})",
          "Pluralization: t('items', { count: 5 }) picks plural form",
          "Format dates/numbers with Intl.DateTimeFormat / NumberFormat",
          "RTL: set dir='rtl' on <html>, CSS logical properties (margin-inline)",
        ],
        keyConcepts: [
          "<strong>i18next / next-intl</strong> — React/Next.js i18n libraries",
          "<strong>ICU MessageFormat</strong> — Standard for plurals/gender/select",
          "<strong>Intl API</strong> — Native date/number/collator formatting",
          "<strong>RTL</strong> — Right-to-left layout; use logical CSS properties",
          "<strong>Locale codes</strong> — en-US, fr-FR, ar-EG (language-REGION)",
        ],
        realWorld:
          "Wikipedia, Airbnb, Netflix support 20+ locales. next-intl powers Vercel & Cal.com. Stripe dashboard is fully localized. Logical CSS properties enable RTL.",
        tradeoffs: {
          pros: ["Reach global audience", "Intl API handles locale quirks", "Logical CSS works for both LTR & RTL"],
          cons: ["Translation cost & maintenance", "Bundle size grows with locales", "RTL testing requires real Arabic/Hebrew pass"],
        },
        codeExample: `import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { useTranslation } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: {
      greeting: "Hello, {{name}}",
      items: "{{count}} item",
      items_other: "{{count}} items",
    }},
    fr: { translation: {
      greeting: "Bonjour, {{name}}",
      items: "{{count}} article",
      items_other: "{{count}} articles",
    }},
  },
  lng: "fr",
  fallbackLng: "en",
});

function Header({ count }: { count: number }) {
  const { t } = useTranslation();
  return (
    <>
      <h1>{t("greeting", { name: "Alice" })}</h1> {/* Bonjour, Alice */}
      <p>{t("items", { count })}</p>              {/* plural-aware */}
    </>
  );
}

// Native Intl formatting — no library needed
const price = new Intl.NumberFormat("fr-FR", {
  style: "currency", currency: "EUR",
}).format(99.9);
const date = new Intl.DateTimeFormat("ar-EG").format(new Date());

// RTL via logical CSS: padding-inline, margin-block-start work for both dirs
// <html dir="rtl" lang="ar">`,
        interviewTips: [
          "Distinguish i18n (architecture) from l10n (translations)",
          "Use Intl API for dates/numbers — no need for moment/locale libs",
          "Logical CSS properties (margin-inline) auto-handle RTL",
        ],
      },
    },
    {
      id: "seo-essentials",
      title: "SEO Essentials",
      icon: "🔍",
      description: "Meta tags, structured data, sitemap, robots, SSR for SEO.",
      tags: ["SEO", "Meta Tags", "Structured Data"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>SEO</strong> makes pages discoverable by search engines. Foundations: unique <strong>title</strong> & <strong>meta description</strong> per page, <strong>Open Graph</strong> tags for social sharing, <strong>structured data</strong> (schema.org JSON-LD) for rich results, <strong>sitemap.xml</strong> + <strong>robots.txt</strong> for crawling, and SSR/SSG so crawlers see content without executing JS.",
        howItWorks: [
          "Crawler fetches HTML — Googlebot renders JS but slower; SSR helps",
          "Title (~60 chars) & meta description (~155 chars) appear in results",
          "Open Graph (og:title, og:image) drives social link previews",
          "JSON-LD structured data → rich results (ratings, FAQ, breadcrumbs)",
          "sitemap.xml lists URLs; robots.txt controls crawl access",
          "Core Web Vitals affect ranking — speed matters",
        ],
        keyConcepts: [
          "<strong>title & meta description</strong> — Per page, unique, keyword-relevant",
          "<strong>Open Graph</strong> — og:title, og:image, og:description",
          "<strong>JSON-LD</strong> — Schema.org structured data for rich results",
          "<strong>sitemap.xml</strong> — All URLs for crawlers",
          "<strong>robots.txt</strong> — Allow/disallow rules; meta robots noindex",
        ],
        realWorld:
          "Next.js Metadata API generates tags from config. Vercel & Stripe invest in SEO. E-commerce uses structured data for product snippets. Wikipedia's robots.txt is famous.",
        tradeoffs: {
          pros: ["Organic traffic = free users", "SSR/SSG helps both SEO and UX", "Structured data → rich snippets boost CTR"],
          cons: ["SEO is slow (weeks/months)", "JS-rendered content ranks slower", "Meta tags need careful per-page maintenance"],
        },
        codeExample: `// Next.js App Router — Metadata API
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ACME — Build Better Apps",
  description: "ACME helps teams ship full-stack apps faster.",
  openGraph: {
    title: "ACME",
    description: "Build better apps",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "https://acme.com/" },
};

// Per-route metadata (generateMetadata overrides)
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);
  return { title: product.name + " — ACME", description: product.summary };
}

// Structured data (JSON-LD) for rich results
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      offers: { "@type": "Offer", price: product.price, priceCurrency: "USD" },
    }),
  }}
/>

// app/sitemap.ts & app/robots.ts auto-generate at build`,
        interviewTips: [
          "SSR/SSG for SEO — Googlebot JS rendering is slower & less reliable",
          "JSON-LD structured data → rich results (FAQ, product, breadcrumbs)",
          "Next.js Metadata API is the modern way (replaces next-seo)",
        ],
      },
    },
    {
      id: "frontend-security",
      title: "Frontend Security",
      icon: "🔐",
      description: "XSS, CSRF, CSP, CORS, SRI, Trusted Types, sandbox iframes.",
      tags: ["Security", "XSS", "CSP"],
      hasAnimation: true,
      content: {
        overview:
          "Frontend security defends against <strong>XSS</strong> (injecting scripts), <strong>CSRF</strong> (forging requests via cookies), and data leaks. Defenses: <strong>CSP</strong> (whitelist script sources), <strong>CORS</strong> (cross-origin fetch policy), <strong>httpOnly cookies</strong> (block JS access), <strong>SRI</strong> (verify subresource integrity), <strong>Trusted Types</strong> (enforce safe DOM sinks), and <strong>sandbox</strong> iframes.",
        howItWorks: [
          "XSS: attacker injects <script> via unescaped user input → runs in victim's session",
          "Defense: React auto-escapes; CSP blocks inline scripts; never use innerHTML",
          "CSRF: malicious site sends request with victim's cookies",
          "Defense: SameSite=Lax cookies + CSRF token + custom header",
          "CORS: browser blocks cross-origin responses unless server allows",
          "SRI: hash on <script integrity> verifies CDN file wasn't tampered",
        ],
        keyConcepts: [
          "<strong>XSS</strong> — Inject scripts; defense = escape, CSP, Trusted Types",
          "<strong>CSRF</strong> — Forge requests via cookies; defense = SameSite + token",
          "<strong>CSP</strong> — Content-Security-Policy header whitelists sources",
          "<strong>CORS</strong> — Server's Access-Control-Allow-Origin policy",
          "<strong>SRI</strong> — Subresource Integrity hash for CDN files",
          "<strong>Trusted Types</strong> — Enforce only safe values reach DOM sinks",
        ],
        realWorld:
          "GitHub, Twitter enforce strict CSP. Stripe uses SRI on its JS SDK. CSP report-to header ships violations to an endpoint. Google enforces Trusted Types internally.",
        tradeoffs: {
          pros: ["CSP blocks most XSS vectors", "SameSite cookies kill most CSRF cheaply", "SRI catches CDN tampering"],
          cons: ["Strict CSP requires refactoring inline scripts", "CORS misconfig exposes APIs", "Trusted Types need policy work"],
        },
        codeExample: `// BAD: dangerouslySetInnerHTML with untrusted input = XSS
<div dangerouslySetInnerHTML={{ __html: user.bio }} /> // ❌

// GOOD: sanitize first (DOMPurify)
import DOMPurify from "dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(user.bio) }} />

// CSP header (helmet in Express / headers in next.config)
const csp = "default-src 'self'; script-src 'self' 'sha256-abc'; " +
            "style-src 'self'; connect-src 'self' https://api.example.com; " +
            "report-to /csp-reports";

// SRI on CDN script
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-abc..."
  crossorigin="anonymous"
></script>

// CORS — server returns
// Access-Control-Allow-Origin: https://app.example.com
// Access-Control-Allow-Credentials: true (for cookies)

// Trusted Types policy (prevent sink injection)
if ((window as any).trustedTypes) {
  (window as any).trustedTypes.createPolicy("default", {
    createHTML: (s: string) => DOMPurify.sanitize(s),
  });
}`,
        interviewTips: [
          "XSS defenses: React auto-escapes, CSP, sanitize, Trusted Types",
          "SameSite=Lax cookies eliminate most CSRF without tokens",
          "CSP report-only mode → ship first, monitor, then enforce",
        ],
      },
    },

    // ───────────────────────── Backend / Full-Stack Integration ─────────────────────────
    {
      id: "bff-pattern",
      title: "Backend For Frontend (BFF)",
      icon: "🛤️",
      description: "Aggregating microservices for a specific UI surface.",
      tags: ["Architecture", "BFF", "Microservices"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>Backend For Frontend (BFF)</strong> is a thin service tailored to one UI surface (web, mobile, partner portal). It aggregates multiple downstream microservices, shapes responses for that UI, and handles auth — so the client makes one call instead of orchestrating many. Each frontend gets its own BFF.",
        howItWorks: [
          "Client makes one request to BFF (e.g., GET /dashboard)",
          "BFF fans out to multiple microservices in parallel",
          "BFF aggregates & shapes response for that UI surface",
          "BFF handles auth, transforms DTOs, drops unused fields",
          "Different BFFs for web vs mobile — each optimized for its client",
          "GraphQL popular as BFF — client queries exact fields",
        ],
        keyConcepts: [
          "<strong>BFF</strong> — One backend per UI surface",
          "<strong>Aggregation</strong> — Fan out to N services, shape one response",
          "<strong>GraphQL gateway</strong> — Common BFF implementation",
          "<strong>Separation from microservices</strong> — BFF only shapes; no business logic",
          "<strong>Mobile vs Web BFFs</strong> — Different data needs per surface",
        ],
        realWorld:
          "SoundCloud, Netflix, Uber popularized BFF. GraphQL gateways (Apollo, Hasura) often serve as BFF. Amazon AWS Console uses BFFs per service.",
        tradeoffs: {
          pros: ["Client makes one call — simpler & faster", "Tailored response shape per UI", "Shields client from microservice churn"],
          cons: ["Another service to maintain", "BFF can bloat with logic if not disciplined", "Multi-BFF (mobile + web) = duplication risk"],
        },
        codeExample: `// BFF route: Next.js Route Handler aggregates 3 services
import { authHeaders } from "@/lib/auth";

export async function GET() {
  const [user, orders, notifications] = await Promise.all([
    fetch("http://user-svc/me", { headers: authHeaders() }).then(r => r.json()),
    fetch("http://order-svc/recent").then(r => r.json()),
    fetch("http://notif-svc/unread").then(r => r.json()),
  ]);
  // Shape response for the dashboard UI specifically
  return Response.json({
    name: user.name,
    avatar: user.avatarUrl,
    recentOrders: orders.slice(0, 5).map((o) => ({
      id: o.id,
      total: o.totalCents / 100, // transform for UI
    })),
    unreadCount: notifications.length,
  });
}

// GraphQL BFF — client requests exactly what it needs:
// query { me { name avatar recentOrders { id total } unreadCount } }`,
        interviewTips: [
          "BFF solves N+1 client calls — one endpoint per surface",
          "Mobile vs web BFFs are common — different data needs",
          "GraphQL is often a BFF implementation — client drives shape",
        ],
      },
    },
    {
      id: "api-clients",
      title: "API Clients: fetch, axios, ky, tRPC",
      icon: "🌐",
      description: "fetch/axios/ky/tRPC, retries, interceptors, type-safe clients.",
      tags: ["API", "fetch", "tRPC"],
      hasAnimation: true,
      content: {
        overview:
          "API clients wrap HTTP with ergonomics. Native <strong>fetch</strong> is bare; <strong>axios</strong> adds interceptors & transforms; <strong>ky</strong> is a modern fetch wrapper. <strong>tRPC</strong> gives end-to-end type safety without codegen — server procedures are typed at the call site. All should handle retries, cancellation, and timeout.",
        howItWorks: [
          "fetch returns a Response; you handle JSON, errors, retries manually",
          "axios wraps XHR (or fetch in v1+) with interceptors & JSON parsing",
          "ky: tiny fetch wrapper with retry, hooks, JSON shortcuts",
          "tRPC: server router infers types → client calls like local functions",
          "AbortController cancels in-flight requests",
          "Interceptors add auth headers, log, retry on 5xx",
        ],
        keyConcepts: [
          "<strong>fetch</strong> — Native, no deps; throws only on network error (not 4xx/5xx)",
          "<strong>axios</strong> — Interceptors, transforms, broader browser support",
          "<strong>tRPC</strong> — End-to-end TS types, no codegen, server calls feel local",
          "<strong>AbortController</strong> — Standard cancellation signal",
          "<strong>Interceptors</strong> — Auth header, retry, logging middleware",
        ],
        realWorld:
          "Vercel & Cal.com use tRPC for type-safe APIs. axios still widely used in legacy React apps. ky is the modern minimal choice. Next.js Route Handlers use fetch.",
        tradeoffs: {
          pros: ["tRPC: zero codegen, types flow server→client", "fetch: native, no deps", "Interceptors centralize auth & retry"],
          cons: ["fetch ergonomics need wrappers", "axios is ~13KB", "tRPC couples client & server (TS only)"],
        },
        codeExample: `// tRPC — fully type-safe API call (no codegen)
import { trpc } from "./trpc";
const data = await trpc.user.getById.query({ id: "123" });
// data is typed from server's procedure return — TS error if mismatch

// Server procedure
const router = t.router({
  user: t.router({
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => db.user.findUnique({ where: input })),
  }),
});

// fetch with AbortController + exponential-backoff retry
async function fetchJson<T>(url: string, opts: RequestInit = {}, retries = 3): Promise<T> {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), 10_000); // 10s timeout
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      if (!res.ok) throw new Error(res.statusText);
      return res.json() as Promise<T>;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 2 ** i * 500));
    }
  }
  throw new Error("unreachable");
}`,
        interviewTips: [
          "fetch throws only on network error — must check res.ok",
          "tRPC = end-to-end TS types, no codegen, ideal for TS monorepo",
          "Always use AbortController for cancellation & timeout",
        ],
      },
    },
    {
      id: "webhooks-vs-api",
      title: "Webhooks vs Polling vs SSE",
      icon: "🪝",
      description: "Push vs pull — choosing event delivery.",
      tags: ["Webhooks", "SSE", "Events"],
      hasAnimation: true,
      content: {
        overview:
          "For event delivery: <strong>API polling</strong> (client asks every Ns — wasteful, high latency), <strong>webhooks</strong> (server pushes HTTP POST when event fires — efficient, but client needs public endpoint), <strong>SSE</strong> (server→client stream over HTTP). Pick by who initiates and whether you have a public endpoint.",
        howItWorks: [
          "Polling: client GET /events every 5s — easy, but mostly empty responses",
          "Webhook: register URL; service POSTs JSON when event fires",
          "Verify HMAC signature to ensure authenticity",
          "Return 200 fast; process async; service retries on 5xx",
          "SSE: client opens EventSource; server pushes events one-way",
          "Webhook = server→server; SSE = server→browser",
        ],
        keyConcepts: [
          "<strong>Webhook</strong> — HTTP POST from server to your endpoint on event",
          "<strong>Signature</strong> — HMAC-SHA256 verifies sender authenticity",
          "<strong>Idempotency</strong> — Webhooks may redeliver; dedupe by event ID",
          "<strong>Retry policy</strong> — Exponential backoff on non-2xx",
          "<strong>Polling trade-off</strong> — Latency vs bandwidth (interval)",
        ],
        realWorld:
          "Stripe payment webhooks. GitHub push webhooks. Slack incoming webhooks. Twilio SMS status. ChatGPT SSE for tokens. Discord WebSocket for chat.",
        tradeoffs: {
          pros: ["Webhooks: real-time, no polling", "SSE: simple server→browser stream", "Both avoid polling bandwidth"],
          cons: ["Webhooks need public endpoint (tunneling for dev)", "Webhooks retry → must be idempotent", "Polling is simple but wasteful"],
        },
        codeExample: `// Webhook handler (Next.js) — verify + idempotent + fast ack
import crypto from "node:crypto";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature")!;
  const body = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, SECRET); // verify HMAC
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  // Idempotent: check if already processed
  if (await db.processedEvents.exists(event.id)) {
    return new Response("OK, duplicate", { status: 200 });
  }

  // Process asynchronously — return 200 within seconds
  await queue.add("handle-event", event);
  return new Response("OK", { status: 200 });
}

// SSE for client-side streaming
const es = new EventSource("/api/updates");
es.onmessage = (e) => update(JSON.parse(e.data));

// Polling fallback (last resort)
setInterval(() => fetch("/api/events?since=" + lastId).then(render), 5000);`,
        interviewTips: [
          "Webhooks MUST verify signature (HMAC) — else spoofing",
          "Return 200 fast; process async — webhook timeouts cause retries",
          "Idempotency key (event.id) handles redelivery",
        ],
      },
    },
    {
      id: "serverless-faas",
      title: "Serverless & FaaS",
      icon: "☁️",
      description: "AWS Lambda, Vercel/Cloudflare Functions, cold starts, scaling.",
      tags: ["Serverless", "Lambda", "FaaS"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Serverless FaaS</strong> runs your function on demand without managing servers — AWS Lambda, Vercel/Netlify Functions, Cloudflare Workers, Azure Functions. You pay per invocation & duration. <strong>Cold starts</strong> (initial boot delay) are the main trade-off. Scales to zero when idle.",
        howItWorks: [
          "Deploy code; provider provisions container/isolate per concurrent request",
          "First invocation: cold start — boot runtime, load code (~100ms-1s)",
          "Warm invocations reuse the isolate — fast (~10ms)",
          "Concurrent requests → provider scales new instances automatically",
          "Function runs to completion; idle instances are recycled",
          "Billing: invocation count × duration × memory",
        ],
        keyConcepts: [
          "<strong>Cold start</strong> — First request boot delay; mitigate via provisioned concurrency",
          "<strong>Warm reuse</strong> — Subsequent calls reuse isolate (keep-alive window)",
          "<strong>Concurrency</strong> — Each concurrent request = new instance (Lambda)",
          "<strong>Timeout</strong> — Lambda max 15min; Vercel 10s-5min depending on plan",
          "<strong>Vendor lock-in</strong> — Runtimes, event shapes differ per provider",
        ],
        realWorld:
          "Vercel functions power Next.js API routes. Cloudflare Workers run at edge with no real cold starts (V8 isolates). Netflix, Coca-Cola use Lambda. Slack uses Lambda for slash commands.",
        tradeoffs: {
          pros: ["No server management", "Pay per use — cheap at low scale", "Auto-scales to thousands of concurrent"],
          cons: ["Cold starts hurt latency-sensitive apps", "15min timeout limit", "Vendor lock-in & observability challenges"],
        },
        codeExample: `// Vercel/Next.js Route Handler — serverless function
export async function POST(req: Request) {
  const body = await req.json();
  const result = await processImage(body.url);
  return Response.json({ result });
}

// AWS Lambda handler
import type { APIGatewayProxyHandler } from "aws-lambda";

// ⚠️ Init clients OUTSIDE handler — reused across warm calls
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const db = new DynamoDBClient({}); // created once per cold start

export const handler: APIGatewayProxyHandler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  await db.send(new GetItemCommand({ /* ... */ }));
  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

// Cold-start mitigation: provisioned concurrency
// aws lambda put-provisioned-concurrency --function-name api \\
//   --provisioned-concurrent-executions 5`,
        interviewTips: [
          "Cold start is the main trade-off — mitigate via provisioned concurrency or edge",
          "Move heavy init (DB clients) outside handler — reuse across warm calls",
          "Cloudflare Workers have no real cold start — V8 isolates vs containers",
        ],
      },
    },
    {
      id: "edge-computing",
      title: "Edge Computing",
      icon: "🌍",
      description: "Edge functions (Cloudflare Workers, Vercel Edge, Deno Deploy).",
      tags: ["Edge", "Cloudflare", "Performance"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Edge computing</strong> runs code at CDN edge locations close to users — Cloudflare Workers, Vercel Edge Functions, Deno Deploy. Uses <strong>V8 isolates</strong> (not containers) for ~5ms cold starts. Trade-off: limited runtime (no Node APIs), smaller memory. Ideal for auth, redirects, A/B tests, geo-personalization.",
        howItWorks: [
          "Code deployed to global edge network (300+ POPs)",
          "Request routed to nearest POP — ~10-50ms RTT vs 200ms+ to origin",
          "V8 isolate spins up in ~5ms — near zero cold start",
          "Function executes with limited runtime (Web APIs, no Node fs/net)",
          "Can read/write KV store, Durable Objects, edge database",
          "Great for middleware: auth, geo routing, A/B tests",
        ],
        keyConcepts: [
          "<strong>V8 isolate</strong> — Single process hosts thousands of isolates (no container overhead)",
          "<strong>POP</strong> — Point of Presence; CDN data center near users",
          "<strong>Limited runtime</strong> — Web APIs (fetch, crypto), no Node.js modules",
          "<strong>Edge KV</strong> — Eventually consistent store replicated globally",
          "<strong>Edge vs Origin</strong> — Edge = fast & limited; Origin = full runtime",
        ],
        realWorld:
          "Cloudflare Workers, Vercel Edge, Deno Deploy. Vercel.com runs middleware at edge for auth & redirects. Cloudflare handles 60M+ req/sec at edge.",
        tradeoffs: {
          pros: ["Lowest latency — closest POP to user", "~5ms cold start (V8 isolates)", "Auto-scales globally; no capacity planning"],
          cons: ["Limited runtime — no fs, limited Node APIs", "Memory/CPU caps (e.g., 128MB)", "Edge state is eventually consistent (KV)"],
        },
        codeExample: `// Vercel Edge Middleware — runs at edge POPs globally
import { NextResponse, type NextRequest } from "next/server";

export const config = { runtime: "edge" };

export async function middleware(req: NextRequest) {
  const country = req.geo?.country; // geo from edge
  if (country === "CN") {
    return NextResponse.redirect("https://cn.example.com");
  }
  // A/B test at edge — no origin request needed
  const variant = Math.random() < 0.5 ? "A" : "B";
  const res = NextResponse.next();
  res.cookies.set("variant", variant);
  return res;
}

// Cloudflare Worker — fetch + KV cache
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const cached = await env.KV.get(url.pathname);
    if (cached) {
      return new Response(cached, {
        headers: { "content-type": "text/html" },
      });
    }
    const origin = await fetch("https://origin.example.com" + url.pathname);
    await env.KV.put(url.pathname, await origin.text(), { expirationTtl: 3600 });
    return origin;
  },
};`,
        interviewTips: [
          "Edge uses V8 isolates — not containers — so cold start is ~5ms",
          "Trade-off: limited runtime, no Node APIs (fs, child_process)",
          "Use cases: auth, redirects, geo, A/B tests at edge",
        ],
      },
    },

    // ───────────────────────── Authentication & Sessions ─────────────────────────
    {
      id: "jwt-auth",
      title: "JWT Authentication",
      icon: "🎫",
      description: "JWT structure, signing, expiry, refresh tokens, storage.",
      tags: ["JWT", "Auth", "Tokens"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>JWT (JSON Web Token)</strong> is a signed, stateless token carrying claims (user ID, expiry). Structure: <strong>header.signature.payload</strong>. Server signs with secret/private key; client stores & sends token on each request. <strong>Access tokens</strong> are short-lived; <strong>refresh tokens</strong> mint new access tokens. Storage matters: localStorage is XSS-vulnerable; httpOnly cookies are safer.",
        howItWorks: [
          "User logs in → server verifies credentials & issues signed JWT",
          "Token = base64(header).base64(payload).signature(HMAC)",
          "Client stores token (cookie/localStorage) & sends on each request",
          "Server verifies signature & expiry — no DB lookup needed (stateless)",
          "Access token expires in 15min; refresh token (days) mints new access",
          "Logout: client drops token (and revokes refresh on server)",
        ],
        keyConcepts: [
          "<strong>Header.Payload.Signature</strong> — 3 base64 parts",
          "<strong>HMAC-SHA256 (HS256)</strong> — Symmetric; RS256 asymmetric (pub/priv)",
          "<strong>exp claim</strong> — Expiry timestamp",
          "<strong>Refresh token</strong> — Long-lived; exchange for new access token",
          "<strong>Storage trade-off</strong> — localStorage (XSS) vs httpOnly cookie (CSRF)",
        ],
        realWorld:
          "Auth0, Firebase Auth, Supabase Auth issue JWTs. Many REST APIs use JWT bearer tokens. WebSocket auth often via JWT in query param.",
        tradeoffs: {
          pros: ["Stateless — server doesn't need session DB", "Works across services (microservices share signing key)", "Compact & URL-safe"],
          cons: ["Can't revoke before expiry (no server-side invalidation)", "Token leak = impersonation until expiry", "Storage dilemma: XSS (localStorage) vs CSRF (cookie)"],
        },
        codeExample: `// Server: sign JWT (jose library)
import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function issueTokens(userId: string) {
  const access = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m") // short-lived
    .sign(secret);
  const refresh = await new SignJWT({ sub: userId, type: "refresh" })
    .setExpirationTime("7d")
    .sign(secret);
  return { access, refresh };
}

// Verify on each request
async function verify(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload.sub as string;
}

// Cookie storage (httpOnly = JS can't read = XSS-safe)
// Set-Cookie: access=...; HttpOnly; Secure; SameSite=Lax; Max-Age=900

// Refresh endpoint
app.post("/refresh", async (req, res) => {
  const userId = await verify(req.cookies.refresh);
  const { access } = await issueTokens(userId);
  res.cookie("access", access, { httpOnly: true, maxAge: 900 });
  res.json({ ok: true });
});`,
        interviewTips: [
          "JWT is stateless — can't revoke; short access TTL + refresh rotation mitigates",
          "Prefer httpOnly cookies over localStorage (XSS can steal localStorage)",
          "Refresh token rotation detects theft (old token invalidates)",
        ],
      },
    },
    {
      id: "session-cookies",
      title: "Session Cookies",
      icon: "🍪",
      description: "Cookie-based sessions, SameSite, Secure, HttpOnly, session stores.",
      tags: ["Cookies", "Sessions", "Auth"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Session cookies</strong> store a session ID (not user data) in a cookie; the server looks up the session in a store (memory, Redis, DB). Proper flags are critical: <strong>HttpOnly</strong> (no JS access → XSS-safe), <strong>Secure</strong> (HTTPS only), <strong>SameSite</strong> (CSRF protection). Stateless JWT vs stateful session is the core auth trade-off.",
        howItWorks: [
          "User logs in → server creates session in store, returns session ID cookie",
          "Browser sends cookie on every matching request automatically",
          "Server reads session ID → looks up session data in store",
          "HttpOnly flag → JS can't read cookie (XSS can't steal)",
          "SameSite=Lax → cookie not sent on cross-site requests (CSRF defense)",
          "Logout → server deletes session from store; cookie expires",
        ],
        keyConcepts: [
          "<strong>HttpOnly</strong> — JS can't access cookie (XSS defense)",
          "<strong>Secure</strong> — Only sent over HTTPS",
          "<strong>SameSite</strong> — Strict/Lax/None; CSRF defense",
          "<strong>Session store</strong> — Redis (distributed), memory (dev), DB",
          "<strong>Session vs JWT</strong> — Stateful (revocable) vs stateless (scalable)",
        ],
        realWorld:
          "Express session middleware (express-session) with Redis store. Rails, Django, Laravel all use session cookies by default. Google, GitHub use httpOnly session cookies.",
        tradeoffs: {
          pros: ["Revocable instantly (delete session in store)", "HttpOnly cookies XSS-safe", "No token in JS means no token leak via XSS"],
          cons: ["Stateful — needs session store (Redis)", "Doesn't scale across services like JWT", "Cookie sent on every request (bandwidth)"],
        },
        codeExample: `// Express session with Redis store
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

const redis = createClient({ url: process.env.REDIS_URL });
await redis.connect();

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET!,
  name: "sid",
  cookie: {
    httpOnly: true,        // JS can't read (XSS-safe)
    secure: true,          // HTTPS only
    sameSite: "lax",       // CSRF defense
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    path: "/",
  },
  resave: false,
  saveUninitialized: false,
}));

// Usage
app.post("/login", async (req, res) => {
  const user = await verifyCreds(req.body.email, req.body.password);
  req.session.userId = user.id; // stored in Redis, cookie holds only sid
  res.json({ ok: true });
});

app.get("/me", (req, res) => {
  if (!req.session.userId) return res.status(401).end();
  res.json({ id: req.session.userId });
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});`,
        interviewTips: [
          "Always set HttpOnly + Secure + SameSite on session cookies",
          "Sessions are revocable; JWT isn't — pick based on need",
          "Use Redis for distributed session store (multi-instance)",
        ],
      },
    },
    {
      id: "oauth-oidc",
      title: "OAuth 2.0 & OpenID Connect",
      icon: "🔑",
      description: "OAuth2 flows, OIDC identity layer, PKCE for SPAs, social login.",
      tags: ["OAuth", "OIDC", "Auth"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>OAuth 2.0</strong> is an authorization framework — lets a user grant a third party access to their data without sharing passwords. <strong>OpenID Connect (OIDC)</strong> adds an identity layer on top (id_token, user profile). <strong>PKCE</strong> (Proof Key for Code Exchange) secures public clients (SPAs, mobile) by binding the auth code to a secret that's never sent.",
        howItWorks: [
          "App redirects user to provider (Google/GitHub) with client_id & redirect_uri",
          "User logs in & grants scopes on provider's domain",
          "Provider redirects back with authorization code (short-lived)",
          "App exchanges code + PKCE verifier for access_token + id_token",
          "id_token is a JWT with user profile (sub, email, name)",
          "App uses access_token to call provider APIs on user's behalf",
        ],
        keyConcepts: [
          "<strong>Authorization Code flow</strong> — Standard; code → token exchange",
          "<strong>PKCE</strong> — Code verifier/challenge; mandatory for SPAs/mobile",
          "<strong>OIDC</strong> — Adds id_token (JWT identity) & userinfo endpoint",
          "<strong>Scopes</strong> — Granular permissions (profile, email, read:repos)",
          "<strong>Refresh token</strong> — Mint new access token without re-login",
        ],
        realWorld:
          "Sign in with Google/Apple/GitHub is OAuth2+OIDC. Auth0, Okta, Clerk, NextAuth.js implement it. Stripe Connect uses OAuth for platform accounts.",
        tradeoffs: {
          pros: ["No password sharing — better security", "Single sign-on across apps", "Standardized protocol with libraries"],
          cons: ["Complex flows — easy to misconfigure", "Provider outages lock users out", "Token management & refresh is fiddly"],
        },
        codeExample: `// PKCE flow for SPA (no client secret)
import { createPKCECodes } from "./pkce";

async function loginWithGoogle() {
  const { verifier, challenge } = await createPKCECodes();
  sessionStorage.setItem("pkce_verifier", verifier); // remember for step 2

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: window.location.origin + "/callback",
    response_type: "code",
    scope: "openid profile email",
    code_challenge: challenge,
    code_challenge_method: "S256",
    state: crypto.randomUUID(), // CSRF defense
  });
  window.location.href =
    "https://accounts.google.com/o/oauth2/v2/auth?" + params.toString();
}

// /callback — exchange code + verifier for tokens
async function handleCallback(code: string) {
  const verifier = sessionStorage.getItem("pkce_verifier")!;
  const res = await fetch("/api/oauth/token", {
    method: "POST",
    body: JSON.stringify({ code, verifier }),
  });
  const { access_token, id_token } = await res.json();
  // id_token is a JWT with user profile (sub, email, name)
  const user = decodeJWT(id_token);
  return { access_token, user };
}

// NextAuth.js handles all flows declaratively
// authOptions.providers = [GoogleProvider({ clientId, clientSecret })];
// const session = await getServerSession(authOptions);`,
        interviewTips: [
          "OAuth2 = authorization; OIDC = identity (adds id_token)",
          "PKCE mandatory for SPAs/mobile — replaces client secret",
          "Use NextAuth.js/Auth0/Clerk — don't roll your own OAuth",
        ],
      },
    },
  ],
};
