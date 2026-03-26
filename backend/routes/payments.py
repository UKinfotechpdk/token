from flask import Blueprint, request, jsonify, send_file
from models import db, Payment, Token, Schedule, Branch
from datetime import datetime
import csv
import io

payments_bp = Blueprint('payments', __name__)


@payments_bp.route('/payments', methods=['GET'])
def get_payments():
    query = Payment.query

    # Filter by branch
    branch_id = request.args.get('branch_id')
    if branch_id:
        query = query.join(Token).join(Schedule).filter(Schedule.branch_id == int(branch_id))

    # Filter by date
    date = request.args.get('date')
    if date:
        query = query.filter(Payment.payment_date == date)

    # Filter by month
    month = request.args.get('month')
    if month:
        query = query.filter(Payment.payment_date.like(f'{month}%'))

    payments = query.order_by(Payment.payment_id.desc()).all()
    return jsonify([p.to_dict() for p in payments]), 200


@payments_bp.route('/payments', methods=['POST'])
def create_payment():
    data = request.get_json()
    token_id = data['token_id']

    # Check if payment already exists for this token
    existing = Payment.query.filter_by(token_id=token_id).first()
    if existing:
        return jsonify({'error': 'Payment already exists for this token'}), 409

    payment = Payment(
        token_id=token_id,
        amount=float(data['amount']),
        payment_date=data.get('payment_date', datetime.now().strftime('%Y-%m-%d')),
        payment_status=data.get('payment_status', 'Completed')
    )
    db.session.add(payment)

    # Update token status to Booked
    token = Token.query.get(token_id)
    if token:
        token.status = 'Booked'

    db.session.commit()
    return jsonify(payment.to_dict()), 201


@payments_bp.route('/payments/<int:payment_id>', methods=['PUT'])
def update_payment(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    data = request.get_json()
    payment.amount = data.get('amount', payment.amount)
    payment.payment_status = data.get('payment_status', payment.payment_status)
    payment.payment_date = data.get('payment_date', payment.payment_date)
    db.session.commit()
    return jsonify(payment.to_dict()), 200


@payments_bp.route('/payments/<int:payment_id>', methods=['DELETE'])
def delete_payment(payment_id):
    payment = Payment.query.get_or_404(payment_id)
    db.session.delete(payment)
    db.session.commit()
    return jsonify({'message': 'Payment deleted successfully'}), 200


@payments_bp.route('/payments/report/csv', methods=['GET'])
def download_csv():
    query = Payment.query
    if branch_id:
        query = query.join(Token).join(Schedule)
        if branch_id:
            query = query.filter(Schedule.branch_id == int(branch_id))

    if date:
        query = query.filter(Payment.payment_date == date)
    if month:
        query = query.filter(Payment.payment_date.like(f'{month}%'))

    payments = query.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['Payment ID', 'Token Number', 'Branch', 'Amount', 'Payment Date', 'Status'])

    for p in payments:
        row = p.to_dict()
        writer.writerow([
            row['payment_id'],
            row['token_number'],
            row['branch_name'],
            row['amount'],
            row['payment_date'],
            row['payment_status']
        ])

    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'payment_report_{datetime.now().strftime("%Y%m%d")}.csv'
    )


@payments_bp.route('/payments/summary', methods=['GET'])
def payment_summary():
    """Get summary statistics for dashboard."""
    total_payments = Payment.query.count()
    total_amount = db.session.query(db.func.sum(Payment.amount)).scalar() or 0
    completed = Payment.query.filter_by(payment_status='Completed').count()
    pending = Payment.query.filter_by(payment_status='Pending').count()

    return jsonify({
        'total_payments': total_payments,
        'total_amount': round(total_amount, 2),
        'completed': completed,
        'pending': pending
    }), 200
