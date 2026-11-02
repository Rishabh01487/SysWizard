import type { Category } from "./types";

/**
 * Full-Stack Algorithms & Data Structures
 * Comprehensive coverage of algorithms every engineer should know.
 */
export const ALGORITHMS: Category = {
  id: "algorithms",
  name: "Algorithms & Data Structures",
  icon: "🧮",
  level: "advanced",
  topics: [
    {
      id: "binary-search",
      title: "Binary Search",
      icon: "🎯",
      description: "O(log n) search on sorted data by repeatedly halving the search space.",
      tags: ["Searching", "Divide & Conquer", "O(log n)"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Binary Search</strong> finds an element in a <strong>sorted</strong> array in O(log n) time by repeatedly comparing the target to the middle element and discarding half the search space. It's one of the most fundamental and widely-used algorithms.",
        howItWorks: [
          "Start with two pointers: low=0, high=n-1",
          "Compute mid = (low + high) / 2",
          "If arr[mid] == target → found! Return mid",
          "If arr[mid] < target → search right half: low = mid + 1",
          "If arr[mid] > target → search left half: high = mid - 1",
          "Repeat until low > high (not found)",
        ],
        keyConcepts: [
          "<strong>Sorted Input Required</strong> — Only works on sorted data",
          "<strong>O(log n) Time</strong> — Halves search space each step",
          "<strong>O(1) Space</strong> — Iterative version uses no extra memory",
          "<strong>Integer Overflow</strong> — Use mid = low + (high - low) / 2 to avoid overflow",
          "<strong>Variants</strong> — Lower bound, upper bound, rotated array search",
        ],
        realWorld:
          "Database B-Tree indexes use binary search. Git uses binary search for bisect debugging. Most standard libraries' sort/search use it. CDN edge selection.",
        tradeoffs: {
          pros: ["Extremely fast (O(log n))", "Constant space", "Works on any sorted data"],
          cons: ["Requires sorted data", "Random access needed (not for linked lists)", "Not suitable for small datasets (linear is fine)"],
        },
        codeExample: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = low + ((high - low) >> 1); // avoid overflow
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1; // not found
}
// arr=[1,3,5,7,9,11], target=7 → returns 3`,
        interviewTips: [
          "Always use mid = low + (high-low)/2 to avoid overflow",
          "Know lower_bound and upper_bound variants",
          "Practice rotated sorted array search",
        ],
      },
    },
    {
      id: "sorting-algorithms",
      title: "Sorting Algorithms",
      icon: "🔢",
      description: "Quick Sort, Merge Sort, Heap Sort, and when to use each.",
      tags: ["Sorting", "Divide & Conquer", "Comparison"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Sorting</strong> arranges elements in order. The best comparison sorts (Merge Sort, Quick Sort, Heap Sort) run in O(n log n). Each has trade-offs in speed, memory, and stability that determine the best choice for a given situation.",
        howItWorks: [
          "<strong>Merge Sort</strong>: Divide array in half, recursively sort each, merge sorted halves",
          "<strong>Quick Sort</strong>: Pick pivot, partition into < pivot and > pivot, recursively sort partitions",
          "<strong>Heap Sort</strong>: Build max-heap, repeatedly extract max to end of array",
          "<strong>Insertion Sort</strong>: Build sorted array one element at a time (good for small/nearly-sorted)",
          "<strong>Counting/Radix Sort</strong>: Non-comparison, O(n) for bounded integer keys",
        ],
        keyConcepts: [
          "<strong>Time Complexity</strong> — Merge/Quick/Heap: O(n log n) avg",
          "<strong>Stable Sort</strong> — Equal elements keep original order (Merge, Insertion; NOT Quick, Heap)",
          "<strong>In-Place</strong> — O(1) extra space (Quick, Heap; NOT Merge which needs O(n))",
          "<strong>Worst Case</strong> — Quick Sort degrades to O(n²) with bad pivot (use randomized)",
          "<strong>Hybrid Sorts</strong> — Timsort (Python/JS): Merge + Insertion for real-world data",
        ],
        realWorld:
          "Python/Java use Timsort (hybrid). C++ uses Introsort (Quick + Heap). Databases use external merge sort for large data. V8 uses Timsort for Array.sort().",
        tradeoffs: {
          pros: ["Merge: Stable, predictable O(n log n)", "Quick: Fast in practice, in-place", "Heap: Guaranteed O(n log n), in-place"],
          cons: ["Merge: O(n) extra space", "Quick: O(n²) worst case", "Heap: Poor cache performance"],
        },
        codeExample: `// Quick Sort (in-place, O(n log n) avg)
function quickSort(arr, lo=0, hi=arr.length-1) {
  if (lo >= hi) return;
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  quickSort(arr, lo, i-1);
  quickSort(arr, i+1, hi);
}

// Merge Sort (stable, O(n) space)
function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = arr.length >> 1;
  return merge(mergeSort(arr.slice(0, mid)),
               mergeSort(arr.slice(mid)));
}`,
        interviewTips: [
          "Know time/space/stability of each sort",
          "Explain why Quick Sort is usually fastest in practice (cache)",
          "Implement Quick and Merge Sort from memory",
        ],
      },
    },
    {
      id: "graph-algorithms",
      title: "Graph Algorithms (BFS, DFS, Dijkstra)",
      icon: "🕸️",
      description: "Traverse graphs and find shortest paths with BFS, DFS, and Dijkstra.",
      tags: ["Graph", "BFS", "DFS", "Shortest Path"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Graphs</strong> model networks (social, road, computer). <strong>BFS</strong> finds shortest path in unweighted graphs. <strong>DFS</strong> explores deeply (good for cycles, topological sort). <strong>Dijkstra</strong> finds shortest path in weighted graphs.",
        howItWorks: [
          "<strong>BFS</strong>: Use a queue. Visit all neighbors at current depth before going deeper. Finds shortest unweighted path.",
          "<strong>DFS</strong>: Use a stack/recursion. Go as deep as possible before backtracking. Good for cycle detection.",
          "<strong>Dijkstra</strong>: Use a priority queue (min-heap). Greedily pick nearest unvisited node. Finds shortest weighted path.",
          "<strong>Topological Sort</strong>: DFS on DAG to get execution order (build systems, task scheduling)",
          "<strong>A*</strong>: Dijkstra + heuristic → faster pathfinding (maps, games)",
        ],
        keyConcepts: [
          "<strong>Adjacency List</strong> — Space-efficient for sparse graphs (O(V+E))",
          "<strong>Adjacency Matrix</strong> — O(V²) space, O(1) edge lookup (dense graphs)",
          "<strong>BFS: O(V+E)</strong> — Shortest path unweighted, level-order",
          "<strong>DFS: O(V+E)</strong> — Cycles, SCCs, topological sort",
          "<strong>Dijkstra: O((V+E) log V)</strong> — Shortest path weighted (no negative edges)",
        ],
        realWorld:
          "Google Maps uses Dijkstra/A* for routing. Social networks use BFS for degrees of separation. Build systems (Make, npm) use topological sort. Web crawlers use BFS.",
        tradeoffs: {
          pros: ["BFS: Shortest path guarantee", "DFS: Low memory (O(depth))", "Dijkstra: Optimal weighted paths"],
          cons: ["BFS: High memory (O(width))", "DFS: May not find shortest path", "Dijkstra: Slow for large graphs, no negative weights"],
        },
        codeExample: `// BFS (shortest path unweighted)
function bfs(graph, start) {
  const queue = [start], visited = new Set([start]);
  while (queue.length) {
    const node = queue.shift();
    for (const next of graph[node] || []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
}

// Dijkstra (shortest path weighted)
function dijkstra(graph, start) {
  const dist = {}; dist[start] = 0;
  const pq = new MinHeap([[0, start]]);
  while (pq.size) {
    const [d, node] = pq.pop();
    if (d > dist[node]) continue;
    for (const [next, w] of graph[node] || []) {
      const nd = d + w;
      if (nd < (dist[next] ?? Infinity)) {
        dist[next] = nd;
        pq.push([nd, next]);
      }
    }
  }
}`,
        interviewTips: [
          "Know when BFS vs DFS vs Dijkstra",
          "Implement Dijkstra with a min-heap",
          "Explain A* improvement over Dijkstra",
        ],
      },
    },
    {
      id: "hash-tables",
      title: "Hash Tables & Hash Functions",
      icon: "#️⃣",
      description: "O(1) average lookups using hash functions — the most used data structure.",
      tags: ["Data Structure", "Hashing", "O(1)"],
      hasAnimation: true,
      content: {
        overview:
          "A <strong>Hash Table</strong> maps keys to values using a hash function, providing O(1) average insert/lookup/delete. It's the backbone of dictionaries, caches, sets, and database indexes. Collisions are handled via chaining or open addressing.",
        howItWorks: [
          "Hash function converts key → integer (hash code)",
          "Hash modded by table size → bucket index",
          "If bucket empty → store key-value pair there",
          "Collision (two keys, same bucket): chaining (linked list) or probing (find next empty slot)",
          "Resize when load factor (entries/buckets) exceeds threshold (e.g., 0.75)",
        ],
        keyConcepts: [
          "<strong>Hash Function</strong> — Distributes keys uniformly (e.g., murmur, fnv)",
          "<strong>Collision</strong> — Two keys hash to same bucket (inevitable)",
          "<strong>Chaining</strong> — Each bucket is a linked list (simple, uses extra memory)",
          "<strong>Open Addressing</strong> — Linear/quadratic probing or double hashing (cache-friendly)",
          "<strong>Load Factor</strong> — entries/buckets; resize when > 0.7-0.75",
        ],
        realWorld:
          "JavaScript Objects/Maps, Python dicts, Java HashMap, Redis, Memcached, database hash indexes, password hashing (bcrypt). Dictionaries in every language.",
        tradeoffs: {
          pros: ["O(1) average operations", "Flexible key types", "Foundation for caches and sets"],
          cons: ["O(n) worst case (many collisions)", "Unordered (no range queries)", "Hash function quality matters"],
        },
        codeExample: `// Simple Hash Table (chaining)
class HashTable {
  constructor(size = 16) { this.buckets = Array.from({length: size}, () => []); }
  _hash(key) {
    let h = 0;
    for (const c of key) h = (h * 31 + c.charCodeAt(0)) | 0;
    return Math.abs(h) % this.buckets.length;
  }
  set(key, val) {
    const b = this.buckets[this._hash(key)];
    const e = b.find(e => e[0] === key);
    e ? e[1] = val : b.push([key, val]);
  }
  get(key) {
    const e = this.buckets[this._hash(key)].find(e => e[0] === key);
    return e ? e[1] : undefined;
  }
}`,
        interviewTips: [
          "Explain collision resolution strategies",
          "Know load factor and when to rehash",
          "Discuss hash function properties (uniform, deterministic)",
        ],
      },
    },
    {
      id: "trees",
      title: "Trees (BST, Trie, B-Tree)",
      icon: "🌳",
      description: "Hierarchical data structures: BST for search, Trie for strings, B-Tree for disks.",
      tags: ["Data Structure", "Tree", "BST", "Trie"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Trees</strong> are hierarchical structures. <strong>BST</strong>: left < root < right, O(log n) search. <strong>Trie</strong>: prefix tree for strings (autocomplete). <strong>B-Tree</strong>: balanced multi-way tree optimized for disk I/O (used by databases).",
        howItWorks: [
          "<strong>BST</strong>: Insert by comparing — smaller goes left, larger goes right. Balanced → O(log n).",
          "<strong>Trie</strong>: Each node = a character. Path from root = a word. Shared prefixes save space.",
          "<strong>B-Tree</strong>: Each node has multiple keys/children. Shallow height → fewer disk reads.",
          "<strong>AVL/Red-Black</strong>: Self-balancing BSTs — guarantee O(log n) height",
          "<strong>Heap</strong>: Complete binary tree with heap property (min/max at root)",
        ],
        keyConcepts: [
          "<strong>In-order Traversal</strong> — Visits BST nodes in sorted order",
          "<strong>BST Balance</strong> — Unbalanced → O(n) (like linked list); balanced → O(log n)",
          "<strong>Trie</strong> — O(L) search/insert where L = key length (independent of N)",
          "<strong>B-Tree Fanout</strong> — High branching factor → shallow → fewer disk seeks",
          "<strong>Segment Tree</strong> — Range queries (sum/min/max over intervals) in O(log n)",
        ],
        realWorld:
          "Databases use B-Trees for indexes. Autocomplete uses Tries. Language runtimes use Red-Black trees (Java TreeMap, C++ map). Heaps power priority queues and Dijkstra.",
        tradeoffs: {
          pros: ["BST: Ordered, flexible", "Trie: Fast prefix search", "B-Tree: Disk-efficient (database indexes)"],
          cons: ["BST: O(n) if unbalanced", "Trie: High memory (pointers)", "B-Tree: Complex implementation"],
        },
        codeExample: `// Binary Search Tree
class BST {
  insert(node, val) {
    if (!node) return {val, left: null, right: null};
    if (val < node.val) node.left = this.insert(node.left, val);
    else if (val > node.val) node.right = this.insert(node.right, val);
    return node;
  }
  search(node, val) {
    if (!node) return false;
    if (val === node.val) return true;
    return val < node.val ? this.search(node.left, val)
                          : this.search(node.right, val);
  }
}

// Trie (autocomplete)
class Trie {
  root = {};
  insert(word) {
    let node = this.root;
    for (const c of word) node = node[c] = node[c] || {};
    node.end = true;
  }
}`,
        interviewTips: [
          "Know BST traversal orders (in/pre/post)",
          "Implement a Trie for autocomplete",
          "Explain why databases use B-Trees not BSTs",
        ],
      },
    },
    {
      id: "dynamic-programming",
      title: "Dynamic Programming",
      icon: "🧩",
      description: "Optimize recursive problems by caching subproblem results (memoization/tabulation).",
      tags: ["DP", "Optimization", "Recursion"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Dynamic Programming (DP)</strong> solves problems by breaking them into overlapping subproblems and caching results. It transforms exponential recursive solutions into polynomial ones. Two approaches: top-down memoization and bottom-up tabulation.",
        howItWorks: [
          "Identify overlapping subproblems (same computation repeated)",
          "Define recurrence relation (how big problem relates to smaller ones)",
          "Top-down: recursive + memo (cache results as you go)",
          "Bottom-up: iterative, fill table from smallest to largest",
          "Identify base cases (smallest subproblem with known answer)",
        ],
        keyConcepts: [
          "<strong>Overlapping Subproblems</strong> — Same subproblem solved multiple times",
          "<strong>Optimal Substructure</strong> — Optimal solution built from optimal sub-solutions",
          "<strong>Memoization</strong> — Top-down: cache results in a map/array",
          "<strong>Tabulation</strong> — Bottom-up: fill table iteratively",
          "<strong>State</strong> — Set of variables defining a subproblem",
        ],
        realWorld:
          "Fibonacci, knapsack, longest common subsequence (diff tools), edit distance (spell check), shortest path (Bellman-Ford), stock trading, sequence alignment (bioinformatics).",
        tradeoffs: {
          pros: ["Turns O(2^n) into O(n²) or O(n)", "Guarantees optimal solution", "Systematic approach"],
          cons: ["Hard to identify DP problems", "High memory (storing states)", "Not always intuitive"],
        },
        codeExample: `// Fibonacci: Naive O(2^n) vs DP O(n)
// Naive (exponential!)
function fibNaive(n) {
  if (n < 2) return n;
  return fibNaive(n-1) + fibNaive(n-2);
}

// Memoization (top-down O(n))
const memo = {};
function fibMemo(n) {
  if (n < 2) return n;
  if (memo[n] !== undefined) return memo[n];
  return memo[n] = fibMemo(n-1) + fibMemo(n-2);
}

// Tabulation (bottom-up O(n), O(1) space)
function fibTab(n) {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}`,
        interviewTips: [
          "Start with recursive brute force, then add memo",
          "Convert memo to tabulation for space optimization",
          "Practice classic DP: knapsack, LCS, coin change",
        ],
      },
    },
    {
      id: "two-pointers",
      title: "Two Pointers & Sliding Window",
      icon: "↔️",
      description: "Efficient array techniques: two pointers for pairs, sliding window for ranges.",
      tags: ["Array", "Two Pointers", "Sliding Window"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Two Pointers</strong> uses two indices to scan an array from different directions — O(n) instead of O(n²) for pair problems. <strong>Sliding Window</strong> maintains a window of elements, expanding/shrinking to find optimal subarrays — ideal for substring/range problems.",
        howItWorks: [
          "<strong>Two Pointers (opposite ends)</strong>: One at start, one at end. Move based on comparison (e.g., sorted two-sum).",
          "<strong>Fast & Slow Pointers</strong>: Both start at beginning, fast moves 2x — detects cycles (Floyd's algorithm).",
          "<strong>Sliding Window (fixed)</strong>: Window of size k slides across — maintain running sum/max.",
          "<strong>Sliding Window (variable)</strong>: Expand right, shrink left when constraint violated — longest substring.",
          "Both techniques turn nested O(n²) loops into single O(n) passes.",
        ],
        keyConcepts: [
          "<strong>Sorted Two-Sum</strong> — Two pointers from ends, move inward",
          "<strong>Floyd's Cycle Detection</strong> — Fast/slow pointers meet if cycle exists",
          "<strong>Fixed Window</strong> — Size k, slide by 1, update incrementally",
          "<strong>Variable Window</strong> — Expand/shrink to satisfy constraint",
          "<strong>O(n) Time</strong> — Each element visited at most twice",
        ],
        realWorld:
          "TCP sliding window for flow control. String matching (longest substring without repeats). Palindrome detection. Memory management (compaction). Network packet windows.",
        tradeoffs: {
          pros: ["O(n) time, often O(1) space", "Avoids nested loops", "Intuitive once recognized"],
          cons: ["Requires sorted data for some variants", "Pattern recognition takes practice", "Not always applicable"],
        },
        codeExample: `// Two Sum (sorted array) — two pointers
function twoSum(arr, target) {
  let l = 0, r = arr.length - 1;
  while (l < r) {
    const sum = arr[l] + arr[r];
    if (sum === target) return [l, r];
    sum < target ? l++ : r--;
  }
}

// Sliding Window: longest substring without repeating chars
function lengthOfLongest(s) {
  const seen = new Map();
  let left = 0, max = 0;
  for (let right = 0; right < s.length; right++) {
    if (seen.has(s[right])) left = Math.max(left, seen.get(s[right]) + 1);
    seen.set(s[right], right);
    max = Math.max(max, right - left + 1);
  }
  return max;
}`,
        interviewTips: [
          "Recognize pair/subarray problems → two pointers or sliding window",
          "Know fixed vs variable window",
          "Practice: container with most water, min window substring",
        ],
      },
    },
    {
      id: "recursion-backtracking",
      title: "Recursion & Backtracking",
      icon: "🔄",
      description: "Solve problems by exploring all possibilities and undoing wrong choices.",
      tags: ["Recursion", "Backtracking", "DFS"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Recursion</strong> solves problems by calling itself on smaller inputs. <strong>Backtracking</strong> is recursion + undo: try a choice, recurse, and if it fails, undo and try the next choice. Perfect for generating all permutations, combinations, and solving puzzles.",
        howItWorks: [
          "Base case: smallest input with known answer (stops recursion)",
          "Recursive case: call self on smaller input, combine results",
          "Backtracking: make a choice → recurse → undo choice → try next",
          "Pruning: skip branches that can't lead to valid solution (early exit)",
          "Track state: maintain 'current path' and 'used' markers",
        ],
        keyConcepts: [
          "<strong>Base Case</strong> — Stops recursion (prevent stack overflow)",
          "<strong>Call Stack</strong> — Each recursive call adds a frame (O(depth) memory)",
          "<strong>Backtracking Template</strong> — Choose → Explore → Un-choose",
          "<strong>Pruning</strong> — Skip invalid branches early (N-Queens, Sudoku)",
          "<strong>Tail Recursion</strong> — Recursive call is last op (can be optimized)",
        ],
        realWorld:
          "File system traversal (find files). Parsing (AST, JSON). Sudoku/N-Queens solvers. Generate all permutations/combinations. Maze solving. Regex backtracking.",
        tradeoffs: {
          pros: ["Elegant for tree/graph/divide-conquer", "Backtracking explores all options", "Mirrors recursive problem structure"],
          cons: ["Stack overflow for deep recursion", "O(2^n) or O(n!) without pruning", "Often slower than iterative equivalents"],
        },
        codeExample: `// Backtracking: Generate all permutations
function permute(nums) {
  const result = [], used = new Set();
  function backtrack(path) {
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }
    for (const n of nums) {
      if (used.has(n)) continue;
      used.add(n); path.push(n);      // choose
      backtrack(path);                 // explore
      path.pop(); used.delete(n);      // un-choose
    }
  }
  backtrack([]);
  return result;
}
// permute([1,2,3]) → [[1,2,3],[1,3,2],[2,1,3],...]`,
        interviewTips: [
          "Always define base case first",
          "Use backtracking template: choose, explore, unchoose",
          "Add pruning for N-Queens/Sudoku to reduce runtime",
        ],
      },
    },
    {
      id: "bit-manipulation",
      title: "Bit Manipulation",
      icon: "⚡",
      description: "Operate on individual bits for ultra-fast, memory-efficient computations.",
      tags: ["Bits", "XOR", "Optimization"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Bit Manipulation</strong> operates on individual bits using bitwise operators (AND, OR, XOR, NOT, shifts). It enables O(1) operations for flags, sets, parity, and power-of-two checks — crucial for performance-critical and embedded code.",
        howItWorks: [
          "AND (&): Both bits 1 → 1. Used for masking/checking bits.",
          "OR (|): Either bit 1 → 1. Used for setting bits.",
          "XOR (^): Bits differ → 1. Used for toggling, finding unique elements.",
          "NOT (~): Flip all bits. Shift (<<, >>, >>>): Move bits left/right.",
          "Combine masks: (x & 0xFF) gets low byte, (x | (1 << n)) sets nth bit",
        ],
        keyConcepts: [
          "<strong>XOR Properties</strong> — a^a=0, a^0=a, a^b^a=b (find unique element)",
          "<strong>Power of Two</strong> — n & (n-1) == 0 (only one bit set)",
          "<strong>Swap Without Temp</strong> — a^=b; b^=a; a^=b",
          "<strong>Bit Masks</strong> — Flags packed into one integer (permissions, options)",
          "<strong>Shifts</strong> — << multiplies by 2, >> divides by 2 (>> is arithmetic, >>> logical)",
        ],
        realWorld:
          "Permissions (Unix file modes). Network protocols (TCP flags). Graphics (color channels RGBA). Cryptography (hash functions). Bloom filters. Set operations (bitsets).",
        tradeoffs: {
          pros: ["Ultra-fast (single CPU cycle)", "Minimal memory (pack flags in int)", "Parallel across all bits"],
          cons: ["Less readable", "Platform-dependent (endianness)", "Easy to introduce subtle bugs"],
        },
        codeExample: `// Check power of two
const isPow2 = (n) => n > 0 && (n & (n-1)) === 0;
// 8 (1000) & 7 (0111) = 0 → power of 2 ✓

// Count set bits (Brian Kernighan's algorithm)
function popcount(n) {
  let count = 0;
  while (n) { n &= n - 1; count++; } // clears lowest set bit
  return count;
}

// Find unique number (all others appear twice)
function singleNumber(nums) {
  return nums.reduce((a, b) => a ^ b, 0);
}
// [4,1,2,1,2] → 4 (4^1^2^1^2 = 4^0^0 = 4)`,
        interviewTips: [
          "Remember XOR properties (a^a=0)",
          "Know power-of-two check: n & (n-1) == 0",
          "Practice: count bits, find unique, swap without temp",
        ],
      },
    },
    {
      id: "concurrency",
      title: "Concurrency & Parallelism",
      icon: "🔀",
      description: "Mutexes, semaphores, locks, and async patterns for multi-threaded code.",
      tags: ["Concurrency", "Threads", "Locks", "Async"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Concurrency</strong> is dealing with multiple tasks at once (interleaved). <strong>Parallelism</strong> is executing them simultaneously (true multi-core). Managing shared state requires synchronization: locks, mutexes, semaphores, and lock-free data structures.",
        howItWorks: [
          "<strong>Mutex</strong>: Mutual exclusion — only one thread enters critical section at a time",
          "<strong>Semaphore</strong>: Counter allowing N threads into a section (e.g., connection pool)",
          "<strong>Monitor</strong>: Mutex + condition variables (wait/signal)",
          "<strong>Lock-free</strong>: Atomic operations (compare-and-swap) — no blocking",
          "<strong>Actor Model</strong>: Isolated actors with message passing (no shared state)",
        ],
        keyConcepts: [
          "<strong>Race Condition</strong> — Result depends on thread timing (bug!)",
          "<strong>Deadlock</strong> — Threads wait on each other forever (circular dependency)",
          "<strong>Atomic Operation</strong> — Indivisible; completes without interruption",
          "<strong>Compare-And-Swap (CAS)</strong> — Lock-free primitive: read, compare, swap atomically",
          "<strong>Async/Await</strong> — Non-blocking; cooperative concurrency (single thread)",
        ],
        realWorld:
          "Node.js event loop (async I/O). Go goroutines (CSP model). Rust (ownership prevents data races). Java synchronized/concurrent. Database row locks.",
        tradeoffs: {
          pros: ["Better CPU utilization", "Responsive UIs (async)", "Throughput on multi-core"],
          cons: ["Race conditions", "Deadlocks", "Hard to debug (non-deterministic)"],
        },
        codeExample: `// Race condition (BAD)
let counter = 0;
// Thread A and B both do counter++ → may lose increments!
// counter++ = read, add, write (not atomic)

// Fix 1: Mutex (blocking)
const lock = new Mutex();
lock.acquire();
counter++;   // only one thread here at a time
lock.release();

// Fix 2: Atomic CAS (lock-free)
function increment() {
  let old;
  do {
    old = counter;
  } while (!CAS(counter, old, old + 1)); // retry if changed
}

// Fix 3: Async (cooperative, single-threaded)
async function fetchData() {
  const [a, b] = await Promise.all([fetchA(), fetchB()]);
  // no shared-state races, but not truly parallel
}`,
        interviewTips: [
          "Explain race conditions and deadlocks",
          "Know mutex vs semaphore vs monitor",
          "Discuss lock-free programming with CAS",
        ],
      },
    },
  ],
};
