from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from models import db, User
from werkzeug.security import generate_password_hash
from sqlalchemy import text
from routes.auth import auth_bp
from routes.branches import branches_bp
from routes.staff import staff_bp
from routes.schedules import schedules_bp
from routes.payments import payments_bp
from routes.consultants import consultants_bp
from routes.public import public_bp
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'token-system-secret-key-2026'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///token_system.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SECURE'] = False # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = 86400 # 24 hours

CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(branches_bp, url_prefix='/api')
app.register_blueprint(staff_bp, url_prefix='/api')
app.register_blueprint(schedules_bp, url_prefix='/api')
app.register_blueprint(payments_bp, url_prefix='/api')
app.register_blueprint(consultants_bp, url_prefix='/api')
app.register_blueprint(public_bp, url_prefix='/api')


def init_db():
    """Initialize database and create default admin."""
    with app.app_context():
        db.create_all()

        # Safe migration: add customer_name column if not present
        try:
            with db.engine.connect() as conn:
                # First try to add customer_name
                try:
                    conn.execute(text("ALTER TABLE token ADD COLUMN customer_name VARCHAR(100)"))
                    conn.commit()
                except Exception:
                    pass 
                
                try:
                    conn.execute(text("ALTER TABLE token RENAME COLUMN patient_name TO customer_name"))
                    conn.commit()
                except Exception:
                    pass
        except Exception:
            pass

        # Safe migration: add new columns
        try:
            with db.engine.connect() as conn:
                # User related columns
                try: conn.execute(text("ALTER TABLE users ADD COLUMN created_at DATETIME"))
                except Exception: pass
                
                # Staff/Consultant link to User
                try: conn.execute(text("ALTER TABLE staff ADD COLUMN user_id INTEGER REFERENCES users(id)"))
                except Exception: pass
                try: conn.execute(text("ALTER TABLE consultant ADD COLUMN user_id INTEGER REFERENCES users(id)"))
                except Exception: pass

                # New Token fields
                try: conn.execute(text("ALTER TABLE token ADD COLUMN customer_age INTEGER"))
                except Exception: pass
                try: conn.execute(text("ALTER TABLE token ADD COLUMN customer_gender VARCHAR(20)"))
                except Exception: pass
                try: conn.execute(text("ALTER TABLE token ADD COLUMN reason VARCHAR(500)"))
                except Exception: pass
                try: conn.execute(text("ALTER TABLE token ADD COLUMN customer_phone VARCHAR(20)"))
                except Exception: pass
                try: conn.execute(text("ALTER TABLE token ADD COLUMN serving_started_at DATETIME"))
                except Exception: pass
                try: conn.execute(text("ALTER TABLE token ADD COLUMN completed_at DATETIME"))
                except Exception: pass

                # New Payment fields
                try: conn.execute(text("ALTER TABLE payment ADD COLUMN payment_method VARCHAR(50)"))
                except Exception: pass

                conn.commit()
        except Exception:
            pass

        # Create default admin if not exists
        # Check by role (lowercase) OR by primary identifier 'admin'
        admin = User.query.filter((User.role == 'admin') | (User.email == 'admin')).first()
        
        if not admin:
            admin = User(
                name='Administrator',
                email='admin',
                mobile='admin',
                role='admin',
                password_hash=generate_password_hash('admin123')
            )
            db.session.add(admin)
            db.session.commit()
            print('Default admin created: admin / admin123')
        else:
            # Ensure the existing admin has the correct attributes
            needs_commit = False
            if admin.role != 'admin':
                admin.role = 'admin'
                needs_commit = True
            if admin.email == 'admin@tokensystem.com':
                admin.email = 'admin'
                admin.mobile = 'admin'
                admin.password_hash = generate_password_hash('admin123')
                needs_commit = True
            
            if needs_commit:
                db.session.commit()
                print('Admin credentials updated to: admin / admin123')


if __name__ == '__main__':
    init_db()
    print('Starting Service Hub Backend on http://localhost:5050')
    app.run(debug=True, port=5050)
