from flask_login import current_user, login_required
from flask import Blueprint, request, jsonify
from models import db, Branch, Consultant, Schedule, Token, Payment
from datetime import datetime

public_bp = Blueprint('public', __name__)

@public_bp.route('/public/branches', methods=['GET'])
def get_public_branches():
    today = datetime.now().strftime('%Y-%m-%d')
    now_time = datetime.now().strftime('%H:%M')
    
    # Show all active branches that have a schedule today (current OR upcoming)
    active_branches = Branch.query.filter_by(status='Active').all()
    results = []
    
    for b in active_branches:
        # Any schedule today (running now or later in the day)
        any_schedule = Schedule.query.filter(
            Schedule.branch_id == b.branch_id,
            Schedule.date == today,
            Schedule.end_time >= now_time  # not yet ended
        ).first()
        
        if any_schedule:
            # Check for at least one available token in today's schedules
            has_tokens = db.session.query(Token).join(Schedule).filter(
                Schedule.branch_id == b.branch_id,
                Schedule.date == today,
                Schedule.end_time >= now_time,
                Token.status == 'Available'
            ).first()
            
            if has_tokens:
                # Attach schedule info so frontend can show opening time
                b_dict = b.to_dict()
                b_dict['opening_hours'] = f"{any_schedule.start_time} - {any_schedule.end_time}"
                results.append(b_dict)
                
    return jsonify(results), 200

@public_bp.route('/public/services', methods=['GET'])
def get_services():
    # Only show specializations with LIVE schedules
    today = datetime.now().strftime('%Y-%m-%d')
    now_time = datetime.now().strftime('%H:%M')
    
    active_specs = db.session.query(Consultant.specialization).distinct().join(Schedule).filter(
        Consultant.status == 'Active',
        Schedule.date == today,
        Schedule.start_time <= now_time,
        Schedule.end_time >= now_time
    ).all()
    
    services = [s[0] for s in active_specs if s[0]]
    return jsonify(services), 200

@public_bp.route('/public/schedules', methods=['GET'])
def get_public_schedules():
    branch_id = request.args.get('branch_id')
    today = datetime.now().strftime('%Y-%m-%d')
    now_time = datetime.now().strftime('%H:%M')
    
    # Show all today's schedules that haven't ended yet (live OR upcoming)
    query = Schedule.query.filter(
        Schedule.date == today,
        Schedule.end_time >= now_time  # not yet ended
    )
    
    if branch_id and branch_id != 'undefined':
        query = query.filter_by(branch_id=branch_id)
        
    schedules = query.order_by(Schedule.start_time.asc()).all()
    results = []
    for s in schedules:
        available_tokens = Token.query.filter_by(schedule_id=s.schedule_id, status='Available').all()
        
        # Only show schedules that still have capacity
        if len(available_tokens) > 0:
            is_live = s.start_time <= now_time
            user_token_count = 0
            if current_user.is_authenticated:
                user_token_count = Token.query.filter(
                    Token.schedule_id == s.schedule_id,
                    Token.user_id == current_user.id,
                    Token.status.in_(['Booked', 'Paid', 'Completed', 'Serving'])
                ).count()

            results.append({
                'schedule_id': s.schedule_id,
                'title': s.service_name or "General Service",
                'date': s.date,
                'start_time': s.start_time,
                'end_time': s.end_time,
                'is_live': is_live,
                'available_tokens': len(available_tokens),
                'user_token_count': user_token_count,
                'fee': s.fees,
                'branch_name': s.branch.branch_name if s.branch else "Main Branch",
                'available_slots': sorted(list(set([t.time_slot for t in available_tokens])))
            })
        
    return jsonify(results), 200

@public_bp.route('/public/token/book', methods=['POST'])
@login_required
def book_token():
    """Initial booking registration with auto-slot assignment."""
    data = request.get_json()
    schedule_id = data.get('schedule_id')
    time_slot = data.get('time_slot') # Optional
    
    if not schedule_id:
        return jsonify({'error': 'Missing schedule_id'}), 400
        
    # Enforce 2 tokens per user per schedule limit
    existing_tokens_count = Token.query.filter(
        Token.schedule_id == schedule_id,
        Token.user_id == current_user.id,
        Token.status.in_(['Booked', 'Paid', 'Completed', 'Serving'])
    ).count()

    if existing_tokens_count >= 2:
        return jsonify({
            'error': 'You can only book a maximum of 2 tokens for this schedule.'
        }), 403

    # Transactional Query with Row-Level Locking
    query = Token.query.with_for_update().filter_by(
        schedule_id=schedule_id,
        status='Available'
    )
    
    if time_slot:
        query = query.filter_by(time_slot=time_slot)
    
    # Order by token_id to ensure sequential assignment
    token = query.order_by(Token.token_id.asc()).first()
    
    if not token:
        db.session.rollback()
        return jsonify({'error': 'No tokens available for this session'}), 409
        
    token.customer_name = current_user.name
    token.user_id = current_user.id
    token.status = 'Booked' 
    
    payment = Payment(
        token_id=token.token_id,
        amount=token.schedule.fees,
        payment_date=datetime.now().strftime('%Y-%m-%d'),
        payment_status='Pending',
        payment_method='UPI'
    )
    db.session.add(payment)
    db.session.commit()
    
    return jsonify(token.to_dict()), 201

@public_bp.route('/public/my-tokens', methods=['GET'])
@login_required
def get_my_tokens():
    tokens = Token.query.filter_by(user_id=current_user.id).order_by(Token.token_id.desc()).all()
    return jsonify([t.to_dict() for t in tokens]), 200

@public_bp.route('/public/token-status/<int:schedule_id>', methods=['GET'])
def get_token_status(schedule_id):
    # Current running token (e.g., status is 'Calling' or 'In Progress' if we had those, else oldest 'Booked' being served)
    # Since we only have 'Available' and 'Booked', 'Staff' usually marks 'Completed'.
    # Let's assume 'Calling' is a status we might use or just the first 'Booked' token.
    
    tokens = Token.query.filter_by(schedule_id=schedule_id).all()
    booked_tokens = [t for t in tokens if t.status == 'Booked']
    completed_tokens = [t for t in tokens if t.status == 'Completed']
    
    current = None
    if completed_tokens:
        # Last completed might be the one just served
        current = completed_tokens[-1].token_number
    elif booked_tokens:
        current = booked_tokens[0].token_number
        
    next_token = booked_tokens[1].token_number if len(booked_tokens) > 1 else "None"
    
    return jsonify({
        'current_token': current or "None",
        'next_token': next_token,
        'waiting_count': len(booked_tokens)
    }), 200
@public_bp.route('/public/status-check/<int:schedule_id>', methods=['GET'])
def get_status_summary(schedule_id):
    """Lightweight endpoint for frequent polling."""
    tokens = Token.query.filter_by(schedule_id=schedule_id).all()
    booked = [t for t in tokens if t.status == 'Booked']
    completed = [t for t in tokens if t.status == 'Completed']
    serving = [t for t in tokens if t.status == 'Serving'] # Assuming we add 'Serving'
    
    current = serving[0].token_number if serving else (completed[-1].token_number if completed else "None")
    
    return jsonify({
        'current': current,
        'waiting': len(booked),
        'timestamp': datetime.now().strftime('%H:%M:%S')
    }), 200

@public_bp.route('/public/board/<int:branch_id>', methods=['GET'])
def get_branch_board(branch_id):
    today = datetime.now().strftime('%Y-%m-%d')
    schedules = Schedule.query.filter_by(branch_id=branch_id, date=today).all()
    
    board_data = []
    for s in schedules:
        tokens = Token.query.filter_by(schedule_id=s.schedule_id).all()
        booked = [t for t in tokens if t.status == 'Booked']
        completed = [t for t in tokens if t.status == 'Completed']
        
        current = "None"
        if completed:
            current = completed[-1].token_number
        elif booked:
            current = booked[0].token_number
            
        board_data.append({
            'consultant_name': s.consultant.name if s.consultant else 'Unknown',
            'specialization': s.consultant.specialization if s.consultant else 'General',
            'service': s.service_name or "General",
            'current_token': current,
            'status': 'Active' if booked else 'Idle'
        })
        
    return jsonify(board_data), 200

# ========================================
# Payment & PDF Booking Integration
# ========================================

import uuid
import hashlib
import hmac
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A6
from flask import send_file

@public_bp.route('/public/create-payment-order', methods=['POST'])
@login_required
def create_payment_order():
    """Simulated Razorpay Order Creation."""
    data = request.get_json()
    schedule_id = data.get('schedule_id')
    time_slot = data.get('time_slot')
    
    schedule = Schedule.query.get_or_404(schedule_id)
    
    # Check if slot exists and is available
    token = Token.query.filter_by(schedule_id=schedule_id, time_slot=time_slot, status='Available').first()
    if not token:
        return jsonify({'error': 'Selected slot is no longer available'}), 409
        
    # Generate a mock Razorpay order_id
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    
    # In a real app, we might reserve the token for 5-10 mins here
    # For now, we just return the order info
    return jsonify({
        'order_id': order_id,
        'amount': schedule.fees * 100, # Razorpay expects paise
        'currency': 'INR',
        'schedule_id': schedule_id,
        'time_slot': time_slot
    }), 200

@public_bp.route('/public/verify-payment', methods=['POST'])
@login_required
def verify_payment():
    """Simulated Payment Verification & Token Activation."""
    data = request.get_json()
    token_id = data.get('token_id')
    
    # We now strictly use token_id as it was reserved in the 'book' step
    if not token_id:
        return jsonify({'error': 'Missing token_id'}), 400
        
    token = Token.query.with_for_update().get(token_id)
    
    if not token or token.user_id != current_user.id:
        db.session.rollback()
        return jsonify({'error': 'Invalid token reservation'}), 404
        
    if token.status == 'Paid': # Already processed
         return jsonify({'success': True, 'token': token.to_dict()}), 200

    payment = Payment.query.filter_by(token_id=token_id).first()
    if not payment:
        payment = Payment(token_id=token_id, amount=token.schedule.fees)
        
    payment.payment_status = 'Paid'
    payment.payment_method = 'Razorpay'
    payment.payment_date = datetime.now().strftime('%Y-%m-%d')
    
    db.session.add(payment)
    db.session.commit()
    
    return jsonify({'success': True, 'token': token.to_dict()}), 200

@public_bp.route('/public/token/<int:token_id>/download', methods=['GET'])
@login_required
def download_token_pdf(token_id):
    token = Token.query.get_or_404(token_id)
    
    # Check if user owns the token and is paid
    if token.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
        
    payment = Payment.query.filter_by(token_id=token_id, payment_status='Paid').first()
    if not payment and token.schedule.fees > 0:
         return jsonify({'error': 'Payment required for download'}), 402
         
    # Generate PDF
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=A6)
    width, height = A6
    
    p.setFont("Helvetica-Bold", 16)
    p.drawString(40, height - 50, "BOOKING RECEIPT")
    
    p.setFont("Helvetica", 10)
    p.drawString(40, height - 80, f"Token Number: {token.token_number}")
    p.drawString(40, height - 100, f"Customer Name: {token.customer_name}")
    p.drawString(40, height - 120, f"Date: {token.schedule.date}")
    p.drawString(40, height - 140, f"Assigned Slot: {token.time_slot}")
    p.drawString(40, height - 160, f"Service Type: {token.schedule.service_name or 'General'}")
    p.drawString(40, height - 180, f"Service Centre: {token.schedule.branch.branch_name}")
    
    p.line(40, height - 200, width - 40, height - 200)
    p.drawString(40, height - 220, f"Amount Paid: INR {payment.amount if payment else 0.0}")
    p.drawString(40, height - 240, f"Payment ID: {razorpay_payment_id[:10] if 'razorpay_payment_id' in locals() else 'RAZORPAY_SIM'}")
    
    p.setFont("Helvetica-Oblique", 8)
    p.drawString(40, 50, "Please arrive 10 minutes before your slot.")
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"token_{token.token_number}.pdf",
        mimetype='application/pdf'
    )
