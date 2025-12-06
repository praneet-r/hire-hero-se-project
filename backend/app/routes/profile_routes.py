import os
import re
from flask import current_app, Blueprint, request, jsonify, g
from ..database import db
from ..models import Profile, Experience

profile_bp = Blueprint('profile_bp', __name__)

# Helper to get current user (for demo, from header)
def get_current_user():
    # In production, use proper authentication (session/token)
    user_id = request.headers.get('X-User-Id')
    if not user_id:
        return None
    from ..models.user import User
    # user_id is now firstname+last 3 digits of phone
    # Find user by matching first_name and last 3 digits of phone in profile
    match = re.match(r"([A-Za-z]+)(\d{1,3})$", user_id)
    if not match:
        return None
    first_name, last3 = match.groups()
    # Find all users with this first name
    users = User.query.filter_by(first_name=first_name).all()
    for user in users:
        profile = user.profile
        if profile and profile.phone:
            phone_digits = ''.join(filter(str.isdigit, profile.phone))
            if phone_digits[-3:] == last3:
                return user
    return None

# GET/PUT /profiles/me
@profile_bp.route('/profiles/me', methods=['GET', 'PUT'])
def profile_me():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    profile = user.profile
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    if request.method == 'GET':
        return jsonify({
            'id': profile.id,
            'user_id': profile.user_id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': f"{user.first_name} {user.last_name}",
            'email': user.email,
            'role': user.role,
            'phone': profile.phone,
            'location': profile.location,
            'summary': profile.summary,
            'profile_pic': profile.profile_pic,
            'resume': profile.resume,
            'completeness': profile.completeness,
            'experiences': [
                {
                    'id': e.id,
                    'title': e.title,
                    'company': e.company,
                    'start_date': e.start_date,
                    'end_date': e.end_date,
                    'description': e.description,
                    'tags': []
                } for e in profile.experiences
            ]
        })
    # PUT: update profile fields
    data = request.json or {}
    for field in ['phone', 'location', 'summary', 'profile_pic', 'completeness']:
        if field in data:
            setattr(profile, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'})


@profile_bp.route('/profiles/user/<int:user_id>', methods=['GET'])
def get_profile_by_user_id(user_id):
    from ..models.user import User
    user = User.query.get_or_404(user_id)
    profile = user.profile
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    return jsonify({
        'id': profile.id,
        'user_id': profile.user_id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'full_name': f"{user.first_name} {user.last_name}",
        'email': user.email,
        'role': user.role,
        'phone': profile.phone,
        'location': profile.location,
        'summary': profile.summary,
        'profile_pic': profile.profile_pic,
        'resume': profile.resume if hasattr(profile, 'resume') else None,
        'completeness': profile.completeness,
        'experiences': [
            {
                'id': e.id,
                'title': e.title,
                'company': e.company,
                'start_date': e.start_date,
                'end_date': e.end_date,
                'description': e.description,
                'tags': []
            } for e in profile.experiences
        ]
    })


# Upload resume and trigger AI training
@profile_bp.route('/profiles/me/upload_resume', methods=['POST'])
def upload_resume():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    profile = user.profile
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['resume']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = f"resume_{user.id}_{file.filename}"
    upload_folder = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    profile.resume = f"/uploads/{filename}"
    db.session.commit()
    # TODO: Trigger AI training logic here with file_path
    return jsonify({'message': 'Resume uploaded successfully', 'resume': profile.resume})

# Upload profile picture
@profile_bp.route('/profiles/me/upload_profile_pic', methods=['POST'])
def upload_profile_pic():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    profile = user.profile
    if not profile:
        return jsonify({'error': 'Profile not found'}), 404
    if 'profile_pic' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['profile_pic']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    filename = f"profilepic_{user.id}_{file.filename}"
    upload_folder = os.path.join(current_app.root_path, 'uploads')
    os.makedirs(upload_folder, exist_ok=True)
    file_path = os.path.join(upload_folder, filename)
    file.save(file_path)
    profile.profile_pic = f"/uploads/{filename}"
    db.session.commit()
    return jsonify({'message': 'Profile picture uploaded successfully', 'profile_pic': profile.profile_pic})
    # PUT: update profile fields
    data = request.json or {}
    for field in ['phone', 'location', 'summary', 'profile_pic', 'completeness']:
        if field in data:
            setattr(profile, field, data[field])
    db.session.commit()
    return jsonify({'message': 'Profile updated successfully'})

@profile_bp.route('/profiles', methods=['GET'])
def get_profiles():
    profiles = Profile.query.all()
    return jsonify([
        {
            'id': p.id,
            'user_id': p.user_id,
            'first_name': p.user.first_name if p.user else '',
            'email': p.user.email if p.user else '',
            'role': p.user.role if p.user else '',
            'phone': p.phone,
            'location': p.location,
            'summary': p.summary,
            'profile_pic': p.profile_pic,
            'completeness': p.completeness,
            'experiences': [
                {
                    'id': e.id,
                    'title': e.title,
                    'company': e.company,
                    'start_date': e.start_date,
                    'end_date': e.end_date,
                    'description': e.description,
                    'tags': []  # Optionally add tags if you have them
                } for e in p.experiences
            ]
        } for p in profiles
    ])

@profile_bp.route('/profiles/<int:profile_id>', methods=['GET'])
def get_profile(profile_id):
    p = Profile.query.get_or_404(profile_id)
    return jsonify({
        'id': p.id,
        'user_id': p.user_id,
        'first_name': p.user.first_name if p.user else '',
        'email': p.user.email if p.user else '',
        'role': p.user.role if p.user else '',
        'phone': p.phone,
        'location': p.location,
        'summary': p.summary,
        'profile_pic': p.profile_pic,
        'completeness': p.completeness,
        'experiences': [
            {
                'id': e.id,
                'title': e.title,
                'company': e.company,
                'start_date': e.start_date,
                'end_date': e.end_date,
                'description': e.description,
                'tags': []  # Optionally add tags if you have them
            } for e in p.experiences
        ]
    })

@profile_bp.route('/profiles', methods=['POST'])
def create_profile():
    data = request.json
    p = Profile(
        user_id=data.get('user_id'),
        phone=data.get('phone'),
        location=data.get('location'),
        summary=data.get('summary'),
        profile_pic=data.get('profile_pic'),
        completeness=data.get('completeness', 0)
    )
    db.session.add(p)
    db.session.commit()
    return jsonify({'message': 'Profile created', 'id': p.id}), 201

@profile_bp.route('/profiles/<int:profile_id>', methods=['PUT'])
def update_profile(profile_id):
    p = Profile.query.get_or_404(profile_id)
    data = request.json
    p.phone = data.get('phone', p.phone)
    p.location = data.get('location', p.location)
    p.summary = data.get('summary', p.summary)
    p.profile_pic = data.get('profile_pic', p.profile_pic)
    p.completeness = data.get('completeness', p.completeness)
    db.session.commit()
    return jsonify({'message': 'Profile updated'})

@profile_bp.route('/profiles/<int:profile_id>', methods=['DELETE'])
def delete_profile(profile_id):
    p = Profile.query.get_or_404(profile_id)
    db.session.delete(p)
    db.session.commit()
    return jsonify({'message': 'Profile deleted'})

# Experience endpoints
@profile_bp.route('/profiles/<int:profile_id>/experiences', methods=['POST'])
def add_experience(profile_id):
    p = Profile.query.get_or_404(profile_id)
    data = request.json
    e = Experience(
        profile_id=profile_id,
        title=data.get('title'),
        company=data.get('company'),
        start_date=data.get('start_date'),
        end_date=data.get('end_date'),
        description=data.get('description')
    )
    db.session.add(e)
    db.session.commit()
    return jsonify({'message': 'Experience added', 'id': e.id}), 201

@profile_bp.route('/profiles/<int:profile_id>/experiences/<int:exp_id>', methods=['PUT'])
def update_experience(profile_id, exp_id):
    e = Experience.query.get_or_404(exp_id)
    data = request.json
    e.title = data.get('title', e.title)
    e.company = data.get('company', e.company)
    e.start_date = data.get('start_date', e.start_date)
    e.end_date = data.get('end_date', e.end_date)
    e.description = data.get('description', e.description)
    db.session.commit()
    return jsonify({'message': 'Experience updated'})

@profile_bp.route('/profiles/<int:profile_id>/experiences/<int:exp_id>', methods=['DELETE'])
def delete_experience(profile_id, exp_id):
    e = Experience.query.get_or_404(exp_id)
    db.session.delete(e)
    db.session.commit()
    return jsonify({'message': 'Experience deleted'})
