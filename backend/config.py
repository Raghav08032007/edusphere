import os
from pathlib import Path
from dotenv import load_dotenv

# Load root .env.local and .env
root_dir = Path(__file__).resolve().parent.parent
load_dotenv(root_dir / '.env.local')
load_dotenv(root_dir / '.env')
load_dotenv(Path(__file__).resolve().parent / '.env')

class Config:
    PORT = int(os.getenv('PORT', 5000))
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ('true', '1', 't')
    
    # Supabase Configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
    SUPABASE_KEY = (
        os.getenv('SUPABASE_SERVICE_KEY') or
        os.getenv('SUPABASE_ANON_KEY') or
        os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or
        os.getenv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', '')
    )
    
    JWT_SECRET = os.getenv('JWT_SECRET', 'edusphere-academic-jwt-secret-key-2026')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000').split(',')
