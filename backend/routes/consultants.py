from flask import Blueprint, request, jsonify
from models import db, Consultant

consultants_bp = Blueprint('consultants', __name__)


@consultants_bp.route('/consultants', methods=['GET'])
def get_consultants():
    consultants = Consultant.query.order_by(Consultant.consultant_id.desc()).all()
    return jsonify([c.to_dict() for c in consultants]), 200


@consultants_bp.route('/consultants', methods=['POST'])
def create_consultant():
    data = request.get_json()
    name = data.get('name', '').strip()
    specialization = data.get('specialization', 'General').strip()
    contact = data.get('contact', '').strip()
    email = data.get('email', '').strip()
    bio = data.get('bio', '').strip()
    branch_id = data.get('branch_id')
    password = data.get('password', 'consultant123').strip()

    if not name or not contact:
        return jsonify({'error': 'Name and contact are required'}), 400

    if Consultant.query.filter_by(contact=contact).first():
        return jsonify({'error': 'A consultant with this contact already exists'}), 409

    consultant = Consultant(
        name=name,
        specialization=specialization,
        contact=contact,
        email=email if email else None,
        bio=bio if bio else None,
        branch_id=branch_id if branch_id else None,
        password=password
    )
    db.session.add(consultant)
    db.session.commit()
    return jsonify(consultant.to_dict()), 201


@consultants_bp.route('/consultants/<int:consultant_id>', methods=['PUT'])
def update_consultant(consultant_id):
    consultant = Consultant.query.get_or_404(consultant_id)
    data = request.get_json()
    consultant.name = data.get('name', consultant.name).strip()
    consultant.specialization = data.get('specialization', consultant.specialization).strip()
    consultant.contact = data.get('contact', consultant.contact).strip()
    consultant.email = data.get('email', consultant.email)
    consultant.bio = data.get('bio', consultant.bio)
    consultant.branch_id = data.get('branch_id', consultant.branch_id)
    if data.get('password'):
        consultant.password = data['password'].strip()
    db.session.commit()
    return jsonify(consultant.to_dict()), 200


@consultants_bp.route('/consultants/<int:consultant_id>', methods=['DELETE'])
def delete_consultant(consultant_id):
    consultant = Consultant.query.get_or_404(consultant_id)
    # Unlink any schedules – don't delete them
    from models import Schedule
    Schedule.query.filter_by(consultant_id=consultant_id).update({'consultant_id': None})
    db.session.delete(consultant)
    db.session.commit()
    return jsonify({'message': 'Consultant deleted'}), 200
