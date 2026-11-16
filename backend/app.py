import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

# Import Route Blueprints
from routes.auth_routes import auth_bp
from routes.notes_routes import notes_bp
from routes.attendance_routes import attendance_bp
from routes.doubts_routes import doubts_bp
from routes.courses_routes import courses_bp
from routes.quizzes_routes import quizzes_bp
from routes.cooper_routes import cooper_bp
from routes.h5p_routes import h5p_bp
from services.supabase_service import supabase_client

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable Cross-Origin Resource Sharing (CORS) for Next.js frontend
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization", "X-Requested-With"]
        }
    })

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(attendance_bp, url_prefix='/api/attendance')
    app.register_blueprint(doubts_bp, url_prefix='/api/doubts')
    app.register_blueprint(courses_bp, url_prefix='/api/courses')
    app.register_blueprint(quizzes_bp, url_prefix='/api/quizzes')
    app.register_blueprint(cooper_bp, url_prefix='/api/cooper')
    app.register_blueprint(h5p_bp, url_prefix='/api/h5p')

    @app.route('/')
    def root():
        return jsonify({
            "service": "Edusphere Academic Backend",
            "framework": "Flask 3.x",
            "status": "online",
            "api_version": "v1.0",
            "docs": "/api/health",
        }), 200

    @app.route('/api/health')
    def health():
        return jsonify({
            "status": "healthy",
            "supabaseConnected": bool(supabase_client),
            "supabaseUrl": Config.SUPABASE_URL if Config.SUPABASE_URL else "Not Configured (Memory Store Active)",
            "port": Config.PORT,
            "services": [
                "auth",
                "notes-storage",
                "attendance-analytics",
                "doubts-queue",
                "courses-catalogue",
                "quizzes-certificates",
                "cooper-ai-tutor",
            ]
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"==================================================")
    print(f"🚀 EDUSPHERE FLASK BACKEND SERVER RUNNING")
    print(f"📡 API Root:    http://127.0.0.1:{port}/api")
    print(f"🩺 Health:      http://127.0.0.1:{port}/api/health")
    print(f"==================================================")
    app.run(host='0.0.0.0', port=port, debug=Config.DEBUG)
