from app import app
from models import db, User, Staff, Consultant
from werkzeug.security import generate_password_hash

def migrate():
    with app.app_context():
        print("Starting migration...")
        
        # Migrate Staff
        staffs = Staff.query.filter_by(user_id=None).all()
        for s in staffs:
            print(f"Migrating Staff: {s.staff_name} ({s.email})")
            # Check if user already exists by email OR mobile
            user = User.query.filter((User.email == s.email) | (User.mobile == s.contact)).first()
            
            if not user:
                user = User(
                    name=s.staff_name,
                    email=s.email,
                    mobile=s.contact,
                    password_hash=generate_password_hash(s.password or '1234'),
                    role='staff'
                )
                db.session.add(user)
                db.session.flush()
            else:
                # Update existing user to be staff if they are just a customer
                if user.role.lower() == 'customer' or user.role.lower() == 'user':
                    user.role = 'staff'
                print(f"Linked existing User {user.id} to Staff")
            
            s.user_id = user.id

        # Migrate Consultants
        consultants = Consultant.query.filter_by(user_id=None).all()
        for c in consultants:
            print(f"Migrating Consultant: {c.name} ({c.email})")
            user = User.query.filter((User.email == c.email) | (User.mobile == c.contact)).first()
            
            if not user:
                user = User(
                    name=c.name,
                    email=c.email or f"consultant_{c.consultant_id}@system.com",
                    mobile=c.contact,
                    password_hash=generate_password_hash(c.password or '1234'),
                    role='consultant'
                )
                db.session.add(user)
                db.session.flush()
            else:
                if user.role.lower() == 'customer' or user.role.lower() == 'user':
                    user.role = 'consultant'
                print(f"Linked existing User {user.id} to Consultant")

            c.user_id = user.id

        db.session.commit()
        print("Migration completed successfully!")

if __name__ == "__main__":
    migrate()
