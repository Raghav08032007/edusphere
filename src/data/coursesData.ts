// ==============================================================================
// EDUSPHEERE ACADEMIC CURRICULUM DATA STORE
// Rigorous Coursera/Vedantu course hierarchies with modules, notes, and question banks
// ==============================================================================

import { Course } from '../types/curriculum';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-dist-sys',
    code: 'CS-DIST-401',
    title: 'Distributed Systems & Cloud Architecture',
    subtitle: 'Consensus Protocols, Raft Fault Tolerance, Linearizability & CRDTs',
    subject: 'Computer Science',
    category: 'Systems & Infrastructure',
    instructorName: 'Dr. K. Rajan',
    instructorTitle: 'Dean of Faculty, Department of Computer Science & Engineering',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    rating: 4.92,
    enrolledCount: 14250,
    estimatedHours: 24,
    difficulty: 'Advanced',
    isEnrolled: true,
    progressPercentage: 50,
    lastAccessedTopicId: 'topic-raft-leader',
    description:
      'Master the engineering fundamentals of modern cloud architectures. Understand how distributed clusters coordinate without a central authority, resolve split-brain network partitions, and maintain linearizable consistency.',
    learningObjectives: [
      'Derive and prove the CAP Theorem trade-offs and PACELC latency bounds.',
      'Implement the Raft consensus algorithm including leader election and log reconciliation.',
      'Analyze causal consistency using Lamport timestamps and Vector Clocks.',
      'Design Conflict-Free Replicated Data Types (CRDTs) for offline-first collaborative systems.',
    ],
    modules: [
      {
        id: 'mod-dist-1',
        courseId: 'course-dist-sys',
        moduleNumber: 1,
        title: 'Foundations of Distributed Computing & Failure Models',
        description: 'Network synchrony models, crash-recovery vs Byzantine failures, and RPC communication fallacies.',
        estimatedMinutes: 180,
        topics: [
          {
            id: 'topic-rpc-fallacies',
            moduleId: 'mod-dist-1',
            courseId: 'course-dist-sys',
            topicNumber: 1,
            title: 'RPC Semantics, Fallacies of Distributed Computing & Network Partitions',
            estimatedMinutes: 45,
            isCompleted: true,
            isBookmarked: true,
            note: {
              id: 'note-rpc-fallacies',
              title: 'RPC Semantics, Fallacies of Distributed Computing & Network Partitions',
              readingMinutes: 12,
              updatedAt: '2026-10-25T10:00:00Z',
              keyTakeaways: [
                'Network latency is never zero; bandwidth is finite; transport topology changes dynamically.',
                'At-least-once RPC invocation requires strict idempotency tokens on state mutation endpoints.',
                'Network partitions are inevitable in asynchronous networks; systems must prioritize Consistency or Availability under partition (CAP).',
              ],
              content: `## The Eight Fallacies of Distributed Computing

When designing modern cloud architectures, engineers often make false assumptions that lead to catastrophic cluster deadlocks:

1. **The network is reliable**: Dropped packets, MTU black holes, and cable cuts are routine.
2. **Latency is zero**: Cross-datacenter Round-Trip Time (RTT) ranges from 20ms to 200ms.
3. **Bandwidth is infinite**: Saturation triggers bufferbloat and socket backpressure.
4. **The network is secure**: Zero-trust architectures require mutual TLS across internal cluster nodes.
5. **Topology doesn't change**: Kubernetes auto-scaling dynamically churns pod IP addresses.
6. **There is one administrator**: Microservices operate under heterogeneous IAM policies.
7. **Transport cost is zero**: Serialization (JSON vs Protobuf vs Cap'n Proto) consumes significant CPU cycles.
8. **The network is homogeneous**: Varying MTU and TCP congestion windows cause head-of-line blocking.

### RPC Delivery Semantics: At-Least-Once vs Exactly-Once

\`\`\`
Client                  Network                 Server
  |                        |                       |
  |--- POST /charge ------>|                       |
  |    (Timeout / Drop)    |x                      |
  |                        |                       |
  |--- POST /charge ------>|---------------------->| (Needs Idempotency Key)
\`\`\`

To guarantee safe retries, servers must maintain an **Idempotency Store**:
$$\\text{Result} = f(\\text{Request}, \\text{IdempotencyKey})$$
If $\\text{IdempotencyKey}$ has already executed, return cached response without re-executing state transitions.`,
            },
            questions: [
              {
                id: 'q-rpc-1',
                courseId: 'course-dist-sys',
                moduleId: 'mod-dist-1',
                topicId: 'topic-rpc-fallacies',
                topicTitle: 'RPC Semantics & Fallacies',
                type: 'mcq_single',
                difficulty: 'Intermediate',
                questionText: 'Under network partitions in an asynchronous distributed system, why is genuine "Exactly-Once" RPC execution mathematically impossible without idempotency keys?',
                options: [
                  'Because the Two Generals Problem proves that two nodes cannot coordinate state with 100% certainty over an unreliable link.',
                  'Because TCP checksums are only 16-bit and frequently suffer undetected bit-flips.',
                  'Because clock skew between NTP servers causes messages to arrive in reverse chronological order.',
                  'Because socket file descriptors are strictly ephemeral and cannot survive process restarts.',
                ],
                correctIndices: [0],
                explanation: 'The Two Generals Problem establishes that over an unreliable channel, infinite acknowledgments would be required to verify common knowledge. Therefore, network timeouts force the client to retry, yielding at-least-once delivery, which requires server-side idempotency keys to ensure exact single execution.',
              },
              {
                id: 'q-rpc-2',
                courseId: 'course-dist-sys',
                moduleId: 'mod-dist-1',
                topicId: 'topic-rpc-fallacies',
                topicTitle: 'RPC Semantics & Fallacies',
                type: 'true_false',
                difficulty: 'Beginner',
                questionText: 'True or False: In a CAP Theorem partition scenario, a system can simultaneously guarantee 100% linearizable Consistency and 100% Availability for write requests across partitioned nodes.',
                options: ['True', 'False'],
                correctIndices: [1],
                explanation: 'False. When a network partition occurs, writes received by a node on side A of the partition cannot synchronously replicate to nodes on side B. The system must choose either to reject the write (prioritizing Consistency) or accept it without synchronization (sacrificing Consistency for Availability).',
              },
            ],
          },
          {
            id: 'topic-raft-leader',
            moduleId: 'mod-dist-1',
            courseId: 'course-dist-sys',
            topicNumber: 2,
            title: 'Raft Consensus Protocol: Leader Election & Log Replication',
            estimatedMinutes: 60,
            isCompleted: true,
            isBookmarked: false,
            note: {
              id: 'note-raft-leader',
              title: 'Raft Consensus Protocol: Leader Election & Log Replication',
              readingMinutes: 15,
              updatedAt: '2026-10-25T14:30:00Z',
              keyTakeaways: [
                'Raft decomposes consensus into three independent subproblems: Leader Election, Log Replication, and Safety.',
                'Randomized election timeouts (150ms–300ms) prevent split-vote deadlocks during term elections.',
                'Leader AppendEntries heartbeats overwrite uncommitted conflicting entries on follower nodes to maintain the Log Matching Property.',
              ],
              content: `## Raft Protocol Architecture

Raft organizes time into arbitrary **Terms** numbered with consecutive integers:

$$\\text{Term}_1 \\to \\text{Term}_2 \\to \\text{Term}_3 \\to \\dots$$

Each node exists in one of three states:
1. **Follower**: Passive, responds to incoming RPCs from candidate and leader.
2. **Candidate**: Increments term, votes for itself, sends \`RequestVote\` RPCs to peers.
3. **Leader**: Manages all client writes, replicates logs via \`AppendEntries\` RPCs, sends heartbeats.

### Leader Election Mechanics & Election Timeouts

Followers reset their internal **Election Timer** whenever receiving valid heartbeats from the Leader. If no heartbeat arrives within a randomized window:
$$T_{\\text{election}} \\in [150\\text{ms}, 300\\text{ms}]$$

The node converts to **Candidate** state and broadcasts:
\`\`\`go
type RequestVoteArgs struct {
    Term         int // Candidate's current term
    CandidateId  int // Candidate requesting vote
    LastLogIndex int // Index of candidate's last log entry
    LastLogTerm  int // Term of candidate's last log entry
}
\`\`\`

A peer grants its vote if and only if:
1. It has not voted for another candidate in this term.
2. The candidate's log is **at least as up-to-date** as the receiver's own log:
   $$(\\text{LastLogTerm}_{\\text{cand}} > \\text{LastLogTerm}_{\\text{recv}}) \\lor (\\text{terms equal} \\land \\text{LastLogIndex}_{\\text{cand}} \\ge \\text{LastLogIndex}_{\\text{recv}})$$`,
            },
            questions: [
              {
                id: 'q-raft-1',
                courseId: 'course-dist-sys',
                moduleId: 'mod-dist-1',
                topicId: 'topic-raft-leader',
                topicTitle: 'Raft Consensus Protocol',
                type: 'mcq_single',
                difficulty: 'Intermediate',
                questionText: 'In the Raft consensus algorithm, how does randomized election timeout effectively prevent split-vote deadlocks?',
                options: [
                  'By designating the node with the lowest MAC address as permanent leader.',
                  'By ensuring candidate timers expire at staggered intervals so one candidate typically requests and secures votes before rivals wake up.',
                  'By delegating the term increment to an external Paxos coordinator.',
                  'By forcing all nodes to wait for 60 seconds before initiating term transitions.',
                ],
                correctIndices: [1],
                explanation: 'Randomized election timeouts (e.g. 150ms to 300ms) break symmetry, ensuring that one follower node times out earlier than its peers, claims the new term, and collects a majority of votes before other nodes can split the ballot.',
              },
              {
                id: 'q-raft-2',
                courseId: 'course-dist-sys',
                moduleId: 'mod-dist-1',
                topicId: 'topic-raft-leader',
                topicTitle: 'Raft Consensus Protocol',
                type: 'mcq_multi',
                difficulty: 'Advanced',
                questionText: 'Which of the following properties are strictly guaranteed by the Raft Safety Invariant? (Select all that apply)',
                options: [
                  'Election Safety: At most one leader can be elected in a given term.',
                  'Leader Append-Only: A leader never overwrites or truncates its own log entries.',
                  'Log Matching Property: If two logs contain an entry with the same index and term, the logs are identical in all entries up through the given index.',
                  'Byzantine Resistance: The cluster can tolerate up to 50% malicious nodes injecting corrupt payloads.',
                ],
                correctIndices: [0, 1, 2],
                explanation: 'Options A, B, and C are fundamental Raft safety guarantees. Raft is a crash-fault-tolerant (CFT) protocol, not a Byzantine-fault-tolerant (BFT) protocol; it assumes non-malicious nodes that follow the protocol rules.',
              },
            ],
          },
        ],
        quiz: {
          id: 'quiz-dist-mod-1',
          courseId: 'course-dist-sys',
          moduleId: 'mod-dist-1',
          title: 'Module 1 Assessment: Distributed Foundations & Raft Consensus',
          description: 'Evaluate your mastery of network fallacies, RPC idempotency, and the Raft leader election algorithm.',
          timeLimitMinutes: 15,
          passingScore: 75,
          questions: [
            {
              id: 'q-quiz-dist-1',
              courseId: 'course-dist-sys',
              moduleId: 'mod-dist-1',
              topicId: 'topic-rpc-fallacies',
              topicTitle: 'RPC Fallacies',
              type: 'mcq_single',
              difficulty: 'Intermediate',
              questionText: 'What is the primary role of the PrevLogIndex and PrevLogTerm fields in Raft AppendEntries RPC?',
              options: [
                'To verify that the follower has matching log history immediately preceding the new entries being appended.',
                'To encrypt the payload using symmetric AES-256 session keys.',
                'To inform the follower of the current NTP wall-clock timestamp.',
                'To trigger an instant leader election if the follower has higher index.',
              ],
              correctIndices: [0],
              explanation: 'When a leader sends AppendEntries, it includes PrevLogIndex and PrevLogTerm. If the follower cannot find an entry matching both values, it rejects the RPC. The leader then decrements NextIndex and retries, ensuring no gaps or discrepancies exist.',
            },
            {
              id: 'q-quiz-dist-2',
              courseId: 'course-dist-sys',
              moduleId: 'mod-dist-1',
              topicId: 'topic-raft-leader',
              topicTitle: 'Raft Consensus',
              type: 'mcq_single',
              difficulty: 'Advanced',
              questionText: 'Under Raft rules, what must a Leader node do if it receives a request or RPC containing a Term higher than its own current Term?',
              options: [
                'Reject the RPC and broadcast an administrative impeachment alert.',
                'Immediately step down to Follower state and update its Term to the higher value.',
                'Increment its own Term by 2 to reassert leadership.',
                'Pause all incoming client writes until a 2/3 supermajority votes.',
              ],
              correctIndices: [1],
              explanation: 'In Raft, Term numbers strictly govern authority. If any node encounters a higher Term number in incoming RPCs or responses, it must immediately convert to Follower state and update its internal Term to match.',
            },
            {
              id: 'q-quiz-dist-3',
              courseId: 'course-dist-sys',
              moduleId: 'mod-dist-1',
              topicId: 'topic-rpc-fallacies',
              topicTitle: 'CAP Theorem',
              type: 'true_false',
              difficulty: 'Beginner',
              questionText: 'True or False: In the absence of network partitions, a distributed system can provide both strong Consistency and high Availability simultaneously.',
              options: ['True', 'False'],
              correctIndices: [0],
              explanation: 'True. The CAP theorem states that a system cannot achieve both Consistency and Availability specifically in the presence of a network Partition (P). When the network is operating normally with zero partitions, both C and A are achievable.',
            },
            {
              id: 'q-quiz-dist-4',
              courseId: 'course-dist-sys',
              moduleId: 'mod-dist-1',
              topicId: 'topic-raft-leader',
              topicTitle: 'Raft Log Replication',
              type: 'mcq_single',
              difficulty: 'Intermediate',
              questionText: 'In a Raft cluster consisting of 5 nodes, what is the minimum number of nodes required to form a valid quorum and commit an entry?',
              options: ['2 nodes', '3 nodes', '4 nodes', '5 nodes'],
              correctIndices: [1],
              explanation: 'A quorum in Raft requires a strict majority: floor(N/2) + 1. For N = 5 nodes, majority is floor(5/2) + 1 = 2 + 1 = 3 nodes.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'course-dl-ai',
    code: 'AI-DEEP-502',
    title: 'Deep Learning Systems & Transformer Architectures',
    subtitle: 'Attention Math, KV-Caching, FlashAttention & Distributed Multi-GPU Training',
    subject: 'Computer Science',
    category: 'Artificial Intelligence',
    instructorName: 'Dr. K. Rajan & Prof. Eleanor Vance',
    instructorTitle: 'Antigravity AI Lab & Department of Mathematics',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    rating: 4.96,
    enrolledCount: 18900,
    estimatedHours: 32,
    difficulty: 'Advanced',
    isEnrolled: true,
    progressPercentage: 35,
    lastAccessedTopicId: 'topic-self-attention',
    description:
      'Rigorous mathematical derivation of self-attention mechanisms, autoregressive token decoding, memory-efficient FlashAttention kernels, and DeepSpeed ZeRO memory stage partitioning for trillion-parameter models.',
    learningObjectives: [
      'Derive the mathematical proof for scaled dot-product attention softmax gradient stability.',
      'Analyze the quadratic time and memory complexity of autoregressive generation.',
      'Implement KV-Caching to reduce generation step complexity from O(N^2) to O(N).',
      'Understand FlashAttention SRAM tiling and I/O-aware gradient computation.',
    ],
    modules: [
      {
        id: 'mod-ai-1',
        courseId: 'course-dl-ai',
        moduleNumber: 1,
        title: 'Attention Foundations & Mathematical Mechanics',
        description: 'Scaled dot-product formulation, multi-head projections, and causal masking.',
        estimatedMinutes: 150,
        topics: [
          {
            id: 'topic-self-attention',
            moduleId: 'mod-ai-1',
            courseId: 'course-dl-ai',
            topicNumber: 1,
            title: 'Scaled Dot-Product Attention & Vanishing Softmax Gradients',
            estimatedMinutes: 50,
            isCompleted: true,
            isBookmarked: true,
            note: {
              id: 'note-self-attention',
              title: 'Scaled Dot-Product Attention & Vanishing Softmax Gradients',
              readingMinutes: 14,
              updatedAt: '2026-10-25T16:00:00Z',
              keyTakeaways: [
                'Attention maps Query and Key tensors into dynamic routing coefficients over Value vectors.',
                'The 1/sqrt(d_k) factor normalizes variance to 1.0, preventing softmax saturation in high dimensions.',
                'Causal lower-triangular masking enforces autoregressive ordering by substituting -inf prior to softmax.',
              ],
              content: `## The Canonical Formulation of Self-Attention

Given an input sequence $X \\in \\mathbb{R}^{N \\times d_{\\text{model}}}$, we project via learned parameter matrices:

$$Q = X W^Q, \\quad K = X W^K, \\quad V = X W^V$$
where $W^Q, W^K \\in \\mathbb{R}^{d_{\\text{model}} \\times d_k}$ and $W^V \\in \\mathbb{R}^{d_{\\text{model}} \\times d_v}$.

### The Scaled Dot-Product Operator:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} \\right) V$$

### Why divide by $\\sqrt{d_k}$? (The Variance Proof)
Assume components of $q$ and $k$ are independent random variables with zero mean and unit variance:
$$\\mathbb{E}[q_i] = 0, \\quad \\text{Var}(q_i) = 1, \\quad \\mathbb{E}[k_i] = 0, \\quad \\text{Var}(k_i) = 1$$

Their dot product is:
$$z = q \\cdot k = \\sum_{i=1}^{d_k} q_i k_i$$
The mean is:
$$\\mathbb{E}[z] = \\sum_{i=1}^{d_k} \\mathbb{E}[q_i] \\mathbb{E}[k_i] = 0$$
The variance is:
$$\\text{Var}(z) = \\sum_{i=1}^{d_k} \\text{Var}(q_i k_i) = \\sum_{i=1}^{d_k} \\text{Var}(q_i) \\text{Var}(k_i) = d_k$$

As $d_k$ grows large (e.g. $d_k = 128$), the standard deviation reaches $\\sqrt{128} \\approx 11.3$. When input values to $\\text{softmax}(z)$ exceed $\\pm 10$, the softmax activation saturates into flat asymptotes where:
$$\\frac{\\partial \\text{softmax}(z)_i}{\\partial z_j} \\approx 0$$
Dividing by $\\sqrt{d_k}$ restores $\\text{Var}\\left(\\frac{z}{\\sqrt{d_k}}\\right) = 1$, ensuring vibrant gradient propagation during backpropagation.`,
            },
            questions: [
              {
                id: 'q-ai-1',
                courseId: 'course-dl-ai',
                moduleId: 'mod-ai-1',
                topicId: 'topic-self-attention',
                topicTitle: 'Attention Mechanics',
                type: 'mcq_single',
                difficulty: 'Intermediate',
                questionText: 'What mathematical hazard occurs if dot-product attention logits are NOT scaled by 1 / sqrt(d_k) in high dimensions?',
                options: [
                  'Logits grow large in magnitude, pushing softmax into flat regions where gradients approach zero (vanishing gradients).',
                  'The attention weight matrix fails to remain symmetric and cannot be inverted.',
                  'Matrix multiplication fails dimensional compatibility checks in BLAS level-3 kernels.',
                  'The time complexity jumps from O(N^2) to exponential O(2^N).',
                ],
                correctIndices: [0],
                explanation: 'Because the variance of the dot product scales linearly with d_k, large d_k produces very large logits. The softmax function approaches a one-hot distribution, causing its derivative to vanish and stalling gradient-based learning.',
              },
            ],
          },
        ],
        quiz: {
          id: 'quiz-ai-mod-1',
          courseId: 'course-dl-ai',
          moduleId: 'mod-ai-1',
          title: 'Module 1 Assessment: Self-Attention & Mathematical Foundations',
          description: 'Assess your comprehension of Query-Key-Value projections and attention gradients.',
          timeLimitMinutes: 20,
          passingScore: 80,
          questions: [
            {
              id: 'q-quiz-ai-1',
              courseId: 'course-dl-ai',
              moduleId: 'mod-ai-1',
              topicId: 'topic-self-attention',
              topicTitle: 'Attention Mathematics',
              type: 'mcq_single',
              difficulty: 'Advanced',
              questionText: 'During autoregressive generation of sequence length N, how does standard KV-Caching optimize computation?',
              options: [
                'By retaining previously computed Key and Value tensors in memory, avoiding redundant recomputation of past token representations.',
                'By pruning 50% of the attention weights using L1 regularization.',
                'By converting all 32-bit floating point weights into 1-bit binary representations.',
                'By skipping the feed-forward MLP sub-layer in odd-numbered decoder blocks.',
              ],
              correctIndices: [0],
              explanation: 'Without KV-caching, generating token t requires computing Q, K, V for all preceding tokens 1..t-1, yielding O(N^2) total cost. With KV-caching, keys and values of previous tokens are cached in VRAM, requiring computation for only the single newest query token at each step.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'course-physics-adv',
    code: 'PHY-ELECTRO-301',
    title: 'Advanced Electrodynamics & Wave Optics',
    subtitle: "Maxwell's Equations, Displacement Currents, Poynting Vectors & Diffraction",
    subject: 'Physics',
    category: 'Physical Sciences',
    instructorName: 'Dr. K. Rajan',
    instructorTitle: 'Department of Physics & Electromagnetic Field Theory',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.89,
    enrolledCount: 12400,
    estimatedHours: 20,
    difficulty: 'Intermediate',
    isEnrolled: true,
    progressPercentage: 65,
    lastAccessedTopicId: 'topic-maxwell-em',
    description:
      'Rigorous mathematical derivations of Maxwell-Ampère equations, displacement currents across dielectric boundaries, and the electromagnetic wave equation yielding the universal speed of light.',
    learningObjectives: [
      'Derive Maxwell’s modification to Ampère’s Circuital Law using continuity equations.',
      'Solve the electromagnetic wave wave-equation in free space to verify c = 1 / sqrt(mu_0 * epsilon_0).',
      'Compute Poynting vector flux and radiation pressure on reflective surfaces.',
      'Model diffraction envelope modulation in Young’s double-slit interference.',
    ],
    modules: [
      {
        id: 'mod-phy-1',
        courseId: 'course-physics-adv',
        moduleNumber: 1,
        title: "Maxwell's Equations & Electromagnetic Wave Propagation",
        description: 'Displacement currents, Maxwell-Ampère law, and electromagnetic energy density flux.',
        estimatedMinutes: 120,
        topics: [
          {
            id: 'topic-maxwell-em',
            moduleId: 'mod-phy-1',
            courseId: 'course-physics-adv',
            topicNumber: 1,
            title: "Maxwell-Ampère Equation & Displacement Current Derivation",
            estimatedMinutes: 45,
            isCompleted: true,
            isBookmarked: true,
            note: {
              id: 'note-maxwell-em',
              title: "Maxwell-Ampère Equation & Displacement Current Derivation",
              readingMinutes: 12,
              updatedAt: '2026-10-25T09:30:00Z',
              keyTakeaways: [
                'Ampère’s original law failed for non-steady currents (such as charging capacitors) violating charge continuity.',
                'Maxwell added the displacement current term proportional to the time rate of change of electric flux.',
                'Combining the curl equations reveals that electric and magnetic fields sustain each other as self-propagating waves traveling at speed c.',
              ],
              content: `## The Inconsistency in Ampère's Circuital Law

Ampère's original law states:
$$\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{enc}}$$

Taking the divergence of both sides:
$$\\nabla \\cdot (\\nabla \\times \\vec{B}) = \\mu_0 (\\nabla \\cdot \\vec{J})$$
Vector calculus dictates that the divergence of any curl field is identically zero:
$$\\nabla \\cdot (\\nabla \\times \\vec{B}) \\equiv 0 \\implies \\nabla \\cdot \\vec{J} = 0$$

However, the fundamental **Continuity Equation for Electric Charge** is:
$$\\nabla \\cdot \\vec{J} + \\frac{\\partial \\rho}{\\partial t} = 0$$
When a capacitor is charging, $\\frac{\\partial \\rho}{\\partial t} \\neq 0$, which causes a direct mathematical contradiction!

### Maxwell's Displacement Current Term
Using Gauss's Law: $\\nabla \\cdot \\vec{E} = \\frac{\\rho}{\\epsilon_0} \\implies \\rho = \\epsilon_0 (\\nabla \\cdot \\vec{E})$.
Substituting into charge continuity:
$$\\nabla \\cdot \\vec{J} + \\frac{\\partial}{\\partial t}(\\epsilon_0 \\nabla \\cdot \\vec{E}) = 0 \\implies \\nabla \\cdot \\left( \\vec{J} + \\epsilon_0 \\frac{\\partial \\vec{E}}{\\partial t} \\right) = 0$$

Maxwell defined the **Displacement Current Density**:
$$\\vec{J}_D = \\epsilon_0 \\frac{\\partial \\vec{E}}{\\partial t}$$

Yielding the complete **Maxwell-Ampère Law**:
$$\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{conduction}} + \\mu_0 \\epsilon_0 \\frac{d\\Phi_E}{dt}$$`,
            },
            questions: [
              {
                id: 'q-phy-1',
                courseId: 'course-physics-adv',
                moduleId: 'mod-phy-1',
                topicId: 'topic-maxwell-em',
                topicTitle: 'Maxwell Equations',
                type: 'mcq_single',
                difficulty: 'Intermediate',
                questionText: 'Between the circular plates of a charging parallel-plate capacitor, what generates the magnetic induction field B?',
                options: [
                  'Physical electrons jumping across the vacuum dielectric barrier.',
                  'The time-varying electric flux and displacement current density between the plates.',
                  'Thermal acoustic vibrations in the copper lead wires.',
                  'The Earth’s static geomagnetic orientation.',
                ],
                correctIndices: [1],
                explanation: 'Inside the capacitor dielectric gap, no physical conduction current flows. Instead, the rapidly changing electric field produces a displacement current I_D = epsilon_0 * (dPhi_E / dt), which induces the concentric circular magnetic field.',
              },
            ],
          },
        ],
        quiz: {
          id: 'quiz-phy-mod-1',
          courseId: 'course-physics-adv',
          moduleId: 'mod-phy-1',
          title: "Module 1 Assessment: Electrodynamics & Maxwell's Equations",
          description: 'Test your understanding of displacement currents and Poynting vectors.',
          timeLimitMinutes: 15,
          passingScore: 75,
          questions: [
            {
              id: 'q-quiz-phy-1',
              courseId: 'course-physics-adv',
              moduleId: 'mod-phy-1',
              topicId: 'topic-maxwell-em',
              topicTitle: 'Poynting Vector',
              type: 'mcq_single',
              difficulty: 'Intermediate',
              questionText: 'What physical quantity does the Poynting vector S = (1 / mu_0) * (E x B) quantify?',
              options: [
                'The rate of electromagnetic energy transfer per unit area (power density).',
                'The total electrostatic capacitance of the conductor.',
                'The Doppler redshift frequency shift of the radiating source.',
                'The quantum mechanical spin angular momentum of conduction electrons.',
              ],
              correctIndices: [0],
              explanation: 'The Poynting vector S represents the directional energy flux density (watts per square meter) of an electromagnetic field, oriented along the direction of wave propagation.',
            },
          ],
        },
      },
    ],
  },
];
