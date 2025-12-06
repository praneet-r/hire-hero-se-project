import os
from flask import Blueprint, request, jsonify,current_app
from ..database import db
from ..models import Employee, Performance, User

employee_bp = Blueprint('employee_bp', __name__)

@employee_bp.route('/employees', methods=['GET'])
def get_employees():
    employees = Employee.query.all()
    return jsonify([
        {
            'id': e.id,
            'user_id': e.user_id,
            'job_title': e.job_title,
            'department': e.department,
            'job_location': e.job_location,
            'hired_at': e.hired_at,
            'photo': e.photo,
            'role': e.user.role if e.user else '',
            'name': f"{e.user.first_name} {e.user.last_name}".strip() if e.user else ''
        }
        for e in employees
    ])

@employee_bp.route('/employees/<int:employee_id>', methods=['GET'])
def get_employee(employee_id):
    e = Employee.query.get_or_404(employee_id)
    return jsonify({
        'id': e.id,
        'user_id': e.user_id,
        'job_title': e.job_title,
        'department': e.department,
        'job_location': e.job_location,
        'hired_at': e.hired_at,
        'photo': e.photo,
        'performances': [
            {
                'id': p.id,
                'metric': p.metric,
                'value': p.value,
                'date': p.date
            } for p in e.performances
        ]
    })


# Upload employee profile photo
@employee_bp.route('/employees/upload_photo', methods=['POST'])
def upload_employee_photo():
    if 'photo' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    # Use provided filename (already cleaned by frontend)
    filename = file.filename
    upload_folder = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    # Overwrite if exists (only one copy per employee)
    file.save(file_path)
    photo_url = f"/uploads/{filename}"
    return jsonify({'photo': photo_url})

@employee_bp.route('/employees', methods=['POST'])
def create_employee():
    data = request.json
    user_id = data.get('user_id')
    if not user_id:
        # External hire: create user
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        email = data.get('email')
        phone = data.get('phone')
        password = data.get('password', 'changeme')
        role = data.get('role', 'employee')
        if not (first_name and last_name and email and phone):
            return jsonify({'error': 'Missing user info for external hire'}), 400
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            user = existing_user
        else:
            user = User(
                first_name=first_name,
                last_name=last_name,
                email=email,
                role=role
            )
            user.set_password(password)
            db.session.add(user)
            db.session.flush()
        user_id = user.id
    else:
        # Internal hire: promote candidate to employee
        user = User.query.get(user_id)
        if user and user.role == 'candidate':
            user.role = 'employee'
            db.session.add(user)
    e = Employee(
        user_id=user_id,
        job_title=data.get('job_title'),
        department=data.get('department'),
        job_location=data.get('job_location'),
        photo=data.get('photo')
    )
    db.session.add(e)
    db.session.commit()
    return jsonify({'message': 'Employee created', 'id': e.id}), 201

@employee_bp.route('/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    e = Employee.query.get_or_404(employee_id)
    data = request.json
    e.job_title = data.get('job_title', e.job_title)
    e.department = data.get('department', e.department)
    e.job_location = data.get('job_location', e.job_location)
    e.photo = data.get('photo', e.photo)
    db.session.commit()
    return jsonify({'message': 'Employee updated'})

@employee_bp.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    e = Employee.query.get_or_404(employee_id)
    db.session.delete(e)
    db.session.commit()
    return jsonify({'message': 'Employee deleted'})

# Performance endpoints
@employee_bp.route('/employees/<int:employee_id>/performances', methods=['POST'])
def add_performance(employee_id):
    e = Employee.query.get_or_404(employee_id)
    data = request.json
    p = Performance(
        employee_id=employee_id,
        metric=data.get('metric'),
        value=data.get('value'),
        date=data.get('date')
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({'message': 'Performance added', 'id': p.id}), 201

@employee_bp.route('/employees/<int:employee_id>/performances/<int:perf_id>', methods=['PUT'])
def update_performance(employee_id, perf_id):
    p = Performance.query.get_or_404(perf_id)
    data = request.json
    p.metric = data.get('metric', p.metric)
    p.value = data.get('value', p.value)
    p.date = data.get('date', p.date)
    db.session.commit()
    return jsonify({'message': 'Performance updated'})

@employee_bp.route('/employees/<int:employee_id>/performances/<int:perf_id>', methods=['DELETE'])
def delete_performance(employee_id, perf_id):
    p = Performance.query.get_or_404(perf_id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Performance deleted'})
