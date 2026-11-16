import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from services.supabase_service import QUIZ_HISTORY_STORE, USERS_STORE
from services.certificate_service import CertificateService

quizzes_bp = Blueprint('quizzes', __name__)

@quizzes_bp.route('/submit', methods=['POST'])
def submit_quiz():
    """Evaluates an assessment submission, records attempt, and issues certificate on passing (>= 75%)"""
    data = request.get_json() or {}
    user_id = data.get('userId', 'student-param')
    course_id = data.get('courseId', 'course-dist-sys')
    course_title = data.get('courseTitle', 'Distributed Systems & Cloud Architecture')
    course_code = data.get('courseCode', 'CS-DIST-401')
    quiz_id = data.get('quizId', 'quiz-dist-1')
    score = int(data.get('score', 0))
    total = int(data.get('total', 1))
    passing_score = int(data.get('passingScore', 75))

    percentage = round((score / total) * 100) if total > 0 else 0
    passed = percentage >= passing_score

    # Find student details
    student = next((u for u in USERS_STORE if u['id'] == user_id), USERS_STORE[2])
    student_name = student["full_name"]

    history_record = {
        "id": f"qh-{uuid.uuid4().hex[:8]}",
        "user_id": user_id,
        "course_id": course_id,
        "course_title": course_title,
        "quiz_id": quiz_id,
        "score": score,
        "total": total,
        "percentage": percentage,
        "passed": passed,
        "completed_at": datetime.utcnow().isoformat() + "Z",
    }
    QUIZ_HISTORY_STORE.insert(0, history_record)

    certificate = None
    if passed:
        try:
            certificate = CertificateService.generate_certificate(
                student_id=user_id,
                student_name=student_name,
                course_code=course_code,
                course_title=course_title,
                score_percentage=percentage,
            )
        except Exception as e:
            print(f"[Certificate] Warning: {e}")

    return jsonify({
        "success": True,
        "result": {
            "score": score,
            "total": total,
            "percentage": percentage,
            "passed": passed,
            "passingScore": passing_score,
            "certificate": certificate,
        }
    }), 200

@quizzes_bp.route('/history', methods=['GET'])
def get_quiz_history():
    user_id = request.args.get('user_id', 'student-param')
    history = [h for h in QUIZ_HISTORY_STORE if h.get('user_id') == user_id]
    
    formatted = []
    for h in history:
        formatted.append({
            "id": h["id"],
            "userId": h["user_id"],
            "courseId": h["course_id"],
            "courseTitle": h.get("course_title", ""),
            "quizId": h["quiz_id"],
            "score": h["score"],
            "total": h["total"],
            "percentage": h["percentage"],
            "passed": h["passed"],
            "completedAt": h.get("completed_at"),
        })

    return jsonify({"history": formatted, "count": len(formatted)}), 200

@quizzes_bp.route('/certificate/<cert_id>', methods=['GET'])
def verify_certificate(cert_id: str):
    cert = CertificateService.verify_certificate(cert_id)
    if not cert:
        return jsonify({"valid": False, "error": "Certificate not found or revoked"}), 404
    return jsonify({"valid": True, "certificate": cert}), 200
