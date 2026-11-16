import uuid
from datetime import datetime, date
from typing import Dict, Any, List, Optional
from config import Config

# Attempt Supabase client initialization
supabase_client = None
if Config.SUPABASE_URL and Config.SUPABASE_KEY and Config.SUPABASE_URL.startswith('https://'):
    try:
        from supabase import create_client
        supabase_client = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)
        print(f"[Supabase] Connected to live project at: {Config.SUPABASE_URL}")
    except Exception as e:
        print(f"[Supabase] Warning: Live client init failed ({e}). Using robust memory store.")

# ==============================================================================
# IN-MEMORY ACADEMIC DATA STORE (Mirrors Supabase tables & provides reliable fallback)
# ==============================================================================

USERS_STORE: List[Dict[str, Any]] = [
    {
        "id": "staff-rajan",
        "email": "k.rajan@vedantu.edu",
        "full_name": "Dr. K. Rajan",
        "role": "staff",
        "reg_number": "FAC-CSE-01",
        "department": "Department of Computer Science & Physics",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "phone": "+91 98401 23456",
    },
    {
        "id": "staff-eleanor",
        "email": "eleanor.vance@vedantu.edu",
        "full_name": "Prof. Eleanor Vance",
        "role": "staff",
        "reg_number": "FAC-MATH-04",
        "department": "Department of Pure Mathematics & Computational Biology",
        "avatar_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
        "phone": "+91 98402 34567",
    },
    {
        "id": "student-param",
        "email": "param.sahar@vedantu.edu",
        "full_name": "Param Sahar",
        "role": "student",
        "reg_number": "2026CSE042",
        "department": "Antigravity AI & Advanced JEE Track",
        "avatar_url": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "phone": "+91 98765 43210",
    },
    {
        "id": "student-maya",
        "email": "maya.lin@vedantu.edu",
        "full_name": "Maya Lin",
        "role": "student",
        "reg_number": "2026CSE029",
        "department": "Computational Physics & Distributed Architecture",
        "avatar_url": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        "phone": "+91 98765 43211",
    },
]

CLASSES_STORE: List[Dict[str, Any]] = [
    {
        "id": "class-dist-sys",
        "code": "CS-DIST-401",
        "name": "Distributed Systems & Cloud Consensus",
        "subject": "Computer Science",
        "description": "Fault tolerance, Paxos, Raft leader election, and Byzantine resilience",
        "staff_id": "staff-rajan",
        "academic_year": "2026-2027",
    },
    {
        "id": "class-deep-learn",
        "code": "AI-DEEP-502",
        "name": "Deep Learning & Transformer Systems",
        "subject": "Artificial Intelligence",
        "description": "Multi-head attention derivations, KV cache, and FlashAttention CUDA kernel math",
        "staff_id": "staff-rajan",
        "academic_year": "2026-2027",
    },
    {
        "id": "class-electrodynamics",
        "code": "PHY-ELECTRO-301",
        "name": "Advanced Electrodynamics & Wave Optics",
        "subject": "Physics",
        "description": "Maxwell's equations, displacement currents, and electromagnetic tensor formulations",
        "staff_id": "staff-rajan",
        "academic_year": "2026-2027",
    },
    {
        "id": "class-computational-bio",
        "code": "BIO-COMP-201",
        "name": "Computational Biology & Structural Modeling",
        "subject": "Biology",
        "description": "Needleman-Wunsch sequence alignment, dynamic programming, and AlphaFold-2 geometric priors",
        "staff_id": "staff-eleanor",
        "academic_year": "2026-2027",
    },
]

NOTES_STORE: List[Dict[str, Any]] = [
    {
        "id": "note-1",
        "class_id": "class-dist-sys",
        "class_name": "Distributed Systems & Cloud Consensus",
        "staff_id": "staff-rajan",
        "staff_name": "Dr. K. Rajan",
        "title": "Module 3: Raft Log Replication & Split-Brain Invariants",
        "subject": "Computer Science",
        "content": "### 1. Invariants of Raft Consensus\nIn Raft, safety is guaranteed through strict term leader election.\n\n$$\\text{LeaderCommit} = \\max \\{ N \\mid N > \\text{commitIndex} \\land \\text{count}(\\text{matchIndex}[i] \\ge N) > \\frac{\\text{peers}}{2} \\}$$\n\n1. **Election Safety**: At most one leader can be elected in a given term.\n2. **Leader Append-Only**: A leader never overwrites its own log.\n3. **Log Matching Safety**: If two logs contain an entry with the same index and term, they are identical up to that index.",
        "attachment_name": "Raft_Consensus_Formal_Proof.pdf",
        "attachment_url": "https://ntkrjfcwhauextzrvkac.supabase.co/storage/v1/object/public/class-notes/class-dist-sys/Raft_Consensus_Formal_Proof.pdf",
        "tags": ["Distributed Systems", "Raft", "Consensus", "Fault Tolerance"],
        "is_published": True,
        "created_at": "2026-11-10T09:30:00Z",
    },
    {
        "id": "note-2",
        "class_id": "class-electrodynamics",
        "class_name": "Advanced Electrodynamics & Wave Optics",
        "staff_id": "staff-rajan",
        "staff_name": "Dr. K. Rajan",
        "title": "Module 1: Maxwell's Correction & Poynting Vector Proof",
        "subject": "Physics",
        "content": "### Maxwell-Ampère Law Derivation\nJames Clerk Maxwell amended Ampère's circuital law with displacement current:\n\n$$\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}$$\n\nThe energy density flux vector is given by:\n$$\\mathbf{S} = \\frac{1}{\\mu_0} (\\mathbf{E} \\times \\mathbf{B})$$",
        "attachment_name": "Maxwell_Displacement_Proof.pdf",
        "attachment_url": "https://ntkrjfcwhauextzrvkac.supabase.co/storage/v1/object/public/class-notes/class-electrodynamics/Maxwell_Displacement_Proof.pdf",
        "tags": ["Physics", "Electromagnetism", "Maxwell Equations", "JEE Advanced"],
        "is_published": True,
        "created_at": "2026-11-12T11:15:00Z",
    },
    {
        "id": "note-3",
        "class_id": "class-deep-learn",
        "class_name": "Deep Learning & Transformer Systems",
        "staff_id": "staff-rajan",
        "staff_name": "Dr. K. Rajan",
        "title": "Module 2: Scaled Dot-Product Attention & KV Cache Memory Footprint",
        "subject": "Artificial Intelligence",
        "content": "### Memory Scaling of Multi-Head Self-Attention\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$\n\nFor a model with $L$ layers, $H$ heads, and dimension $D$:\n$$\\text{KV Cache Size per Token} = 2 \\times 2 \\times L \\times H \\times D \\times \\text{sizeof(FP16)}$$",
        "attachment_name": "FlashAttention_Kernel_Derivations.pdf",
        "attachment_url": "https://ntkrjfcwhauextzrvkac.supabase.co/storage/v1/object/public/class-notes/class-deep-learn/FlashAttention_Kernel_Derivations.pdf",
        "tags": ["AI", "Transformers", "KV Cache", "FlashAttention"],
        "is_published": True,
        "created_at": "2026-11-14T14:00:00Z",
    },
]

ATTENDANCE_STORE: List[Dict[str, Any]] = [
    {
        "id": "att-1",
        "class_id": "class-dist-sys",
        "class_name": "Distributed Systems",
        "student_id": "student-param",
        "student_name": "Param Sahar",
        "date": "2026-11-14",
        "status": "present",
        "remarks": "On-time arrival, actively answered Raft questions",
    },
    {
        "id": "att-2",
        "class_id": "class-electrodynamics",
        "class_name": "Advanced Electrodynamics",
        "student_id": "student-param",
        "student_name": "Param Sahar",
        "date": "2026-11-13",
        "status": "present",
        "remarks": "Verified lab participation",
    },
    {
        "id": "att-3",
        "class_id": "class-deep-learn",
        "class_name": "Deep Learning Systems",
        "student_id": "student-param",
        "student_name": "Param Sahar",
        "date": "2026-11-12",
        "status": "present",
        "remarks": "Engaged in GPU memory discussion",
    },
    {
        "id": "att-4",
        "class_id": "class-computational-bio",
        "class_name": "Computational Biology",
        "student_id": "student-param",
        "student_name": "Param Sahar",
        "date": "2026-11-11",
        "status": "late",
        "remarks": "Arrived 10 minutes late due to campus bus delay",
    },
    {
        "id": "att-5",
        "class_id": "class-dist-sys",
        "class_name": "Distributed Systems",
        "student_id": "student-maya",
        "student_name": "Maya Lin",
        "date": "2026-11-14",
        "status": "present",
        "remarks": "Regular attendee",
    },
]

DOUBTS_STORE: List[Dict[str, Any]] = [
    {
        "id": "doubt-1",
        "student_id": "student-param",
        "student_name": "Param Sahar",
        "class_id": "class-dist-sys",
        "subject": "Distributed Systems",
        "title": "Why is 2F+1 nodes required in Raft instead of 3F+1 in PBFT?",
        "description": "I understand Raft assumes crash-fault-tolerant (CFT) semantics with benign failures, whereas PBFT handles arbitrary Byzantine (malicious) failures. Can faculty explain how the intersecting quorum guarantees differ mathematically?",
        "priority": "high",
        "status": "answered",
        "tags": ["Raft", "PBFT", "Consensus", "Quorum"],
        "created_at": "2026-11-14T10:00:00Z",
        "answers": [
            {
                "id": "ans-1",
                "author_id": "staff-rajan",
                "author_name": "Dr. K. Rajan (Dean & Professor)",
                "author_role": "staff",
                "answer_text": "Excellent insight, Param! In crash-stop/crash-recovery (CFT), nodes never lie—they either respond correctly or remain silent. Two quorums of size ⌊N/2⌋ + 1 must intersect at least at 1 honest node ((N/2 + 1) + (N/2 + 1) = N + 2 > N). In Byzantine Fault Tolerance (BFT), faulty nodes can actively send contradictory votes (split votes). Thus, any two quorums must intersect at least at F+1 nodes so that at least one honest non-faulty node resides in the intersection: 2(2F+1) - N ≥ F+1 yields N ≥ 3F+1.",
                "is_official_staff_answer": True,
                "created_at": "2026-11-14T11:20:00Z",
            }
        ],
    },
    {
        "id": "doubt-2",
        "student_id": "student-param",
        "student_name": "Param Sahar",
        "class_id": "class-deep-learn",
        "subject": "Artificial Intelligence",
        "title": "How does FlashAttention avoid the quadratic HBM memory overhead?",
        "description": "Standard attention computes softmax(QK^T/sqrt(d))V which materializes an N x N matrix in GPU HBM. How does the tiling and online softmax trick eliminate this?",
        "priority": "urgent",
        "status": "unresolved",
        "tags": ["FlashAttention", "CUDA", "GPU", "SRAM"],
        "created_at": "2026-11-15T08:30:00Z",
        "answers": [],
    },
]

QUIZ_HISTORY_STORE: List[Dict[str, Any]] = [
    {
        "id": "qh-1",
        "user_id": "student-param",
        "course_id": "course-dist-sys",
        "course_title": "Distributed Systems & Cloud Architecture",
        "quiz_id": "quiz-dist-1",
        "score": 4,
        "total": 4,
        "percentage": 100,
        "passed": True,
        "completed_at": "2026-11-14T16:00:00Z",
    }
]

CERTIFICATES_STORE: List[Dict[str, Any]] = [
    {
        "id": "CERT-EDUSPHERE-2026-042DIST",
        "student_id": "student-param",
        "student_name": "Param Sahar",
        "course_code": "CS-DIST-401",
        "course_title": "Distributed Systems & Cloud Architecture",
        "score_percentage": 100,
        "grade": "Distinction",
        "issued_by": "Dr. K. Rajan, Dean of Computing",
        "issued_at": "2026-11-14T16:05:00Z",
        "verification_hash": "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    }
]
