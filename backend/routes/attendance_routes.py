import math
from datetime import datetime
from flask import Blueprint, request, jsonify
from services.supabase_service import ATTENDANCE_STORE, USERS_STORE, CLASSES_STORE

attendance_bp = Blueprint('attendance', __name__)

@attendance_bp.route('', methods=['GET'])
def get_attendance():
    student_id = request.args.get('student_id')
    class_id = request.args.get('class_id')

    records = ATTENDANCE_STORE
    if student_id:
        records = [r for r in records if r.get('student_id') == student_id]
    if class_id:
        records = [r for r in records if r.get('class_id') == class_id]

    formatted = []
    for r in records:
        formatted.append({
            "id": r["id"],
            "classId": r["class_id"],
            "className": r.get("class_name", ""),
            "studentId": r["student_id"],
            "studentName": r.get("student_name", "Student"),
            "date": r["date"],
            "status": r["status"],
            "remarks": r.get("remarks"),
        })

    return jsonify({"records": formatted, "count": len(formatted)}), 200

@attendance_bp.route('/mark', methods=['POST'])
def mark_attendance():
    """Faculty marks daily attendance for roster"""
    data = request.get_json() or {}
    class_id = data.get('classId') or data.get('class_id')
    student_id = data.get('studentId') or data.get('student_id')
    status = data.get('status', 'present').lower()
    date_val = data.get('date') or datetime.utcnow().strftime('%Y-%m-%d')
    remarks = data.get('remarks')

    if not class_id or not student_id:
        return jsonify({"error": "classId and studentId are required"}), 400

    target_class = next((c for c in CLASSES_STORE if c['id'] == class_id), CLASSES_STORE[0])
    target_student = next((u for u in USERS_STORE if u['id'] == student_id), None)
    student_name = target_student["full_name"] if target_student else "Student"

    # Check existing for today
    existing = next((r for r in ATTENDANCE_STORE if r['class_id'] == class_id and r['student_id'] == student_id and r['date'] == date_val), None)
    if existing:
        existing['status'] = status
        existing['remarks'] = remarks
        record = existing
    else:
        record = {
            "id": f"att-{len(ATTENDANCE_STORE) + 1}",
            "class_id": class_id,
            "class_name": target_class["name"],
            "student_id": student_id,
            "student_name": student_name,
            "date": date_val,
            "status": status,
            "remarks": remarks,
        }
        ATTENDANCE_STORE.insert(0, record)

    return jsonify({
        "success": True,
        "record": {
            "id": record["id"],
            "classId": record["class_id"],
            "className": record["class_name"],
            "studentId": record["student_id"],
            "studentName": record["student_name"],
            "date": record["date"],
            "status": record["status"],
            "remarks": record["remarks"],
        }
    }), 200

@attendance_bp.route('/stats/<student_id>', methods=['GET'])
def get_attendance_stats(student_id: str):
    """Calculates student's verified attendance rate and exam eligibility threshold (75%)"""
    records = [r for r in ATTENDANCE_STORE if r.get('student_id') == student_id]
    total_classes = len(records)
    
    if total_classes == 0:
        return jsonify({
            "studentId": student_id,
            "totalClasses": 0,
            "presentCount": 0,
            "lateCount": 0,
            "absentCount": 0,
            "attendancePercentage": 100.0,
            "isEligibleForExams": True,
            "threshold": 75.0,
            "classesNeeded": 0,
        }), 200

    present_count = sum(1 for r in records if r.get('status') == 'present')
    late_count = sum(1 for r in records if r.get('status') == 'late')
    absent_count = sum(1 for r in records if r.get('status') == 'absent')

    # Late counts as 0.75 attendance
    effective_presence = present_count + (0.75 * late_count)
    rate = round((effective_presence / total_classes) * 100, 1)
    is_eligible = rate >= 75.0

    # Calculate additional classes needed if below 75%
    # (effective + X) / (total + X) >= 0.75 => X >= (0.75*total - effective) / 0.25
    classes_needed = 0
    if not is_eligible:
        classes_needed = max(0, math.ceil((0.75 * total_classes - effective_presence) / 0.25))

    return jsonify({
        "studentId": student_id,
        "totalClasses": total_classes,
        "presentCount": present_count,
        "lateCount": late_count,
        "absentCount": absent_count,
        "attendancePercentage": rate,
        "isEligibleForExams": is_eligible,
        "threshold": 75.0,
        "classesNeeded": classes_needed,
    }), 200
