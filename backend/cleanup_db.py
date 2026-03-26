from models import db, Schedule, Branch
from app import app

with app.app_context():
    # Update Branch names
    branches = Branch.query.all()
    for b in branches:
        if 'hospital' in (b.branch_name or '').lower():
            b.branch_name = 'Main Service Centre'
    
    # Update Schedule service names
    schedules = Schedule.query.all()
    for s in schedules:
        if 'nurology' in (s.service_name or '').lower():
            s.service_name = 'General Support'
            
    db.session.commit()
    print("Database cleanup complete.")
