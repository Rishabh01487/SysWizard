import type { Category } from "./types";

/**
 * Software Engineering & DevOps
 * Comprehensive coverage of SDLC, methodologies, design patterns, version control,
 * testing, CI/CD, observability, SRE, and API/engineering practices.
 */
export const SOFTWARE_ENG: Category = {
  id: "software-engineering",
  name: "Software Engineering & DevOps",
  icon: "🛠️",
  level: "intermediate",
  topics: [
    // ───────────────────────────────────────────────────────────────────────────
    // Software Development Life Cycle & Methodologies
    // ───────────────────────────────────────────────────────────────────────────
    {
      id: "sdlc",
      title: "Software Development Life Cycle (SDLC)",
      icon: "🔄",
      description: "The structured phases a software product moves through from idea to retirement.",
      tags: ["Process", "Lifecycle", "Planning"],
      hasAnimation: true,
      content: {
        overview:
          "The <strong>SDLC</strong> is a structured framework defining phases a software product passes through: requirements, design, implementation, testing, deployment, and maintenance. It provides discipline, traceability, and predictable delivery.",
        howItWorks: [
          "Requirements: gather and document functional/non-functional needs from stakeholders",
          "Design: translate requirements into architecture, data models, and interface specifications",
          "Implementation: developers write code from the design using agreed conventions",
          "Testing: verify each unit, integration path, and the whole system against acceptance criteria",
          "Deployment: release the verified build to staging and production environments",
          "Maintenance: patch bugs, evolve features, monitor health, and eventually retire the system",
        ],
        keyConcepts: [
          "<strong>Requirements Engineering</strong> — elicitation, analysis, specification, validation",
          "<strong>Verification vs Validation</strong> — 'are we building it right?' vs 'building the right thing?'",
          "<strong>V-Model</strong> — each dev phase maps to a corresponding test phase",
          "<strong>Traceability Matrix</strong> — links requirements → design → code → tests",
          "<strong>Retirement Phase</strong> — sunsetting and migrating off legacy systems",
        ],
        realWorld:
          "NASA, Boeing, and medical device companies (FDA-regulated) use strict SDLC with sign-offs. Modern teams blend SDLC phases inside Agile sprints, but the phase boundaries remain.",
        tradeoffs: {
          pros: ["Predictable and auditable", "Clear deliverables and gates", "Required for regulated industries"],
          cons: ["Waterfall-style phase gates can slow delivery", "Risk of late defect discovery", "Heavy documentation overhead"],
        },
        codeExample: `# Example traceability matrix (CSV)
REQ-ID, DESIGN-ID, CODE-MODULE, TEST-ID
REQ-001, DES-010,  auth.py,     TEST-101
REQ-002, DES-011,  billing.py,  TEST-102
REQ-003, DES-012,  api.py,      TEST-103

# Each requirement must map to a design,
# an implementation, and a passing test.`,
        interviewTips: [
          "Mention that modern Agile still uses SDLC phases, just in smaller loops",
          "Distinguish verification (process) from validation (product)",
          "Cite regulated industries (aerospace, medical) where SDLC is mandatory",
        ],
      },
    },
    {
      id: "agile-scrum",
      title: "Agile & Scrum",
      icon: "🏃",
      description: "Iterative, value-driven delivery via sprints, ceremonies, roles, and artifacts.",
      tags: ["Agile", "Scrum", "Process"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Agile</strong> values individuals and interactions, working software, customer collaboration, and responding to change. <strong>Scrum</strong> is its most popular framework: time-boxed sprints, three roles, three artifacts, and five ceremonies.",
        howItWorks: [
          "Product Owner maintains a prioritized Product Backlog of user-valuable items",
          "Sprint Planning selects backlog items and crafts a Sprint Goal for the next 1-4 weeks",
          "Development Team self-organizes daily, syncing at the Daily Standup (15 min)",
          "Sprint Review demonstrates working increment to stakeholders and gathers feedback",
          "Sprint Retrospective inspects process and commits to one or two improvements",
          "Repeat — each Sprint produces a potentially-shippable Increment",
        ],
        keyConcepts: [
          "<strong>Scrum Roles</strong> — Product Owner, Scrum Master, Developers",
          "<strong>Artifacts</strong> — Product Backlog, Sprint Backlog, Increment",
          "<strong>Ceremonies</strong> — Planning, Standup, Review, Retrospective, Refinement",
          "<strong>Definition of Done</strong> — shared agreement on what 'done' means",
          "<strong>Velocity</strong> — rolling average of completed story points per sprint",
        ],
        realWorld:
          "Spotify, Atlassian, and Salesforce run Scrum at scale. SAFe and LeSS scale Scrum to hundreds of teams. The 2020 Scrum Guide is the canonical reference.",
        tradeoffs: {
          pros: ["Adaptive to changing requirements", "Fast feedback loops", "High transparency"],
          cons: ["Scope creep without discipline", "Meetings can consume time", "Hard to estimate without stable team"],
        },
        codeExample: `# Product Backlog Item (user story) example
As a registered shopper
I want to save items to a wishlist
So that I can purchase them later

Acceptance Criteria:
- Wishlist persists across sessions
- Max 100 items per user
- API responds < 200ms p95
- Covered by unit + e2e tests

Story Points: 5   Priority: High`,
        interviewTips: [
          "Know the 4 Agile values and 12 principles cold",
          "Be able to differentiate Scrum, Kanban, and XP",
          "Explain why Scrum Master is a servant-leader, not a manager",
        ],
      },
    },
    {
      id: "kanban",
      title: "Kanban",
      icon: "📋",
      description: "Visualize work, limit WIP, and pull flow continuously—no fixed sprints.",
      tags: ["Agile", "Flow", "Lean"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Kanban</strong> visualizes work on a board with explicit policies, limits Work-In-Progress (WIP), and uses a pull system to expose bottlenecks. It optimizes for <strong>flow</strong> rather than fixed iterations.",
        howItWorks: [
          "Visualize the workflow as columns: Backlog → To Do → In Progress → Review → Done",
          "Apply WIP limits per column (e.g., max 3 items In Progress)",
          "Team pulls new work only when capacity opens downstream (pull, not push)",
          "Blocked or aging items surface immediately on the board",
          "Monitor Cumulative Flow Diagram (CFD) to spot bottlenecks visually",
          "Continuously tune policies and limits based on cycle/lead time data",
        ],
        keyConcepts: [
          "<strong>WIP Limit</strong> — maximum concurrent items per column to prevent overload",
          "<strong>Lead Time</strong> — request arrival to delivery; <strong>Cycle Time</strong> — start of work to done",
          "<strong>Cumulative Flow Diagram</strong> — bands show backlog, in-progress, done over time",
          "<strong>Explicit Policies</strong> — written rules for entry/exit criteria per column",
          "<strong>Pull System</strong> — downstream demand triggers upstream production",
        ],
        realWorld:
          "Toyota Production System is the origin. DevOps teams use Kanban for ops tickets; Jira, Linear, and GitHub Projects implement it. Netflix and Stripe blend Kanban with continuous deployment.",
        tradeoffs: {
          pros: ["No sprint ceremony overhead", "Bottlenecks become visible fast", "Great for ops/support work"],
          cons: ["Lack of time-boxing can dilute urgency", "Harder to forecast release dates", "Requires discipline to enforce WIP"],
        },
        codeExample: `# Cumulative Flow data (per day)
date, backlog, in_progress, done
2024-01-01, 40, 8, 0
2024-01-02, 38, 9, 2
2024-01-03, 35, 10, 5
2024-01-04, 33, 11, 9

# WIP limit policy (yaml)
board:
  columns:
    - name: in_progress
      wip_limit: 3
    - name: review
      wip_limit: 2`,
        interviewTips: [
          "Contrast Kanban (continuous) vs Scrum (time-boxed)",
          "Explain that WIP limits are the key mechanism",
          "Mention Little's Law: Lead Time = WIP / Throughput",
        ],
      },
    },
    {
      id: "extreme-programming",
      title: "Extreme Programming (XP)",
      icon: "🤺",
      description: "Engineering-intensive Agile: TDD, pair programming, CI, and continuous refactoring.",
      tags: ["Agile", "Engineering", "XP"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Extreme Programming (XP)</strong> takes good engineering practices to the extreme: if testing is good, test all the time (TDD); if reviews are good, review continuously (pair programming); if integration is good, integrate every commit (CI).",
        howItWorks: [
          "Customer writes user stories with the on-site customer",
          "Developers write a failing test (Red), implement minimal code to pass (Green), then refactor",
          "Pair programming: two devs at one keyboard—driver writes, navigator reviews in real time",
          "Continuous Integration runs the full suite on every push, fast feedback",
          "Refactoring keeps the design clean under changing requirements",
          "Small releases ship working software to production frequently",
        ],
        keyConcepts: [
          "<strong>TDD</strong> — Red-Green-Refactor cycle, tests first",
          "<strong>Pair Programming</strong> — Driver + Navigator roles, rotate often",
          "<strong>Collective Code Ownership</strong> — anyone can improve any code",
          "<strong>Continuous Integration</strong> — integrate several times a day",
          "<strong>Simple Design</strong> — YAGNI: build only what's needed now",
        ],
        realWorld:
          "Kent Beck created XP at Chrysler C3 in 1996. Industrial Logic and Pivotal Labs still teach XP practices. Many of XP's practices (TDD, CI, refactoring) are now mainstream DevOps.",
        tradeoffs: {
          pros: ["Very high code quality", "Knowledge spreads rapidly", "Design stays flexible"],
          cons: ["Demanding on developers", "Pairing all day can be exhausting", "Requires mature engineers"],
        },
        codeExample: `// TDD cycle in Jest — Red → Green → Refactor
test('cart adds item', () => {
  const cart = new Cart();
  cart.add({ id: 1, price: 10 });
  expect(cart.total()).toBe(10);    // Red: fails initially
});

// Minimal implementation to pass
class Cart {
  items = [];
  add(i) { this.items.push(i); }
  total() { return this.items.reduce((s, i) => s + i.price, 0); }
}`,
        interviewTips: [
          "List the 12 XP practices (test-first, pair prog, CI, refactoring, small releases, etc.)",
          "Explain Red-Green-Refactor",
          "Pair programming isn't 'two people doing one job' — it's quality + knowledge transfer",
        ],
      },
    },
    {
      id: "waterfall-vs-agile",
      title: "Waterfall vs Agile vs Hybrid",
      icon: "🌊",
      description: "Choose the right process model based on requirements stability, risk, and team context.",
      tags: ["Process", "Comparison", "Methodology"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Waterfall</strong> completes each phase fully before the next; <strong>Agile</strong> iterates in small loops; <strong>Hybrid</strong> blends them—often Agile delivery inside a Waterfall governance shell. Each fits different problem shapes.",
        howItWorks: [
          "Waterfall: gather ALL requirements → design ALL → code ALL → test ALL → deploy",
          "Agile: pick small slice → design → code → test → demo → repeat",
          "Hybrid (Water-Scrum-Fall): up-front architecture and planning, Agile sprints for delivery, formal release gates",
          "Selection criteria: requirements stability, regulatory constraints, contract type, team maturity",
          "Waterfall thrives when change is costly; Agile when learning is valuable",
        ],
        keyConcepts: [
          "<strong>Phased Gates</strong> — formal review/sign-off at end of each Waterfall phase",
          "<strong>Iterative vs Incremental</strong> — refine one piece vs add new pieces",
          "<strong>Plan-Driven vs Value-Driven</strong> — predict vs adapt",
          "<strong>Scaled Hybrid</strong> — SAFe combines portfolio (waterfall-ish) + team (agile)",
          "<strong>Change Cost Curve</strong> — late changes cost more in Waterfall, less in Agile",
        ],
        realWorld:
          "Aerospace, construction, and FDA/medical use Waterfall for safety-critical components. Spotify, Netflix, and most SaaS use Agile. Large enterprises (banks, gov) often run Hybrid.",
        tradeoffs: {
          pros: ["Waterfall: predictable for stable scope", "Agile: adaptive and feedback-driven", "Hybrid: balances governance and speed"],
          cons: ["Waterfall: late feedback, brittle to change", "Agile: scope creep without discipline", "Hybrid: can inherit worst of both"],
        },
        codeExample: `# Decision matrix
factor               | Waterfall | Agile | Hybrid
---------------------|-----------|-------|-------
Requirements stable  |    ✓✓     |  ✗    |  ✓
Regulatory overhead  |    ✓✓     |  ✗    |  ✓✓
Need fast feedback   |    ✗      |  ✓✓   |  ✓
Fixed-price contract |    ✓✓     |  ✗    |  ✓
Team is mature       |    ~      |  ✓✓   |  ✓`,
        interviewTips: [
          "Don't dismiss Waterfall—mention where it's the right answer",
          "Hybrid is the dominant reality in large enterprises",
          "Tie the choice to risk: known risk → Waterfall, unknown risk → Agile",
        ],
      },
    },
    {
      id: "tdd-bdd",
      title: "TDD vs BDD",
      icon: "🧪",
      description: "Test-first styles: TDD drives design from unit tests; BDD drives behavior from examples.",
      tags: ["Testing", "TDD", "BDD"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>TDD</strong> writes failing unit tests before code (Red-Green-Refactor) to drive design at the unit level. <strong>BDD</strong> expresses behavior in Given-When-Then scenarios that stakeholders can read, driving design at the feature level.",
        howItWorks: [
          "TDD Red: write a small failing test for the next behavior",
          "TDD Green: write minimal code to make it pass",
          "TDD Refactor: improve structure while keeping tests green",
          "BDD Discovery: stakeholders discuss examples in Given-When-Then form",
          "BDD Formulation: scenarios automated (Cucumber/SpecFlow) as executable specs",
          "BDD Automation: steps implemented; failures drive next development",
        ],
        keyConcepts: [
          "<strong>Red-Green-Refactor</strong> — the TDD cycle",
          "<strong>Given-When-Then</strong> — BDD scenario structure (Gherkin syntax)",
          "<strong>Outside-In</strong> — BDD starts at the acceptance level, drives inward",
          "<strong>Ubiquitous Language</strong> — BDD scenarios use domain terms shared by all",
          "<strong>Executable Specification</strong> — tests that also document behavior",
        ],
        realWorld:
          "Cucumber, SpecFlow, Behave, and Jasmine/Mocha are common tools. ThoughtWorks, the BBC, and many fintech firms use BDD to align product and engineering. TDD is universal in mature engineering cultures.",
        tradeoffs: {
          pros: ["Forces clarity before coding", "Live documentation via executable specs", "Catch defects at lowest-cost layer"],
          cons: ["Slower initial velocity", "Tests can become a maintenance burden", "Hard to apply to UI/legacy code"],
        },
        codeExample: `# BDD — Gherkin scenario (Cucumber)
Feature: Wishlist
  Scenario: Add item to wishlist
    Given a logged-in user
    When they add product "X" to their wishlist
    Then the wishlist should contain 1 item
    And the API should respond with 201

# TDD — Jest unit test
test('wishlist adds item', () => {
  const w = new Wishlist();
  w.add('X');
  expect(w.size).toBe(1);
});`,
        interviewTips: [
          "TDD is about design, not just tests—say it explicitly",
          "BDD aligns business + tech via shared language",
          "Mention that Given-When-Then comes from Gherkin",
        ],
      },
    },
    {
      id: "ddd-domain-driven-design",
      title: "Domain-Driven Design (DDD)",
      icon: "🧠",
      description: "Model software around the business domain with ubiquitous language and bounded contexts.",
      tags: ["Architecture", "Modeling", "DDD"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Domain-Driven Design</strong> aligns software models with the business domain. Strategic design defines <strong>Bounded Contexts</strong> and a <strong>Ubiquitous Language</strong>; tactical design builds Aggregates, Entities, Value Objects, and Domain Events.",
        howItWorks: [
          "Event Storming: domain experts and engineers map domain events on a timeline",
          "Identify Bounded Contexts—clusters of related concepts with one ubiquitous language",
          "Define Context Maps showing relationships (upstream/downstream, conformist, ACL)",
          "Inside each context model Aggregates with strict invariants and a single root",
          "Implement Entities (identity), Value Objects (no identity), Domain Events (facts)",
          "Repositories and Application Services orchestrate use cases around the model",
        ],
        keyConcepts: [
          "<strong>Ubiquitous Language</strong> — shared vocabulary used by code and business",
          "<strong>Bounded Context</strong> — explicit boundary where a model is valid",
          "<strong>Aggregate Root</strong> — single entry point enforcing invariants of a cluster",
          "<strong>Value Object</strong> — immutable, compared by value (Money, Address)",
          "<strong>Domain Event</strong> — a fact that happened in the past (OrderPlaced)",
          "<strong>Anti-Corruption Layer (ACL)</strong> — protects a context from legacy models",
        ],
        realWorld:
          "Eric Evans' 2003 book. Used at Shopify (orders), Atlassian, and many fintechs. Context Maps guide microservice decomposition. Event Storming is the modern discovery workshop format.",
        tradeoffs: {
          pros: ["Code mirrors business reality", "Bounded Contexts align with microservices", "Reduces translation loss between teams"],
          cons: ["Steep learning curve", "Overkill for CRUD apps", "Requires ongoing domain expert collaboration"],
        },
        codeExample: `// Tactical DDD in TypeScript
class OrderId { constructor(readonly value: string) {} }  // VO

class Order {                                            // Aggregate Root
  private lines: OrderLine[] = [];
  constructor(readonly id: OrderId, readonly customerId: string) {}
  addLine(sku: string, qty: number, price: Money) {
    if (qty <= 0) throw new Error('qty must be positive');
    this.lines.push(new OrderLine(sku, qty, price));
    DomainEvents.publish(new ItemAdded(this.id, sku, qty));
  }
  total(): Money { return this.lines.reduce((s, l) => s.add(l.price.times(l.qty)), Money.ZERO); }
}`,
        interviewTips: [
          "Differentiate strategic (contexts) vs tactical (aggregates) DDD",
          "Bounded Context ≠ microservice, but often maps to one",
          "Explain that Aggregate Root enforces invariants and transactional consistency",
        ],
      },
    },
    {
      id: "clean-architecture",
      title: "Clean / Hexagonal Architecture",
      icon: "🏛️",
      description: "Separate business logic from infrastructure via dependency inversion and ports & adapters.",
      tags: ["Architecture", "SOLID", "Layered"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Clean Architecture</strong> (Robert C. Martin), <strong>Hexagonal</strong> (Cockburn), and <strong>Onion</strong> (Palermo) all invert dependencies so the business core depends on nothing external. UI, DB, and frameworks become replaceable plugins via <strong>ports and adapters</strong>.",
        howItWorks: [
          "Innermost layer: Enterprise Business Rules (Entities) — pure, framework-free",
          "Next layer: Application Business Rules (Use Cases) — orchestrate entities",
          "Interface Adapters: controllers, presenters, gateways translate between layers",
          "Outermost layer: Frameworks & Drivers — web, DB, cloud SDKs as plug-ins",
          "Define Ports (interfaces) in inner layers; implement Adapters in outer layers",
          "Dependency Rule: dependencies point inward only — outer knows inner, never reverse",
        ],
        keyConcepts: [
          "<strong>Dependency Inversion</strong> — high-level policy never depends on low-level details",
          "<strong>Ports & Adapters</strong> — ports are interfaces; adapters implement them for tech",
          "<strong>Use Case (Interactor)</strong> — application-specific business rule",
          "<strong>Entity</strong> — enterprise-wide, most stable business rule",
          "<strong>Boundary</strong> — interface crossing where data is mapped (DTOs)",
        ],
        realWorld:
          "Used by ThoughtWorks projects, many enterprise Java/Spring apps, and the Node.js NestJS framework. Architectural tests (e.g., ArchUnit, dependency-cruiser) enforce the rules in CI.",
        tradeoffs: {
          pros: ["Business logic is testable in isolation", "Swap DB/UI without touching core", "Forces clear separation of concerns"],
          cons: ["More boilerplate (interfaces, mappers)", "Steep for small CRUD apps", "Indirection can obscure flow"],
        },
        codeExample: `// Ports & Adapters in TypeScript
interface OrderRepository {                  // Port
  save(order: Order): Promise<void>;
}

class PlaceOrderUseCase {                    // Inner, stable
  constructor(private repo: OrderRepository) {}
  async execute(cmd) { /* ... */ }
}

class PostgresOrderRepo implements OrderRepository {  // Outer adapter
  async save(order) { /* pg INSERT */ }
}`,
        interviewTips: [
          "Quote the Dependency Rule: dependencies point inward",
          "Hexagonal, Onion, Clean are siblings—mention the family",
          "Use ArchUnit or dependency-cruiser to enforce rules in CI",
        ],
      },
    },
    {
      id: "solid-principles",
      title: "SOLID Principles",
      icon: "🧱",
      description: "Five design principles for maintainable object-oriented code: SRP, OCP, LSP, ISP, DIP.",
      tags: ["Design", "OOP", "Principles"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>SOLID</strong> is five OOP design principles by Robert C. Martin: <strong>Single Responsibility</strong>, <strong>Open-Closed</strong>, <strong>Liskov Substitution</strong>, <strong>Interface Segregation</strong>, and <strong>Dependency Inversion</strong>. Together they reduce rigidity, fragility, and immobility of code.",
        howItWorks: [
          "SRP: a class has one reason to change—only one actor's needs drive it",
          "OCP: extend behavior by adding new code, not editing existing—via abstraction",
          "LSP: subtypes must be substitutable for their base types without surprise",
          "ISP: clients shouldn't depend on methods they don't use—split fat interfaces",
          "DIP: depend on abstractions, not concretions—high-level policy defines the interface",
          "Apply incrementally via refactoring; tests guard the behavior",
        ],
        keyConcepts: [
          "<strong>SRP</strong> — one responsibility, one reason to change",
          "<strong>OCP</strong> — open for extension, closed for modification",
          "<strong>LSP</strong> — derived classes must honor the base contract",
          "<strong>ISP</strong> — many small, client-specific interfaces beat one large one",
          "<strong>DIP</strong> — invert ownership of interfaces from consumer to policy",
        ],
        realWorld:
          "Standard guidance across Spring, .NET, and TypeScript codebases. Most design patterns (Strategy, Decorator, Adapter) are direct applications of SOLID. SonarQube flags many SOLID violations.",
        tradeoffs: {
          pros: ["Easier to extend and test", "Reduces regression risk", "Supports substitution and polymorphism"],
          cons: ["Over-application yields abstraction soup", "More files/interfaces", "Harder for newcomers to navigate"],
        },
        codeExample: `// OCP + DIP — adding shapes without modifying AreaCalculator
interface Shape { area(): number; }
class Square implements Shape { constructor(private s: number) {} area() { return this.s * this.s; } }
class Circle implements Shape { constructor(private r: number) {} area() { return Math.PI * this.r ** 2; } }

class AreaCalculator {
  constructor(private shapes: Shape[]) {}
  total() { return this.shapes.reduce((s, x) => s + x.area(), 0); }
  // No edit needed when Triangle is added
}`,
        interviewTips: [
          "Be ready to write the OCP + Strategy pattern example live",
          "LSP classic example: Square inherits Rectangle—breaks invariant",
          "DIP is the engine behind Clean Architecture",
        ],
      },
    },
    {
      id: "dry-kiss-yagni",
      title: "DRY, KISS, YAGNI, AHA",
      icon: "✂️",
      description: "Foundational programming heuristics: don't repeat, keep it simple, don't over-build.",
      tags: ["Principles", "Design", "Heuristics"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>DRY</strong> (Don't Repeat Yourself) eliminates duplication of knowledge. <strong>KISS</strong> (Keep It Simple, Stupid) prefers the simplest solution. <strong>YAGNI</strong> (You Aren't Gonna Need It) forbids speculative features. <strong>AHA</strong> (Avoid Hasty Abstractions) prioritizes duplication over premature abstraction.",
        howItWorks: [
          "DRY: when the same rule changes in two places, centralize it",
          "KISS: among options that meet requirements, pick the simplest",
          "YAGNI: skip features not required by current stories, even if 'obviously coming'",
          "AHA: tolerate duplication until a third case reveals the true abstraction",
          "Rule of Three: refactor to abstraction only on the third duplication",
          "Balance: YAGNI vs KISS vs DRY can conflict—choose for the local context",
        ],
        keyConcepts: [
          "<strong>Single Source of Truth</strong> — DRY at the data/config level",
          "<strong>Rule of Three</strong> — abstraction justified only on third occurrence",
          "<strong>Essential vs Accidental Complexity</strong> — Brooks' distinction",
          "<strong>Premature Abstraction</strong> — wrong abstraction is worse than duplication",
          "<strong>Worse Is Better</strong> — simple software wins in the marketplace",
        ],
        realWorld:
          "The Pragmatic Programmer (Hunt & Thomas) popularized DRY. Kent Beck's 'Make it work, make it right, make it fast' embodies KISS/YAGNI. Sandi Metz's POODR teaches 'Rule of Three'.",
        tradeoffs: {
          pros: ["Less code to maintain", "Easier onboarding", "Avoids speculative complexity"],
          cons: ["DRY taken too far creates brittle coupling", "YAGNI can under-build for scale", "Requires judgment to balance"],
        },
        codeExample: `// BAD: DRY over-applied — wrong abstraction
class DataProcessor { process(d, fn) { return fn(d); } } // over-generic

// GOOD: tolerate duplication, abstract on third case
function sum(nums)  { return nums.reduce((a,b) => a + b, 0); }
function product(nums) { return nums.reduce((a,b) => a * b, 1); }
// Only when a THIRD reducer appears, introduce a reduceWith(fn, init)`,
        interviewTips: [
          "Quote Sandi Metz: 'duplication is far cheaper than the wrong abstraction'",
          "Distinguish DRY (knowledge) from DRY (code)—repeated code ≠ repeated knowledge",
          "YAGNI pairs with evolutionary architecture",
        ],
      },
    },

    // ───────────────────────────────────────────────────────────────────────────
    // Design Patterns (GoF & beyond)
    // ───────────────────────────────────────────────────────────────────────────
    {
      id: "creational-patterns",
      title: "Creational Design Patterns",
      icon: "🏗️",
      description: "Patterns that abstract object creation: Singleton, Factory, Builder, Prototype, Abstract Factory.",
      tags: ["Patterns", "GoF", "Creation"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Creational Patterns</strong> decouple clients from how objects are constructed. The Gang of Four defined five: <strong>Singleton</strong> (one instance), <strong>Factory Method</strong> (subclass decides), <strong>Abstract Factory</strong> (families), <strong>Builder</strong> (stepwise), and <strong>Prototype</strong> (clone).",
        howItWorks: [
          "Singleton: private constructor + static instance accessor (or use DI container lifecycle)",
          "Factory Method: define createProduct() in base class; subclass returns concrete product",
          "Abstract Factory: a factory of factories—create related products as a family",
          "Builder: separate director stepwise assembling parts; one product per build() call",
          "Prototype: implement clone(); new instances via cloning a registered prototype",
          "Modern usage: prefer DI containers and functions over raw GoF in many languages",
        ],
        keyConcepts: [
          "<strong>Singleton</strong> — single instance, global access (use sparingly)",
          "<strong>Factory Method</strong> — defer instantiation to subclasses",
          "<strong>Abstract Factory</strong> — produce families of related objects",
          "<strong>Builder</strong> — separate construction of complex object from representation",
          "<strong>Prototype</strong> — clone to create new instances",
        ],
        realWorld:
          "Java's java.lang.Runtime is a Singleton. StringBuilder is a Builder. Spring's BeanFactory is a Factory/Abstract Factory. Object.create() in JS is the Prototype pattern.",
        tradeoffs: {
          pros: ["Decouples client from concrete types", "Centralizes construction logic", "Supports configuration-driven creation"],
          cons: ["Singleton hides dependencies and harms testing", "Extra classes increase complexity", "Easy to misuse in dynamic languages"],
        },
        codeExample: `// Builder pattern (TypeScript)
class Pizza {
  size!: string; cheese = false; pepperoni = false;
  static builder() { return new PizzaBuilder(); }
}
class PizzaBuilder {
  private p = new Pizza();
  size(s: string)            { this.p.size = s; return this; }
  addCheese()                { this.p.cheese = true; return this; }
  addPepperoni()             { this.p.pepperoni = true; return this; }
  build()                    { return this.p; }
}
const p = Pizza.builder().size('L').addCheese().addPepperoni().build();`,
        interviewTips: [
          "Singleton—mention double-checked locking and the per-class-loader gotcha",
          "Builder is the fluent-API pattern; very common",
          "Prefer DI container lifetimes over hand-rolled Singleton",
        ],
      },
    },
    {
      id: "structural-patterns",
      title: "Structural Design Patterns",
      icon: "🧩",
      description: "Compose classes/objects into larger structures: Adapter, Decorator, Facade, Proxy, Composite.",
      tags: ["Patterns", "GoF", "Structure"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Structural Patterns</strong> compose classes and objects into larger structures while keeping them flexible. GoF structural set: <strong>Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy</strong>.",
        howItWorks: [
          "Adapter: wraps an incompatible interface so a client can use it",
          "Decorator: wraps an object to add behavior dynamically, same interface",
          "Facade: presents a simplified front to a complex subsystem",
          "Proxy: stands in for a real object—lazy, remote, protective, or caching",
          "Composite: treats individual objects and compositions uniformly (trees)",
          "Bridge: decouples abstraction from implementation so they vary independently",
        ],
        keyConcepts: [
          "<strong>Adapter</strong> — converts one interface to another",
          "<strong>Decorator</strong> — 'wraps and enhances' preserving interface",
          "<strong>Facade</strong> — simplified entry point to a subsystem",
          "<strong>Proxy</strong> — placeholder controlling access to a subject",
          "<strong>Composite</strong> — uniform treatment of leaf and composite nodes",
        ],
        realWorld:
          "Java InputStream stack (FilterInputStream decorators). Spring's AOP proxies. React's higher-order components are decorators. REST adapters over SOAP services. java.awt Component/Container is Composite.",
        tradeoffs: {
          pros: ["Compose behavior without editing existing classes", "Promotes single responsibility", "Enables runtime composition"],
          cons: ["Many small wrapper classes", "Debugging through layers is hard", "Overuse obscures flow"],
        },
        codeExample: `// Decorator — logging wrapper around an HTTP client
interface HttpClient { get(url: string): Promise<string>; }
class FetchClient implements HttpClient {
  get(url: string) { return fetch(url).then(r => r.text()); }
}
class LoggingClient implements HttpClient {
  constructor(private inner: HttpClient) {}
  async get(url: string) {
    console.log('GET', url);
    const res = await this.inner.get(url);
    console.log('→', res.length, 'bytes');
    return res;
  }
}
const c = new LoggingClient(new FetchClient());`,
        interviewTips: [
          "Decorator preserves interface; Adapter changes interface",
          "Proxy controls access; Decorator adds behavior",
          "Composite enables tree recursion with uniform API",
        ],
      },
    },
    {
      id: "behavioral-patterns",
      title: "Behavioral Design Patterns",
      icon: "🎯",
      description: "Patterns for object interaction and responsibility assignment: Strategy, Observer, Command, State.",
      tags: ["Patterns", "GoF", "Behavior"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Behavioral Patterns</strong> assign responsibility and define communication between objects. GoF set: <strong>Strategy, Observer, Command, State, Template Method, Iterator, Mediator, Visitor, Chain of Responsibility, Memento, Interpreter</strong>.",
        howItWorks: [
          "Strategy: encapsulate interchangeable algorithms behind one interface",
          "Observer: subject notifies subscribers when state changes (pub-sub)",
          "Command: encapsulate a request as an object—supports undo/queue/log",
          "State: object changes behavior when internal state changes",
          "Template Method: base class defines skeleton; subclasses fill in steps",
          "Visitor: add operations to a structure without modifying its classes",
        ],
        keyConcepts: [
          "<strong>Strategy</strong> — pluggable algorithm",
          "<strong>Observer</strong> — publish/subscribe decoupling",
          "<strong>Command</strong> — action as object (queue, undo, replay)",
          "<strong>State</strong> — behavior varies with state (FSM in code)",
          "<strong>Chain of Responsibility</strong> — pass request along handlers",
        ],
        realWorld:
          "Event emitters in Node.js (Observer). Redux actions (Command). Java's Comparator (Strategy). UI state machines in XState (State). Express middleware (Chain of Responsibility). React's render is a Template Method variant.",
        tradeoffs: {
          pros: ["Decoupled, pluggable behavior", "Open for extension (OCP)", "Centralizes interaction logic"],
          cons: ["Extra classes and indirection", "Observer can cause memory leaks", "Visitor breaks when classes change"],
        },
        codeExample: `// Strategy + Command in TypeScript
interface SortStrategy { sort<T>(xs: T[]): T[]; }
class QuickSort implements SortStrategy { sort<T>(xs: T[]): T[] { /* ... */ return xs; } }
class MergeSort implements SortStrategy { sort<T>(xs: T[]): T[] { /* ... */ return xs; } }

class Sorter {
  constructor(private strategy: SortStrategy) {}
  setStrategy(s: SortStrategy) { this.strategy = s; }
  run<T>(xs: T[]) { return this.strategy.sort(xs); }
}`,
        interviewTips: [
          "Strategy vs State: Strategy chosen externally, State changes internally",
          "Observer—mention weak references to avoid leaks",
          "Command enables undo, queueing, and event sourcing",
        ],
      },
    },
    {
      id: "dependency-injection",
      title: "Dependency Injection & IoC",
      icon: "💉",
      description: "Invert control: components receive dependencies rather than create them.",
      tags: ["Patterns", "DI", "IoC"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Dependency Injection (DI)</strong> implements Inversion of Control by supplying a component's dependencies from outside, rather than having it construct them. A <strong>DI container</strong> resolves the graph, manages lifetimes, and wires the application at startup.",
        howItWorks: [
          "Component declares dependencies via constructor, setter, or field",
          "DI container (Composition Root) resolves dependencies recursively",
          "Container configures bindings: interface → implementation",
          "Lifetimes selected: transient, singleton, scoped, request",
          "On startup, container composes the object graph",
          "Tests inject mocks/fakes via the same constructor—no service locator needed",
        ],
        keyConcepts: [
          "<strong>Composition Root</strong> — single place where the graph is wired",
          "<strong>Constructor Injection</strong> — preferred; immutable, testable",
          "<strong>Lifetimes</strong> — singleton, scoped, transient, per-request",
          "<strong>Service Locator</strong> — anti-pattern: components pull deps themselves",
          "<strong>IoC</strong> — broader principle: framework calls your code (Hollywood Principle)",
        ],
        realWorld:
          "Spring (Java), .NET DI, NestJS, Angular, Dagger (Go), InversifyJS. AWS Lambda bootstraps are composition roots. Modern frameworks wire DI automatically via decorators or reflection.",
        tradeoffs: {
          pros: ["Improves testability dramatically", "Decouples classes from concrete deps", "Centralizes lifecycle management"],
          cons: ["Container magic obscures flow", "Runtime resolution failures", "Performance cost of reflection"],
        },
        codeExample: `// NestJS-style DI in TypeScript
@Injectable()
class EmailService { async send(to: string, msg: string) { /* ... */ } }

@Injectable()
class UserService {
  constructor(private email: EmailService) {}   // injected
  async register(u: { email: string }) {
    await this.email.send(u.email, 'Welcome');
  }
}

@Module({
  providers: [EmailService, UserService],
})
class AppModule {}`,
        interviewTips: [
          "Distinguish DI (mechanism) from IoC (principle)",
          "Constructor injection > setter injection > service locator",
          "Composition Root is the only place that should know about the container",
        ],
      },
    },
    {
      id: "refactoring-code-smells",
      title: "Code Smells & Refactoring",
      icon: "👃",
      description: "Recognize structural smells (god class, long method) and apply disciplined refactorings.",
      tags: ["Refactoring", "Quality", "Maintainability"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Code Smells</strong> (Fowler & Beck) are surface indicators of deeper design problems—<strong>not bugs</strong>, but weaknesses. <strong>Refactoring</strong> changes internal structure without changing behavior, guided by tests, to remove smells.",
        howItWorks: [
          "Identify smell: long method, large class, long parameter list, duplicate code",
          "Identify smell: shotgun surgery, divergent change, feature envy, data clumps",
          "Identify smell: primitive obsession, switch statements, speculative generality",
          "Verify safety: green tests cover current behavior",
          "Apply a named refactoring: Extract Method, Move Method, Replace Conditional w/ Polymorphism",
          "Run tests after each tiny step—never refactor without safety net",
        ],
        keyConcepts: [
          "<strong>Bloaters</strong> — long method, large class, long parameter list, data clumps",
          "<strong>Change Preventers</strong> — divergent change, shotgun surgery, parallel hierarchies",
          "<strong>Dispensables</strong> — comments, duplicate code, lazy class, speculative generality",
          "<strong>Couplers</strong> — feature envy, inappropriate intimacy, message chains, middle man",
          "<strong>Extract Method</strong> — most-used refactoring; turns a fragment into a named method",
        ],
        realWorld:
          "Martin Fowler's 'Refactoring' (1999, 2nd ed 2018). IDEs (IntelliJ, Eclipse, VS Code) ship automated refactorings. SonarQube and CodeClimate auto-detect smells in CI.",
        tradeoffs: {
          pros: ["Reduced future maintenance cost", "Easier to add features safely", "Improves readability"],
          cons: ["Risk of regression without tests", "Short-term velocity dip", "Can be over-applied (gold-plating)"],
        },
        codeExample: `// BEFORE: long method with embedded logic
function invoice(o: Order) {
  let total = 0;
  for (const l of o.lines) {
    const base = l.qty * l.price;
    const disc = o.cust.vip ? base * 0.1 : 0;
    total += base - disc;
  }
  return total;
}

// AFTER: Extract Method + Replace Magic with constant
const VIP_DISCOUNT = 0.1;
function lineTotal(l: Line, vip: boolean) {
  const base = l.qty * l.price;
  return base - (vip ? base * VIP_DISCOUNT : 0);
}
function invoice(o: Order) {
  return o.lines.reduce((s, l) => s + lineTotal(l, o.cust.vip), 0);
}`,
        interviewTips: [
          "Always say 'refactor only with green tests'",
          "Know 5+ smells by name and the corresponding refactoring",
          "Extract Method is the gateway refactoring—mention it first",
        ],
      },
    },
    {
      id: "technical-debt",
      title: "Technical Debt",
      icon: "💳",
      description: "The cost of expedient short-term choices; manage deliberately like financial debt.",
      tags: ["Process", "Quality", "Strategy"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Technical Debt</strong> is the future cost of today's shortcuts. Martin Fowler's quadrant distinguishes <strong>Reckless vs Prudent</strong> and <strong>Deliberate vs Inadvertent</strong>. Like financial debt, it can be strategic—borrowing speed against future maintenance—but must be tracked and paid down.",
        howItWorks: [
          "Acquire debt: ship a quick fix to hit a deadline (deliberate) or unintentionally (inadvertent)",
          "Record the debt: a ticket tagged 'tech-debt' with rationale and impact",
          "Quantify interest: slower velocity, more bugs, harder onboarding",
          "Allocate capacity: ~20% of sprint to debt payoff (rule of thumb)",
          "Pay down via targeted refactoring during adjacent feature work",
          "Track debt ratio over time; rising debt = warning signal",
        ],
        keyConcepts: [
          "<strong>Reckless/Prudent</strong> — careless vs informed choice",
          "<strong>Deliberate/Inadvertent</strong> — known vs discovered later",
          "<strong>Interest</strong> — recurring cost imposed by the debt",
          "<strong>Principal</strong> — one-time cost to pay it off",
          "<strong>Bit Rot</strong> — gradual degradation as the environment evolves",
        ],
        realWorld:
          "Quadrant originated by Martin Fowler (2009). SonarQube and CodeScene quantify debt in time. Many platform teams reserve 15-25% capacity for debt reduction.",
        tradeoffs: {
          pros: ["Strategic debt enables speed to market", "Explicit tracking enables planning", "Healthy debt improves product/market fit"],
          cons: ["Reckless debt compounds silently", "Untracked debt destroys morale", "Bankruptcy: rewrite becomes cheaper than evolve"],
        },
        codeExample: `# Tech-debt ticket template (markdown)
## Debt: OrderService bypasses repository
**Type**: Reckless-Inadvertent
**Acquired**: 2024-03-12 (deadline for Black Friday)
**Interest**: every change to orders touches SQL directly; 2 bugs/quarter
**Principal**: ~3 dev-days to refactor to OrderRepository
**Plan**: pay down during Q2 payments rewrite
**Owner**: @payments-team`,
        interviewTips: [
          "Know Fowler's quadrant—name all four cells",
          "Distinguish strategic debt from accidental debt",
          "Argue for sustainable ~20% capacity for debt",
        ],
      },
    },

    // ───────────────────────────────────────────────────────────────────────────
    // Version Control & Collaboration
    // ───────────────────────────────────────────────────────────────────────────
    {
      id: "git-workflow-gitflow",
      title: "Git Branching Strategies",
      icon: "🌿",
      description: "GitFlow, Trunk-Based Development, and GitHub Flow—choose by team size and release cadence.",
      tags: ["Git", "Workflow", "Branching"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>GitFlow</strong> uses long-lived develop/release/hotfix branches. <strong>Trunk-Based Development</strong> integrates everyone on a single main branch, often daily. <strong>GitHub Flow</strong> is main + short-lived feature branches with PRs.",
        howItWorks: [
          "GitFlow: feature → develop → release → main; hotfix from main back-merged",
          "Trunk-Based: feature branches < 24h; merge to main via small PRs; feature flags hide WIP",
          "GitHub Flow: feature branch → PR → review → squash-merge to main → deploy",
          "All strategies rely on a strong CI gate on every push",
          "Release strategy is orthogonal: release branches or trunk + tags",
        ],
        keyConcepts: [
          "<strong>Trunk-Based Development</strong> — favored for continuous deployment",
          "<strong>Feature Flag</strong> — decouple deploy from release (required for trunk-based)",
          "<strong>PR Review</strong> — quality gate before integration",
          "<strong>Squash Merge</strong> — collapse commits to keep history linear",
          "<strong>Release Branch</strong> — stabilization branch for a specific release",
        ],
        realWorld:
          "Google and Facebook mandate trunk-based. GitFlow (Vincent Driessen, 2010) suits versioned on-prem software. GitHub Flow dominates SaaS. Trunk-based is the DevOps Research Assessment (DORA) recommended practice.",
        tradeoffs: {
          pros: ["Trunk-based: fast integration, fewer merge conflicts", "GitFlow: explicit release control", "GitHub Flow: simple, dev-friendly"],
          cons: ["Trunk-based: requires feature flags + strong CI", "GitFlow: slow, merge-hell on long branches", "GitHub Flow: limited for multi-version products"],
        },
        codeExample: `# Trunk-based short-lived branch
git checkout main && git pull
git checkout -b feat/wishlist
# small commits, push within 24h
git push -u origin feat/wishlist
# open PR, CI green, review, squash-merge
git checkout main && git pull
git branch -d feat/wishlist

# GitFlow: release branch
git flow release start 1.4.0
# stabilize on release/1.4.0
git flow release finish 1.4.0`,
        interviewTips: [
          "Trunk-based correlates strongly with DORA elite performance",
          "Feature flags are prerequisite for trunk-based at scale",
          "GitFlow suits versioned software; GitHub Flow suits continuous-deploy SaaS",
        ],
      },
    },
    {
      id: "code-review",
      title: "Code Review & Pull Requests",
      icon: "🔍",
      description: "Quality gate before merge: review checklist, constructive feedback, automated checks.",
      tags: ["Quality", "Collaboration", "Process"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Code Review</strong> is a peer quality gate before integration. A <strong>Pull/Merge Request</strong> bundles a change with diff, description, automated checks, and discussion. Good reviews improve quality, spread knowledge, and catch design issues—without becoming bottlenecks.",
        howItWorks: [
          "Author opens PR: small, focused, with description and test evidence",
          "CI runs: build, unit/integration tests, lint, security scans",
          "Reviewers read diff for correctness, design, readability, tests",
          "Comments: praise-good, ask-questions, suggest changes—kind and specific",
          "Author responds, pushes fixes; reviewers re-review until approved",
          "Squash/merge; PR auto-closes linked issue",
        ],
        keyConcepts: [
          "<strong>Review Checklist</strong> — correctness, tests, edge cases, naming, perf, security",
          "<strong>Small PRs</strong> — under ~400 LOC review faster and find more defects",
          "<strong>Blameless Tone</strong> — critique the code, not the person",
          "<strong>Two-Person Rule</strong> — at least one approver; high-risk changes need two",
          "<strong>Automated Checks</strong> — shift left: lint, format, SAST, coverage in CI",
        ],
        realWorld:
          "Google's Eng Practices guide, Microsoft Research studies on review. Gerrit, GitHub PRs, GitLab MRs. Many companies enforce 'PR ≤ 400 lines' and '24h response SLA'.",
        tradeoffs: {
          pros: ["Catches defects before merge", "Spreads domain knowledge", "Shared code ownership"],
          cons: ["Bottleneck if reviewers are scarce", "Bike-shedding on style", "Reviewer fatigue on huge PRs"],
        },
        codeExample: `# PR template (.github/pull_request_template.md)
## What
Brief summary of the change.

## Why
Business reason / linked ticket (closes #123).

## How
Key design decisions, alternatives considered.

## Tests
- [x] Unit tests added/updated
- [x] e2e for the new flow
- [x] Manual smoke on staging

## Risk
What could break; rollback plan.

## Checklist
- [x] No secrets in diff
- [x] Public API change? Update OpenAPI
- [x] Backward compatible`,
        interviewTips: [
          "Small PRs (<400 LOC) review faster and find more issues",
          "Phrase feedback as questions, not orders ('consider X?' beats 'do X')",
          "Praise good code, not just flag problems",
        ],
      },
    },
    {
      id: "pair-programming",
      title: "Pair & Mob Programming",
      icon: "👥",
      description: "Two or more developers share one workstation for real-time collaboration and review.",
      tags: ["Collaboration", "XP", "Quality"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Pair Programming</strong> has two developers at one machine: a <strong>Driver</strong> types, a <strong>Navigator</strong> reviews and thinks ahead. <strong>Mob Programming</strong> extends this to a whole team around one screen. Quality, knowledge transfer, and focus increase; perceived cost is the trade-off.",
        howItWorks: [
          "Driver: focused on the immediate code; types and explains",
          "Navigator: reviews in real time, considers design, next steps, edge cases",
          "Rotate roles every 15-30 minutes—pomodoro style",
          "Mob: one driver, one navigator, rest are researchers; rotate every 10-15 min",
          "Remote pairing: shared editor (VS Code Live Share, Tuple, Zoom + screen)",
          "Retros at the end: what worked, what to tune",
        ],
        keyConcepts: [
          "<strong>Driver/Navigator</strong> — the two role split",
          "<strong>Ping-Pong Pairing</strong> — one writes test, other writes impl, alternate",
          "<strong>Mob Programming</strong> — whole team at one keyboard",
          "<strong>Strong-Style Pairing</strong> — driver must type what navigator says verbatim",
          "<strong>Restful Breaks</strong> — pairing is intense; schedule them",
        ],
        realWorld:
          "Industrial Logic, Hunter Industries (mob programming origin), Pivotal Labs. Used heavily at shops practicing XP. Remote pairing via Tuple, Live Share, tmux.",
        tradeoffs: {
          pros: ["Continuous review—defects caught live", "Spreads knowledge of every module", "Sustains focus, less context-switching"],
          cons: ["Higher hourly cost on paper", "Exhausting for introverts/all-day", "Suboptimal for trivial work"],
        },
        codeExample: `# Pairing rotation schedule (markdown)
Time         Driver       Navigator
---------    ----------   ----------
10:00-10:25  Alice        Bob
10:25-10:50  Bob          Alice
10:50-11:00  break
11:00-11:25  Carol        Alice
11:25-11:50  Alice        Carol

# Mob: same, plus 3-4 researchers each assigned
# a question (perf, security, docs, edge cases)`,
        interviewTips: [
          "Pairing is not 2× cost—studies show ~15% overhead for major quality gains",
          "Ping-pong pairing combines TDD + pairing",
          "Know when NOT to pair (mechanical, well-understood work)",
        ],
      },
    },
    {
      id: "semantic-versioning",
      title: "Semantic Versioning (SemVer)",
      icon: "🔢",
      description: "MAJOR.MINOR.PATCH: communicate breaking changes, new features, and fixes via version numbers.",
      tags: ["Versioning", "Release", "Compatibility"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>SemVer</strong> version numbers as <strong>MAJOR.MINOR.PATCH</strong>: increment MAJOR for incompatible API changes, MINOR for backward-compatible features, PATCH for backward-compatible fixes. Pre-release and build metadata extend it (e.g., 2.1.0-beta.1+exp.sha).",
        howItWorks: [
          "Start at 0.y.z for initial development—anything may change",
          "Reach 1.0.0 when API is stable/public",
          "PATCH (x.y.Z): bug fixes only, no behavior change beyond the fix",
          "MINOR (x.Y.0): new backward-compatible features; bump on next release",
          "MAJOR (X.0.0): any incompatible change—also bump major of dependent packages",
          "Pre-release (1.0.0-alpha.1) sorts before release; build metadata (+sha) ignored in precedence",
        ],
        keyConcepts: [
          "<strong>MAJOR</strong> — breaking change",
          "<strong>MINOR</strong> — new feature, backward compatible",
          "<strong>PATCH</strong> — bug fix, backward compatible",
          "<strong>Pre-release</strong> — alpha/beta/rc; lower precedence than the release",
          "<strong>Changelog</strong> — Keep a Changelog convention maps versions to changes",
        ],
        realWorld:
          "npm, Cargo, Maven Central, PyPI all expect SemVer. Renovate/Dependabot use it to drive upgrade PRs. Renovate's 'auto-merge patch PRs' is safe because PATCH is non-breaking by contract.",
        tradeoffs: {
          pros: ["Tooling can reason about upgrades", "Communicates intent unambiguously", "Enables automated dependency updates"],
          cons: ["Depends on authors respecting the contract", "0.x has no stability guarantees", "Hyrum's Law: any observable behavior can break someone"],
        },
        codeExample: `# package.json
{
  "name": "my-lib",
  "version": "2.4.1",            # MAJOR.MINOR.PATCH
  "engines": { "node": ">=18" },
  "peerDependencies": {
    "react": "^18.0.0"           # ^ allows minor + patch, blocks major
  }
}

# CHANGELOG.md (Keep a Changelog format)
## [2.4.1] - 2024-05-12
### Fixed
- Crash when cart empty (closes #142)
## [2.4.0] - 2024-05-01
### Added
- Wishlist export to CSV`,
        interviewTips: [
          "Distinguish ^ ~ and exact in package.json ranges",
          "Hyrum's Law undermines SemVer in popular libraries—any observable change can break someone",
          "0.x means 'no stability guarantees'",
        ],
      },
    },
    {
      id: "release-management",
      title: "Release Management",
      icon: "🚢",
      description: "Coordinate releases via trains, feature flags, canaries, and rollback playbooks.",
      tags: ["Release", "DevOps", "Risk"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Release Management</strong> coordinates getting verified code into production safely. Techniques include <strong>release trains</strong> (scheduled cadence), <strong>feature flags</strong> (decouple deploy from release), <strong>canary releases</strong> (ramp exposure), and explicit <strong>rollback</strong> playbooks.",
        howItWorks: [
          "Plan: scope a release against a release train or continuous flow",
          "Build & verify: CI produces immutable artifacts tagged with SemVer",
          "Stage: deploy to dev → staging → prod-like; run smoke + load tests",
          "Release: enable feature flag or ramp canary 1% → 5% → 25% → 100%",
          "Monitor: SLO dashboards + error budgets; auto-rollback on breach",
          "Post-release: publish changelog, announce, archive artifacts",
        ],
        keyConcepts: [
          "<strong>Release Train</strong> — fixed cadence; features either make the train or wait",
          "<strong>Deploy vs Release</strong> — deploy = code in prod; release = users see it",
          "<strong>Canary</strong> — expose to a small slice, ramp if healthy",
          "<strong>Rollback</strong> — revert to previous version; forward-fix is the alternative",
          "<strong>Release Manager / Release Engineer</strong> — role owning the train",
        ],
        realWorld:
          "Amazon deploys every 11.7 seconds (2019 stat) via Apollo. Netflix uses Spinnaker for canaries. Apple, Salesforce use release trains. Etsy popularized continuous deployment in 2010s.",
        tradeoffs: {
          pros: ["Lower risk per release (small, frequent)", "Faster customer feedback", "Smaller blast radius on failure"],
          cons: ["Requires mature CI/CD and observability", "Feature flags add complexity", "Rollback can be hard with schema changes"],
        },
        codeExample: `# Canary rollout via Argo Rollouts (k8s)
strategy:
  canary:
    canaryService: checkout-canary
    stableService: checkout-stable
    trafficRouting:
      smi: {}
    steps:
      - setWeight: 5
      - pause: { duration: 10m }
      - analysis:           # auto-promote or rollback
          templates:
            - templateName: success-rate
      - setWeight: 25
      - pause: { duration: 10m }
      - setWeight: 100`,
        interviewTips: [
          "Deploy ≠ release—say it explicitly",
          "Canaries reduce blast radius but need automated analysis",
          "Schema changes break rollback—mention expand/contract migrations",
        ],
      },
    },

    // ───────────────────────────────────────────────────────────────────────────
    // Testing & Quality
    // ───────────────────────────────────────────────────────────────────────────
    {
      id: "testing-pyramid",
      title: "Testing Pyramid & Trophies",
      icon: "🔺",
      description: "Right-size your test suite: many fast unit tests, fewer integration, fewest end-to-end.",
      tags: ["Testing", "Strategy", "Quality"],
      hasAnimation: true,
      content: {
        overview:
          "The <strong>Testing Pyramid</strong> (Cohn): many fast <strong>unit</strong> tests, fewer <strong>integration</strong> tests, fewest slow <strong>end-to-end</strong> tests. Modern variants—<strong>Testing Trophy</strong> (Kohlhof) and <strong>Honeycomb</strong> (Stanhope)—rebalance toward integration tests for service architectures.",
        howItWorks: [
          "Unit tests: one function/class in isolation, pure, sub-millisecond",
          "Integration tests: multiple components together (DB, queues, internal APIs)",
          "Contract tests: verify consumer/provider compatibility at API boundaries",
          "E2E tests: simulate real user journeys through the entire stack",
          "Exploratory/manual: humans probe unknowns, edge cases, usability",
          "Layer ratio: pyramid ~70/20/10; trophy shifts weight toward integration",
        ],
        keyConcepts: [
          "<strong>Unit Test</strong> — isolated, fast, deterministic",
          "<strong>Integration Test</strong> — verifies collaboration across boundaries",
          "<strong>E2E Test</strong> — full user journey through UI/API/DB",
          "<strong>Test Trophy</strong> — more integration, fewer E2E, some unit",
          "<strong>Ice Cream Cone Anti-Pattern</strong> — many manual/E2E, few unit (slow, flaky)",
        ],
        realWorld:
          "Google Testing on the Toilet promotes 70% unit / 20% integration / 10% E2E. Spotify uses the Honeycomb (Stanhope) emphasizing contracts. Cypress/Playwright enable reliable E2E; Testsigma, Mabl add AI.",
        tradeoffs: {
          pros: ["Fast feedback at lower layers", "Localizes defects quickly", "Cheaper than E2E at scale"],
          cons: ["Pure unit tests can miss integration bugs", "Service architectures favor trophies", "E2E gives highest confidence but is slow/flaky"],
        },
        codeExample: `// Unit — pure function, ms-fast
test('cart total applies discount', () => {
  expect(total([{ price: 10 }], 0.1)).toBe(9);
});

// Integration — with real Postgres testcontainer
test('order persists', async () => {
  const repo = new OrderRepo(pg);
  await repo.save(order);
  expect(await repo.find(order.id)).toEqual(order);
});

// E2E — Playwright
test('user checks out', async ({ page }) => {
  await page.goto('/cart');
  await page.click('text=Checkout');
  await expect(page).toHaveURL(/order\\/\\d+/);
});`,
        interviewTips: [
          "Avoid the ice-cream cone: lots of manual, few unit",
          "In microservices, contract tests reduce the need for E2E",
          "Watch out: pure unit tests pass while integration fails",
        ],
      },
    },
    {
      id: "contract-testing",
      title: "Consumer-Driven Contract Testing",
      icon: "📜",
      description: "Verify provider/consumer compatibility via contracts; eliminate brittle E2E across services.",
      tags: ["Testing", "Microservices", "API"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Contract Testing</strong> verifies that a provider's API matches what its consumers expect. <strong>Consumer-Driven Contracts (CDC)</strong> flip the direction: consumers publish expectations; providers verify them. <strong>Pact</strong> is the dominant implementation; schema compatibility (Avro/Protobuf) is a related approach.",
        howItWorks: [
          "Consumer writes a Pact: expected request + minimal expected response",
          "Pact file published to a Pact Broker",
          "Provider's CI runs pact verification: replays each pact against the provider",
          "If provider breaks a contract, verification fails—block the deploy",
          "Broker records compatibility: can-i-deploy checks cross-service safety",
          "Schema registries (Avro/Protobuf) enforce wire-level backward compatibility",
        ],
        keyConcepts: [
          "<strong>Pact</strong> — open-source CDC framework (Pact-JVM, Pact JS, etc.)",
          "<strong>Pact Broker</strong> — stores pacts + verification results + matrix",
          "<strong>can-i-deploy</strong> — pre-deploy check: are consumer+provider compatible?",
          "<strong>Schema Registry</strong> — Confluent/Protobuf: enforce backward/forward compat",
          "<strong>Bi-directional Contracts</strong> — provider's OpenAPI also verified against pacts",
        ],
        realWorld:
          "Pact originated at Realestate.com.au. Used at Atlassian, Shopify, Mozilla. Confluent Schema Registry is the standard for Kafka contracts. Specmatic and Schemathesis are alternatives.",
        tradeoffs: {
          pros: ["Replaces slow cross-service E2E", "Catches breaking changes pre-deploy", "Scales with service count"],
          cons: ["Operational overhead for broker", "Pacts test only what consumers declared", "Doesn't replace functional testing"],
        },
        codeExample: `// Consumer (Pact JS) declares expectation
await provider.addInteraction({
  uponReceiving: 'a request for an order',
  withRequest: { method: 'GET', path: '/orders/1' },
  willRespondWith: { status: 200,
    headers: { 'Content-Type': 'application/json' },
    body: { id: 1, total: 99.95 } },
});

// Provider (CI) verifies
const opts = { pactUrls: [path.resolve(__dirname, '../pacts/orderservice-web.json')],
  providerBaseUrl: 'http://localhost:8080' };
await Verifier(opts).verifyProvider();`,
        interviewTips: [
          "Pact flow: consumer writes pact → broker → provider verifies",
          "CDC complements, doesn't replace, unit tests",
          "For Kafka, schema registry is the analog of Pact",
        ],
      },
    },
    {
      id: "mocking-stubbing",
      title: "Test Doubles: Mocks, Stubs, Spies, Fakes",
      icon: "🎭",
      description: "Replace collaborators in tests with controlled doubles—choose the right kind per case.",
      tags: ["Testing", "Mocks", "Unit"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Test Doubles</strong> (Meszaros) replace real collaborators in tests. Variants: <strong>Dummy</strong> (placeholder), <strong>Stub</strong> (canned answers), <strong>Spy</strong> (records calls), <strong>Mock</strong> (verifies interactions), <strong>Fake</strong> (working but simplified impl). Choose the simplest double that verifies the behavior you care about.",
        howItWorks: [
          "Dummy: passed but never used (e.g., to satisfy a parameter list)",
          "Stub: returns canned data—'when X, return Y'",
          "Spy: wraps real object, records calls (e.g., how many times, with what args)",
          "Mock: pre-programs expectations, fails if not met—verifies interactions",
          "Fake: lightweight working impl (in-memory repo instead of Postgres)",
          "Use classical (state) testing by default; mockist (interaction) when logic is in collaboration",
        ],
        keyConcepts: [
          "<strong>Stub</strong> — state verification: 'did we get the right answer?'",
          "<strong>Mock</strong> — behavior verification: 'did we call the right collaborator?'",
          "<strong>Mockist vs Classical</strong> — schools of TDD (Chicago vs London)",
          "<strong>Fake</strong> — simpler but working (in-memory DB)",
          "<strong>Don't mock what you don't own</strong> — wrap third-party APIs first",
        ],
        realWorld:
          "Mockito (Java), Jest mocks (JS), sinon (JS), Moq (.NET), unittest.mock (Python). Testcontainers are increasingly replacing mocks with real dependencies for integration tests.",
        tradeoffs: {
          pros: ["Fast, deterministic tests", "Isolates the unit under test", "Easy to simulate edge cases (timeouts, errors)"],
          cons: ["Mocks couple tests to implementation", "Over-mocking hides integration defects", "Maintenance burden when interfaces churn"],
        },
        codeExample: `// Stub: returns canned data
const stub = { findUser: () => ({ id: 1, vip: true }) };

// Mock: verifies interaction
const mock = { sendEmail: jest.fn() };
registerUser(mock, { email: 'a@b.com' });
expect(mock.sendEmail).toHaveBeenCalledWith('a@b.com', expect.any(String));

// Fake: working but simplified
class FakeUserRepo {
  private db = new Map<string, User>();
  save(u: User) { this.db.set(u.id, u); }
  find(id: string) { return this.db.get(id); }
}`,
        interviewTips: [
          "Know the 5 doubles by name (Gerard Meszaros)",
          "Don't mock types you don't own—wrap them first",
          "Classical vs Mockist TDD—have an opinion",
        ],
      },
    },
    {
      id: "load-testing",
      title: "Load, Stress, Soak & Spike Testing",
      icon: "⚡",
      description: "Validate performance under realistic and extreme load using k6, JMeter, Gatling.",
      tags: ["Testing", "Performance", "SRE"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Load Testing</strong> validates system behavior under expected traffic. Variants: <strong>stress</strong> (beyond capacity), <strong>soak</strong> (long duration for leaks), <strong>spike</strong> (sudden bursts). Tools like <strong>k6, JMeter, Gatling</strong> generate the load; results are measured against <strong>SLOs</strong>.",
        howItWorks: [
          "Define SLOs: p95 latency, throughput (RPS), error rate",
          "Capture a realistic load profile from production (RPS by hour, user mix)",
          "Script scenarios in k6/JMeter/Gatling (think-time, ramp-up, ramp-down)",
          "Baseline test: typical peak; check SLOs hold",
          "Stress test: ramp until SLOs break—identify the knee and the cliff",
          "Soak (hours) catches memory leaks, connection leaks, GC drift",
          "Spike test: instant 10× burst—verify autoscaling and queueing",
        ],
        keyConcepts: [
          "<strong>RPS / VUs</strong> — requests per second vs virtual users",
          "<strong>p50/p95/p99</strong> — latency percentiles (averages mislead)",
          "<strong>Little's Law</strong> — VUs = RPS × response time (seconds)",
          "<strong>Knee vs Cliff</strong> — graceful vs catastrophic degradation",
          "<strong>Soak Test</strong> — hours-long to surface resource leaks",
        ],
        realWorld:
          "k6 by Grafana (JS scripting), Gatling (Scala, great reports), JMeter (Java, legacy), Locust (Python). Used by Amazon (Prime Day prep), Netflix (Chaos Monkey + load), and Black Friday retailers.",
        tradeoffs: {
          pros: ["Find capacity limits before customers do", "Reveals bottleneck tier (DB, app, network)", "Validates autoscaling"],
          cons: ["Test env rarely matches prod", "Noisy neighbors skew results", "Scripts drift as the system evolves"],
        },
        codeExample: `// k6 load test (JavaScript)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // ramp to 100 VUs
    { duration: '10m', target: 100 },  // hold (baseline)
    { duration: '2m', target: 500 },   // stress
    { duration: '5m', target: 500 },
    { duration: '2m', target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],  // SLO: p95 < 200ms
    http_req_failed:   ['rate<0.01'],  // error rate < 1%
  },
};

export default function () {
  const r = http.get('https://api.shop/cart');
  check(r, { 'status 200': (x) => x.status === 200 });
  sleep(1);
}`,
        interviewTips: [
          "Always report percentiles, never averages",
          "Little's Law connects VUs, RPS, and response time",
          "Differentiate knee (graceful) from cliff (catastrophic) under stress",
        ],
      },
    },

    // ───────────────────────────────────────────────────────────────────────────
    // CI/CD & DevOps
    // ───────────────────────────────────────────────────────────────────────────
    {
      id: "ci-cd-pipelines",
      title: "CI/CD Pipelines",
      icon: "🔁",
      description: "Automate build, test, and delivery on every commit—GitHub Actions, Jenkins, GitLab CI.",
      tags: ["CI/CD", "DevOps", "Automation"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Continuous Integration (CI)</strong> merges everyone's work frequently, building and testing on every push. <strong>Continuous Delivery (CD)</strong> keeps the build always releasable. <strong>Continuous Deployment</strong> goes one step further—every green build is deployed to production automatically.",
        howItWorks: [
          "Push triggers pipeline: checkout, install deps, lint, typecheck, build",
          "Run test layers: unit → integration → contract; collect coverage",
          "Build artifact (image, jar, bundle) tagged with commit SHA + SemVer",
          "Scan for security (SAST, SCA, image scan); fail on critical CVEs",
          "Deploy to staging; run smoke + e2e",
          "Promote to prod via canary/feature flag; auto-rollback on SLO breach",
        ],
        keyConcepts: [
          "<strong>CI vs CD vs Continuous Deployment</strong> — build → releasable → auto-deployed",
          "<strong>Immutable Artifact</strong> — promote the same binary across envs",
          "<strong>Pipeline as Code</strong> — YAML stored in repo, versioned",
          "<strong>Shift Left</strong> — catch issues earlier (lint, security in PR)",
          "<strong>Golden Path</strong> — opinionated template pipeline new services inherit",
        ],
        realWorld:
          "GitHub Actions, GitLab CI/CD, Jenkins, CircleCI, Buildkite. Netflix Spinnaker for multi-cloud deploy. Capital One and AWS use full continuous deployment. Google's Blaze/Bazel build is CI backbone.",
        tradeoffs: {
          pros: ["Catches defects within minutes", "Always-releasable main branch", "Forces small, focused changes"],
          cons: ["Flaky tests erode trust", "Pipeline runtime grows without discipline", "Requires investment in tooling"],
        },
        codeExample: `# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm run build
      - uses: docker/build-push-action@v5
        with:
          context: .
          tags: ghcr.io/org/app:\${{ github.sha }}
          push: true`,
        interviewTips: [
          "Distinguish CI vs CD vs Continuous Deployment",
          "Build once, promote the same artifact—never rebuild per env",
          "Flaky tests destroy CI trust—quarantine them aggressively",
        ],
      },
    },
    {
      id: "containerization-docker",
      title: "Containerization & Docker",
      icon: "📦",
      description: "Package apps with their dependencies into portable, reproducible container images.",
      tags: ["Docker", "Containers", "DevOps"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Containers</strong> package an app with its dependencies into a portable, isolated process running on a shared kernel. <strong>Docker</strong> popularized containers via images, layers, registries, and the Dockerfile format. <strong>OCI</strong> is now the open standard.",
        howItWorks: [
          "Author Dockerfile: FROM base image, COPY code, RUN install, CMD/ENTRYPOINT",
          "Build: each instruction creates a layer; layers are cached and reused",
          "Push image to registry (Docker Hub, ECR, GHCR) tagged with version + sha",
          "Pull image on host; container runtime (containerd/runc) starts process in namespaces + cgroups",
          "Multi-stage builds: build in one image, copy artifact to slim runtime image",
          "Distroless or alpine base shrinks image and reduces CVE surface",
        ],
        keyConcepts: [
          "<strong>Layer</strong> — immutable filesystem diff, cached",
          "<strong>Image</strong> — layered template; <strong>Container</strong> — running instance",
          "<strong>Namespaces + cgroups</strong> — isolation + resource limits (Linux primitives)",
          "<strong>Multi-stage Build</strong> — separate build vs runtime image",
          "<strong>OCI</strong> — Open Container Initiative: image + runtime spec",
        ],
        realWorld:
          "Docker, containerd, Podman, runc. Every cloud runs containers (ECS, EKS, GKE, Cloud Run). Images stored in ECR/GHCR/Docker Hub. BuildKit speeds builds via parallel + cache.",
        tradeoffs: {
          pros: ["Reproducible environments", "Portable across dev/prod", "Resource-efficient vs VMs"],
          cons: ["Shared kernel = weaker isolation than VMs", "Image size & CVE surface if unmanaged", "Persistent state needs volumes"],
        },
        codeExample: `# Dockerfile — multi-stage Node app
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]`,
        interviewTips: [
          "Multi-stage + distroless/alpine is table stakes for prod images",
          "Order instructions least-→most-changing to maximize layer cache hits",
          "Containers share the kernel—VMs/gVisor/Kata for stronger isolation",
        ],
      },
    },
    {
      id: "kubernetes-orchestration",
      title: "Kubernetes Orchestration",
      icon: "☸️",
      description: "Schedule, scale, and heal containers via Pods, Services, Deployments, Ingress, Operators.",
      tags: ["Kubernetes", "DevOps", "Orchestration"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Kubernetes (K8s)</strong> is a container orchestration platform: it schedules <strong>Pods</strong> across nodes, exposes them via <strong>Services</strong> and <strong>Ingress</strong>, scales via <strong>Deployments</strong>, isolates by <strong>Namespace</strong>, and automates stateful apps with <strong>Operators/StatefulSets</strong>.",
        howItWorks: [
          "Declare desired state in YAML: Deployment with N replicas of a Pod",
          "Control plane (API server, scheduler, controller manager, etcd) accepts the manifest",
          "Scheduler assigns Pods to healthy worker nodes based on resources/taints/affinity",
          "kubelet on each node runs the Pod; kube-proxy programs networking",
          "Service gives Pods a stable DNS + LB; Ingress routes HTTP/S externally",
          "Self-healing: crashed Pods are restarted; failed nodes are rescheduled",
          "HPA scales replicas on CPU/custom metrics; Operators encode operational knowledge",
        ],
        keyConcepts: [
          "<strong>Pod</strong> — smallest unit; one or more co-located containers",
          "<strong>Deployment</strong> — declarative rollout + rollback of Pods",
          "<strong>Service</strong> — stable network identity for a set of Pods",
          "<strong>Ingress</strong> — L7 HTTP routing into the cluster",
          "<strong>Operator</strong> — custom controller encoding human ops knowledge",
          "<strong>HPA / VPA / Cluster Autoscaler</strong> — scale replicas, resources, nodes",
        ],
        realWorld:
          "Originated at Google (Borg lineage), donated to CNCF in 2014. Run by GKE, EKS, AKS, OpenShift, Rancher. Used by Pokémon Go, Shopify, GitHub. Operators handle PostgreSQL, Prometheus, Redis.",
        tradeoffs: {
          pros: ["Vendor-neutral, portable", "Self-healing & autoscaling built-in", "Ecosystem: Helm, Argo, Istio, Crossplane"],
          cons: ["Steep learning curve", "Operational toil on self-managed clusters", "Control plane is critical—needs HA"],
        },
        codeExample: `# k8s Deployment + Service
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 3
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/org/api:1.4.0
          ports: [{ containerPort: 8080 }]
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { cpu: 500m, memory: 512Mi }
          readinessProbe:
            httpGet: { path: /healthz, port: 8080 }
---
apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 8080 }]`,
        interviewTips: [
          "K8s reconciles desired vs actual state continuously",
          "Pods are ephemeral—use Services for stable identity",
          "Operators encode operational knowledge (e.g., the Postgres operator)",
        ],
      },
    },
    {
      id: "infrastructure-as-code",
      title: "Infrastructure as Code (IaC)",
      icon: "🏗️",
      description: "Declare cloud infrastructure in versioned code—Terraform, Pulumi, AWS CDK.",
      tags: ["IaC", "DevOps", "Cloud"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Infrastructure as Code (IaC)</strong> declares cloud resources in versioned, reviewable files instead of click-ops. <strong>Terraform</strong> (HCL), <strong>Pulumi</strong> (TS/Python/Go), and <strong>AWS CDK</strong> (TS/Python) are dominant. They keep a <strong>state file</strong> mapping declared → real resources and detect drift.",
        howItWorks: [
          "Author declarative config: resource type, name, properties, dependencies",
          "Initialize: terraform init pulls provider plugins",
          "Plan: diff current state vs config—shows what will be created/changed/destroyed",
          "Apply: provider API calls mutate real infrastructure; state file is updated",
          "State stored remotely (S3 + DynamoDB lock, Terraform Cloud) for team safety",
          "Detect drift: terraform plan reveals manual changes; reconcile or import",
        ],
        keyConcepts: [
          "<strong>Declarative vs Imperative</strong> — desired state vs sequence of actions",
          "<strong>State File</strong> — mapping between config and real resource IDs",
          "<strong>Provider</strong> — plugin for AWS/Azure/GCP/K8s/etc.",
          "<strong>Drift Detection</strong> — discovering out-of-band changes",
          "<strong>Modules</strong> — reusable, parameterized infra units",
        ],
        realWorld:
          "Terraform (HashiCorp), OpenTofu (Linux Foundation fork), Pulumi, AWS CDK, Crossplane (K8s-native IaC). Used by virtually every cloud-native org; Terraform is the de facto standard.",
        tradeoffs: {
          pros: ["Reproducible, reviewable infra", "Versioned and auditable", "Enables disaster-recovery via re-apply"],
          cons: ["State file is a single point of failure", "Drift from manual changes is hard", "Refactoring state is risky"],
        },
        codeExample: `# Terraform (HCL) — S3 bucket + DynamoDB lock table
terraform {
  backend "s3" {
    bucket         = "tf-state-prod"
    key            = "infra/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-locks"
    encrypt        = true
  }
}

resource "aws_s3_bucket" "assets" {
  bucket = "acme-assets-prod"
}

resource "aws_s3_bucket_versioning" "assets" {
  bucket = aws_s3_bucket.assets.id
  versioning_configuration { status = "Enabled" }
}`,
        interviewTips: [
          "State is the key concept—mention locking and remote backends",
          "Plan before apply; review diff in PR",
          "Crossplane is K8s-native IaC worth knowing",
        ],
      },
    },
    {
      id: "feature-flags",
      title: "Feature Flags & Progressive Delivery",
      icon: "🚩",
      description: "Decouple deploy from release; roll out features gradually, kill them instantly.",
      tags: ["DevOps", "Release", "Experimentation"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Feature Flags</strong> wrap new behavior in conditional logic so the same deploy can be enabled for some users and not others. They enable <strong>progressive rollout</strong>, <strong>kill switches</strong>, <strong>A/B testing</strong>, and <strong>trunk-based development</strong> by hiding unfinished work.",
        howItWorks: [
          "Wrap new code: if flagService.isEnabled('new_checkout', user) { ... } else { ... }",
          "Flag configured in a management UI or config file",
          "Rollout rules: percentage, user segments, geographic, beta cohort",
          "Progressive: 1% → 5% → 25% → 100% with holdback for comparison",
          "Kill switch: flip to off to disable in seconds—no redeploy",
          "A/B: route variants and measure impact on metrics/SLOs",
        ],
        keyConcepts: [
          "<strong>Release Flag</strong> — short-lived, controls rollout (most common)",
          "<strong>Ops Flag</strong> — long-lived, controls behavior like circuit breakers",
          "<strong>Experiment Flag</strong> — A/B/n with statistical measurement",
          "<strong>Kill Switch</strong> — instant disable for incidents",
          "<strong>Holdback</strong> — small % never receives the feature, for baseline",
        ],
        realWorld:
          "LaunchDarkly, Unleash, Flagsmith, Optimizely, GrowthBook. GitHub uses flags for every PR (merged-but-hidden). Netflix, Uber, Facebook ship features behind flags daily. OpenFeature standardizes the SDK API.",
        tradeoffs: {
          pros: ["Decouple deploy from release", "Instant rollback (kill switch)", "Trunk-based dev without half-built features"],
          cons: ["Flag proliferation becomes technical debt", "Combinatorial testing complexity", "Old flags forgotten in code"],
        },
        codeExample: `// LaunchDarkly-style usage (TypeScript)
import { LDClient } from 'launchdarkly-node-server-sdk';
const client: LDClient = init(SDK_KEY);

app.get('/checkout', async (req, res) => {
  const user = { key: req.userId, country: req.geo };
  const newFlow = await client.variation('new-checkout', user, false);
  if (newFlow) return res.render('checkout-v2');
  res.render('checkout-v1');
});

// Rule: 10% rollout + beta cohort
// { rollout: { percentage: 10 },
//   fallthrough: { variation: 0 } }`,
        interviewTips: [
          "Flags enable trunk-based development—mention the link",
          "Track flag lifecycle: add a cleanup ticket when shipping the flag",
          "OpenFeature is the emerging standard to avoid vendor lock-in",
        ],
      },
    },
    {
      id: "deployment-strategies",
      title: "Deployment Strategies",
      icon: "🚦",
      description: "Choose how new code reaches prod: blue/green, canary, rolling, shadow, recreate.",
      tags: ["DevOps", "Release", "Risk"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Deployment Strategies</strong> control how new code replaces old in production. <strong>Rolling</strong> replaces instances gradually; <strong>Blue/Green</strong> swaps traffic between two envs; <strong>Canary</strong> ramps exposure; <strong>Shadow</strong> mirrors traffic with no user impact; <strong>Recreate</strong> takes downtime to swap.",
        howItWorks: [
          "Rolling: replace N old pods with N new ones over time; default in K8s",
          "Blue/Green: spin up identical 'green' env, switch LB/DNS, keep blue for rollback",
          "Canary: route small % to new version; auto-promote on health, auto-rollback on breach",
          "Shadow: mirror prod traffic to new version; compare outputs, no user impact",
          "Recreate: shutdown old, start new—downtime, simplest, used for incompatible changes",
          "A/B: route by user segment, measure behavior (more business than ops)",
        ],
        keyConcepts: [
          "<strong>Blue/Green</strong> — instant switch + fast rollback",
          "<strong>Canary</strong> — progressive exposure with auto-rollback",
          "<strong>Shadow</strong> — traffic mirroring for validation",
          "<strong>Rolling</strong> — gradual pod replacement",
          "<strong>Blast Radius</strong> — the user impact if the deploy is bad",
        ],
        realWorld:
          "K8s Deployments default to rolling. Argo Rollouts and Flagger add canary automation. Istio/Envoy enable shadow traffic. Netflix uses red/black deploy via Spinnaker (blue/green).",
        tradeoffs: {
          pros: ["Blue/Green: instant rollback", "Canary: smallest blast radius", "Shadow: validates real load safely"],
          cons: ["Blue/Green: 2× infra cost", "Canary: needs good observability", "Shadow: hidden costs and side effects"],
        },
        codeExample: `# K8s Deployment with RollingUpdate strategy
apiVersion: apps/v1
kind: Deployment
metadata: { name: api }
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1            # 1 extra pod above replicas during rollout
      maxUnavailable: 0      # never below replicas (zero downtime)
  selector: { matchLabels: { app: api } }
  template:
    metadata: { labels: { app: api } }
    spec:
      containers:
        - name: api
          image: ghcr.io/org/api:1.4.1
          readinessProbe:
            httpGet: { path: /healthz, port: 8080 }`,
        interviewTips: [
          "Map strategies to blast radius: shadow < canary < blue/green < rolling < recreate",
          "Canary needs automated analysis to be valuable",
          "Blue/Green doubles cost but enables instant rollback",
        ],
      },
    },

    // ───────────────────────────────────────────────────────────────────────────
    // Observability & Reliability (SRE)
    // ───────────────────────────────────────────────────────────────────────────
    {
      id: "observability-three-pillars",
      title: "Observability: Logs, Metrics, Traces",
      icon: "🔭",
      description: "The three pillars of observability—logs, metrics, and distributed traces—together answer unknowns.",
      tags: ["Observability", "SRE", "Monitoring"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Observability</strong> is the ability to ask arbitrary questions about a system from the outside. The <strong>three pillars</strong>—<strong>logs</strong> (discrete events), <strong>metrics</strong> (numeric time series), <strong>traces</strong> (request journeys)—are complementary; <strong>high-cardinality labels</strong> and correlation IDs tie them together.",
        howItWorks: [
          "Instrument services: emit structured logs, metrics, and spans",
          "Logs: discrete records with level, timestamp, context, correlation_id",
          "Metrics: numeric values over time (counters, gauges, histograms)",
          "Traces: a tree of spans showing a request's path through services",
          "Correlate: shared trace_id and span_id in logs lets you pivot pillar→pillar",
          "Query: 'which user is failing?' → metrics shows error spike → traces find slow span → logs show the exact error",
        ],
        keyConcepts: [
          "<strong>Logs</strong> — events, can carry arbitrary fields; high cardinality is expensive",
          "<strong>Metrics</strong> — pre-aggregated, cheap to store, support alerting",
          "<strong>Traces</strong> — span trees with parent/child relationships",
          "<strong>Exemplars</strong> — link a metric point to a representative trace",
          "<strong>High-Cardinality Labels</strong> — user_id, request_id enable deep slicing",
        ],
        realWorld:
          "Honeycomb, Datadog, New Relic, Splunk, Grafana LGTM stack (Loki, Grafana, Tempo, Mimir). OpenTelemetry is the standard instrumentation API. Netflix, Uber, Twitter pioneered large-scale observability.",
        tradeoffs: {
          pros: ["Investigate unknown unknowns", "Cross-pillar pivot speeds root cause", "Supports SLO-based alerting"],
          cons: ["Instrumentation tax", "Cost scales with cardinality & retention", "Tool sprawl without standards"],
        },
        codeExample: `# OpenTelemetry ties all three together
# A single trace context propagates across services
trace_id = "5f1c...e3"   # in HTTP header: traceparent
span_id  = "a4b1..."

# Log (JSON, structured) — carries the IDs
{ "ts": "2024-...", "level": "error",
  "trace_id": "5f1c...e3", "span_id": "a4b1...",
  "msg": "db timeout", "user_id": "u-42" }

# Metric (Prometheus) — links via exemplar
http_requests_total{route="/checkout",status="500"} +1 # {trace_id=5f1c...}

# Trace — span tree
checkout-service (2.1s)
  └─ pricing-service (1.8s)
       └─ db.query (1.7s) ← bottleneck`,
        interviewTips: [
          "Observability ≠ monitoring: monitoring checks known unknowns; observability enables unknown unknowns",
          "High-cardinality is what separates observability tools from metrics-only tools",
          "OpenTelemetry is the future-proof instrumentation standard",
        ],
      },
    },
    {
      id: "monitoring-metrics",
      title: "Monitoring & Metrics (RED, USE, Four Golden Signals)",
      icon: "📊",
      description: "Pick the right signal framework—RED for services, USE for resources, Four Golden Signals for user impact.",
      tags: ["Monitoring", "SRE", "Metrics"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Monitoring</strong> collects and alerts on metrics. Three complementary frameworks: <strong>RED</strong> (Rate, Errors, Duration) for request-driven services; <strong>USE</strong> (Utilization, Saturation, Errors) for resources; <strong>Four Golden Signals</strong> (latency, traffic, errors, saturation) for user-facing health.",
        howItWorks: [
          "Identify service type: request-driven (RED), resource (USE), user-facing (Golden)",
          "RED: instrument Rate (RPS), Errors (error %), Duration (latency p50/p95/p99)",
          "USE: instrument Utilization (% used), Saturation (queue/wait), Errors (device errors)",
          "Four Golden: combine latency + traffic + errors + saturation for SLO dashboards",
          "Alert on SLO burn rate, not raw thresholds—reduce alert fatigue",
          "Visualize in Grafana/Datadog with runbook links in alerts",
        ],
        keyConcepts: [
          "<strong>RED</strong> — Rate, Errors, Duration (Tom Wilkie)",
          "<strong>USE</strong> — Utilization, Saturation, Errors (Brendan Gregg)",
          "<strong>Four Golden Signals</strong> — Latency, Traffic, Errors, Saturation (Google SRE)",
          "<strong>Histogram vs Counter</strong> — distribution vs monotonic count",
          "<strong>SLO Burn Rate</strong> — how fast you're consuming your error budget",
        ],
        realWorld:
          "Prometheus + Grafana (open source standard). Datadog, New Relic, Dynatrace, Splunk Observability. eBPF-based tools (Pixie, Cilium) add kernel-level visibility. Netflix Atlas, Uber M3 are in-house metrics systems.",
        tradeoffs: {
          pros: ["Frameworks guide what to instrument", "SLO-based alerts reduce fatigue", "Cheap to store & query"],
          cons: ["Pre-aggregation loses event detail", "Cardinality explosion if abused", "Doesn't explain why—needs logs/traces"],
        },
        codeExample: `# Prometheus — RED metrics for an HTTP service
http_requests_total{method="GET",route="/checkout",status="200"} 12345
http_requests_total{method="GET",route="/checkout",status="500"}   17
http_request_duration_seconds_bucket{route="/checkout",le="0.1"} 9800
http_request_duration_seconds_bucket{route="/checkout",le="0.5"} 12100

# Alert on SLO burn rate (multi-window multi-burn)
- alert: HighErrorRate
  expr: |
    (sum(rate(http_requests_total{status=~"5.."}[5m]))
     / sum(rate(http_requests_total[5m]))) > 0.01
  for: 10m
  annotations:
    runbook: https://runbooks/check-500`,
        interviewTips: [
          "Pick the framework by resource type: RED for services, USE for resources",
          "Alert on SLO burn rate, not static thresholds",
          "Always attach a runbook link to alerts",
        ],
      },
    },
    {
      id: "structured-logging",
      title: "Structured Logging",
      icon: "🪵",
      description: "Emit machine-parseable JSON logs with correlation IDs for fast search and analysis.",
      tags: ["Logging", "Observability", "JSON"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Structured Logging</strong> emits log records as JSON (or similar) with named fields rather than free text. This makes logs searchable, filterable, and aggregatable. <strong>Correlation IDs</strong> (trace_id, request_id, user_id) tie log lines to traces and to each other.",
        howItWorks: [
          "Logger emits JSON: timestamp, level, message, service, trace_id, span_id, context fields",
          "Each request injects a correlation ID at the edge (API gateway / middleware)",
          "Context flows through HTTP headers, async jobs, and message queues",
          "Logs shipped to a backend: ELK, Loki, Datadog, Splunk, Cloud Logging",
          "Query by field: 'level:error AND trace_id:5f1c... AND service:checkout'",
          "Alert on log patterns: 'error AND timeout' rate above threshold",
        ],
        keyConcepts: [
          "<strong>JSON Log</strong> — machine-parseable record with named fields",
          "<strong>Correlation ID</strong> — ties log lines to a trace and to each other",
          "<strong>Log Levels</strong> — DEBUG / INFO / WARN / ERROR / FATAL",
          "<strong>Log Aggregation</strong> — collect, index, search across all services",
          "<strong>Sampling</strong> — drop verbose logs (DEBUG) at scale to control cost",
        ],
        realWorld:
          "ELK (Elasticsearch + Logstash + Kibana), Grafana Loki (cheaper, label-indexed), Datadog Logs, Splunk, AWS CloudWatch Logs, Google Cloud Logging. Serilog (.NET), pino (Node), structlog (Python), zap (Go) are common structured loggers.",
        tradeoffs: {
          pros: ["Searchable and aggregatable", "Correlation IDs enable cross-service debugging", "Supports automated alerting"],
          cons: ["Storage cost at high volume", "Sensitive data leakage risk—must scrub PII", "Cardinality bloat if fields unbounded"],
        },
        codeExample: `# pino (Node) — structured JSON log
import pino from 'pino';
const log = pino();

log.info({ userId: 'u-42', cartId: 'c-9',
           traceId: '5f1c...', durationMs: 87 },
         'checkout completed');

# Output
{"level":30,"time":1715528400,"pid":1,
 "traceId":"5f1c...","userId":"u-42","cartId":"c-9",
 "durationMs":87,"msg":"checkout completed"}

# Loki query (LogQL)
{service="checkout"} |= "error"
  | json | traceId="5f1c..."
  | durationMs > 1000`,
        interviewTips: [
          "Never log free text in production—structured JSON only",
          "Always thread trace_id through context (HTTP, async, queues)",
          "Scrub PII/secrets before emitting; never log tokens",
        ],
      },
    },
    {
      id: "sre-sli-slo-sla",
      title: "SLI, SLO, SLA & Error Budgets",
      icon: "📐",
      description: "Define reliability numerically: indicators, objectives, agreements, and the budget to spend on risk.",
      tags: ["SRE", "Reliability", "Metrics"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>SLI</strong> (Service Level Indicator) is a measurement. <strong>SLO</strong> (Objective) is the target you set internally. <strong>SLA</strong> (Agreement) is the contract with customers, stricter than the SLO. The <strong>Error Budget</strong>—1 minus the SLO—is what you can spend on risk (features, deploys, experiments).",
        howItWorks: [
          "Define SLI: numerator/denominator of good events (e.g., 200 responses / total requests)",
          "Set SLO: e.g., 99.9% of requests successful over 28-day window",
          "Set SLA stricter: e.g., 99.5% to customers; breach triggers credits",
          "Compute error budget: 1 − 0.999 = 0.1% of bad requests allowed per window",
          "Burn rate: how fast you're consuming budget; multi-window alerts trigger before exhaustion",
          "When budget empty: freeze feature work, focus on reliability",
        ],
        keyConcepts: [
          "<strong>SLI</strong> — measurable indicator (good / total)",
          "<strong>SLO</strong> — internal target; what users will be happy with",
          "<strong>SLA</strong> — external contract; breach has consequences",
          "<strong>Error Budget</strong> — allowable unreliability; spend on risk",
          "<strong>Burn Rate</strong> — budget consumption speed; 1× = on track to exhaust exactly in window",
        ],
        realWorld:
          "Originated in Google SRE. Adopted by Microsoft, Netflix, Amazon. Tools: Sloth, Nobl9, Pixie, Grafana SLO. Every major SaaS publishes SLAs (e.g., AWS S3: 99.9%, Multi-AZ RDS: 99.95%).",
        tradeoffs: {
          pros: ["Quantifies reliability conversations with product", "Aligns dev and SRE on risk", "Objective basis for freeze/release decisions"],
          cons: ["Hard to pick the right SLI", "Too-tight SLO strangles feature velocity", "Gaming metrics (e.g., succeeding the wrong queries)"],
        },
        codeExample: `# Sloth (Prometheus SLO generator)
version: "prometheus/v1"
service: "checkout"
slos:
  - name: "availability"
    objective: 99.9
    sli:
      events:
        error_ratio:
          total:  'sum(rate(http_requests_total{service="checkout"}[{{.window}}]))'
          errors: 'sum(rate(http_requests_total{service="checkout",status=~"5.."}[{{.window}}]))'
    alerting:
      name: HighErrorBurn
      page_alert:    { disable: false }
      ticket_alert:  { disable: false }
      windows:
        - { severity: page,   short: 5m,  long: 1h,  factor: 14.4 }
        - { severity: ticket, short: 30m, long: 6h,  factor: 6   }`,
        interviewTips: [
          "SLI < SLO < SLA in strictness: SLA is the strictest contract",
          "Error budget = 1 − SLO; when exhausted, freeze feature work",
          "Multi-window multi-burn-rate alerts catch both fast and slow burns",
        ],
      },
    },
    {
      id: "incident-management",
      title: "Incident Management & On-Call",
      icon: "🚨",
      description: "Coordinate response to outages: roles, severity levels, runbooks, blameless postmortems.",
      tags: ["SRE", "Incidents", "On-Call"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Incident Management</strong> coordinates the response to outages. Define <strong>severities</strong> (SEV1-4), <strong>roles</strong> (Incident Commander, Comms, Ops Lead), follow <strong>runbooks</strong>, communicate broadly, and run <strong>blameless postmortems</strong> that produce action items.",
        howItWorks: [
          "Detect via paging alerts (PagerDuty, Opsgenie) or user reports",
          "Acknowledge: on-call triages and declares severity (SEV1 = customer down)",
          "Coordinate: Incident Commander runs the call; Scribe logs timeline; Comms updates status page",
          "Mitigate: rollback, scale, failover, feature-flag-off—stop the bleeding",
          "Resolve: identify root cause, apply real fix, verify recovery",
          "Postmortem: blameless analysis within 1-2 days; produce action items tracked to closure",
        ],
        keyConcepts: [
          "<strong>Severity Levels</strong> — SEV1 (down) → SEV4 (cosmetic)",
          "<strong>Incident Commander (IC)</strong> — runs response, doesn't fix",
          "<strong>Blameless Postmortem</strong> — focus on systemic causes, not people",
          "<strong>Runbook</strong> — playbook for known incidents",
          "<strong>5 Whys / Fishbone</strong> — root cause analysis techniques",
        ],
        realWorld:
          "PagerDuty, Opsgenie, Incident.io, Rootly, FireHydrant. Status pages: Atlassian Statuspage, Instatus. Google's SRE book (2016) defined modern practice. GitHub's 2018 MySQL incident is a classic public postmortem.",
        tradeoffs: {
          pros: ["Reduces MTTR with practiced roles", "Captures learnings systematically", "Builds psychological safety via blamelessness"],
          cons: ["On-call burnout if poorly run", "Excessive meetings without discipline", "Action items pile up without ownership"],
        },
        codeExample: `# Postmortem template (markdown)
## Summary
One-paragraph description of impact.

## Impact
- Duration: 2024-05-10 14:03–14:47 UTC (44m)
- Affected: 12% of checkouts in EU
- Severity: SEV1

## Timeline (UTC)
14:03  Alert: checkout 5xx > 5%
14:06  IC declared (Alice); bridge opened
14:12  Rolled back to 1.4.0
14:18  Errors cleared
14:47  Declared resolved

## Root Cause
Migration ran before feature flag flipped; schema
incompatible with old code path.

## Action Items
- [ ] Add schema change to deploy checklist (owner: Bob, due: ...)
- [ ] Add contract test between migration + code (owner: ...)
- [ ] Update runbook: checkout-rollback`,
        interviewTips: [
          "Blameless means 'what failed in our system', not 'who failed'",
          "Incident Commander runs the call and doesn't fix—say it explicitly",
          "Track action items to closure, not just write them",
        ],
      },
    },
    {
      id: "chaos-engineering",
      title: "Chaos Engineering",
      icon: "🌀",
      description: "Proactively inject failures to find weaknesses before customers do—Chaos Monkey, Gremlin.",
      tags: ["SRE", "Resilience", "Experiments"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Chaos Engineering</strong> is the discipline of experimenting on a system by injecting failures (killed pods, network partitions, latency) to build confidence in resilience. Originated at Netflix with <strong>Chaos Monkey</strong>; now formalized as <strong>Game Days</strong> and continuous experiments.",
        howItWorks: [
          "Define steady state: a measurable normal (SLOs, throughput, error rate)",
          "Form hypothesis: 'killing 10% of checkout pods won't breach SLO'",
          "Inject failure: terminate instances, add latency, drop packets, expire certs",
          "Observe: did steady state hold? Where did the system degrade?",
          "Blast radius: start small in prod-like env; expand gradually",
          "Remediate: fix weaknesses (retry, bulkhead, autoscale); re-run experiment",
        ],
        keyConcepts: [
          "<strong>Steady State</strong> — measurable normal behavior to compare against",
          "<strong>Blast Radius</strong> — scope of impact of an experiment",
          "<strong>Game Day</strong> — scheduled, human-driven chaos exercise",
          "<strong>Failure Injection</strong> — kill, latency, partition, CPU/disk exhaustion",
          "<strong>Resilience Validation</strong> — verifying SLOs hold under failure",
        ],
        realWorld:
          "Netflix Chaos Monkey → Chaos Kong → Simian Army. Gremlin commercial platform. AWS Fault Injection Service (FIS), Chaos Mesh (CNCF, K8s), LitmusChaos. Capital One, Target, Amazon run regular Game Days.",
        tradeoffs: {
          pros: ["Surfaces hidden weaknesses safely", "Validates resilience under real conditions", "Builds confidence in autoscaling/retries"],
          cons: ["Risk of real customer impact if blast radius unbounded", "Requires mature observability", "Experiments need cleanup automation"],
        },
        codeExample: `# Chaos Mesh — inject 200ms latency into 30% of checkout pods
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: checkout-latency
  namespace: prod
spec:
  action: delay
  mode: fixed-percent
  value: "30"
  selector:
    namespaces: ["prod"]
    labelSelectors: { "app": "checkout" }
  delay:
    latency: "200ms"
    correlation: "100"
    jitter: "50ms"
  duration: "5m"
  scheduler:
    cron: "@every 1h"`,
        interviewTips: [
          "Chaos Engineering = experiments, not random destruction",
          "Always start with a steady-state hypothesis",
          "Bound blast radius; have auto-stop on SLO breach",
        ],
      },
    },

    // ───────────────────────────────────────────────────────────────────────────
    // Documentation & API Design
    // ───────────────────────────────────────────────────────────────────────────
    {
      id: "api-documentation-openapi",
      title: "OpenAPI & Contract-First API Design",
      icon: "📘",
      description: "Describe REST APIs in an OpenAPI/Swagger spec; drive codegen, mock servers, and validation.",
      tags: ["API", "Documentation", "OpenAPI"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>OpenAPI</strong> (formerly Swagger) is the standard spec for describing REST APIs in YAML/JSON. <strong>Contract-First design</strong> writes the spec before code, then uses <strong>codegen</strong> for server stubs, clients, mocks, and validation—keeping docs and code in sync.",
        howItWorks: [
          "Authors write openapi.yaml: paths, methods, parameters, schemas, responses",
          "Review the spec with stakeholders; iterate on the contract",
          "Generate server stubs (Spring, Express, FastAPI) from the spec",
          "Generate typed clients (TS, Java, Go) for consumers",
          "Run mock server (Prism, Stoplight) for parallel frontend dev",
          "Validate requests/responses at runtime against the spec in CI",
        ],
        keyConcepts: [
          "<strong>OpenAPI Spec</strong> — paths, components/schemas, security schemes",
          "<strong>Contract-First</strong> — design API before code",
          "<strong>Codegen</strong> — openapi-generator, oapi-codegen, Orval",
          "<strong>Mock Server</strong> — Prism, Stoplight Spectrum",
          "<strong>Swagger UI / Redoc</strong> — interactive API docs from the spec",
        ],
        realWorld:
          "Stripe, GitHub, Twilio publish OpenAPI specs. AWS API Gateway imports them. Used by APIs.guru catalog. openapi-generator supports 50+ languages. AsyncAPI is the analog for event-driven.",
        tradeoffs: {
          pros: ["Single source of truth for docs, clients, validation", "Parallel frontend/backend dev with mocks", "Forces upfront API design"],
          cons: ["Spec churn before stable", "Codegen output needs cleanup", "YAML can be verbose for big APIs"],
        },
        codeExample: `# openapi.yaml — minimal contract
openapi: 3.1.0
info:
  title: Cart API
  version: 1.0.0
paths:
  /cart/{id}:
    get:
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        '200':
          description: ok
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Cart' }
        '404': { $ref: '#/components/responses/NotFound' }
components:
  schemas:
    Cart:
      type: object
      properties:
        id:    { type: string }
        items: { type: array, items: { $ref: '#/components/schemas/Item' } }
    Item:
      type: object
      required: [sku, qty]
      properties:
        sku: { type: string }
        qty: { type: integer, minimum: 1 }`,
        interviewTips: [
          "Contract-first beats code-first for shared APIs",
          "Mention codegen for both server stubs and typed clients",
          "AsyncAPI is the event-driven counterpart to OpenAPI",
        ],
      },
    },
    {
      id: "technical-documentation",
      title: "Technical Documentation (Diátaxis)",
      icon: "📚",
      description: "Four documentation types: tutorials, how-to guides, reference, and explanation.",
      tags: ["Documentation", "Writing", "DX"],
      hasAnimation: true,
      content: {
        overview:
          "The <strong>Diátaxis</strong> framework (Procida) divides docs into four types by purpose: <strong>Tutorials</strong> (learning), <strong>How-to Guides</strong> (achieving a goal), <strong>Reference</strong> (describing), and <strong>Explanation</strong> (understanding). Each has distinct voice, structure, and audience.",
        howItWorks: [
          "Tutorials: guided, learning-oriented—'do this to learn'; one path, no detours",
          "How-to Guides: goal-oriented, practical—'do this to achieve X'; allow alternatives",
          "Reference: information-oriented, austere—APIs, config, CLI; no explanation",
          "Explanation: understanding-oriented—why, history, alternatives, design choices",
          "Each doc lives in exactly one type—mixing muddles purpose",
          "Site structure: four top-level sections matching the four types",
        ],
        keyConcepts: [
          "<strong>Tutorials</strong> — learning by doing",
          "<strong>How-to Guides</strong> — solving a problem",
          "<strong>Reference</strong> — technical description (no tutorializing)",
          "<strong>Explanation</strong> — discussion and clarification",
          "<strong>Docs as Code</strong> — write docs in Markdown, version with the code",
        ],
        realWorld:
          "Diátaxis adopted by Django, Cloudflare, Gatsby, GitLab, FastAPI docs. Docs-as-code tools: MkDocs Material, Docusaurus, Antora, Sphinx, Hugo. Read the Docs and Netlify host.",
        tradeoffs: {
          pros: ["Clear purpose per doc improves navigation", "Helps authors know what to write", "Scales across large projects"],
          cons: ["Initial taxonomy work to migrate", "Requires discipline to keep types separate", "May not suit very small projects"],
        },
        codeExample: `# docs/ structure (Diátaxis)
docs/
├── tutorials/         # learning
│   └── getting-started.md
├── how-to/            # goal-oriented
│   ├── deploy-to-k8s.md
│   └── rotate-tokens.md
├── reference/         # austere
│   ├── api.md
│   └── configuration.md
└── explanation/       # understanding
    ├── architecture.md
    └── why-event-sourcing.md

# mkdocs.yml
nav:
  - Tutorials:    tutorials/
  - How-to:       how-to/
  - Reference:    reference/
  - Explanation:  explanation/`,
        interviewTips: [
          "Name the four types and their purpose",
          "Diátaxis is widely adopted—cite Django, Cloudflare, FastAPI",
          "Docs as code: Markdown, version control, CI publishing",
        ],
      },
    },
    {
      id: "twelve-factor-app",
      title: "Twelve-Factor App",
      icon: "⑫",
      description: "Heroku's methodology for building SaaS apps: config, backing services, disposability, logs.",
      tags: ["Methodology", "Cloud", "SaaS"],
      hasAnimation: true,
      content: {
        overview:
          "The <strong>Twelve-Factor App</strong> (Wiggins & Heroku, 2011) is a methodology for building SaaS apps that are scalable, portable, and cloud-native. The twelve factors cover codebase, dependencies, config, backing services, build/release/run, processes, port binding, concurrency, disposability, dev/prod parity, logs, and admin processes.",
        howItWorks: [
          "I. Codebase: one codebase tracked in revision control, many deploys",
          "II. Dependencies: explicitly declare and isolate (package manifests, lockfiles)",
          "III. Config: store in environment variables, not in code",
          "IV. Backing Services: treat DBs, caches, queues as attached resources via URLs",
          "V. Build/Release/Run: strictly separate stages; releases are immutable",
          "VI-XII: processes, port binding, concurrency, disposability (graceful exit), dev/prod parity, logs as event streams, admin as one-off processes",
        ],
        keyConcepts: [
          "<strong>Config in ENV</strong> — config varies across deploys; code does not",
          "<strong>Backing Services</strong> — swap DB by changing URL (loose coupling)",
          "<strong>Build/Release/Run</strong> — immutable artifacts + release IDs",
          "<strong>Disposability</strong> — fast startup + graceful shutdown for elastic scale",
          "<strong>Logs as Event Streams</strong> — write to stdout; aggregator handles routing",
        ],
        realWorld:
          "Foundational for cloud-native apps and PaaS (Heroku, Cloud Foundry, App Engine). Containers and Kubernetes embody many factors. Cloud Native Computing Foundation references it for app design.",
        tradeoffs: {
          pros: ["Portable across clouds/PaaS", "Scales horizontally by design", "Dev/prod parity reduces bugs"],
          cons: ["Less suited for stateful/long-running processes", "ENV config gets unwieldy at scale (use config server)", "Some factors now dated (XII admin processes)"],
        },
        codeExample: `# III. Config in environment (not in code)
DATABASE_URL=postgres://user:pass@db:5432/app
REDIS_URL=redis://cache:6379
JWT_SECRET=********
LOG_LEVEL=info

# IX. Disposability — graceful shutdown (Node.js)
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, draining...');
  server.close();              // stop accepting new conns
  await queue.close();         // finish in-flight work
  await db.$disconnect();
  process.exit(0);
});

# XI. Logs as event stream → stdout (JSON)
{ "level":"info","msg":"request","route":"/cart","ms":42 }`,
        interviewTips: [
          "List factors III (config), IV (backing services), IX (disposability), XI (logs) by heart",
          "Logs go to stdout, never to files in twelve-factor apps",
          "Twelve-factor underpins container/Kubernetes-native design",
        ],
      },
    },
    {
      id: "developer-portals-backstage",
      title: "Developer Portals (Backstage)",
      icon: "🚪",
      description: "Centralize service catalogs, docs, scaffolding, and tooling into an internal developer platform.",
      tags: ["DevEx", "Platform", "Backstage"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Internal Developer Portals (IDPs)</strong> centralize the software catalog, documentation, templating, and operational tooling. <strong>Backstage</strong> (Spotify, donated to CNCF) is the leading open-source IDP; it organizes services via <strong>Software Catalog</strong>, <strong>Templates</strong> (golden paths), and plugin-based tool integrations.",
        howItWorks: [
          "Catalog: every service, website, library, resource has an entity YAML in repo",
          "Catalog ingest: Backstage scans repos, builds a unified entity graph",
          "Software Templates: scaffold a new service with CI/CD, docs, and best-practice defaults",
          "Plugins: TechDocs, scaffolder, CI/CD dashboard, cost insights, security checks",
          "Golden Paths: opinionated templates encode org standards (tech, structure, CI)",
          "Scorecards: track service maturity (has owner, has SLO, has on-call, on supported runtime)",
        ],
        keyConcepts: [
          "<strong>Software Catalog</strong> — single source of truth for services & ownership",
          "<strong>Golden Path</strong> — opinionated, supported default for new services",
          "<strong>Scaffolder</strong> — generates new projects from templates",
          "<strong>TechDocs</strong> — docs-as-code, published alongside the service",
          "<strong>Scorecards</strong> — track service maturity against org standards",
        ],
        realWorld:
          "Spotify Backstage (CNCF). Adopted by Netflix (internal portal), Uber, American Airlines, Porsche, Cisco. Commercial offerings: Port, Cortex, OpsLevel, Humanitec. Sporna model (Gartner) defines IDP components.",
        tradeoffs: {
          pros: ["Find any service, owner, docs in one place", "Standardizes service creation", "Reduces cognitive load on engineers"],
          cons: ["Backstage customization needs platform team", "Catalog hygiene requires maintenance", "Adoption depends on cultural buy-in"],
        },
        codeExample: `# catalog-info.yaml — Backstage entity
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: checkout-service
  description: Shopping cart checkout API
  tags: [java, spring, payments]
spec:
  type: service
  lifecycle: production
  owner: team-payments
  system: commerce
  dependsOn:
    - resource:default/postgres-prod
    - component:default/pricing-service
  providesApis:
    - api:checkout-api
---
# Scorecard rule
- id: has-owner
  weight: 1
  appliesTo: [service]
  check: spec.owner is defined`,
        interviewTips: [
          "Backstage originated at Spotify and is CNCF-hosted",
          "Golden paths encode org standards into templates",
          "Scorecards measure service maturity—cite the use case",
        ],
      },
    },
    {
      id: "api-versioning",
      title: "API Versioning & Deprecation",
      icon: "🔖",
      description: "Evolve APIs without breaking consumers: URL/header/query versioning, deprecation policies.",
      tags: ["API", "Versioning", "Compatibility"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>API Versioning</strong> lets APIs evolve without breaking existing consumers. Approaches: <strong>URL</strong> (/v2/users), <strong>Header</strong> (Accept: application/vnd.api+json;version=2), <strong>Query</strong> (?version=2), or <strong>media-type</strong>. Pair with explicit <strong>deprecation</strong>, sunset headers, and backward-compat guarantees.",
        howItWorks: [
          "Choose versioning scheme: URL (most visible) vs header (cleaner URLs)",
          "Maintain backward compat within a major version (additive changes only)",
          "On breaking change: ship new major version alongside the old",
          "Mark deprecated endpoints with Sunset and Deprecation headers",
          "Communicate: deprecation notice in docs, response headers, developer emails",
          "Sunset: hard removal date (e.g., 12 months out); monitor usage to extend if needed",
        ],
        keyConcepts: [
          "<strong>URL Versioning</strong> — /v2/users; explicit, easy to route",
          "<strong>Header Versioning</strong> — Accept header; cleaner URLs but less discoverable",
          "<strong>Backward Compatibility</strong> — only additive changes within a major",
          "<strong>Sunset Header</strong> — RFC 8594: signals removal date",
          "<strong>Expand/Contract</strong> — add new, migrate, remove old (parallel change)",
        ],
        realWorld:
          "Stripe, GitHub, Twilio use URL versioning with multi-year deprecation cycles. AWS uses header/signing versioning. Stripe's API has versions like 2024-04-10. Postman and Stoplight manage deprecation tracking.",
        tradeoffs: {
          pros: ["URL versioning: visible and easy to route", "Header versioning: clean URLs", "Multi-version coexistence keeps consumers stable"],
          cons: ["Multi-version maintenance is costly", "Header versioning less discoverable", "Deprecation cycles can run for years"],
        },
        codeExample: `# URL versioning (REST)
GET /v1/users/42          # deprecated, returns Sunset header
GET /v2/users/42          # current

# Deprecation headers (RFC 8594 + draft-ietf-httpapi-deprecation-header)
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 31 Dec 2025 23:59:59 GMT
Link: </v2/users/42>; rel="successor-version"

# Expand/Contract migration
# Phase 1 (Expand): add field 'email_verified' alongside 'verified'
# Phase 2 (Migrate): consumers switch to new field
# Phase 3 (Contract): remove old field 'verified'`,
        interviewTips: [
          "Prefer URL versioning for public APIs—it's most discoverable",
          "Use Sunset/Deprecation headers to formalize the deprecation",
          "Expand/Contract (parallel change) avoids version bumps for additive evolution",
        ],
      },
    },
    {
      id: "error-handling-resilience",
      title: "Resilience Patterns: Retries, Timeouts, Bulkheads",
      icon: "🛡️",
      description: "Keep systems reliable under partial failure: retry with backoff, jitter, timeouts, bulkheads, circuit breakers.",
      tags: ["Resilience", "Patterns", "Reliability"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Resilience patterns</strong> keep a system working when dependencies fail partially. Core techniques: <strong>timeouts</strong> (bound wait), <strong>retries with exponential backoff + jitter</strong>, <strong>circuit breakers</strong> (stop calling failing deps), <strong>bulkheads</strong> (isolate resource pools), and <strong>fail fast</strong>.",
        howItWorks: [
          "Set a timeout on every outbound call—fail fast instead of hanging",
          "Retry transient failures with exponential backoff: 100ms → 200ms → 400ms",
          "Add jitter (random ±) to avoid thundering herd of synchronized retries",
          "Circuit breaker: after N failures, open the circuit; short-circuit subsequent calls",
          "Bulkhead: limit concurrent calls per dependency so one slow dep can't exhaust the pool",
          "Combine: timeout + retry + circuit breaker + bulkhead = layered defense",
        ],
        keyConcepts: [
          "<strong>Timeout</strong> — bound how long you'll wait",
          "<strong>Exponential Backoff + Jitter</strong> — retry with randomization",
          "<strong>Circuit Breaker</strong> — open/half-open/closed states",
          "<strong>Bulkhead</strong> — separate thread/connection pools per dependency",
          "<strong>Fall-back</strong> — degrade gracefully (cache, default, partial UI)",
        ],
        realWorld:
          "Netflix Hystrix pioneered this in microservices; Resilience4j is the modern Java successor. Polly (.NET), opossum (Node), failsafe-go. AWS SDKs include adaptive retry modes. gRPC has built-in deadline propagation.",
        tradeoffs: {
          pros: ["Prevents cascading failures", "Improves MTTR for transient issues", "Isolates blast radius of failing deps"],
          cons: ["Retries amplify load during outages (retry storm)", "Adds latency on failures", "Hard to tune thresholds"],
        },
        codeExample: `// Resilience4j-style config (TypeScript sketch)
const breaker = createCircuitBreaker({
  failureRateThreshold: 50,
  waitDurationInOpenState: '30s',
  slidingWindowSize: 20,
});
const retry = createRetry({
  maxAttempts: 3,
  waitDuration: (n) => 100 * 2 ** n + Math.random() * 50, // exp + jitter
});
const timeout = createTimeout(2000);   // 2s hard cap
const bulkhead = createBulkhead({ maxConcurrent: 20 });

async function callPayment(order) {
  return bulkhead.execute(() =>
    timeout.execute(() =>
      retry.execute(() =>
        breaker.execute(() => axios.post('/pay', order)))));
}`,
        interviewTips: [
          "Retries without backoff + jitter cause retry storms—always add them",
          "Circuit breaker protects the dependency, not just the caller",
          "Bulkheads prevent one slow dependency from starving others",
        ],
      },
    },
    {
      id: "concurrency-patterns",
      title: "Concurrency Patterns",
      icon: "🔀",
      description: "Coordinate concurrent work: worker pools, fan-out/fan-in, async/await, goroutines & channels.",
      tags: ["Concurrency", "Patterns", "Performance"],
      hasAnimation: true,
      content: {
        overview:
          "<strong>Concurrency patterns</strong> structure parallel work safely and efficiently. Common patterns: <strong>worker pool</strong> (bounded workers consuming a queue), <strong>fan-out/fan-in</strong> (dispatch many, gather results), <strong>async/await</strong> (cooperative concurrency on a single thread), <strong>goroutines + channels</strong> (CSP-style).",
        howItWorks: [
          "Worker Pool: fixed N workers pull tasks from a shared channel/queue",
          "Fan-out: spawn N concurrent units each handling a slice of input",
          "Fan-in: collect results from all workers into a single result channel/iterator",
          "async/await: write linear-looking code that yields on I/O—single-thread event loop",
          "Promises/Futures: represent a future value; chain with then/await; compose with all/race",
          "Channels/Select: Go-style CSP—workers communicate via typed channels",
        ],
        keyConcepts: [
          "<strong>Worker Pool</strong> — bounded concurrency, backpressure",
          "<strong>Fan-out / Fan-in</strong> — parallel dispatch + result aggregation",
          "<strong>async/await</strong> — cooperative concurrency, single-thread",
          "<strong>Promise.all / Promise.race</strong> — concurrent composition",
          "<strong>CSP (Go channels)</strong> — communicate by sharing channels, not memory",
        ],
        realWorld:
          "Go goroutines + channels (CSP). Rust tokio async runtime. Python asyncio + anyio. Node.js event loop + worker_threads. Java virtual threads (Project Loom, JDK 21) bring lightweight concurrency.",
        tradeoffs: {
          pros: ["Improves throughput on I/O-bound work", "Bounded pools provide backpressure", "Async/await avoids thread overhead"],
          cons: ["Shared state needs locking or atomics", "Deadlocks/livelocks possible", "Async stack traces are harder to debug"],
        },
        codeExample: `// Go: worker pool + fan-out/fan-in via channels
func worker(id int, jobs <-chan int, out chan<- int) {
  for j := range jobs {
    out <- j * j          // produce result
  }
}

func main() {
  jobs := make(chan int, 100)
  results := make(chan int, 100)
  for w := 1; w <= 5; w++ {            // fan-out: 5 workers
    go worker(w, jobs, results)
  }
  for j := 1; j <= 20; j++ { jobs <- j }
  close(jobs)
  sum := 0
  for r := 1; r <= 20; r++ { sum += <-results }   // fan-in
}`,
        interviewTips: [
          "Worker pools provide backpressure—mention bounded queues",
          "Promise.all vs Promise.race vs Promise.any—know the difference",
          "Prefer message passing over shared memory where possible",
        ],
      },
    },
  ],
};
