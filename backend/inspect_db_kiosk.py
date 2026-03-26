from app import app
from models import db, Branch, Schedule, Token
from datetime import datetime

with app.app_context():
    today = datetime.now().strftime('%Y-%m-%d')
    now_time = datetime.now().strftime('%H:%M')
    
    print(f"Current Date: {today}, Time: {now_time}")
    
    branches = Branch.query.all()
    print(f"Total Branches: {len(branches)}")
    for b in branches:
        print(f"Branch: {b.branch_name} (ID: {b.branch_id}, Status: {b.status})")
        
        schedules = Schedule.query.filter_by(branch_id=b.branch_id).all()
        print(f"  Total Schedules: {len(schedules)}")
        for s in schedules:
            tokens = Token.query.filter_by(schedule_id=s.schedule_id).all()
            avail = [t for t in tokens if t.status == 'Available']
            print(f"    Schedule {s.schedule_id}: {s.date} {s.start_time}-{s.end_time}, Tokens: {len(tokens)} (Available: {len(avail)})")
            
            # Check validity match
            is_valid = (s.date > today) or (s.date == today and s.end_time >= now_time)
            print(f"      Is Valid (Time-wise): {is_valid}")
