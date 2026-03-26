
import sqlite3
import os

db_path = r'c:\Users\LENOVO\Downloads\token_system_admin\token_system_admin\backend\instance\token_system.db'

if not os.path.exists(db_path):
    print(f"Database not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

email = 'mari@gmail.com'
mobile = '6379329182'

print(f"Checking for Email: {email} or Mobile: {mobile}")

cursor.execute("SELECT * FROM users WHERE email=? OR mobile=?", (email, mobile))
rows = cursor.fetchall()

if rows:
    print(f"Found {len(rows)} matching users:")
    for row in rows:
        print(row)
else:
    print("No matching users found.")

conn.close()
