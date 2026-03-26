from app import app, db
from models import Schedule, Token
import traceback

def test_create_schedule():
    with app.app_context():
        try:
            print("Attempting to create a test schedule...")
            # Check if there is at least one branch
            from models import Branch
            branch = Branch.query.first()
            if not branch:
                print("No branch found! Creating dummy branch...")
                branch = Branch(branch_name="Test Branch", location="Test Loc", contact="123")
                db.session.add(branch)
                db.session.commit()
            
            schedule = Schedule(
                branch_id=branch.branch_id,
                date='2026-03-14',
                start_time='09:00',
                end_time='10:00',
                token_count=1,
                fees=100.0,
                service_name='Test Service',
                token_series='T'
            )
            db.session.add(schedule)
            db.session.flush()
            
            print(f"Created schedule ID: {schedule.schedule_id}")
            
            token = Token(
                schedule_id=schedule.schedule_id,
                token_number='T1',
                time_slot='09:00 - 10:00',
                status='Available'
            )
            db.session.add(token)
            db.session.commit()
            print("Successfully created schedule and token!")
            
        except Exception as e:
            db.session.rollback()
            print("\nError caught:")
            print(e)
            print("\nTraceback:")
            traceback.print_exc()

if __name__ == "__main__":
    test_create_schedule()
