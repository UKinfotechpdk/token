import sqlite3
import os
from datetime import datetime

db_path = r'c:\Users\LENOVO\Downloads\token_system_admin\token_system_admin\backend\instance\token_system.db'

def inspect_users():
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        print(f"Current Date: {datetime.now().strftime('%Y-%m-%d')}")
        print(f"Current Time: {datetime.now().strftime('%H:%M')}")
        print("\nSchedules:")
        cursor.execute("SELECT schedule_id, branch_id, date, start_time, end_time, service_name FROM schedule;")
        schedules = cursor.fetchall()
        print("ID | Branch | Date | Start | End | Service")
        print("-" * 60)
        for s in schedules:
            print(f"{s[0]} | {s[1]} | {s[2]} | {s[3]} | {s[4]} | {s[5]}")

        print("\nToken Availability (Available count per schedule):")
        cursor.execute("SELECT schedule_id, COUNT(*) FROM token WHERE status='Available' GROUP BY schedule_id;")
        tokens = cursor.fetchall()
        print("Schedule ID | Available Tokens")
        print("-" * 30)
        for t in tokens:
            print(f"{t[0]} | {t[1]}")
        conn.close()
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    inspect_users()
