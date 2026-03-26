from flask import Blueprint, request, jsonify, session
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Staff, Consultant, Schedule
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    return re.match(r'[^@]+@[^@]+\.[^@]+', email)

def validate_mobile(mobile):
    return re.match(r'^\d{10,15}$', mobile)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    mobile = data.get('mobile', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'Customer') # Default to Customer

    if not all([name, email, mobile, password]):
        return jsonify({'error': 'All fields are required'}), 400

    if not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400
    
    if not validate_mobile(mobile):
        return jsonify({'error': 'Invalid mobile number'}), 400

    if User.query.filter((User.email == email) | (User.mobile == mobile)).first():
        return jsonify({'error': 'Email or mobile already registered'}), 409

    user = User(
        name=name,
        email=email,
        mobile=mobile,
        role=role,
        password_hash=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Registration successful', 'user': user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = data.get('identifier', '').strip()
    password = data.get('password', '')
    expected_role = data.get('role') # optional role hint

    if not identifier or not password:
        return jsonify({'error': 'Identifier and password are required'}), 400

    user = User.query.filter((User.email == identifier) | (User.mobile == identifier)).first()
    
    if user and check_password_hash(user.password_hash, password):
        # Normalize role check to lowercase
        user_role = user.role.lower()
        if user_role == 'customer': user_role = 'user' # map customer to user for consistency

        if expected_role and user_role != expected_role.lower():
             return jsonify({'error': f'Unauthorized. This account is not a {expected_role}'}), 403
             
        login_user(user, remember=True)
        user_data = user.to_dict()
        user_data['role'] = user_role # ensure returned role is also normalized
        
        return jsonify({
            'message': 'Login successful',
            'user': user_data,
            'token': 'mock-session-token'
        }), 200

    return jsonify({'error': 'Invalid credentials'}), 401

@auth_bp.route('/admin-login', methods=['POST'])
def admin_login():
    data = request.get_json()
    data['role'] = 'admin'
    return login()

@auth_bp.route('/staff-login', methods=['POST'])
def staff_login():
    data = request.get_json()
    identifier = data.get('identifier', '').strip()
    password = data.get('password', '').strip()

    if not identifier or not password:
        return jsonify({'error': 'Identifier and password are required'}), 400

    # Look up in Staff table by email or contact
    staff = Staff.query.filter(
        (Staff.email == identifier) | (Staff.contact == identifier)
    ).first()

    if not staff or staff.password != password:
        return jsonify({'error': 'Invalid identifier or password'}), 401

    # Get or create a User row for this staff to support Flask-Login session
    user = User.query.filter((User.email == staff.email) | (User.mobile == staff.contact)).first()
    if not user and staff.email:
        try:
            user = User(
                name=staff.staff_name,
                email=staff.email,
                mobile=staff.contact,
                role='Staff',
                password_hash=generate_password_hash(password)
            )
            db.session.add(user)
            db.session.commit()
            staff.user_id = user.id
            db.session.commit()
        except Exception:
            db.session.rollback()
            user = User.query.filter((User.email == staff.email) | (User.mobile == staff.contact)).first()
    
    if user:
        login_user(user, remember=True)
        if not staff.user_id:
            staff.user_id = user.id
            db.session.commit()

    user_data = staff.to_dict()
    user_data['name'] = staff.staff_name # keep 'name' for frontend compatibility
    user_data['role'] = 'staff'

    return jsonify({
        'message': 'Login successful',
        'user': user_data,
        'token': f'staff-token-{staff.staff_id}'
    }), 200

@auth_bp.route('/consultant-login', methods=['POST'])
def consultant_login():
    data = request.get_json()
    identifier = data.get('identifier', '').strip()
    password = data.get('password', '').strip()

    if not identifier or not password:
        return jsonify({'error': 'Identifier and password are required'}), 400

    # Look up in Consultant table by email or contact
    consultant = Consultant.query.filter(
        (Consultant.email == identifier) | (Consultant.contact == identifier)
    ).first()

    if not consultant or consultant.password != password:
        return jsonify({'error': 'Invalid identifier or password'}), 401

    # Get or create a User row for this consultant to support Flask-Login session
    user = User.query.filter((User.email == consultant.email) | (User.mobile == consultant.contact)).first()
    if not user and consultant.email:
        # Create a shadow User row if it doesn't exist
        try:
            user = User(
                name=consultant.name,
                email=consultant.email,
                mobile=consultant.contact,
                role='Consultant',
                password_hash=generate_password_hash(password) # store hash for future
            )
            db.session.add(user)
            db.session.commit()
            consultant.user_id = user.id
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            # If still fails (e.g. race condition), try to fetch it again
            user = User.query.filter((User.email == consultant.email) | (User.mobile == consultant.contact)).first()
    
    if user:
        login_user(user, remember=True)
        # Update consultant with user_id if not already set
        if not consultant.user_id:
            consultant.user_id = user.id
            db.session.commit()

    user_data = {
        'id': consultant.consultant_id,
        'user_id': user.id if user else None,
        'name': consultant.name,
        'email': consultant.email,
        'contact': consultant.contact,
        'role': 'consultant',
        'specialization': consultant.specialization,
        'branch_id': consultant.branch_id,
        'status': consultant.status
    }

    return jsonify({
        'message': 'Login successful',
        'user': user_data,
        'token': f'consultant-token-{consultant.consultant_id}'
    }), 200

@auth_bp.route('/user-login', methods=['POST'])
def user_login():
    data = request.get_json()
    data['role'] = 'user'
    return login()

@auth_bp.route('/logout', methods=['POST'])
def logout():
    if current_user.is_authenticated:
        logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_me():
    if current_user.is_authenticated:
        user_data = current_user.to_dict()
        # Enrich user data with profile specifics
        if current_user.role == 'Staff':
            staff = Staff.query.filter_by(user_id=current_user.id).first()
            if staff:
                user_data['branch_id'] = staff.branch_id
        elif current_user.role == 'Consultant':
            consultant = Consultant.query.filter_by(user_id=current_user.id).first()
            if consultant:
                user_data['branch_id'] = consultant.branch_id
        
        return jsonify({
            'authenticated': True,
            'user': user_data
        }), 200
    return jsonify({'authenticated': False}), 200

# Legacy route compatibility or role-specific data fetches
@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    return get_me()

@auth_bp.route('/consultant-schedules', methods=['GET'])
@login_required
def consultant_schedules():
    # Allow access if they have a consultant profile, even if role is 'staff' or 'admin'
    consultant = Consultant.query.filter_by(user_id=current_user.id).first()
    
    if not consultant and current_user.role != 'Consultant':
        return jsonify({'error': 'Unauthorized. No Consultant profile linked to this account.'}), 403
    
    if not consultant:
        return jsonify({'error': 'Consultant profile not found for this user.'}), 404

    from datetime import date
    today = date.today().isoformat()
    schedules = Schedule.query.filter(
        Schedule.consultant_id == consultant.consultant_id,
        Schedule.date >= today
    ).order_by(Schedule.date, Schedule.start_time).all()
    return jsonify([s.to_dict() for s in schedules]), 200
