from app import app
from models import db, Schedule, Branch, Consultant, Token
from datetime import datetime
import os

def create_test_data():
    with app.app_context():
        # Ensure a branch and consultant exist
        branch = Branch.query.first()
        if not branch:
            branch = Branch(branch_name="Main Branch", location="Downtown", contact="123")
            db.session.add(branch)
        
        consultant = Consultant.query.first()
        if not consultant:
            consultant = Consultant(name="John Smith", specialization="General", contact="999", password="123")
            db.session.add(consultant)
        
        db.session.commit()
        
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Check if schedule exists for today
        sched = Schedule.query.filter_by(date=today, branch_id=branch.branch_id).first()
        if not sched:
            print(f"Creating schedule for {today}")
            sched = Schedule(
                branch_id=branch.branch_id,
                consultant_id=consultant.consultant_id,
                date=today,
                start_time="09:00",
                end_time="17:00",
                token_count=10,
                fees=100.0,
                service_name="Test Service",
                token_series="A"
            )
            db.session.add(sched)
            db.session.commit()
            
            # Add a few tokens
            for i in range(1, 5):
                t = Token(
                    schedule_id=sched.schedule_id,
                    token_number=f"A{i}",
                    time_slot=f"09:0{i} - 09:1{i}",
                    status="Available"
                )
                db.session.add(t)
            db.session.commit()
        else:
            print(f"Schedule for {today} already exists.")

if __name__ == "__main__":
    create_test_data()
