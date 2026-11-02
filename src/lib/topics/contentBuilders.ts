/**
 * Content builders — generate the rich per-topic content sections
 * (study notes, request flow, data flow, caching, deep analysis, quiz),
 * matching the original SysWizard renderContent() behavior.
 */
import type { FlatTopic } from "./types";
import type { AlgoInfo } from "./enrichment";

function stripTags(s: string): string {
  return s;
}

export interface FlowStep {
  name: string;
  description: string;
  timing?: string;
}

/** Request flow steps from howItWorks */
export function buildRequestFlow(topic: FlatTopic): FlowStep[] {
  return topic.content.howItWorks.map((s, i) => ({
    name: `Step ${i + 1}`,
    description: s,
    timing: i === 0 ? "~1ms" : i === topic.content.howItWorks.length - 1 ? "~5ms" : "~10-50ms",
  }));
}

/** ASCII data flow diagram */
export function buildDataFlowDiagram(title: string, steps: string[]): string {
  const shortTitle = title.length > 26 ? title.substring(0, 23) + "..." : title;
  let diagram = `  ┌─────────────────────────────────────────────┐
  │              ${shortTitle.padEnd(30)}│
  └─────────────────────┬───────────────────────┘
                        │
    ┌───────────────────▼───────────────────────┐
    │           User / Client Request            │
    └───────────────────┬───────────────────────┘
                        │\n`;
  steps.forEach((step, i) => {
    const label = step.replace(/<[^>]+>/g, "");
    const trimmed = label.length > 38 ? label.substring(0, 35) + "..." : label;
    diagram += `    ┌───────────────────▼───────────────────────┐
    │  ${(i + 1)}. ${trimmed.padEnd(38)}   │
    └───────────────────┬───────────────────────┘
                        │\n`;
  });
  diagram += `    ┌───────────────────▼───────────────────────┐
    │            Response to Client               │
    └─────────────────────────────────────────────┘`;
  return diagram;
}

/** Caching layers content (same 4-layer model for every topic) */
export const CACHING_LAYERS = [
  {
    name: "Layer 1: Client-Side Cache",
    ttl: "TTL: 60s",
    strategy: "Browser cache, localStorage, or in-memory cache on the client",
    what: "Static assets, frequently accessed data, user preferences",
    benefit: "Eliminates network round-trip entirely for repeated requests",
  },
  {
    name: "Layer 2: CDN / Edge Cache",
    ttl: "TTL: 5m",
    strategy: "Cache at edge locations geographically close to users",
    what: "API responses, images, static files, pre-rendered pages",
    benefit: "Reduces latency from 200ms to ~20ms for cached content",
  },
  {
    name: "Layer 3: Application Cache (Redis/Memcached)",
    ttl: "TTL: 5-30m",
    strategy: "Cache-aside or Write-through pattern using Redis",
    what: "Database query results, computed aggregations, session data",
    benefit: "Reduces database load by 80-95% for read-heavy workloads",
  },
  {
    name: "Layer 4: Database Query Cache",
    ttl: "TTL: varies",
    strategy: "Query result caching, materialized views",
    what: "Expensive joins, aggregation queries, search results",
    benefit: "Avoids repeated computation for identical queries",
  },
];

export const CACHE_INVALIDATION = [
  "<strong>Cache-Aside (Lazy Loading)</strong> — App checks cache first, loads from DB on miss, writes to cache",
  "<strong>Write-Through</strong> — Every write goes to cache AND database simultaneously",
  "<strong>Write-Behind (Write-Back)</strong> — Write to cache immediately, async flush to DB",
  "<strong>TTL-Based Expiry</strong> — Cache entries expire after a set time, ensuring freshness",
];

/** Fallback algorithms when no specific enrichment exists */
export function generateAlgorithmsFromTopic(title: string): AlgoInfo[] {
  return [
    { name: "Hash Table", type: "Data Structure", description: `Used in ${title} for O(1) key-value lookups, caching, and deduplication`, complexity: "O(1) avg" },
    { name: "Binary Search", type: "Search", description: `Efficiently find records in sorted data structures used by ${title}`, complexity: "O(log n)" },
    { name: "BFS/DFS", type: "Graph Traversal", description: `Traverse dependency graphs and network topologies in ${title} implementations`, complexity: "O(V + E)" },
    { name: "Consistent Hashing", type: "Distribution", description: "Distribute data evenly across nodes with minimal redistribution when nodes join/leave", complexity: "O(log n)" },
  ];
}

/** Common interview questions per topic */
export function commonInterviewQuestions(title: string): string[] {
  return [
    `❓ What is ${title} and why is it used?`,
    `❓ How does ${title} work under the hood?`,
    `❓ What are the trade-offs of ${title}?`,
    `❓ When would you NOT use ${title}?`,
    `❓ Compare ${title} with its alternatives`,
    `❓ How do companies like Google/Amazon use ${title}?`,
  ];
}

export interface QuizResult {
  total: number;
  correct: number;
  passed: boolean;
}

export { stripTags };
