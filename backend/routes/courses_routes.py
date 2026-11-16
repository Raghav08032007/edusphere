from flask import Blueprint, jsonify, request
from services.supabase_service import CLASSES_STORE

courses_bp = Blueprint('courses', __name__)

COURSES_METADATA = [
    {
        "id": "course-dist-sys",
        "code": "CS-DIST-401",
        "title": "Distributed Systems & Cloud Architecture",
        "subtitle": "Consensus Protocols, Raft Fault Tolerance, Linearizability & CRDTs",
        "subject": "Computer Science",
        "category": "Systems & Infrastructure",
        "instructorName": "Dr. K. Rajan",
        "instructorTitle": "Dean of Faculty, Department of Computer Science & Engineering",
        "rating": 4.92,
        "enrolledCount": 14250,
        "estimatedHours": 24,
        "difficulty": "Advanced",
        "modulesCount": 4,
        "quizzesCount": 2,
    },
    {
        "id": "course-deep-learn",
        "code": "AI-DEEP-502",
        "title": "Deep Learning Systems & Transformer Architectures",
        "subtitle": "Multi-Head Attention Math, KV-Caching & FlashAttention CUDA Kernels",
        "subject": "Artificial Intelligence",
        "category": "Machine Learning & AI",
        "instructorName": "Dr. K. Rajan",
        "instructorTitle": "Dean of Faculty, Department of Computer Science & Engineering",
        "rating": 4.96,
        "enrolledCount": 18400,
        "estimatedHours": 32,
        "difficulty": "Advanced",
        "modulesCount": 4,
        "quizzesCount": 2,
    },
    {
        "id": "course-electrodynamics",
        "code": "PHY-ELECTRO-301",
        "title": "Advanced Electrodynamics & Wave Optics",
        "subtitle": "Maxwell Equations, Displacement Currents & Poynting Vectors",
        "subject": "Physics",
        "category": "Classical & Modern Physics",
        "instructorName": "Dr. K. Rajan",
        "instructorTitle": "Professor of Applied Physics",
        "rating": 4.88,
        "enrolledCount": 9800,
        "estimatedHours": 28,
        "difficulty": "Advanced",
        "modulesCount": 4,
        "quizzesCount": 2,
    },
    {
        "id": "course-comp-bio",
        "code": "BIO-COMP-201",
        "title": "Computational Bio-Science & Structural Modeling",
        "subtitle": "Sequence Alignment Dynamic Programming, HMMs & AlphaFold Mechanics",
        "subject": "Biology",
        "category": "Bioinformatics & Computational Life Sciences",
        "instructorName": "Prof. Eleanor Vance",
        "instructorTitle": "Chair of Computational Biology",
        "rating": 4.85,
        "enrolledCount": 7600,
        "estimatedHours": 20,
        "difficulty": "Intermediate",
        "modulesCount": 3,
        "quizzesCount": 1,
    },
]

@courses_bp.route('', methods=['GET'])
def list_courses():
    category = request.args.get('category')
    subject = request.args.get('subject')

    result = COURSES_METADATA
    if category:
        result = [c for c in result if c['category'].lower() == category.lower()]
    if subject:
        result = [c for c in result if c['subject'].lower() == subject.lower()]

    return jsonify({"courses": result, "count": len(result)}), 200

@courses_bp.route('/<course_id>', methods=['GET'])
def get_course(course_id: str):
    matched = next((c for c in COURSES_METADATA if c['id'] == course_id or c['code'] == course_id), None)
    if not matched:
        return jsonify({"error": "Course not found"}), 404
    return jsonify({"course": matched}), 200
