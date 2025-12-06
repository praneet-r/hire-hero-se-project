import os
from flask import Blueprint, request, jsonify, current_app
from ..database import db
from ..models import Employee, Performance, User
from ..utils import get_current_user

employee_bp = Blueprint('employee_bp', __name__)

# --- HR - Employee Endpoints ---

@employee_bp.route('/hr/employees', methods=['GET'])
def get_employees():
    user = get_current_user()
    if not user or user.role != 'hr':
        return jsonify({'error': 'Unauthorized: HR role required'}), 403

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)

    employees = Employee.query.all()
    # Simple pagination
    start = (page - 1) * limit
    end = start + limit
    paginated = employees[start:end]

    employee_list = [
        {
            'id': e.id,
            'user_id': e.user_id,
            'job_title': e.job_title,
            'department': e.department,
            'job_location': e.job_location,
            'hired_at': e.hired_at,
            'photo_url': e.photo, # YAML: photo_url
            'manager_id': getattr(e, 'manager_id', None)
        }
        for e in paginated
    ]

    return jsonify({
        'pagination': {
            'page': page,
            'per_page': limit,
            'total_items': len(employees),
            'total_pages': (len(employees) + limit - 1) // limit
        },
        'employees': employee_list
    })

@employee_bp.route('/hr/employees/<int:emp_id>', methods=['GET'])
def get_employee(emp_id):
    e = Employee.query.get_or_404(emp_id)
    return jsonify({
        'id': e.id,
        'user_id': e.user_id,
        'job_title': e.job_title,
        'department': e.department,
        'job_location': e.job_location,
        'hired_at': e.hired_at,
        'photo_url': e.photo,
        'manager_id': getattr(e, 'manager_id', None),
        # Extra: nesting performances as it was in original, though not in strict schema
        'performances': [
            {
                'id': p.id,
                'metric': p.metric,
                'value': p.value,
                'date': p.date,
                'rating': getattr(p, 'rating', None),
                'comments': getattr(p, 'comments', None)
            } for p in e.performances
        ]
    })

@employee_bp.route('/hr/employees', methods=['POST'])
def create_employee():
    user = get_current_user()
    if not user or user.role != 'hr':
        return jsonify({'error': 'Unauthorized: HR role required'}), 403

    data = request.json
    user_id = data.get('user_id')

    # Logic for creating user if not exists (from original code)
    if not user_id:
        # Check if email provided for new user
        if data.get('email'):
            existing_user = User.query.filter_by(email=data.get('email')).first()
            if existing_user:
                user_id = existing_user.id
            else:
                # Create rudimentary user
                u = User(
                    first_name=data.get('first_name', 'New'),
                    last_name=data.get('last_name', 'Employee'),
                    email=data['email'],
                    role='employee'
                )
                u.set_password('welcome123')
                db.session.add(u)
                db.session.flush()
                user_id = u.id

    e = Employee(
        user_id=user_id,
        job_title=data.get('job_title'),
        department=data.get('department'),
        job_location=data.get('job_location'), # Not in YAML Schema but in original model
        photo=data.get('photo_url') or data.get('photo'),
        hired_at=data.get('hired_at')
    )
    if 'manager_id' in data and hasattr(e, 'manager_id'):
        e.manager_id = data['manager_id']

    db.session.add(e)
    db.session.commit()
    return jsonify({'message': 'Employee record created', 'id': e.id}), 201

@employee_bp.route('/hr/employees/<int:emp_id>', methods=['PUT'])
def update_employee(emp_id):
    e = Employee.query.get_or_404(emp_id)
    data = request.json
    if 'job_title' in data: e.job_title = data['job_title']
    if 'department' in data: e.department = data['department']
    if 'photo_url' in data: e.photo = data['photo_url']
    if 'job_location' in data: e.job_location = data['job_location']

    db.session.commit()
    return jsonify({'message': 'Employee updated'})

@employee_bp.route('/hr/employees/<int:emp_id>', methods=['DELETE'])
def delete_employee(emp_id):
    user = get_current_user()
    if not user or user.role != 'hr':
        return jsonify({'error': 'Unauthorized: HR role required'}), 403

    e = Employee.query.get_or_404(emp_id)
    db.session.delete(e)
    db.session.commit()
    return jsonify({'message': 'Employee deleted successfully'})

# Upload employee profile photo
@employee_bp.route('/hr/employees/upload_photo', methods=['POST'])
def upload_employee_photo():
    user = get_current_user()
    if not user or user.role != 'hr':
        return jsonify({'error': 'Unauthorized: HR role required'}), 403

    if 'photo' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = file.filename
    upload_folder = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    photo_url = f"/uploads/{filename}"
    return jsonify({'photo': photo_url})

# --- HR - Performance Reviews ---

@employee_bp.route('/hr/employees/<int:emp_id>/performance-reviews', methods=['POST'])
def add_performance_review(emp_id):
    e = Employee.query.get_or_404(emp_id)
    data = request.json
    p = Performance(
        employee_id=emp_id,
        metric=data.get('metric'), # Legacy
        value=data.get('value'),   # Legacy
        date=data.get('review_date') or data.get('date'),
        # rating=data.get('rating'), # Add to model if missing
        # comments=data.get('comments') # Add to model if missing
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({'message': 'Review added successfully', 'id': p.id}), 201

@employee_bp.route('/hr/performance-reviews/<int:review_id>', methods=['PUT'])
def update_performance_review(review_id):
    p = Performance.query.get_or_404(review_id)
    data = request.json
    if 'metric' in data: p.metric = data['metric']
    if 'value' in data: p.value = data['value']
    if 'review_date' in data: p.date = data['review_date']
    if 'date' in data: p.date = data['date']

    db.session.commit()
    return jsonify({'message': 'Review updated successfully'})

# Note: DELETE not in YAML for performance reviews or employees, but originally present.
# Keeping them if needed or removing. I'll omit them for strictness or keep if safe.
# I'll omit DELETE /hr/performance-reviews/{id} as it's not in YAML.
# I'll omit DELETE /hr/employees/{id} as it's not in YAML.
