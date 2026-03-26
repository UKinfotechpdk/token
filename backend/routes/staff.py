from flask import Blueprint, request, jsonify
from models import db, Staff

staff_bp = Blueprint('staff', __name__)


@staff_bp.route('/staff', methods=['GET'])
def get_staff():
    staff_list = Staff.query.order_by(Staff.staff_id.desc()).all()
    return jsonify([s.to_dict() for s in staff_list]), 200


@staff_bp.route('/staff/<int:staff_id>', methods=['GET'])
def get_staff_member(staff_id):
    staff = Staff.query.get_or_404(staff_id)
    return jsonify(staff.to_dict()), 200


@staff_bp.route('/staff', methods=['POST'])
def create_staff():
    data = request.get_json()
    staff = Staff(
        staff_name=data['staff_name'],
        contact=data['contact'],
        email=data.get('email'),
        role=data.get('role', 'Staff'),
        status=data.get('status', 'Active'),
        password=data['password'],
        branch_id=data.get('branch_id')
    )
    db.session.add(staff)
    db.session.commit()
    return jsonify(staff.to_dict()), 201


@staff_bp.route('/staff/<int:staff_id>', methods=['PUT'])
def update_staff(staff_id):
    staff = Staff.query.get_or_404(staff_id)
    data = request.get_json()
    staff.staff_name = data.get('staff_name', staff.staff_name)
    staff.contact = data.get('contact', staff.contact)
    staff.email = data.get('email', staff.email)
    staff.role = data.get('role', staff.role)
    staff.status = data.get('status', staff.status)
    staff.branch_id = data.get('branch_id', staff.branch_id)
    if data.get('password'):
        staff.password = data['password']
    db.session.commit()
    return jsonify(staff.to_dict()), 200


@staff_bp.route('/staff/<int:staff_id>', methods=['DELETE'])
def delete_staff(staff_id):
    staff = Staff.query.get_or_404(staff_id)
    db.session.delete(staff)
    db.session.commit()
    return jsonify({'message': 'Staff deleted successfully'}), 200
