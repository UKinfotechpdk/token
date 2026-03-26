from flask import Blueprint, request, jsonify
from models import db, Branch

branches_bp = Blueprint('branches', __name__)


@branches_bp.route('/branches', methods=['GET'])
def get_branches():
    branches = Branch.query.order_by(Branch.branch_id.desc()).all()
    return jsonify([b.to_dict() for b in branches]), 200


@branches_bp.route('/branches/<int:branch_id>', methods=['GET'])
def get_branch(branch_id):
    branch = Branch.query.get_or_404(branch_id)
    return jsonify(branch.to_dict()), 200


@branches_bp.route('/branches', methods=['POST'])
def create_branch():
    data = request.get_json()
    if not data.get('opening_hours'):
        return jsonify({'error': 'Opening hours are required'}), 400
    branch = Branch(
        branch_name=data['branch_name'],
        location=data['location'],
        contact=data['contact'],
        email=data.get('email'),
        opening_hours=data.get('opening_hours'),
        description=data.get('description'),
        status=data.get('status', 'Active')
    )
    db.session.add(branch)
    db.session.commit()
    return jsonify(branch.to_dict()), 201


@branches_bp.route('/branches/<int:branch_id>', methods=['PUT'])
def update_branch(branch_id):
    branch = Branch.query.get_or_404(branch_id)
    data = request.get_json()
    branch.branch_name = data.get('branch_name', branch.branch_name)
    branch.location = data.get('location', branch.location)
    branch.contact = data.get('contact', branch.contact)
    branch.email = data.get('email', branch.email)
    branch.opening_hours = data.get('opening_hours', branch.opening_hours)
    if not branch.opening_hours:
        return jsonify({'error': 'Opening hours are required'}), 400
    branch.description = data.get('description', branch.description)
    branch.status = data.get('status', branch.status)
    db.session.commit()
    return jsonify(branch.to_dict()), 200


@branches_bp.route('/branches/<int:branch_id>', methods=['DELETE'])
def delete_branch(branch_id):
    branch = Branch.query.get_or_404(branch_id)
    db.session.delete(branch)
    db.session.commit()
    return jsonify({'message': 'Branch deleted successfully'}), 200
