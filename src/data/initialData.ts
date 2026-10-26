import { StudyTask, FlashcardDeck, StudyNote, DailyStudyLog } from '../types';

export const INITIAL_TASKS: StudyTask[] = [
  {
    id: 'task-1',
    title: 'Implement Raft Consensus Protocol Leader Election',
    subject: 'Distributed Systems',
    subjectColor: '#06b6d4',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    estimatedMinutes: 60,
    priority: 'high',
    status: 'in-progress',
    notes: 'Handle heartbeat timers and randomized election timeouts between 150ms-300ms.'
  },
  {
    id: 'task-2',
    title: 'Derive Backpropagation for Multi-Head Attention',
    subject: 'Machine Learning',
    subjectColor: '#6366f1',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    estimatedMinutes: 45,
    priority: 'high',
    status: 'todo',
    notes: 'Focus on softmax gradient Jacobian and scaled dot-product matrix multiplication.'
  },
  {
    id: 'task-3',
    title: 'Review Action Potential & Synaptic Vesicle Release',
    subject: 'Neuroscience',
    subjectColor: '#10b981',
    dueDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
    estimatedMinutes: 30,
    priority: 'medium',
    status: 'todo',
    notes: 'SNARE complex proteins (Synaptobrevin, Syntaxin-1, SNAP-25) and Ca2+ triggering.'
  },
  {
    id: 'task-4',
    title: 'Solve Eigenvalue Decomposition Problem Set 4',
    subject: 'Linear Algebra',
    subjectColor: '#f59e0b',
    dueDate: new Date(Date.now() - 43200000).toISOString().split('T')[0],
    estimatedMinutes: 50,
    priority: 'medium',
    status: 'completed',
    completedAt: new Date(Date.now() - 3600000).toISOString(),
    notes: 'Checked orthogonal diagonalization for symmetric matrices.'
  },
  {
    id: 'task-5',
    title: 'Graph Traversal Complexity & Dijkstra Optimization',
    subject: 'Algorithms',
    subjectColor: '#ec4899',
    dueDate: new Date(Date.now() - 129600000).toISOString().split('T')[0],
    estimatedMinutes: 40,
    priority: 'low',
    status: 'completed',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Implemented with indexed binary min-heap for O((V + E) log V).'
  }
];

export const INITIAL_DECKS: FlashcardDeck[] = [
  {
    id: 'deck-1',
    title: 'Distributed Systems Core Principles',
    subject: 'Distributed Systems',
    subjectColor: '#06b6d4',
    description: 'CAP theorem, consensus algorithms, 2PC, vector clocks, and replication.',
    cards: [
      {
        id: 'card-1-1',
        front: 'What does the CAP Theorem state regarding network partitions?',
        back: 'In the presence of a network partition (P), a distributed system must choose between Consistency (all nodes see the same data at the same time) or Availability (every request receives a non-error response, without guarantee that it contains the most recent write).',
        hint: 'Think about trade-offs when nodes cannot communicate.',
        masteryLevel: 'mastered'
      },
      {
        id: 'card-1-2',
        front: 'How does Raft avoid split-vote deadlocks in leader election?',
        back: 'Raft uses randomized election timeouts (typically 150-300ms) for each follower. This spreads out when nodes become candidates, ensuring one candidate usually collects majority votes before others time out.',
        hint: 'Randomized intervals.',
        masteryLevel: 'learning'
      },
      {
        id: 'card-1-3',
        front: 'What is the role of Vector Clocks in distributed storage?',
        back: 'Vector clocks capture causal relationships between events in a distributed system, enabling detection of concurrent updates and resolving divergence without relying on synchronized physical clocks.',
        hint: 'Causality vs. physical time.',
        masteryLevel: 'new'
      }
    ]
  },
  {
    id: 'deck-2',
    title: 'Deep Learning Architectures',
    subject: 'Machine Learning',
    subjectColor: '#6366f1',
    description: 'Attention mechanisms, LayerNorm vs BatchNorm, residual connections, and positional encodings.',
    cards: [
      {
        id: 'card-2-1',
        front: 'Why is dot-product attention scaled by sqrt(d_k)?',
        back: 'For large values of d_k, dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Dividing by sqrt(d_k) counteracts this effect and stabilizes gradient flow.',
        hint: 'Softmax gradient saturation.',
        masteryLevel: 'mastered'
      },
      {
        id: 'card-2-2',
        front: 'Why is Layer Normalization preferred over Batch Normalization in Transformers?',
        back: 'LayerNorm normalizes across the feature dimension for each token independently, making it invariant to batch size and well-suited for sequences of variable lengths, unlike BatchNorm which depends on batch statistics.',
        hint: 'Independence from batch dimension.',
        masteryLevel: 'learning'
      },
      {
        id: 'card-2-3',
        front: 'What is the vanishing gradient mitigation mechanism in ResNet?',
        back: 'Residual shortcut connections (y = F(x) + x) create an uninterrupted highway for gradient flow directly back through the identity mapping, ensuring dL/dx includes a non-decaying additive term.',
        hint: 'Additive skip identity path.',
        masteryLevel: 'mastered'
      }
    ]
  },
  {
    id: 'deck-3',
    title: 'Synaptic Transmission & Plasticity',
    subject: 'Neuroscience',
    subjectColor: '#10b981',
    description: 'LTP, NMDA receptors, neurotransmitter reuptake, and Hebbian plasticity.',
    cards: [
      {
        id: 'card-3-1',
        front: 'Why is the NMDA receptor called a molecular coincidence detector?',
        back: 'It requires two simultaneous events to open: glutamate binding from the presynaptic terminal, and postsynaptic membrane depolarization to dislodge the Mg2+ plug blocking the channel pore.',
        hint: 'Ligand + voltage dependence.',
        masteryLevel: 'learning'
      },
      {
        id: 'card-3-2',
        front: 'What primary ion influx triggers Long-Term Potentiation (LTP)?',
        back: 'Calcium (Ca2+) influx through the unblocked NMDA receptors into the dendritic spine, which activates CaMKII and leads to insertion of additional AMPA receptors into the postsynaptic density.',
        hint: 'Divalent cation messenger.',
        masteryLevel: 'new'
      }
    ]
  }
];

export const INITIAL_NOTES: StudyNote[] = [
  {
    id: 'note-1',
    title: 'Transformer Self-Attention Mechanics',
    subject: 'Machine Learning',
    subjectColor: '#6366f1',
    tags: ['NLP', 'Attention', 'Transformers', 'Math'],
    updatedAt: '2 hours ago',
    content: `# Transformer Self-Attention Mechanics

### Core Formula
The scaled dot-product attention maps Query ($Q$), Key ($K$), and Value ($V$) matrices:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$

### Key Insights
1. **Computational Complexity**: $O(N^2 \\cdot d)$ where $N$ is sequence length.
2. **Multi-Head Partitioning**: Splitting into $h$ heads allows the model to jointly attend to information from different representation subspaces at different positions.
3. **Causal Masking**: In autoregressive decoders, an upper triangular matrix with $-\\infty$ is added to logits before softmax to prevent attending to future tokens.

### Action Items
- Benchmark FlashAttention-2 vs vanilla attention on sequence length 4096.
- Implement rotary position embeddings (RoPE).`
  },
  {
    id: 'note-2',
    title: 'Distributed Consensus: Raft vs Paxos',
    subject: 'Distributed Systems',
    subjectColor: '#06b6d4',
    tags: ['Consensus', 'Raft', 'Reliability', 'System Design'],
    updatedAt: 'Yesterday',
    content: `# Distributed Consensus: Raft vs Paxos

### Comparison Summary
- **Understandability**: Raft separates consensus into explicit sub-problems: Leader Election, Log Replication, and Safety. Paxos conflates them into synod rounds.
- **Leader Invariant**: In Raft, a leader must contain all committed entries (Leader Completeness Property). Entries only flow from leader to followers.
- **Heartbeat & Leases**: Raft relies on regular empty AppendEntries RPCs as heartbeats to suppress new elections.

### Key Corner Cases
- **Partitioned Leader**: If an old leader is partitioned, it may accept uncommitted writes, but will be rejected when committing because it cannot reach quorum ($N/2 + 1$).`
  },
  {
    id: 'note-3',
    title: 'Neural Plasticity & Memory Consolidation',
    subject: 'Neuroscience',
    subjectColor: '#10b981',
    tags: ['Neurobiology', 'Memory', 'Hippocampus', 'Synapses'],
    updatedAt: '3 days ago',
    content: `# Neural Plasticity & Memory Consolidation

### Synaptic vs Systems Consolidation
1. **Synaptic Consolidation**: Occurs within minutes to hours across localized synapses via protein synthesis and structural dendritic spine remodeling.
2. **Systems Consolidation**: Operates over weeks/months, transferring hippocampus-dependent memories to neocortical distributed networks.

### Sleep Spindles & Sharp-Wave Ripples (SWRs)
During non-REM (slow-wave) sleep, high-frequency oscillatory bursts in the CA1 hippocampus replay firing sequences at 10x-20x speed, driving neocortical long-term storage.`
  }
];

export const INITIAL_WEEKLY_LOGS: DailyStudyLog[] = [
  { day: 'Mon', hours: 3.5, tasksCompleted: 4 },
  { day: 'Tue', hours: 4.2, tasksCompleted: 5 },
  { day: 'Wed', hours: 2.8, tasksCompleted: 3 },
  { day: 'Thu', hours: 5.0, tasksCompleted: 6 },
  { day: 'Fri', hours: 4.6, tasksCompleted: 4 },
  { day: 'Sat', hours: 6.2, tasksCompleted: 7 },
  { day: 'Sun', hours: 3.8, tasksCompleted: 3 }
];
