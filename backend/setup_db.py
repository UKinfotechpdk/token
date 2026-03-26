from app import app, init_db
from models import db, User, Branch
from werkzeug.security import generate_password_hash

def setup():
    with app.app_context():
        # This will call db.create_all() inside app.py's init_db
        init_db()
        
        # Create a sample branch if none exist
        if not Branch.query.first():
            branch = Branch(
                branch_name='Main Service Hub',
                location='City Hall Area',
                contact='1234567890',
                status='Active'
            )
            db.session.add(branch)
            print("Sample branch created.")
            
        db.session.commit()
        print("Database initialized successfully.")

if __name__ == '__main__':
    setup()
