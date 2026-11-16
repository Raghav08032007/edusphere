import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from services.supabase_service import DOUBTS_STORE, USERS_STORE
from services.cooper_service import CooperAIService

doubts_bp = Blueprint('doubts', __name__)

@doubts_bp.route('', methods=['GET'])
def list_doubts():
    status = request.args.get('status')
    subject = request.args.get('subject')
    student_id = request.args.get('student_id')

    filtered = DOUBTS_STORE
    if status and status != 'all':
        filtered = [d for d in filtered if d.get('status') == status]
    if subject and subject != 'all':
        filtered = [d for d in filtered if d.get('subject', '').lower() == subject.lower()]
    if student_id:
        filtered = [d for d in filtered if d.get('student_id') == student_id]

    formatted = []
    for d in filtered:
        answers = []
        for a in d.get("answers", []):
            answers.append({
                "id": a["id"],
                "authorId": a.get("author_id"),
                "authorName": a["author_name"],
                "authorRole": a.get("author_role", "staff"),
                "answerText": a["answer_text"],
                "isOfficialStaffAnswer": a.get("is_official_staff_answer", False),
                "createdAt": a.get("created_at"),
            })

        formatted.append({
            "id": d["id"],
            "studentId": d["student_id"],
            "studentName": d.get("student_name", "Student"),
            "classId": d["class_id"],
            "subject": d["subject"],
            "title": d["title"],
            "description": d["description"],
            "priority": d.get("priority", "medium"),
            "status": d.get("status", "unresolved"),
            "tags": d.get("tags", []),
            "answers": answers,
            "createdAt": d.get("created_at"),
        })

    return jsonify({"doubts": formatted, "count": len(formatted)}), 200

@doubts_bp.route('', methods=['POST'])
def post_doubt():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    subject = data.get('subject', 'General')
    class_id = data.get('classId') or data.get('class_id', 'class-dist-sys')
    student_id = data.get('studentId', 'student-param')
    student_name = data.get('studentName', 'Param Sahar')
    priority = data.get('priority', 'medium')
    tags = data.get('tags', [subject])
    ask_cooper_instant = data.get('askCooperInstant', True)

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    doubt_id = f"doubt-{uuid.uuid4().hex[:8]}"
    answers = []

    # If student requested Cooper AI to provide an immediate preliminary dissection
    if ask_cooper_instant:
        cooper_ans = CooperAIService.generate_response(
            f"{title}\n{description}",
            {"user_name": student_name}
        )
        answers.append({
            "id": f"ans-ai-{uuid.uuid4().hex[:6]}",
            "author_id": "cooper-ai",
            "author_name": "Cooper AI Assistant (Automated Academic Dissection)",
            "author_role": "cooper_ai",
            "answer_text": cooper_ans["response"],
            "is_official_staff_answer": False,
            "created_at": datetime.utcnow().isoformat() + "Z",
        })

    status = "answered" if answers else "unresolved"

    new_doubt = {
        "id": doubt_id,
        "student_id": student_id,
        "student_name": student_name,
        "class_id": class_id,
        "subject": subject,
        "title": title,
        "description": description,
        "priority": priority,
        "status": status,
        "tags": tags,
        "answers": answers,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    DOUBTS_STORE.insert(0, new_doubt)

    return jsonify({
        "success": True,
        "doubt": {
            "id": new_doubt["id"],
            "studentId": new_doubt["student_id"],
            "studentName": new_doubt["student_name"],
            "classId": new_doubt["class_id"],
            "subject": new_doubt["subject"],
            "title": new_doubt["title"],
            "description": new_doubt["description"],
            "priority": new_doubt["priority"],
            "status": new_doubt["status"],
            "tags": new_doubt["tags"],
            "answers": [
                {
                    "id": a["id"],
                    "authorId": a.get("author_id"),
                    "authorName": a["author_name"],
                    "authorRole": a.get("author_role", "cooper_ai"),
                    "answerText": a["answer_text"],
                    "isOfficialStaffAnswer": a.get("is_official_staff_answer", False),
                    "createdAt": a.get("created_at"),
                }
                for a in new_doubt["answers"]
            ],
            "createdAt": new_doubt["created_at"],
        }
    }), 201

@doubts_bp.route('/<doubt_id>/answers', methods=['POST'])
def add_answer(doubt_id: str):
    target_doubt = next((d for d in DOUBTS_STORE if d['id'] == doubt_id), None)
    if not target_doubt:
        return jsonify({"error": "Doubt not found"}), 404

    data = request.get_json() or {}
    answer_text = data.get('answerText') or data.get('answer_text', '').strip()
    author_id = data.get('authorId', 'staff-rajan')
    author_name = data.get('authorName', 'Dr. K. Rajan (Dean & Professor)')
    author_role = data.get('authorRole', 'staff')
    is_official = author_role == 'staff'

    if not answer_text:
        return jsonify({"error": "answerText is required"}), 400

    new_answer = {
        "id": f"ans-{uuid.uuid4().hex[:6]}",
        "author_id": author_id,
        "author_name": author_name,
        "author_role": author_role,
        "answer_text": answer_text,
        "is_official_staff_answer": is_official,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    target_doubt.setdefault("answers", []).append(new_answer)
    target_doubt["status"] = "answered"

    return jsonify({
        "success": True,
        "answer": {
            "id": new_answer["id"],
            "authorId": new_answer["author_id"],
            "authorName": new_answer["author_name"],
            "authorRole": new_answer["author_role"],
            "answerText": new_answer["answer_text"],
            "isOfficialStaffAnswer": new_answer["is_official_staff_answer"],
            "createdAt": new_answer["created_at"],
        },
        "doubtStatus": target_doubt["status"],
    }), 201

@doubts_bp.route('/<doubt_id>/status', methods=['PATCH'])
def update_status(doubt_id: str):
    target_doubt = next((d for d in DOUBTS_STORE if d['id'] == doubt_id), None)
    if not target_doubt:
        return jsonify({"error": "Doubt not found"}), 404

    data = request.get_json() or {}
    new_status = data.get('status', 'resolved')
    target_doubt['status'] = new_status

    return jsonify({"success": True, "doubtId": doubt_id, "status": new_status}), 200
