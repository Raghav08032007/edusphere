// ==============================================================================
// SUPABASE CLIENT & HYBRID DEMO STORE
// Seamlessly connects to real Supabase or provides fully reactive local store
// ==============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  AcademicClass,
  ClassNote,
  AttendanceRecord,
  StudentDoubt,
  CooperChatMessage,
} from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isLiveSupabaseConfigured = Boolean(
  supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey
);

export const supabase: SupabaseClient | null = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==============================================================================
// SEED DATA FOR DEMO & LOCAL STORE
// ==============================================================================

export const DEMO_STAFF_USERS: UserProfile[] = [
  {
    id: 'staff-rajan',
    email: 'k.rajan@vedantu.edu',
    fullName: 'Dr. K. Rajan',
    role: 'staff',
    regNumber: 'FAC-CSE-01',
    department: 'Department of Computer Science & Physics',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    phone: '+91 98401 23456',
  },
  {
    id: 'staff-eleanor',
    email: 'eleanor.vance@vedantu.edu',
    fullName: 'Prof. Eleanor Vance',
    role: 'staff',
    regNumber: 'FAC-MATH-04',
    department: 'Department of Pure Mathematics & Computational Biology',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    phone: '+91 98402 34567',
  },
  {
    id: 'staff-thorne',
    email: 'aris.thorne@vedantu.edu',
    fullName: 'Dr. Aris Thorne',
    role: 'staff',
    regNumber: 'FAC-CHEM-08',
    department: 'Department of Physical Chemistry & Quantum Kinetics',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    phone: '+91 98403 45678',
  },
];

export const DEMO_STUDENT_USERS: UserProfile[] = [
  {
    id: 'student-param',
    email: 'param.sahar@vedantu.edu',
    fullName: 'Param Sahar',
    role: 'student',
    regNumber: '2026CSE042',
    department: 'Antigravity AI & Advanced JEE Track',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    phone: '+91 98765 43210',
  },
  {
    id: 'student-maya',
    email: 'maya.lin@vedantu.edu',
    fullName: 'Maya Lin',
    role: 'student',
    regNumber: '2026CSE029',
    department: 'Distributed Systems & Physics Track',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
  },
  {
    id: 'student-kavi',
    email: 'kaviyarasu.m@vedantu.edu',
    fullName: 'Kaviyarasu Murugan',
    role: 'student',
    regNumber: '2026CSE018',
    department: 'High-Performance Algorithms Track',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'student-anitha',
    email: 'anitha.s@vedantu.edu',
    fullName: 'Anitha Selvaraj',
    role: 'student',
    regNumber: '2026CSE007',
    department: 'Computational Bio-Science Track',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
  },
];

export const INITIAL_CLASSES: AcademicClass[] = [
  {
    id: 'class-phy-12',
    code: 'PHY-12A',
    name: 'Class 12 Advanced Physics & Mechanics',
    subject: 'Physics',
    description: 'Electrodynamics, Wave Optics, and Quantum Mechanics for JEE Advanced & Olympiads.',
    staffId: 'staff-rajan',
    staffName: 'Dr. K. Rajan',
    studentCount: 38,
    academicYear: '2026-2027',
  },
  {
    id: 'class-cs-ai',
    code: 'CS-AI-01',
    name: 'Antigravity AI & Distributed Systems',
    subject: 'Computer Science',
    description: 'Transformer Self-Attention, Raft Consensus, and High-Performance Machine Learning.',
    staffId: 'staff-rajan',
    staffName: 'Dr. K. Rajan',
    studentCount: 42,
    academicYear: '2026-2027',
  },
  {
    id: 'class-math-calc',
    code: 'MATH-CALC-02',
    name: 'Advanced Multivariable Calculus & Linear Algebra',
    subject: 'Mathematics',
    description: 'Spectral theorems, Stokes Theorem, and Differential Equations.',
    staffId: 'staff-eleanor',
    staffName: 'Prof. Eleanor Vance',
    studentCount: 35,
    academicYear: '2026-2027',
  },
  {
    id: 'class-chem-adv',
    code: 'CHEM-ADV-03',
    name: 'Chemical Kinetics, Thermodynamics & Coordination Chemistry',
    subject: 'Chemistry',
    description: 'Reaction rate laws, Arrhenius activation energies, Gibbs spontaneity, and Crystal Field splitting.',
    staffId: 'staff-thorne',
    staffName: 'Dr. Aris Thorne',
    studentCount: 40,
    academicYear: '2026-2027',
  },
  {
    id: 'class-bio-mol',
    code: 'BIO-MOL-04',
    name: 'Molecular Genetics & Structural Bioinformatics',
    subject: 'Biology',
    description: 'DNA replication fork kinetics, Ramachandran dihedral plots, and dynamic programming sequence alignment.',
    staffId: 'staff-eleanor',
    staffName: 'Prof. Eleanor Vance',
    studentCount: 36,
    academicYear: '2026-2027',
  },
];

export const INITIAL_NOTES: ClassNote[] = [
  // ==========================================
  // PHYSICS
  // ==========================================
  {
    id: 'note-1',
    classId: 'class-phy-12',
    className: 'Class 12 Advanced Physics & Mechanics',
    staffId: 'staff-rajan',
    staffName: 'Dr. K. Rajan',
    title: 'Electromagnetic Wave Propagation & Maxwell-Ampère Equation',
    subject: 'Physics',
    content: `## Comprehensive Summary: Maxwell's Equations

The fundamental relationship governing time-varying electromagnetic induction:

$$\\oint \\vec{B} \\cdot d\\vec{l} = \\mu_0 I_{\\text{enc}} + \\mu_0 \\epsilon_0 \\frac{d\\Phi_E}{dt}$$

### Key Conceptual Takeaways:
1. **Displacement Current**: Maxwell recognized that varying electric fields generate physical magnetic induction equivalent to conduction currents: $I_d = \\epsilon_0 \\frac{d\\Phi_E}{dt}$.
2. **Speed of Light Derivation**: $c = 1 / \\sqrt{\\mu_0 \\epsilon_0} \\approx 2.998 \\times 10^8 \\text{ m/s}$.
3. **Poynting Vector Energy Flux**: $\\vec{S} = \\frac{1}{\\mu_0} (\\vec{E} \\times \\vec{B})$, representing directional power flow per unit area in $\\text{W/m}^2$.

*Recommended Problem Set*: Solve Exercise 8.1 to 8.14 in Chapter 8 before Friday's seminar.`,
    attachmentUrl: 'https://example.com/docs/physics-em-waves-lecture-04.pdf',
    attachmentName: 'EM_Waves_Detailed_Derivations.pdf',
    tags: ['Electrodynamics', 'Maxwell Equations', 'JEE Advanced'],
    isPublished: true,
    createdAt: '2026-10-25T09:30:00Z',
  },
  {
    id: 'note-phy-wave-optics',
    classId: 'class-phy-12',
    className: 'Class 12 Advanced Physics & Mechanics',
    staffId: 'staff-rajan',
    staffName: 'Dr. K. Rajan',
    title: "Wave Optics: Young's Double Slit Interference & Coherence Derivations",
    subject: 'Physics',
    content: `## Young's Double Slit Experiment (YDSE) & Interference Theory

When monochromatic light from two mutually coherent point slits separated by distance $d$ illuminates a screen at distance $D$ ($D \\gg d$):

### Path Difference & Fringe Width
The geometric path difference between two rays reaching point $P$ at distance $y$ from the central line:

$$\\Delta x = d \\sin\\theta \\approx d \\frac{y}{D}$$

- **Constructive Interference (Bright Fringes)**: $\\Delta x = n \\lambda \\implies y_n = \\frac{n \\lambda D}{d}$
- **Destructive Interference (Dark Fringes)**: $\\Delta x = \\left(n + \\frac{1}{2}\\right) \\lambda \\implies y'_n = \\left(n + \\frac{1}{2}\\right) \\frac{\\lambda D}{d}$

### Fringe Width ($\\beta$)
The linear separation between any two successive maxima:
$$\\beta = y_{n+1} - y_n = \\frac{\\lambda D}{d}$$

### Resultant Intensity Profile:
$$I(\\delta) = 4 I_0 \\cos^2\\left(\\frac{\\delta}{2}\\right) \\quad \\text{where } \\delta = \\frac{2\\pi}{\\lambda} \\Delta x$$
Under submerged dielectric media of refractive index $\\mu$, the wavelength contracts to $\\lambda' = \\lambda / \\mu$, compressing fringe width to $\\beta' = \\beta / \\mu$.`,
    attachmentUrl: 'https://example.com/docs/wave-optics-ydse.pdf',
    attachmentName: 'YDSE_Interference_Derivation.pdf',
    tags: ['Wave Optics', 'Interference', 'YDSE', 'Coherence'],
    isPublished: true,
    createdAt: '2026-10-24T16:00:00Z',
  },
  {
    id: 'note-phy-quantum-photo',
    classId: 'class-phy-12',
    className: 'Class 12 Advanced Physics & Mechanics',
    staffId: 'staff-rajan',
    staffName: 'Dr. K. Rajan',
    title: 'Quantum Mechanics: Einstein Photoelectric Equation & de Broglie Matter Waves',
    subject: 'Physics',
    content: `## Einstein's Quantum Formulation of the Photoelectric Effect

Light consists of discrete energy quanta called photons. Each photon carries energy proportional to frequency: $E = h\\nu$.

### Einstein's Photoelectric Equation:
$$K_{\\max} = h\\nu - \\Phi = e V_0$$

Where:
- $\\Phi = h \\nu_0$ is the material-specific work function.
- $\\nu_0$ is the threshold cut-off frequency below which zero electron emission occurs regardless of light intensity.
- $V_0$ is the stopping potential required to reduce photoelectric photocurrent to zero.

### De Broglie Hypothesis of Matter Waves:
Any material particle of mass $m$ moving with velocity $v$ possesses an intrinsic quantum wave characteristic:

$$\\lambda = \\frac{h}{p} = \\frac{h}{mv} = \\frac{h}{\\sqrt{2 m E}}$$

For an electron accelerated through an electrostatic potential difference $V$:
$$\\lambda_e = \\frac{1.227}{\\sqrt{V}} \\text{ nm}$$
Verified experimentally by the Davisson-Germer electron diffraction apparatus on nickel crystal lattices.`,
    attachmentUrl: 'https://example.com/docs/photoelectric-effect.pdf',
    attachmentName: 'Einstein_Photoelectric_Theory.pdf',
    tags: ['Quantum Physics', 'Photoelectric Effect', 'Matter Waves'],
    isPublished: true,
    createdAt: '2026-10-23T11:45:00Z',
  },

  // ==========================================
  // COMPUTER SCIENCE
  // ==========================================
  {
    id: 'note-2',
    classId: 'class-cs-ai',
    className: 'Antigravity AI & Distributed Systems',
    staffId: 'staff-rajan',
    staffName: 'Dr. K. Rajan',
    title: 'Transformer Architecture: Scaled Dot-Product & Multi-Head Attention',
    subject: 'Computer Science',
    content: `## Scaled Dot-Product Attention Mechanics

The canonical formulation for Query ($Q$), Key ($K$), and Value ($V$) tensors:

$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left( \\frac{Q K^T}{\\sqrt{d_k}} \\right) V$$

### Why divide by $\\sqrt{d_k}$?
For large projection dimensions $d_k$, the dot product yields large magnitudes that drive the softmax into regions with vanishing gradients. Dividing by $\\sqrt{d_k}$ guarantees unit variance under standard initialization.

### Multi-Head Projection:
$$\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h) W^O$$
where each $\\text{head}_i = \\text{Attention}(Q W_i^Q, K W_i^K, V W_i^V)$.`,
    attachmentUrl: 'https://example.com/docs/attention-derivation-notes.pdf',
    attachmentName: 'Self_Attention_Mathematical_Proof.pdf',
    tags: ['AI/ML', 'Transformers', 'Deep Learning'],
    isPublished: true,
    createdAt: '2026-10-24T14:15:00Z',
  },
  {
    id: 'note-cs-raft-consensus',
    classId: 'class-cs-ai',
    className: 'Antigravity AI & Distributed Systems',
    staffId: 'staff-rajan',
    staffName: 'Dr. K. Rajan',
    title: 'Distributed Consensus: Raft Protocol, Term Monotonicity & Log Replication',
    subject: 'Computer Science',
    content: `## The Raft Consensus Algorithm for Fault-Tolerant Clusters

Raft decomposes distributed consensus into three independent subproblems:
1. **Leader Election**
2. **Log Replication**
3. **Safety / State Commitment Invariants**

### State Transitions:
\`\`\`
   [ Follower ] --- (Election Timeout) ---> [ Candidate ]
        ^                                        |
        |---- (Discovers Higher Term / Leader) --|
        |                                        | (Receives Quorum Votes)
        |                                        v
        +---------- (Steps Down) ----------- [ Leader ]
\`\`\`

### The Randomized Timeout Invariant:
To prevent recurring split-vote deadlocks where multiple candidates start elections concurrently, election timeouts are randomized per node:
$$\\text{Timeout} \\in [150\\text{ms}, 300\\text{ms}]$$

### Log Commitment Rule:
An entry is committed once replicated onto a strict majority (quorum):
$$Q = \\left\\lfloor \\frac{N}{2} \\right\\rfloor + 1$$
A leader cannot commit an entry from a previous term purely by counting replicas; it must commit an entry from its own current term.`,
    attachmentUrl: 'https://example.com/docs/raft-consensus-spec.pdf',
    attachmentName: 'Raft_Consensus_Specification.pdf',
    tags: ['Distributed Systems', 'Raft', 'Fault Tolerance', 'Consensus'],
    isPublished: true,
    createdAt: '2026-10-23T15:20:00Z',
  },
  {
    id: 'note-cs-virtual-memory',
    classId: 'class-cs-ai',
    className: 'Antigravity AI & Distributed Systems',
    staffId: 'staff-rajan',
    staffName: 'Dr. K. Rajan',
    title: 'Operating Systems: Multi-Level Page Tables & TLB Translation Mechanics',
    subject: 'Computer Science',
    content: `## Hardware Virtual Memory & Address Translation Architecture

Modern operating systems provide each process with an isolated 64-bit virtual address space mapped dynamically to physical DRAM through multi-level page tables and Hardware Memory Management Units (MMU).

### Translation Lookaside Buffer (TLB) Fast-Path:
\`\`\`
Virtual Address ---> [ MMU ] ---> TLB Hit? ---> Physical Address (1-2 cycles)
                                    |
                                  TLB Miss
                                    v
                     Walk 4-Level Page Table in RAM (100-200 cycles)
                     (PML4 -> PDPT -> PD -> PT -> Frame)
\`\`\`

### 48-bit Canonical Virtual Address Split (x86_64 4KB Pages):
- **Bits 47-39 (9 bits)**: Page Map Level 4 (PML4) index ($2^9 = 512$ entries)
- **Bits 38-30 (9 bits)**: Page Directory Pointer Table (PDPT) index
- **Bits 29-21 (9 bits)**: Page Directory (PD) index
- **Bits 20-12 (9 bits)**: Page Table (PT) index
- **Bits 11-0 (12 bits)**: Byte Offset within the 4096-byte page frame ($2^{12} = 4096$)

### TLB Invalidation Costs:
Switching the CR3 control register during process context switches invalidates non-global TLB entries unless Process-Context Identifiers (PCID) are enabled by the kernel.`,
    tags: ['Operating Systems', 'Virtual Memory', 'Hardware Architecture'],
    isPublished: true,
    createdAt: '2026-10-21T18:00:00Z',
  },

  // ==========================================
  // MATHEMATICS
  // ==========================================
  {
    id: 'note-3',
    classId: 'class-math-calc',
    className: 'Advanced Multivariable Calculus & Linear Algebra',
    staffId: 'staff-eleanor',
    staffName: 'Prof. Eleanor Vance',
    title: 'Spectral Theorem & Orthogonal Diagonalization of Symmetric Matrices',
    subject: 'Mathematics',
    content: `## Spectral Decomposition of Real Symmetric Matrices

If $A \\in \\mathbb{R}^{n \\times n}$ is real and symmetric ($A = A^T$):
1. All eigenvalues $\\lambda_1, \\dots, \\lambda_n$ are strictly **real numbers**.
2. Eigenvectors corresponding to distinct eigenvalues are mutually **orthogonal**.
3. There exists an orthonormal basis of $\\mathbb{R}^n$ consisting of eigenvectors of $A$.

$$A = Q \\Lambda Q^T = \\sum_{i=1}^n \\lambda_i \\vec{u}_i \\vec{u}_i^T$$

This provides the exact mathematical underpinning for Principal Component Analysis (PCA) and Quantum State Decompositions.`,
    tags: ['Linear Algebra', 'Spectral Theorem', 'Calculus'],
    isPublished: true,
    createdAt: '2026-10-22T11:00:00Z',
  },
  {
    id: 'note-math-stokes-divergence',
    classId: 'class-math-calc',
    className: 'Advanced Multivariable Calculus & Linear Algebra',
    staffId: 'staff-eleanor',
    staffName: 'Prof. Eleanor Vance',
    title: "Vector Calculus: Stokes' Theorem, Green's Theorem & Gauss's Divergence",
    subject: 'Mathematics',
    content: `## Fundamental Theorems of Multivariable Integration

All integral theorems of vector calculus are specific dimensional instantiations of the Generalized Stokes' Theorem: $\\int_{\\partial \\Omega} \\omega = \\int_\\Omega d\\omega$.

### 1. Stokes' Theorem (Curl Theorem in $\\mathbb{R}^3$):
The circulation of vector field $\\vec{F}$ around a closed boundary curve $C = \\partial S$ equals the surface flux of its curl:

$$\\oint_{\\partial S} \\vec{F} \\cdot d\\vec{r} = \\iint_S (\\nabla \\times \\vec{F}) \\cdot d\\vec{S}$$

### 2. Gauss's Divergence Theorem (Flux Theorem in $\\mathbb{R}^3$):
The net outward flux of vector field $\\vec{F}$ across closed surface $\\partial V$ equals the volume integral of its divergence:

$$\\oiint_{\\partial V} \\vec{F} \\cdot d\\vec{S} = \\iiint_V (\\nabla \\cdot \\vec{F}) \\, dV$$

### Physical Meaning in Fluid Mechanics:
- $\\nabla \\cdot \\vec{F}$: Local source/sink generation density per unit volume.
- $\\nabla \\times \\vec{F}$: Local vorticity and circulation angular momentum vector.`,
    attachmentUrl: 'https://example.com/docs/vector-calculus-theorems.pdf',
    attachmentName: 'Stokes_And_Gauss_Divergence.pdf',
    tags: ['Multivariable Calculus', 'Stokes Theorem', 'Vector Fields'],
    isPublished: true,
    createdAt: '2026-10-21T13:30:00Z',
  },
  {
    id: 'note-math-svd-lowrank',
    classId: 'class-math-calc',
    className: 'Advanced Multivariable Calculus & Linear Algebra',
    staffId: 'staff-eleanor',
    staffName: 'Prof. Eleanor Vance',
    title: 'Singular Value Decomposition (SVD) & Eckart-Young Low-Rank Approximations',
    subject: 'Mathematics',
    content: `## Singular Value Decomposition (SVD) for Arbitrary Rectangular Matrices

Every matrix $A \\in \\mathbb{R}^{m \\times n}$ of rank $r$ admits a factorization:

$$A = U \\Sigma V^T = \\sum_{i=1}^r \\sigma_i \\vec{u}_i \\vec{v}_i^T$$

Where:
- $U \\in \\mathbb{R}^{m \\times m}$ contains the orthonormal left singular vectors (eigenvectors of $A A^T$).
- $\\Sigma \\in \\mathbb{R}^{m \\times n}$ contains non-negative singular values $\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge \\sigma_r > 0$ along its diagonal.
- $V \\in \\mathbb{R}^{n \\times n}$ contains the orthonormal right singular vectors (eigenvectors of $A^T A$).

### Eckart-Young-Mirsky Theorem:
The optimal rank-$k$ approximation ($k < r$) minimizing Frobenius and Spectral norm errors is obtained by truncating the sum at index $k$:

$$A_k = \\sum_{i=1}^k \\sigma_i \\vec{u}_i \\vec{v}_i^T \\implies \\|A - A_k\\|_2 = \\sigma_{k+1}$$

This is the exact mathematical mechanism behind Low-Rank Adaptation (LoRA) fine-tuning in modern foundation models.`,
    tags: ['Linear Algebra', 'SVD', 'Matrix Factorization', 'Machine Learning'],
    isPublished: true,
    createdAt: '2026-10-20T10:15:00Z',
  },

  // ==========================================
  // CHEMISTRY
  // ==========================================
  {
    id: 'note-chem-kinetics',
    classId: 'class-chem-adv',
    className: 'Chemical Kinetics, Thermodynamics & Coordination Chemistry',
    staffId: 'staff-thorne',
    staffName: 'Dr. Aris Thorne',
    title: 'Chemical Kinetics: Integrated Rate Laws, Arrhenius Theory & Activation Barrier',
    subject: 'Chemistry',
    content: `## Reaction Kinetics & Integrated Rate Equations

For general reaction $aA + bB \\to \\text{Products}$, rate $R = k [A]^m [B]^n$.

### 1. First-Order Kinetics:
$$-\\frac{d[A]}{dt} = k [A] \\implies \\ln\\left(\\frac{[A]_0}{[A]_t}\\right) = k t$$
- **Half-Life ($t_{1/2}$)**:
  $$t_{1/2} = \\frac{\\ln 2}{k} \\approx \\frac{0.693}{k}$$
  *Critical property*: $t_{1/2}$ is completely independent of initial reactant concentration $[A]_0$.

### 2. Arrhenius Temperature Dependence:
$$k = A e^{-\\frac{E_a}{RT}}$$
Taking natural logarithms yields the linear form:
$$\\ln k = -\\frac{E_a}{R} \\left(\\frac{1}{T}\\right) + \\ln A$$
Between two temperatures $T_1$ and $T_2$:
$$\\ln\\left(\\frac{k_2}{k_1}\\right) = \\frac{E_a}{R} \\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)$$

Where $E_a$ is the activation energy barrier required to reach the Transition State complex.`,
    attachmentUrl: 'https://example.com/docs/chemical-kinetics-guide.pdf',
    attachmentName: 'Integrated_Rate_Laws_Guide.pdf',
    tags: ['Chemistry', 'Chemical Kinetics', 'Arrhenius Equation', 'Half Life'],
    isPublished: true,
    createdAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'note-chem-coordination',
    classId: 'class-chem-adv',
    className: 'Chemical Kinetics, Thermodynamics & Coordination Chemistry',
    staffId: 'staff-thorne',
    staffName: 'Dr. Aris Thorne',
    title: 'Coordination Chemistry: Crystal Field Theory (CFT) & Octahedral d-Orbital Splitting',
    subject: 'Chemistry',
    content: `## Crystal Field Theory (CFT) in Transition Metal Complexes

CFT treats metal-ligand interactions as electrostatic point charges. Under an octahedral ligand field ($O_h$), degenerate $d$-orbitals split into two sets:

### Octahedral Splitting Diagram:
\`\`\`
          --- --- (eg: dx2-y2, dz2)  +0.6 Δo
               ^
               |  Δo (Crystal Field Splitting Energy)
               v
      --- --- --- (t2g: dxy, dyz, dxz) -0.4 Δo
\`\`\`

### High-Spin vs Low-Spin Criterion:
- **Pairing Energy ($P$)**: The electrostatic repulsion cost of pairing two electrons in the same spatial orbital.
- **Strong Field Ligands ($CN^-, CO, NO_2^-$)**: $\\Delta_o > P \\implies$ Low-spin complexes (electrons pair in $t_{2g}$ before filling $e_g$). Diamagnetic or weak paramagnetism.
- **Weak Field Ligands ($I^-, Br^-, Cl^-, F^-$)**: $\\Delta_o < P \\implies$ High-spin complexes (Hund's rule applies; electrons populate $e_g$ singly). Strong paramagnetism.

### Spectrochemical Series:
$$I^- < Br^- < S^{2-} < Cl^- < F^- < OH^- < H_2O < NH_3 < en < NO_2^- < CN^- < CO$$`,
    attachmentUrl: 'https://example.com/docs/crystal-field-theory.pdf',
    attachmentName: 'Crystal_Field_Splitting_Diagrams.pdf',
    tags: ['Chemistry', 'Coordination Compounds', 'Crystal Field Theory'],
    isPublished: true,
    createdAt: '2026-10-23T08:30:00Z',
  },
  {
    id: 'note-chem-thermodynamics',
    classId: 'class-chem-adv',
    className: 'Chemical Kinetics, Thermodynamics & Coordination Chemistry',
    staffId: 'staff-thorne',
    staffName: 'Dr. Aris Thorne',
    title: 'Chemical Thermodynamics: Gibbs Free Energy Spontaneity & Van ’t Hoff Isochore',
    subject: 'Chemistry',
    content: `## Gibbs Free Energy ($\\Delta G$) & Chemical Equilibrium

The universal criterion for spontaneous change at constant temperature and pressure:

$$\\Delta G = \\Delta H - T \\Delta S < 0$$

### Spontaneity Regimes:
| $\\Delta H$ | $\\Delta S$ | Spontaneity Condition |
| :--- | :--- | :--- |
| **Negative (Exothermic)** | **Positive (Disorder)** | Spontaneous at **all temperatures** ($\\Delta G < 0$) |
| **Negative (Exothermic)** | **Negative (Order)** | Spontaneous only at **low temperatures** ($T < \\Delta H / \\Delta S$) |
| **Positive (Endothermic)** | **Positive (Disorder)** | Spontaneous only at **high temperatures** ($T > \\Delta H / \\Delta S$) |
| **Positive (Endothermic)** | **Negative (Order)** | **Non-spontaneous** at all temperatures |

### Relation to Equilibrium Constant ($K_{\\text{eq}}$):
$$\\Delta G^\\circ = -RT \\ln K_{\\text{eq}}$$

### Van ’t Hoff Isochore Equation:
$$\\frac{d \\ln K_{\\text{eq}}}{dT} = \\frac{\\Delta H^\\circ}{R T^2} \\implies \\ln\\left(\\frac{K_2}{K_1}\\right) = -\\frac{\\Delta H^\\circ}{R}\\left(\\frac{1}{T_2} - \\frac{1}{T_1}\\right)$$
For exothermic reactions ($\\Delta H^\\circ < 0$), raising temperature decreases equilibrium conversion.`,
    tags: ['Chemistry', 'Thermodynamics', 'Gibbs Energy', 'Equilibrium'],
    isPublished: true,
    createdAt: '2026-10-22T09:00:00Z',
  },

  // ==========================================
  // BIOLOGY / BIO-SCIENCE
  // ==========================================
  {
    id: 'note-bio-dna-fork',
    classId: 'class-bio-mol',
    className: 'Molecular Genetics & Structural Bioinformatics',
    staffId: 'staff-eleanor',
    staffName: 'Prof. Eleanor Vance',
    title: 'Molecular Genetics: DNA Replication Fork Kinetics, Helicase & Okazaki Fragments',
    subject: 'Biology',
    content: `## Molecular Mechanics of the DNA Replication Fork

DNA replication in living cells is semiconservative, bidirectional, and strictly limited to the $5' \\to 3'$ synthesis direction by DNA Polymerase catalytic geometry.

### Replication Fork Enzymatic Machinery:
1. **DNA Helicase (DnaB)**: Consumes ATP to break hydrogen bonds and unwind double-stranded DNA at 500-1000 bp/second.
2. **Topoisomerase (Gyrase)**: Introduces transient single- or double-strand breaks to relieve positive supercoiling strain ahead of the fork.
3. **Single-Stranded Binding Proteins (SSB)**: Stabilize transient single strands and prevent hairpin re-annealing.
4. **Leading vs Lagging Strand Asymmetry**:
   - **Leading Strand**: Continuous elongation toward the advancing replication fork.
   - **Lagging Strand**: Discontinuous synthesis generating Okazaki fragments (1000-2000 nt in prokaryotes, 100-200 nt in eukaryotes).

### Fidelity & Proofreading:
DNA Polymerase III utilizes intrinsic $3' \\to 5'$ exonuclease proofreading to excise mismatched nucleotides, driving the raw replication error rate down from $10^{-5}$ to $10^{-7}$. Subsequent mismatch repair systems achieve an overall fidelity of $10^{-10}$.`,
    attachmentUrl: 'https://example.com/docs/dna-replication-fork.pdf',
    attachmentName: 'Replication_Fork_Enzymology.pdf',
    tags: ['Biology', 'Molecular Genetics', 'DNA Replication', 'Polymerase'],
    isPublished: true,
    createdAt: '2026-10-24T10:00:00Z',
  },
  {
    id: 'note-bio-protein-folding',
    classId: 'class-bio-mol',
    className: 'Molecular Genetics & Structural Bioinformatics',
    staffId: 'staff-eleanor',
    staffName: 'Prof. Eleanor Vance',
    title: 'Structural Biology: Protein Secondary Structure & Ramachandran Plot Mechanics',
    subject: 'Biology',
    content: `## Secondary Structure Architecture & Ramachandran Dihedral Angles

The primary polypeptide chain folds into stable local configurations dictated by steric hindrance and main-chain hydrogen bonding.

### Dihedral Torsion Angles:
Every residue contributes two flexible backbone degrees of freedom:
- **$\\phi$ (Phi)**: Torsion angle around the $C_\\alpha - N$ bond.
- **$\\psi$ (Psi)**: Torsion angle around the $C_\\alpha - C$ bond.
The peptide bond itself ($\\omega$) is constrained to planar $180^\\circ$ (trans) by partial double-bond resonance.

### The Ramachandran Plot Energy Landscape:
\`\`\`
   psi (+180) |  [ Beta Sheets ]
              |
              |       [ Alpha-R ]
              |
            0 |--------------------
              |
              |               [ Alpha-L ]
   psi (-180) +--------------------
             -180        0       +180  phi
\`\`\`

### Geometry of Secondary Motifs:
1. **$\\alpha$-Helix**: $\\phi \\approx -57^\\circ, \\psi \\approx -47^\\circ$. 3.6 residues per turn, 5.4 Å pitch. Strong internal $i \\to i+4$ backbone hydrogen bonds ($C=O_i \\cdots H-N_{i+4}$).
2. **$\\beta$-Pleated Sheet**: $\\phi \\approx -120^\\circ, \\psi \\approx +120^\\circ$. Extended pleated chains with inter-strand hydrogen bonds.`,
    attachmentUrl: 'https://example.com/docs/ramachandran-plots.pdf',
    attachmentName: 'Protein_Structural_Conformations.pdf',
    tags: ['Biology', 'Structural Biology', 'Protein Folding', 'Ramachandran Plot'],
    isPublished: true,
    createdAt: '2026-10-23T14:00:00Z',
  },
  {
    id: 'note-bio-sequence-align',
    classId: 'class-bio-mol',
    className: 'Molecular Genetics & Structural Bioinformatics',
    staffId: 'staff-eleanor',
    staffName: 'Prof. Eleanor Vance',
    title: 'Bioinformatics: Dynamic Programming for Pairwise Sequence Alignment',
    subject: 'Biology',
    content: `## Algorithmic Sequence Alignment: Needleman-Wunsch & Smith-Waterman

To deduce evolutionary homology and functional conservation across genomic and proteomic sequences, computational biologists employ dynamic programming matrices.

### 1. Global Alignment (Needleman-Wunsch):
Maximizes similarity across the full extent of sequence $X$ (length $m$) and $Y$ (length $n$):

$$M(i, j) = \\max \\begin{cases}
M(i-1, j-1) + S(x_i, y_j) & \\text{(Match / Mismatch)} \\\\
M(i-1, j) + d & \\text{(Deletions / Gap in } Y) \\\\
M(i, j-1) + d & \\text{(Insertions / Gap in } X)
\\end{cases}$$

Boundary initialization: $M(i, 0) = i \\cdot d$, $M(0, j) = j \\cdot d$.

### 2. Local Alignment (Smith-Waterman):
Finds the highest-scoring local homologous subdomain (e.g. active catalytic pockets):

$$H(i, j) = \\max \\begin{cases}
0 & \\text{(Reset path score)} \\\\
H(i-1, j-1) + S(x_i, y_j) \\\\
H(i-1, j) + d \\\\
H(i, j-1) + d
\\end{cases}$$

### Scoring Matrices:
- **BLOSUM62**: Derived from blocks of aligned protein families with $\\le 62\\%$ identity; optimized for functional domain discovery.
- **PAM250**: Models deep evolutionary divergence based on Point Accepted Mutations.`,
    attachmentUrl: 'https://example.com/docs/bioinformatics-alignment.pdf',
    attachmentName: 'Sequence_Alignment_Algorithms.pdf',
    tags: ['Biology', 'Bioinformatics', 'Dynamic Programming', 'Sequence Alignment'],
    isPublished: true,
    createdAt: '2026-10-21T09:15:00Z',
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Param Sahar
  { id: 'att-1', classId: 'class-phy-12', className: 'Physics XII', studentId: 'student-param', studentName: 'Param Sahar', studentReg: '2026CSE042', date: '2026-10-26', status: 'present', markedBy: 'staff-rajan' },
  { id: 'att-2', classId: 'class-cs-ai', className: 'Antigravity AI', studentId: 'student-param', studentName: 'Param Sahar', studentReg: '2026CSE042', date: '2026-10-25', status: 'present', markedBy: 'staff-rajan' },
  { id: 'att-3', classId: 'class-math-calc', className: 'Multivariable Calc', studentId: 'student-param', studentName: 'Param Sahar', studentReg: '2026CSE042', date: '2026-10-24', status: 'present', markedBy: 'staff-eleanor' },
  { id: 'att-4', classId: 'class-phy-12', className: 'Physics XII', studentId: 'student-param', studentName: 'Param Sahar', studentReg: '2026CSE042', date: '2026-10-23', status: 'late', remarks: 'Arrived 10 mins late due to lab transport', markedBy: 'staff-rajan' },
  { id: 'att-5', classId: 'class-cs-ai', className: 'Antigravity AI', studentId: 'student-param', studentName: 'Param Sahar', studentReg: '2026CSE042', date: '2026-10-22', status: 'present', markedBy: 'staff-rajan' },
  { id: 'att-6', classId: 'class-phy-12', className: 'Physics XII', studentId: 'student-param', studentName: 'Param Sahar', studentReg: '2026CSE042', date: '2026-10-21', status: 'present', markedBy: 'staff-rajan' },
  { id: 'att-7', classId: 'class-math-calc', className: 'Multivariable Calc', studentId: 'student-param', studentName: 'Param Sahar', studentReg: '2026CSE042', date: '2026-10-20', status: 'present', markedBy: 'staff-eleanor' },
  { id: 'att-8', classId: 'class-cs-ai', className: 'Antigravity AI', studentId: 'student-param', studentName: 'Param Sahar', studentReg: '2026CSE042', date: '2026-10-19', status: 'present', markedBy: 'staff-rajan' },

  // Maya Lin
  { id: 'att-10', classId: 'class-phy-12', className: 'Physics XII', studentId: 'student-maya', studentName: 'Maya Lin', studentReg: '2026CSE029', date: '2026-10-26', status: 'present', markedBy: 'staff-rajan' },
  { id: 'att-11', classId: 'class-phy-12', className: 'Physics XII', studentId: 'student-maya', studentName: 'Maya Lin', studentReg: '2026CSE029', date: '2026-10-25', status: 'absent', remarks: 'Medical leave submitted', markedBy: 'staff-rajan' },

  // Kaviyarasu Murugan
  { id: 'att-20', classId: 'class-phy-12', className: 'Physics XII', studentId: 'student-kavi', studentName: 'Kaviyarasu Murugan', studentReg: '2026CSE018', date: '2026-10-26', status: 'present', markedBy: 'staff-rajan' },

  // Anitha Selvaraj
  { id: 'att-30', classId: 'class-phy-12', className: 'Physics XII', studentId: 'student-anitha', studentName: 'Anitha Selvaraj', studentReg: '2026CSE007', date: '2026-10-26', status: 'present', markedBy: 'staff-rajan' },
];

export const INITIAL_DOUBTS: StudentDoubt[] = [
  {
    id: 'doubt-1',
    studentId: 'student-param',
    studentName: 'Param Sahar',
    classId: 'class-phy-12',
    className: 'Class 12 Advanced Physics & Mechanics',
    subject: 'Physics',
    title: 'Phase Difference in Wave Optics: Double Slit vs Single Slit Diffraction',
    description: 'When computing the fringe width in Young’s double slit experiment, how does the angular spread of the central maximum in single-slit diffraction modulate the envelope of double-slit interference fringes?',
    priority: 'high',
    status: 'answered',
    tags: ['Wave Optics', 'Diffraction', 'Interference'],
    createdAt: '2026-10-25T16:20:00Z',
    answers: [
      {
        id: 'ans-1',
        doubtId: 'doubt-1',
        authorId: 'staff-rajan',
        authorName: 'Dr. K. Rajan',
        authorRole: 'staff',
        answerText: 'Great inquiry Param! The overall intensity pattern is mathematically the product of the interference term and the single-slit diffraction envelope: I(theta) = I_0 * [cos(beta)]^2 * [sin(alpha)/alpha]^2, where beta = (pi * d * sin(theta))/lambda and alpha = (pi * a * sin(theta))/lambda. The single slit width `a` dictates which interference orders become "missing orders" when beta and alpha vanish concurrently.',
        isOfficialStaffAnswer: true,
        createdAt: '2026-10-25T18:45:00Z',
      },
    ],
  },
  {
    id: 'doubt-2',
    studentId: 'student-param',
    studentName: 'Param Sahar',
    classId: 'class-cs-ai',
    className: 'Antigravity AI & Distributed Systems',
    subject: 'Computer Science',
    title: 'Raft Log Inconsistency Resolution during Leader Heartbeats',
    description: 'If a partitioned follower node has accumulated uncommitted log entries from an old term, exactly what does the new Leader do upon receiving a reject from AppendEntries RPC?',
    priority: 'medium',
    status: 'answered',
    tags: ['Distributed Systems', 'Raft Consensus'],
    createdAt: '2026-10-24T12:00:00Z',
    answers: [
      {
        id: 'ans-2',
        doubtId: 'doubt-2',
        authorId: 'staff-rajan',
        authorName: 'Dr. K. Rajan',
        authorRole: 'staff',
        answerText: 'The Leader decrements the follower’s `nextIndex` by 1 and retries the AppendEntries RPC. Once the follower finds a matching log entry at `prevLogIndex` with matching `prevLogTerm`, it overwrites all conflicting subsequent entries with the leader’s log, achieving strict linearizable convergence.',
        isOfficialStaffAnswer: true,
        createdAt: '2026-10-24T15:30:00Z',
      },
    ],
  },
  {
    id: 'doubt-3',
    studentId: 'student-maya',
    studentName: 'Maya Lin',
    classId: 'class-math-calc',
    className: 'Advanced Multivariable Calculus & Linear Algebra',
    subject: 'Mathematics',
    title: 'Intuitive Meaning of the Curl of a Gradient Vector Field',
    description: 'Why is curl(grad(f)) identically zero for any twice continuously differentiable scalar function f?',
    priority: 'medium',
    status: 'unresolved',
    tags: ['Vector Calculus', 'Curl', 'Conservative Fields'],
    createdAt: '2026-10-26T10:15:00Z',
    answers: [],
  },
];

export const INITIAL_COOPER_MESSAGES: CooperChatMessage[] = [
  {
    id: 'cooper-msg-welcome',
    sender: 'cooper',
    content: "👋 Hi! I'm **Cooper**, your dedicated AI Academic Tutor.\n\nI have live access to your **class notes**, **attendance percentage**, and **doubts queue** via Eduspheere and MCP tools.\n\nTry asking me:\n• *What is my attendance percentage?*\n• *Show me recent physics notes*\n• *Explain Maxwell's displacement current*\n• *Help me write a doubt for my teacher*",
    timestamp: 'Just now',
  },
];
