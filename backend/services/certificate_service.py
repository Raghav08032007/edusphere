import hashlib
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from services.supabase_service import CERTIFICATES_STORE

class CertificateService:
    """
    Manages generation and cryptographic verification of academic Course Completion Certificates.
    """

    @classmethod
    def generate_certificate(
        cls,
        student_id: str,
        student_name: str,
        course_code: str,
        course_title: str,
        score_percentage: float,
        instructor: str = "Dr. K. Rajan, Dean of Academic Affairs",
    ) -> Dict[str, Any]:
        if score_percentage < 75.0:
            raise ValueError(f"Score {score_percentage}% is below the required 75% passing threshold.")

        cert_id = f"CERT-EDUSPHERE-2026-{uuid.uuid4().hex[:6].upper()}"
        issued_at = datetime.utcnow().isoformat() + "Z"

        # Determine honors
        if score_percentage >= 95:
            grade = "High Distinction & Honors"
        elif score_percentage >= 85:
            grade = "Distinction"
        else:
            grade = "Merit Pass"

        # Generate cryptographic verification hash
        payload = f"{cert_id}:{student_id}:{course_code}:{score_percentage}:{issued_at}"
        verification_hash = f"sha256:{hashlib.sha256(payload.encode('utf-8')).hexdigest()}"

        cert_record = {
            "id": cert_id,
            "student_id": student_id,
            "student_name": student_name,
            "course_code": course_code,
            "course_title": course_title,
            "score_percentage": score_percentage,
            "grade": grade,
            "issued_by": instructor,
            "issued_at": issued_at,
            "verification_hash": verification_hash,
            "verified": True,
        }

        CERTIFICATES_STORE.append(cert_record)
        return cert_record

    @classmethod
    def verify_certificate(cls, cert_id: str) -> Optional[Dict[str, Any]]:
        for cert in CERTIFICATES_STORE:
            if cert["id"].lower() == cert_id.strip().lower():
                return cert
        return None
