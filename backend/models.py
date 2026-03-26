from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()


class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    mobile = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(50), nullable=False) # Admin, Staff, Consultant, Customer
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    staff_profile = db.relationship('Staff', backref='user', uselist=False)
    consultant_profile = db.relationship('Consultant', backref='user', uselist=False)
    tokens = db.relationship('Token', backref='customer', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'mobile': self.mobile,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Branch(db.Model):
    __tablename__ = 'branch'
    branch_id = db.Column(db.Integer, primary_key=True)
    branch_name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(200), nullable=False)
    contact = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    opening_hours = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(20), default='Active')

    schedules = db.relationship('Schedule', backref='branch', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'branch_id': self.branch_id,
            'branch_name': self.branch_name,
            'location': self.location,
            'contact': self.contact,
            'email': self.email,
            'opening_hours': self.opening_hours,
            'description': self.description,
            'status': self.status
        }


class Staff(db.Model):
    __tablename__ = 'staff'
    staff_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    staff_name = db.Column(db.String(120), nullable=False)
    contact = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), nullable=True)
    role = db.Column(db.String(50), default='Staff')
    status = db.Column(db.String(20), default='Active')
    password = db.Column(db.String(256), nullable=True) # deprecated, moving to User.password_hash
    branch_id = db.Column(db.Integer, db.ForeignKey('branch.branch_id'), nullable=True)
    branch = db.relationship('Branch', backref='staff_members')

    def to_dict(self):
        return {
            'staff_id': self.staff_id,
            'user_id': self.user_id,
            'staff_name': self.staff_name,
            'contact': self.contact,
            'email': self.email,
            'role': self.role,
            'status': self.status,
            'branch_id': self.branch_id,
            'branch_name': self.branch.branch_name if self.branch else ''
        }


class TokenConfig(db.Model):
    """Stores the token series configuration for the admin."""
    __tablename__ = 'token_config'
    id = db.Column(db.Integer, primary_key=True)
    current_series = db.Column(db.String(5), nullable=False, default='A')
    number_format = db.Column(db.String(20), nullable=False, default='plain')  # plain, padded
    prefix = db.Column(db.String(10), nullable=False, default='')  # optional prefix like "TK-"

    def to_dict(self):
        return {
            'id': self.id,
            'current_series': self.current_series,
            'number_format': self.number_format,
            'prefix': self.prefix
        }


class Consultant(db.Model):
    __tablename__ = 'consultant'
    consultant_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    name = db.Column(db.String(120), nullable=False)
    specialization = db.Column(db.String(120), nullable=False, default='General')
    contact = db.Column(db.String(20), nullable=False, unique=True)
    email = db.Column(db.String(120), nullable=True)
    bio = db.Column(db.String(500), nullable=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branch.branch_id'), nullable=True)
    password = db.Column(db.String(256), nullable=True, default='consultant123') # deprecated
    status = db.Column(db.String(20), default='Active')

    schedules = db.relationship('Schedule', backref='consultant', lazy=True)

    def to_dict(self):
        return {
            'consultant_id': self.consultant_id,
            'user_id': self.user_id,
            'name': self.name,
            'specialization': self.specialization,
            'contact': self.contact,
            'email': self.email,
            'bio': self.bio,
            'branch_id': self.branch_id,
            'status': self.status
        }


class Schedule(db.Model):
    __tablename__ = 'schedule'
    schedule_id = db.Column(db.Integer, primary_key=True)
    branch_id = db.Column(db.Integer, db.ForeignKey('branch.branch_id'), nullable=False)
    consultant_id = db.Column(db.Integer, db.ForeignKey('consultant.consultant_id'), nullable=True)
    date = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.String(10), nullable=False)
    end_time = db.Column(db.String(10), nullable=False)
    token_count = db.Column(db.Integer, nullable=False)
    fees = db.Column(db.Float, nullable=False, default=0.0)
    service_name = db.Column(db.String(200), nullable=False, default='')
    token_series = db.Column(db.String(5), nullable=False, default='A')

    tokens = db.relationship('Token', backref='schedule', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'schedule_id': self.schedule_id,
            'branch_id': self.branch_id,
            'branch_name': self.branch.branch_name if self.branch else '',
            'consultant_id': self.consultant_id,
            'consultant_name': self.consultant.name if self.consultant else '',
            'date': self.date,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'token_count': self.token_count,
            'fees': self.fees,
            'service_name': self.service_name,
            'token_series': self.token_series
        }



class Token(db.Model):
    __tablename__ = 'token'
    token_id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedule.schedule_id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    token_number = db.Column(db.String(20), nullable=False)  # e.g., "A1", "B3"
    time_slot = db.Column(db.String(30), nullable=False)
    status = db.Column(db.String(20), default='Available')
    customer_name = db.Column(db.String(100), nullable=True, default=None)
    customer_age = db.Column(db.Integer, nullable=True)
    customer_gender = db.Column(db.String(20), nullable=True)
    customer_phone = db.Column(db.String(20), nullable=True)
    reason = db.Column(db.String(500), nullable=True)
    serving_started_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)

    __table_args__ = (
        db.UniqueConstraint('schedule_id', 'token_number', name='_schedule_token_uc'),
    )

    payment = db.relationship('Payment', backref='token', uselist=False, lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'token_id': self.token_id,
            'schedule_id': self.schedule_id,
            'user_id': self.user_id,
            'token_number': self.token_number,
            'time_slot': self.time_slot,
            'status': self.status,
            'customer_name': self.customer_name or '',
            'customer_age': self.customer_age,
            'customer_gender': self.customer_gender,
            'customer_phone': self.customer_phone,
            'reason': self.reason,
            'serving_started_at': self.serving_started_at.isoformat() if self.serving_started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'schedule': self.schedule.to_dict() if self.schedule else None
        }


class Payment(db.Model):
    __tablename__ = 'payment'
    payment_id = db.Column(db.Integer, primary_key=True)
    token_id = db.Column(db.Integer, db.ForeignKey('token.token_id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    payment_date = db.Column(db.String(20), nullable=False)
    payment_status = db.Column(db.String(20), default='Pending')
    payment_method = db.Column(db.String(50), nullable=True) # UPI, Cash

    def to_dict(self):
        schedule = self.token.schedule if self.token else None
        return {
            'payment_id': self.payment_id,
            'token_id': self.token_id,
            'token_number': self.token.token_number if self.token else '',
            'amount': self.amount,
            'payment_date': self.payment_date,
            'payment_status': self.payment_status,
            'payment_method': self.payment_method,
            'branch_name': schedule.branch.branch_name if schedule and schedule.branch else '',
        }
