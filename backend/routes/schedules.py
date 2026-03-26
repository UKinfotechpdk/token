from flask import Blueprint, request, jsonify
from flask_login import current_user, login_required
from models import db, Schedule, Token, TokenConfig, Payment, Staff
from datetime import datetime, timedelta

schedules_bp = Blueprint('schedules', __name__)


def get_or_create_token_config():
    """Get or create the singleton TokenConfig record."""
    config = TokenConfig.query.first()
    if not config:
        config = TokenConfig(current_series='A', number_format='plain', prefix='')
        db.session.add(config)
        db.session.commit()
    return config


def get_next_series():
    """Determine the next available token series letter by checking existing schedules."""
    # Get all used series letters
    used_series = db.session.query(Schedule.token_series).distinct().all()
    used_letters = set(s[0] for s in used_series if s[0])

    if not used_letters:
        return 'A'

    # Find the highest letter used and return the next one
    highest = max(used_letters)
    next_letter = chr(ord(highest) + 1)

    # Wrap around if we go past Z
    if next_letter > 'Z':
        next_letter = 'A'

    return next_letter


def format_token_number(series, number, config):
    """Format the token number based on config settings."""
    prefix = config.prefix if config.prefix else ''
    if config.number_format == 'padded':
        return f"{prefix}{series}{number:02d}"
    return f"{prefix}{series}{number}"


def generate_time_slots(start_time_str, end_time_str, token_count):
    """Generate evenly spaced time slots between start and end time."""
    start = datetime.strptime(start_time_str, '%H:%M')
    end = datetime.strptime(end_time_str, '%H:%M')
    total_minutes = (end - start).seconds // 60
    slot_duration = total_minutes // token_count if token_count > 0 else 0

    slots = []
    for i in range(token_count):
        slot_start = start + timedelta(minutes=i * slot_duration)
        slot_end = slot_start + timedelta(minutes=slot_duration)
        slots.append(f"{slot_start.strftime('%H:%M')} - {slot_end.strftime('%H:%M')}")
    return slots


@schedules_bp.route('/schedules', methods=['GET'])
def get_schedules():
    schedules = Schedule.query.order_by(Schedule.schedule_id.desc()).all()
    return jsonify([s.to_dict() for s in schedules]), 200


@schedules_bp.route('/staff-schedules', methods=['GET'])
@login_required
def get_staff_schedules():
    """STRICT AUTHORIZATION: Only return schedules for the staff's branch."""
    staff = Staff.query.filter_by(user_id=current_user.id).first()
    if not staff:
        return jsonify({'error': 'Unauthorized. Staff profile not found.'}), 403

    from datetime import date
    today = date.today().isoformat()
    
    schedules = Schedule.query.filter(
        Schedule.branch_id == staff.branch_id,
        Schedule.date >= today
    ).order_by(Schedule.date, Schedule.start_time).all()
    
    return jsonify([s.to_dict() for s in schedules]), 200


@schedules_bp.route('/schedules/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)
    data = schedule.to_dict()
    data['tokens'] = [t.to_dict() for t in schedule.tokens]
    return jsonify(data), 200


@schedules_bp.route('/schedules/next-series', methods=['GET'])
def get_next_series_endpoint():
    """Return the next available token series and current config."""
    config = get_or_create_token_config()
    next_series = get_next_series()

    # Get all used series with their schedule count
    used = db.session.query(
        Schedule.token_series,
        db.func.count(Schedule.schedule_id)
    ).group_by(Schedule.token_series).all()

    used_series = [{'letter': s[0], 'count': s[1]} for s in used]

    return jsonify({
        'next_series': next_series,
        'used_series': used_series,
        'config': config.to_dict(),
        'preview': format_token_number(next_series, 1, config)
    }), 200


@schedules_bp.route('/schedules', methods=['POST'])
def create_schedule():
    data = request.get_json()
    branch_id = data['branch_id']
    date = data['date']
    start_time = data['start_time']
    end_time = data['end_time']
    token_count = int(data.get('tokens', data.get('token_count', 0)))
    fees = float(data.get('fees', 0))
    service_name = data.get('service_name', '')
    provider_name = data.get('provider_name', '')

    # Determine token series: use custom if provided, otherwise auto-detect
    custom_series = data.get('token_series', '').strip().upper()
    config = get_or_create_token_config()

    if custom_series and len(custom_series) == 1 and custom_series.isalpha():
        token_series = custom_series
    else:
        token_series = get_next_series()

    # Check for overlapping schedules matching branch, date, AND consultant
    # Only block if it's the SAME consultant at the same branch/time
    overlap_query = Schedule.query.filter_by(
        branch_id=branch_id,
        date=date
    )
    
    consultant_id = data.get('consultant_id')
    
    # Attempt to resolve consultant_id from provider_name if missing
    if not consultant_id and provider_name:
        from models import Consultant
        c = Consultant.query.filter_by(name=provider_name).first()
        if c: 
            consultant_id = c.consultant_id

    if consultant_id:
        consultant_id = int(consultant_id)
        overlap_query = overlap_query.filter_by(consultant_id=consultant_id)

    existing = overlap_query.all()

    for sched in existing:
        if not (end_time <= sched.start_time or start_time >= sched.end_time):
            consultant_msg = f" for consultant {sched.consultant.name}" if sched.consultant else ""
            return jsonify({
                'error': f'Schedule overlaps with existing schedule ID {sched.schedule_id}{consultant_msg} '
                         f'({sched.start_time} - {sched.end_time})'
            }), 409

    schedule = Schedule(
        branch_id=branch_id,
        consultant_id=consultant_id,
        date=date,
        start_time=start_time,
        end_time=end_time,
        token_count=token_count,
        fees=fees,
        service_name=service_name,
        token_series=token_series
    )
    db.session.add(schedule)
    db.session.flush()

    # Auto-generate tokens with series prefix
    time_slots = generate_time_slots(start_time, end_time, token_count)
    for i, slot in enumerate(time_slots, 1):
        token_num = format_token_number(token_series, i, config)
        token = Token(
            schedule_id=schedule.schedule_id,
            token_number=token_num,
            time_slot=slot,
            status='Available'
        )
        db.session.add(token)

    # Update the config's current_series to this series
    config.current_series = token_series
    db.session.commit()

    result = schedule.to_dict()
    result['tokens'] = [t.to_dict() for t in schedule.tokens]
    return jsonify(result), 201


@schedules_bp.route('/schedules/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)
    db.session.delete(schedule)
    db.session.commit()
    return jsonify({'message': 'Schedule deleted successfully'}), 200


@schedules_bp.route('/tokens/<int:token_id>/status', methods=['PUT'])
def update_token_status(token_id):
    # Use with_for_update to lock the row and prevent race conditions
    token = Token.query.with_for_update().get_or_404(token_id)
    data = request.get_json()
    new_status = data.get('status', token.status)
    
    # Concurrency Check: Prevent overwriting a token that was already booked by someone else
    if new_status == 'Booked' and token.status != 'Available':
        db.session.rollback()
        return jsonify({'error': 'Token has already been booked or is no longer available.', 'current_status': token.status}), 409

    if new_status == 'Serving' and token.status != 'Serving':
        token.serving_started_at = datetime.utcnow()
    elif new_status == 'Completed' and token.status != 'Completed':
        token.completed_at = datetime.utcnow()

    token.status = new_status

    # Save customer metadata if provided
    if 'customer_name' in data:
        token.customer_name = data['customer_name']
    if 'customer_age' in data:
        token.customer_age = data['customer_age']
    if 'customer_gender' in data:
        token.customer_gender = data['customer_gender']
    if 'customer_phone' in data:
        token.customer_phone = data['customer_phone']
    if 'reason' in data:
        token.reason = data['reason']

    # Auto-Revenue Tracking: If Booked or Completed, ensure a Payment record exists
    if new_status in ['Booked', 'Completed']:
        existing_payment = Payment.query.filter_by(token_id=token_id).first()
        payment_method = data.get('payment_method', 'Cash')
        
        if not existing_payment:
            payment = Payment(
                token_id=token_id,
                amount=token.schedule.fees,
                payment_date=token.schedule.date,
                payment_status='Pending' if payment_method == 'UPI' else 'Completed',
                payment_method=payment_method
            )
            db.session.add(payment)
        else:
            if 'payment_method' in data:
                existing_payment.payment_method = data['payment_method']
            if 'payment_status' in data:
                existing_payment.payment_status = data['payment_status']

    db.session.commit()
    return jsonify(token.to_dict()), 200


@schedules_bp.route('/schedules/<int:schedule_id>/tokens', methods=['GET'])
def get_tokens(schedule_id):
    tokens = Token.query.filter_by(schedule_id=schedule_id).all()
    return jsonify([t.to_dict() for t in tokens]), 200


# ========================================
# Token Config API
# ========================================

@schedules_bp.route('/token-config', methods=['GET'])
def get_token_config():
    config = get_or_create_token_config()
    next_series = get_next_series()
    return jsonify({
        'config': config.to_dict(),
        'next_series': next_series,
        'preview': format_token_number(next_series, 1, config)
    }), 200


@schedules_bp.route('/token-config', methods=['PUT'])
def update_token_config():
    """Allow admin to customize token series settings."""
    config = get_or_create_token_config()
    data = request.get_json()

    if 'current_series' in data:
        series = data['current_series'].strip().upper()
        if len(series) == 1 and series.isalpha():
            config.current_series = series

    if 'number_format' in data:
        if data['number_format'] in ('plain', 'padded'):
            config.number_format = data['number_format']

    if 'prefix' in data:
        config.prefix = data['prefix'].strip()[:10]

    db.session.commit()
    next_series = get_next_series()
    return jsonify({
        'config': config.to_dict(),
        'next_series': next_series,
        'preview': format_token_number(next_series, 1, config)
    }), 200
