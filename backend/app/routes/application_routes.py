from flask import Blueprint, request, jsonify, current_app
from ..database import db
from ..models import Application, User, Job
from ..utils import get_current_user

application_bp = Blueprint('application_bp', __name__)

# --- Job Seeker - Applications ---

@application_bp.route('/applications', methods=['POST'])
def create_application():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    data = request.json
    job_id = data.get('job_id')
    
    if not job_id:
        return jsonify({'error': 'job_id is required'}), 400

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    existing = Application.query.filter_by(user_id=user.id, job_id=job_id).first()
    if existing:
        return jsonify({'error': 'You have already applied to this job'}), 400 # YAML says 400 for bad request

    app = Application(
        user_id=user.id,
        job_id=job_id,
        status='applied' # Default status
    )
    # TODO: Handle cover_letter if model supports
    db.session.add(app)
    db.session.commit()
    return jsonify({'message': 'Application submitted successfully', 'id': app.id}), 201

@application_bp.route('/applications/my', methods=['GET'])
def get_my_applications():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    status_filter = request.args.get('status')
    query = Application.query.filter_by(user_id=user.id)
    if status_filter:
        query = query.filter_by(status=status_filter)
        
    applications = query.all()
    enriched = []
    for app in applications:
        job = app.job
        enriched.append({
            'application_details': {
                'id': app.id,
                'user_id': app.user_id,
                'job_id': app.job_id,
                'status': app.status,
                'applied_at': app.applied_at
            },
            'job_details': {
                'id': job.id if job else None,
                'title': job.title if job else '',
                'company_name': job.company if job else '',
                'tags': job.tags.split(',') if job and job.tags else [],
                # ... limited fields for summary
            }
        })
    return jsonify(enriched)

@application_bp.route('/applications/my/<int:app_id>', methods=['GET'])
def get_my_application(app_id):
    user = get_current_user()
    if not user: return jsonify({'error': 'Unauthorized'}), 401
    
    app = Application.query.get_or_404(app_id)
    if app.user_id != user.id:
        return jsonify({'error': 'Not found or forbidden'}), 404
        
    job = app.job
    return jsonify({
        'application_details': {
            'id': app.id,
            'status': app.status,
            'applied_at': app.applied_at
        },
        'job_details': {
            'id': job.id if job else None,
            'title': job.title if job else '',
            'company_name': job.company if job else '',
            'description': job.description if job else ''
        }
    })

@application_bp.route('/applications/my/<int:app_id>', methods=['DELETE'])
def withdraw_application(app_id):
    user = get_current_user()
    if not user: return jsonify({'error': 'Unauthorized'}), 401
    
    app = Application.query.get_or_404(app_id)
    if app.user_id != user.id:
        return jsonify({'error': 'Not found or forbidden'}), 404
        
    app.status = 'withdrawn'
    db.session.commit()
    return jsonify({'message': 'Application withdrawn successfully'})

# --- Job Seeker - Screening Form (Scaffold) ---
@application_bp.route('/applications/<int:app_id>/screening-form', methods=['GET'])
def get_screening_form(app_id):
    # TODO: Implement retrieval of questions
    return jsonify({
        'application_id': app_id,
        'questions': [
            {'id': 1, 'question_text': 'Mock Question?', 'type': 'text'}
        ]
    })

@application_bp.route('/applications/<int:app_id>/screening-form', methods=['POST'])
def submit_screening_form(app_id):
    # TODO: Implement saving answers
    return jsonify({'message': 'Form submitted successfully'})


# --- HR - Applications Endpoints ---

@application_bp.route('/hr/applications', methods=['GET'])
def get_company_applications():
    user = get_current_user()
    if not user or user.role != 'hr':
        return jsonify({'error': 'Unauthorized: HR role required'}), 403

    job_id = request.args.get('job_id')
    status = request.args.get('status')
    
    query = Application.query
    if job_id:
        query = query.filter_by(job_id=job_id)
    if status:
        query = query.filter_by(status=status)
        
    applications = query.all()
    enriched = []
    for app in applications:
        job = app.job
        user = User.query.get(app.user_id)
        enriched.append({
            'id': app.id,
            'user_id': app.user_id,
            'job_id': app.job_id,
            'status': app.status,
            'applied_at': app.applied_at,
            'candidate_name': f"{user.first_name} {user.last_name}" if user else 'Unknown',
            'job_title': job.title if job else ''
        })
    return jsonify({'pagination': {}, 'applications': enriched})

@application_bp.route('/hr/applications/<int:app_id>', methods=['GET'])
def get_application_hr(app_id):
    user = get_current_user()
    if not user or user.role != 'hr':
        return jsonify({'error': 'Unauthorized: HR role required'}), 403

    app = Application.query.get_or_404(app_id)
    user = User.query.get(app.user_id)
    job = app.job
    return jsonify({
        'id': app.id,
        'status': app.status,
        'user_details': {
            'id': user.id if user else None,
            'name': f"{user.first_name} {user.last_name}" if user else ''
        },
        'job_details': {
            'title': job.title if job else ''
        }
    })

@application_bp.route('/hr/applications/<int:app_id>', methods=['PUT'])
def update_application_status(app_id):
    user = get_current_user()
    if not user or user.role != 'hr':
        return jsonify({'error': 'Unauthorized: HR role required'}), 403

    app = Application.query.get_or_404(app_id)
    data = request.json
    status = data.get('status')
    if status:
        app.status = status
    db.session.commit()
    return jsonify({'message': 'Application status updated'})

# --- HR - Screening & Feedback (Scaffold) ---

@application_bp.route('/hr/screening-forms', methods=['POST'])
def create_screening_form():
    return jsonify({'message': 'Screening form created', 'id': 123}), 201

@application_bp.route('/hr/applications/<int:app_id>/screening-result', methods=['GET'])
def get_screening_result(app_id):
    return jsonify({'score': 85.0, 'summary': 'Good match'})

@application_bp.route('/hr/applications/<int:app_id>/feedback', methods=['POST'])
def submit_feedback(app_id):
    return jsonify({'message': 'Feedback submitted'}), 201

@application_bp.route('/hr/applications/<int:app_id>/feedback-summary', methods=['GET'])
def get_feedback_summary(app_id):
    return jsonify({'summary': 'Positive feedback overall', 'recommendation': 'hire'})
