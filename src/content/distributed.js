/**
 * Category: Distributed Systems
 * Core concepts of building systems that span multiple machines.
 */
export const DISTRIBUTED = {
    id: 'distributed-systems',
    name: 'Distributed Systems',
    icon: '🌐',
    level: 'advanced',
    topics: [
        {
            id: 'cap-theorem', title: 'CAP Theorem', icon: '🔺',
            description: 'The fundamental trade-off between Consistency, Availability, and Partition Tolerance.',
            tags: ['Distributed Systems', 'Trade-offs', 'Theory'],
            hasAnimation: true, animationModule: 'capTheorem',
            content: {
                overview: 'The <strong>CAP Theorem</strong> states that a distributed system can guarantee at most <strong>two of three</strong> properties: Consistency, Availability, and Partition Tolerance. Since network partitions are unavoidable, the real choice is between C and A.',
                howItWorks: ['Consistency: Every read receives the most recent write or an error', 'Availability: Every request receives a non-error response', 'Partition Tolerance: System works despite network failures between nodes', 'Network partitions WILL happen → P is non-negotiable', 'Choose CP (consistency) or AP (availability) during partitions'],
                keyConcepts: ['<strong>CP Systems</strong> — Reject requests during partitions (MongoDB, HBase)', '<strong>AP Systems</strong> — Return possibly stale data (Cassandra, DynamoDB)', '<strong>Eventual Consistency</strong> — Data converges after partition heals', '<strong>Strong Consistency</strong> — All nodes always agree', '<strong>PACELC</strong> — Extension: even without Partitions, choose Latency vs Consistency'],
                realWorld: 'Banking: CP (balance must be accurate). Social media: AP (showing slightly stale likes count is OK). DNS: AP (cached records may be stale).',
                tradeoffs: { pros: ['Provides framework for design decisions', 'Clarifies what\'s possible vs impossible'], cons: ['Oversimplifies real-world systems', 'Not binary — many gradations exist'] },
                codeExample: `# CP System (MongoDB w/ majority read concern)
db.users.find({id: 1}).readConcern("majority")
# Always consistent, but blocks during partition

# AP System (Cassandra w/ ONE consistency)
SELECT * FROM users WHERE id = 1
  CONSISTENCY ONE;
# Always responds, but may return stale data`,
                interviewTips: ['Explain CAP with concrete examples', 'Know PACELC extension', 'Discuss eventual consistency and conflict resolution']
            }
        },
        {
            id: 'consistent-hashing', title: 'Consistent Hashing', icon: '💍',
            description: 'Distribute data across nodes with minimal redistribution when nodes change.',
            tags: ['Distributed Systems', 'Hash Ring', 'Scaling'],
            hasAnimation: true, animationModule: 'consistentHashing',
            content: {
                overview: '<strong>Consistent Hashing</strong> maps both data keys and server nodes onto a hash ring. Each key is assigned to the first node clockwise on the ring. When nodes are added/removed, only ~1/N of keys need to move.',
                howItWorks: ['Hash both server IDs and data keys onto a ring (0 to 2^32)', 'Each key maps to the first server clockwise from its position', 'Adding a server: only keys between new server and predecessor move', 'Removing: only that server\'s keys move to the next server', 'Virtual nodes: each physical server gets multiple ring positions'],
                keyConcepts: ['<strong>Hash Ring</strong> — Circular hash space from 0 to 2^32', '<strong>Virtual Nodes</strong> — Multiple positions per server for even distribution', '<strong>Key Redistribution</strong> — Only K/N keys move on changes (vs ALL with modulo)', '<strong>Replication</strong> — Store data on N consecutive nodes on the ring', '<strong>Node Heterogeneity</strong> — More virtual nodes for more powerful servers'],
                realWorld: 'Amazon DynamoDB, Apache Cassandra, Memcached, Akamai CDN. Discord uses consistent hashing for message routing.',
                tradeoffs: { pros: ['Minimal redistribution on node changes', 'Horizontally scalable', 'Works with heterogeneous hardware'], cons: ['More complex than simple modulo', 'Hot spots possible without virtual nodes', 'Rebalancing during node changes still has cost'] },
                codeExample: `import hashlib

class ConsistentHash:
    def __init__(self, nodes, vnodes=150):
        self.ring = {}
        for node in nodes:
            for i in range(vnodes):
                key = hash(f"{node}:{i}")
                self.ring[key] = node

    def get_node(self, key):
        h = hash(key)
        # Find first node clockwise
        for ring_key in sorted(self.ring):
            if ring_key >= h:
                return self.ring[ring_key]
        return self.ring[sorted(self.ring)[0]]`,
                interviewTips: ['Draw the hash ring and walk through examples', 'Explain why virtual nodes are necessary', 'Compare with simple modulo hashing']
            }
        },
        {
            id: 'consensus-raft', title: 'Distributed Consensus (Raft)', icon: '🤝',
            description: 'How distributed nodes agree on shared state using the Raft protocol.',
            tags: ['Consensus', 'Raft', 'Fault Tolerance'],
            hasAnimation: true,
            content: {
                overview: '<strong>Distributed Consensus</strong> is how multiple nodes agree on shared state despite failures. <strong>Raft</strong> is an understandable consensus algorithm that elects a leader to manage log replication across followers.',
                howItWorks: ['Nodes are in one of 3 states: Leader, Follower, Candidate', 'Leader sends heartbeats to followers', 'If heartbeat timeout → follower becomes candidate, starts election', 'Candidate requests votes; majority wins election', 'Leader replicates log entries to followers for consistency'],
                keyConcepts: ['<strong>Leader Election</strong> — Majority vote determines the leader', '<strong>Log Replication</strong> — Leader appends entries, followers replicate', '<strong>Term</strong> — Monotonically increasing election era', '<strong>Majority Quorum</strong> — Need N/2+1 nodes to agree', '<strong>Split Brain</strong> — Prevented by requiring majority for election'],
                realWorld: 'etcd (Kubernetes) uses Raft. CockroachDB uses Raft for transaction consensus. Consul uses Raft for service discovery. HashiCorp Vault for secret management.',
                tradeoffs: { pros: ['Strong consistency', 'Understandable algorithm', 'Fault tolerant (survives minority failures)'], cons: ['Leader bottleneck', 'Availability reduced during elections', 'Majority must be reachable'] },
                codeExample: `Raft State Machine:
Follower → (timeout) → Candidate
Candidate → (majority vote) → Leader
Candidate → (higher term) → Follower
Leader → (higher term seen) → Follower

Quorum: 3/5 nodes must agree
  5 nodes: tolerates 2 failures
  7 nodes: tolerates 3 failures`,
                interviewTips: ['Walk through a Raft election step by step', 'Explain how Raft handles network partitions', 'Compare Raft vs Paxos']
            }
        },
        {
            id: 'leader-election', title: 'Leader Election', icon: '👑',
            description: 'Choosing a single coordinator node in a distributed system.',
            tags: ['Coordination', 'ZooKeeper', 'Consensus'],
            hasAnimation: true,
            content: {
                overview: '<strong>Leader Election</strong> is the process of designating a single node as the coordinator (leader) for a group. The leader handles writes, task assignment, or coordination while followers replicate and serve reads.',
                howItWorks: ['All nodes start as equals (no leader)', 'Trigger election on startup or leader failure', 'Nodes propose themselves and collect votes', 'Node with majority votes becomes leader', 'Leader announces its role; followers start following'],
                keyConcepts: ['<strong>Bully Algorithm</strong> — Highest ID node always wins', '<strong>Ring Algorithm</strong> — Election message passed in a ring', '<strong>ZooKeeper</strong> — Centralized coordination service for election', '<strong>Lease-Based</strong> — Leader holds a time-limited lease', '<strong>Fencing Token</strong> — Prevents stale leader from acting'],
                realWorld: 'Kafka uses ZooKeeper for partition leader election. Redis Sentinel for master election. Kubernetes leader election for controller manager.',
                tradeoffs: { pros: ['Simplifies coordination', 'Prevents conflicting decisions'], cons: ['Leader is a bottleneck', 'Election downtime', 'Split-brain risk without fencing'] },
                codeExample: `# ZooKeeper Leader Election
1. All nodes create ephemeral sequential znodes:
   /election/node-0001 (Node A)
   /election/node-0002 (Node B)
   /election/node-0003 (Node C)

2. Lowest sequence number = Leader
   Node A is the leader!

3. If Node A dies → ephemeral node deleted
   Node B becomes new leader`,
                interviewTips: ['Know multiple leader election algorithms', 'Explain the split-brain problem', 'Discuss fencing tokens for safety']
            }
        },
        {
            id: 'gossip-protocol', title: 'Gossip Protocol', icon: '🗣️',
            description: 'Peer-to-peer information dissemination inspired by how rumors spread.',
            tags: ['P2P', 'Membership', 'Failure Detection'],
            hasAnimation: true,
            content: {
                overview: 'The <strong>Gossip Protocol</strong> spreads information through a cluster the way rumors spread in society. Each node periodically picks a random peer and exchanges state. Information eventually reaches all nodes — a form of <strong>eventual consistency</strong>.',
                howItWorks: ['Each node maintains a list of known nodes and their states', 'Periodically (every ~1s), pick a random peer', 'Exchange state information with that peer', 'Both nodes merge state, keeping the latest versions', 'Within O(log N) rounds, all nodes converge'],
                keyConcepts: ['<strong>Epidemic Broadcast</strong> — Information spreads exponentially', '<strong>Membership Protocol</strong> — Detect which nodes are alive', '<strong>Failure Detection</strong> — Node not gossiping = suspected dead', '<strong>Crdt Convergence</strong> — Gossip + CRDTs for conflict-free merge', '<strong>Anti-Entropy</strong> — Background process to repair inconsistencies'],
                realWorld: 'Cassandra uses gossip for cluster membership. Amazon DynamoDB uses gossip. HashiCorp Serf/Consul for service discovery. Redis Cluster for node coordination.',
                tradeoffs: { pros: ['Decentralized (no SPOF)', 'Scalable to large clusters', 'Eventually consistent'], cons: ['Latency in convergence', 'Bandwidth overhead', 'Not immediate consistency'] },
                codeExample: `Gossip Round (every 1 second):
Node A picks random peer → Node C
A sends: {B: alive@t3, D: alive@t5}
C sends: {B: alive@t3, E: alive@t2}
After merge, both know: B, D, E are alive

Convergence: O(log N) rounds
  10 nodes: ~4 rounds (4 sec)
  1000 nodes: ~10 rounds (10 sec)`,
                interviewTips: ['Explain convergence time analysis', 'Compare gossip vs centralized coordination', 'Discuss gossip-based failure detection']
            }
        },
        {
            id: 'vector-clocks', title: 'Vector Clocks & Causality', icon: '🕐',
            description: 'Track causal ordering of events in distributed systems where clocks are unreliable.',
            tags: ['Ordering', 'Causality', 'Conflict Resolution'],
            hasAnimation: true,
            content: {
                overview: '<strong>Vector Clocks</strong> track causality in distributed systems. Physical clocks are unreliable across machines, so vector clocks use logical counters to determine if events are causally related or concurrent.',
                howItWorks: ['Each node maintains a vector of counters [A:0, B:0, C:0]', 'On local event: increment own counter', 'On send: include current vector clock', 'On receive: merge (take max of each counter) + increment own', 'Compare vectors to determine causal ordering'],
                keyConcepts: ['<strong>Happened-Before</strong> — Event A causally precedes event B', '<strong>Concurrent Events</strong> — Neither happened before the other', '<strong>Lamport Timestamps</strong> — Simpler single counter (weaker ordering)', '<strong>Conflict Detection</strong> — Concurrent writes = conflict', '<strong>Version Vectors</strong> — Used in databases like DynamoDB (Riak)'],
                realWorld: 'Amazon DynamoDB uses version vectors. Riak uses vector clocks. CRDTs use causal ordering internally.',
                tradeoffs: { pros: ['Detects conflicts accurately', 'No dependency on physical clocks'], cons: ['Vector size grows with number of nodes', 'Complex conflict resolution logic', 'Storage overhead'] },
                codeExample: `Node A          Node B          Node C
[1,0,0]                          (A writes)
        →send→  [1,1,0]         (B receives + writes)
[2,0,0]                          (A writes again)
                        →send→  [1,1,1] (C receives)

Compare [2,0,0] vs [1,1,0]:
  A > B? 2>1 yes, 0<1 no → CONCURRENT (conflict!)`,
                interviewTips: ['Draw vector clock examples', 'Explain happened-before relation', 'Know how DynamoDB resolves conflicts']
            }
        },
        {
            id: 'distributed-txn', title: 'Distributed Transactions', icon: '🔗',
            description: 'Coordinating transactions across multiple databases or services (2PC, Saga).',
            tags: ['Transactions', '2PC', 'Saga Pattern'],
            hasAnimation: true,
            content: {
                overview: '<strong>Distributed Transactions</strong> span multiple databases or services. <strong>2-Phase Commit (2PC)</strong> provides atomicity but is blocking. The <strong>Saga Pattern</strong> uses compensating transactions for eventual consistency.',
                howItWorks: ['2PC Phase 1: Coordinator asks all participants to PREPARE', '2PC Phase 2: If all vote YES → COMMIT; if any vote NO → ABORT', 'Saga: Break transaction into steps with compensating actions', 'If step 3 fails → run compensation for steps 2, 1 (reverse)', 'Saga provides eventual consistency, not ACID'],
                keyConcepts: ['<strong>2-Phase Commit</strong> — Strong consistency but blocking', '<strong>Saga Pattern</strong> — Sequence of local transactions + compensations', '<strong>Choreography Saga</strong> — Services emit events, others react', '<strong>Orchestration Saga</strong> — Central coordinator manages the saga', '<strong>Compensating Transaction</strong> — Undo action for a failed step'],
                realWorld: 'Google Spanner uses a variant of 2PC globally. Uber uses Saga for ride booking (reserve driver → charge payment → notify). AWS Step Functions orchestrate sagas.',
                tradeoffs: { pros: ['2PC: Strong consistency', 'Saga: No global locks, better availability'], cons: ['2PC: Blocking, coordinator SPOF', 'Saga: Complex compensation logic, eventual consistency'] },
                codeExample: `# Saga: E-commerce Order
Step 1: Reserve Inventory
Step 2: Charge Payment
Step 3: Ship Order

If Step 2 fails:
  Compensate Step 1: Release Inventory
  → Order cancelled cleanly

# 2PC
Coordinator → All: PREPARE
  Node A: YES     Node B: YES
Coordinator → All: COMMIT
  Node A: COMMIT  Node B: COMMIT`,
                interviewTips: ['Compare 2PC vs Saga with examples', 'Explain compensation logic for common scenarios', 'Discuss why 2PC doesn\'t scale well']
            }
        },
        {
            id: 'quorum', title: 'Quorum & W+R>N', icon: '🗳️',
            description: 'Reading and writing to a majority of nodes for consistency guarantees.',
            tags: ['Consistency', 'Replication', 'Read/Write'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>Quorum</strong> is the minimum number of nodes that must agree for an operation to succeed. With N replicas, if Write quorum (W) + Read quorum (R) > N, reads always see the latest write.',
                howItWorks: ['Data replicated to N nodes', 'Write succeeds when W nodes acknowledge', 'Read queries R nodes and takes the latest value', 'If W + R > N → at least one node has latest write', 'Tunable consistency: adjust W and R for your needs'],
                keyConcepts: ['<strong>N</strong> — Total replicas', '<strong>W</strong> — Write quorum (nodes that must ACK writes)', '<strong>R</strong> — Read quorum (nodes queried for reads)', '<strong>W+R>N</strong> — Guarantees strong consistency', '<strong>Sloppy Quorum</strong> — Allow non-replica nodes during partitions'],
                realWorld: 'Cassandra: configurable W, R, N per query. DynamoDB uses quorum for consistency. Riak supports tunable consistency.',
                tradeoffs: { pros: ['Tunable consistency vs availability', 'Flexible trade-offs per operation'], cons: ['Higher W = slower writes', 'Higher R = slower reads', 'Network partitions can prevent quorum'] },
                codeExample: `N=3, W=2, R=2 (W+R=4 > 3 → consistent)
Write "x=5": 2 of 3 nodes ACK → success
Read "x": query 2 of 3 → at least 1 has "x=5"

N=3, W=1, R=1 (W+R=2 < 3 → eventually consistent)
Fast but may read stale data

Common configs:
  Strong:   W=N, R=1  (fast reads, slow writes)
  Fast:     W=1, R=N  (fast writes, slow reads)
  Balanced: W=2, R=2  (N=3)`,
                interviewTips: ['Derive why W+R>N guarantees consistency', 'Know common quorum configurations', 'Explain sloppy quorum and hinted handoff']
            }
        },
        {
            id: 'split-brain', title: 'Split Brain Problem', icon: '🧠',
            description: 'When network partitions cause two leaders to emerge, leading to data divergence.',
            tags: ['Failure', 'Network Partition', 'Safety'],
            hasAnimation: true,
            content: {
                overview: 'A <strong>Split Brain</strong> occurs when a network partition divides a cluster into two groups, and each group believes it is the sole survivor. Both partitions may elect their own leader, leading to <strong>conflicting writes and data divergence</strong>.',
                howItWorks: ['Network partition separates cluster into Group A and Group B', 'Group A can\'t reach Group B → assumes B is dead', 'Group A elects a new leader (now 2 leaders exist!)', 'Both leaders accept writes → data diverges (conflict!)', 'When partition heals → conflicting data must be reconciled'],
                keyConcepts: ['<strong>Fencing Token</strong> — Monotonically increasing token prevents stale leader actions', '<strong>Majority Quorum</strong> — Only majority partition can elect leader', '<strong>STONITH</strong> — Shoot The Other Node In The Head (force kill old leader)', '<strong>Epoch/Term Numbers</strong> — Higher term leader overrides lower term', '<strong>Conflict Resolution</strong> — Last-Write-Wins, merge, or manual resolution'],
                realWorld: 'Elasticsearch split brain was a common production issue. Redis Sentinel uses quorum to prevent it. ZooKeeper prevents split brain in Kafka.',
                tradeoffs: { pros: ['Awareness helps design safer systems'], cons: ['No perfect solution exists', 'Recovery may require manual intervention', 'Data loss possible in worst case'] },
                codeExample: `Split Brain Scenario:
[A, B, C | D, E]  ← network partition

Group {A,B,C}: has majority → can elect leader ✓
Group {D,E}: minority → should NOT elect leader ✗

Prevention: require majority (N/2+1) for election
  5 nodes → need 3 votes
  {A,B,C} has 3 → can elect ✓
  {D,E} has 2 → cannot elect ✓ (prevented!)`,
                interviewTips: ['Know how majority quorum prevents split brain', 'Explain fencing tokens', 'Discuss what happens when split brain occurs']
            }
        },
        {
            id: 'heartbeat', title: 'Heartbeat & Failure Detection', icon: '💓',
            description: 'How distributed systems detect when nodes fail using periodic health signals.',
            tags: ['Monitoring', 'Health Check', 'Failure'],
            hasAnimation: true,
            content: {
                overview: '<strong>Heartbeats</strong> are periodic signals sent between nodes to indicate liveness. If a node stops sending heartbeats, it\'s suspected to have failed. Failure detection triggers leader election, failover, or traffic rerouting.',
                howItWorks: ['Each node sends heartbeat to coordinator (or peers) at fixed intervals', 'Coordinator tracks last heartbeat time for each node', 'If no heartbeat within timeout → node marked as suspected failed', 'Failed node removed from routing, failover initiated', 'When node recovers, it re-registers and resumes heartbeats'],
                keyConcepts: ['<strong>Heartbeat Interval</strong> — How often signals are sent (e.g., every 1s)', '<strong>Timeout</strong> — How long to wait before declaring failure (e.g., 5s)', '<strong>Phi Accrual Detector</strong> — Adaptive failure detection based on heartbeat history', '<strong>False Positives</strong> — Slow network may cause healthy nodes to be declared dead', '<strong>Cascading Failure</strong> — Removing a node increases load on remaining nodes'],
                realWorld: 'Kubernetes liveness/readiness probes. AWS ELB health checks. ZooKeeper session heartbeats. Redis Sentinel monitors master health.',
                tradeoffs: { pros: ['Simple and effective', 'Quick failure detection'], cons: ['Network issues cause false positives', 'Short timeouts = more false positives', 'Long timeouts = slow failure detection'] },
                codeExample: `# Kubernetes Health Check
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
  # 3 failures × 5s = 15s to detect failure`,
                interviewTips: ['Discuss timeout tuning trade-offs', 'Know phi accrual failure detector', 'Explain cascading failure scenario']
            }
        }
    ]
};
