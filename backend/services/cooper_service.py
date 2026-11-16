import re
from typing import Dict, Any, List, Optional

class CooperAIService:
    """
    Cooper AI Academic Tutor Service
    Provides conversational pedagogical tutoring, step-by-step formula derivations,
    and question bank dissections.
    """

    KNOWLEDGE_BASE = {
        "raft": {
            "title": "Raft Consensus Algorithm",
            "summary": "Raft decomposes distributed consensus into leader election, log replication, and safety.",
            "derivation": "$$\\text{Majority Quorum} = \\lfloor N / 2 \\rfloor + 1$$\n$$\\text{LeaderCommit} = \\max \\{ N \\mid \\text{count}(\\text{matchIndex}[i] \\ge N) > N/2 \\}$$",
            "key_takeaways": [
                "Election safety: At most one leader per term.",
                "Leader append-only: Leaders never overwrite or truncate their log.",
                "Log matching property: Entries at the same index and term are strictly identical.",
            ],
        },
        "attention": {
            "title": "Scaled Dot-Product Self-Attention",
            "summary": "Scaled dot-product attention scales query-key products by 1/sqrt(d_k) to prevent softmax saturation in high dimensions.",
            "derivation": "$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$\n$$\\text{Var}(q \\cdot k) = d_k \\implies \\text{Var}\\left(\\frac{q \\cdot k}{\\sqrt{d_k}}\\right) = 1$$",
            "key_takeaways": [
                "Scaling factor 1/sqrt(d_k) preserves unit variance under independent zero-mean normal initializations.",
                "Softmax computes an interpolation weight distribution over value vectors.",
                "FlashAttention computes this in tile blocks in SRAM without materializing the N x N matrix in HBM.",
            ],
        },
        "maxwell": {
            "title": "Maxwell's Equations & Displacement Current",
            "summary": "Maxwell unified electricity and magnetism by adding the displacement current term to Ampere's circuital law.",
            "derivation": "$$\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J} + \\mu_0 \\varepsilon_0 \\frac{\\partial \\mathbf{E}}{\\partial t}$$\n$$\\mathbf{S} = \\frac{1}{\\mu_0}(\\mathbf{E} \\times \\mathbf{B})$$",
            "key_takeaways": [
                "Displacement current \\(\\varepsilon_0 \\partial \\mathbf{E} / \\partial t\\) resolves the continuity equation \\(\\nabla \\cdot \\mathbf{J} + \\partial \\rho / \\partial t = 0\\).",
                "Poynting vector \\(\\mathbf{S}\\) represents the directional energy flux density (Watts/m²).",
                "Electromagnetic wave velocity in vacuum: \\(c = 1 / \\sqrt{\\mu_0 \\varepsilon_0}\\).",
            ],
        },
    }

    @classmethod
    def generate_response(cls, prompt: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        prompt_lower = prompt.lower()
        
        # Check topic match in curated academic knowledge base
        matched_topic = None
        for key in cls.KNOWLEDGE_BASE:
            if key in prompt_lower:
                matched_topic = cls.KNOWLEDGE_BASE[key]
                break

        if matched_topic:
            content = (
                f"### 🤖 Cooper AI Academic Dissection: {matched_topic['title']}\n\n"
                f"{matched_topic['summary']}\n\n"
                f"#### 📐 Mathematical Derivation & Proof:\n"
                f"{matched_topic['derivation']}\n\n"
                f"#### 💡 Core Principles:\n"
                + "\n".join([f"- **{t}**" for t in matched_topic['key_takeaways']])
                + "\n\n---\n*Feel free to ask me to prove any step or generate a targeted practice problem!*"
            )
            return {
                "response": content,
                "topic": matched_topic['title'],
                "latex_included": True,
                "suggested_actions": [
                    "Generate a 3-question quiz on this topic",
                    "Show practical Python implementation",
                    "Explain edge cases & common exam pitfalls",
                ],
            }

        # Context-aware answering
        user_name = context.get("user_name", "Scholar") if context else "Scholar"
        attendance_rate = context.get("attendance_rate") if context else None
        
        if "attendance" in prompt_lower and attendance_rate is not None:
            status = "Verified and eligible for exams" if attendance_rate >= 75 else "Below the 75% threshold"
            content = (
                f"Hello {user_name}! According to university academic dossiers, your current verified attendance rate is **{attendance_rate}%** ({status}).\n\n"
                f"- **Requirement**: ≥ 75.0% for semester final exams.\n"
                f"- **Recommendation**: Maintain consistent presence in upcoming laboratory and lecture sessions."
            )
            return {
                "response": content,
                "topic": "Attendance & Academic Health",
                "latex_included": False,
                "suggested_actions": ["View detailed attendance history", "Contact academic counselor"],
            }

        # General pedagogical fallback
        return {
            "response": (
                f"Greetings {user_name}! I am **Cooper**, your dedicated AI Academic Tutor.\n\n"
                f"I can assist you with:\n"
                f"1. **Mathematical Derivations & Proofs** (Maxwell equations, Raft consensus, Attention math, DP alignment).\n"
                f"2. **Doubt Resolution & Code Analysis** across Distributed Systems, Machine Learning, and Electrodynamics.\n"
                f"3. **Targeted Problem Solving & Exam Preparation** for university and competitive evaluations.\n\n"
                f"How may I support your learning inquiry today?"
            ),
            "topic": "General Academic Guidance",
            "latex_included": False,
            "suggested_actions": [
                "Explain Raft split-brain prevention",
                "Derive Scaled Dot-Product Attention variance",
                "Explain Maxwell's displacement current",
            ],
        }
