import uuid
from flask import Blueprint, request, jsonify
from services.supabase_service import USERS_STORE, supabase_client

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    role = data.get('role', 'student')

    # Try live Supabase Auth if credentials provided
    if supabase_client and email and password:
        try:
            res = supabase_client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            if res.user:
                return jsonify({
                    "success": True,
                    "user": {
                        "id": res.user.id,
                        "email": res.user.email,
                        "fullName": res.user.user_metadata.get("full_name", email.split('@')[0]),
                        "role": res.user.user_metadata.get("role", "student"),
                        "avatarUrl": res.user.user_metadata.get("avatar_url"),
                    },
                    "token": res.session.access_token if res.session else None,
                }), 200
        except Exception as e:
            # Fall through to mock store if live authentication fails
            print(f"[Auth] Supabase auth attempt fallback: {e}")

    # Fallback to demo academic user matching
    matched = next((u for u in USERS_STORE if u['email'].lower() == email), None)
    if not matched:
        if role == 'staff':
            matched = USERS_STORE[0] # Dr. K. Rajan
        else:
            matched = USERS_STORE[2] # Param Sahar

    return jsonify({
        "success": True,
        "user": {
            "id": matched["id"],
            "email": matched["email"],
            "fullName": matched["full_name"],
            "role": matched["role"],
            "regNumber": matched.get("reg_number"),
            "department": matched.get("department"),
            "avatarUrl": matched.get("avatar_url"),
            "phone": matched.get("phone"),
        },
        "token": f"mock-jwt-token-{matched['id']}",
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    full_name = data.get('fullName', '').strip() or email.split('@')[0]
    role = data.get('role', 'student')

    new_user = {
        "id": f"student-{uuid.uuid4().hex[:8]}",
        "email": email,
        "full_name": full_name,
        "role": role,
        "reg_number": f"2026CSE{len(USERS_STORE) + 10:03d}",
        "department": "Antigravity Engineering Track",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    }
    USERS_STORE.append(new_user)

    return jsonify({
        "success": True,
        "user": {
            "id": new_user["id"],
            "email": new_user["email"],
            "fullName": new_user["full_name"],
            "role": new_user["role"],
            "regNumber": new_user["reg_number"],
            "department": new_user["department"],
            "avatarUrl": new_user["avatar_url"],
        },
        "token": f"mock-jwt-token-{new_user['id']}",
    }), 201

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    user_id = request.args.get('user_id', 'student-param')
    matched = next((u for u in USERS_STORE if u['id'] == user_id), USERS_STORE[2])
    return jsonify({
        "user": {
            "id": matched["id"],
            "email": matched["email"],
            "fullName": matched["full_name"],
            "role": matched["role"],
            "regNumber": matched.get("reg_number"),
            "department": matched.get("department"),
            "avatarUrl": matched.get("avatar_url"),
        }
    }), 200
