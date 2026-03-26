from app import app
from routes.public import get_public_branches
import json

with app.app_context():
    response, status_code = get_public_branches()
    print(f"Status: {status_code}")
    print(f"Data: {json.dumps(response.json, indent=2)}")
