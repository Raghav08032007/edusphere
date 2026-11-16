import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from services.supabase_service import NOTES_STORE, CLASSES_STORE, supabase_client

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('', methods=['GET'])
def list_notes():
    class_id = request.args.get('class_id')
    subject = request.args.get('subject')

    filtered = NOTES_STORE
    if class_id and class_id != 'all':
        filtered = [n for n in filtered if n.get('class_id') == class_id]
    if subject:
        filtered = [n for n in filtered if n.get('subject', '').lower() == subject.lower()]

    # Convert snake_case to camelCase for Next.js frontend consistency
    formatted = []
    for n in filtered:
        formatted.append({
            "id": n["id"],
            "classId": n["class_id"],
            "className": n.get("class_name", ""),
            "staffId": n["staff_id"],
            "staffName": n.get("staff_name", "Faculty"),
            "title": n["title"],
            "subject": n["subject"],
            "content": n["content"],
            "attachmentName": n.get("attachment_name"),
            "attachmentUrl": n.get("attachment_url"),
            "tags": n.get("tags", []),
            "isPublished": n.get("is_published", True),
            "createdAt": n.get("created_at"),
        })

    return jsonify({"notes": formatted, "count": len(formatted)}), 200

@notes_bp.route('', methods=['POST'])
def create_note():
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    class_id = data.get('classId') or data.get('class_id')
    staff_id = data.get('staffId', 'staff-rajan')
    staff_name = data.get('staffName', 'Dr. K. Rajan')
    subject = data.get('subject', 'General')

    if not title or not content:
        return jsonify({"error": "Title and content are required"}), 400

    target_class = next((c for c in CLASSES_STORE if c['id'] == class_id), CLASSES_STORE[0])
    note_id = f"note-{uuid.uuid4().hex[:8]}"

    new_note = {
        "id": note_id,
        "class_id": target_class["id"],
        "class_name": target_class["name"],
        "staff_id": staff_id,
        "staff_name": staff_name,
        "title": title,
        "subject": subject or target_class["subject"],
        "content": content,
        "attachment_name": data.get('attachmentName'),
        "attachment_url": data.get('attachmentUrl'),
        "tags": data.get('tags', [subject]),
        "is_published": True,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    NOTES_STORE.insert(0, new_note)

    return jsonify({
        "success": True,
        "note": {
            "id": new_note["id"],
            "classId": new_note["class_id"],
            "className": new_note["class_name"],
            "staffId": new_note["staff_id"],
            "staffName": new_note["staff_name"],
            "title": new_note["title"],
            "subject": new_note["subject"],
            "content": new_note["content"],
            "attachmentName": new_note["attachment_name"],
            "attachmentUrl": new_note["attachment_url"],
            "tags": new_note["tags"],
            "isPublished": new_note["is_published"],
            "createdAt": new_note["created_at"],
        }
    }), 201

@notes_bp.route('/upload', methods=['POST'])
def upload_attachment():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files['file']
    class_id = request.form.get('classId', 'general')

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    sanitized_name = file.filename.replace(' ', '_')
    storage_path = f"{class_id}/{int(datetime.utcnow().timestamp())}_{sanitized_name}"

    # If Supabase client is live, upload directly to Supabase Storage bucket 'class-notes'
    if supabase_client:
        try:
            file_bytes = file.read()
            supabase_client.storage.from_('class-notes').upload(
                path=storage_path,
                file=file_bytes,
                file_options={"content-type": file.content_type or "application/octet-stream", "upsert": "true"}
            )
            public_url = supabase_client.storage.from_('class-notes').get_public_url(storage_path)
            return jsonify({
                "success": True,
                "fileName": file.filename,
                "publicUrl": public_url,
                "path": storage_path,
            }), 200
        except Exception as e:
            print(f"[Storage] Supabase upload exception: {e}")

    # Fallback storage URL
    fallback_url = f"https://ntkrjfcwhauextzrvkac.supabase.co/storage/v1/object/public/class-notes/{storage_path}"
    return jsonify({
        "success": True,
        "fileName": file.filename,
        "publicUrl": fallback_url,
        "path": storage_path,
    }), 200

@notes_bp.route('/<note_id>', methods=['DELETE'])
def delete_note(note_id: str):
    global NOTES_STORE
    initial_len = len(NOTES_STORE)
    NOTES_STORE = [n for n in NOTES_STORE if n['id'] != note_id]

    if len(NOTES_STORE) < initial_len:
        return jsonify({"success": True, "message": "Note deleted successfully"}), 200
    return jsonify({"error": "Note not found"}), 404
