from app import app, db
from models import Consultant
import sqlite3
import os

with app.app_context():
    conn = sqlite3.connect('instance/token_system.db')
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(consultant);")
    columns = cursor.fetchall()
    print("Columns in consultant table:")
    for col in columns:
        print(f"Index: {col[0]}, Name: {col[1]}, Type: {col[2]}, Nullable: {col[3]}, Default: {col[4]}, PK: {col[5]}")
    conn.close()
