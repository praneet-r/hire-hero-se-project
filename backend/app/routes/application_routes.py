from flask import Blueprint, request, jsonify
from ..database import db
from ..models import Application, User, Job

application_bp = Blueprint('application_bp', __name__)

@application_bp.route('/applications', methods=['GET'])
def get_applications():
    applications = Application.query.all()
    enriched = []
    for app in applications:
        job = app.job
        enriched.append({
            'id': app.id,
            'user_id': app.user_id,
            'job_id': app.job_id,
            'status': app.status,
            'applied_at': app.applied_at,
            'title': job.title if job else '',
            'company': job.company if job else '',
            'tags': job.tags.split(',') if job and job.tags else [],
            'location': job.location if job else '',
            'type': job.type if job else '',
            'salary': job.salary if job else '',
        })
    return jsonify(enriched)

@application_bp.route('/applications/<int:application_id>', methods=['GET'])
def get_application(application_id):
    app = Application.query.get_or_404(application_id)
    return jsonify({
        'id': app.id,
        'user_id': app.user_id,
        'job_id': app.job_id,
        'status': app.status,
        'applied_at': app.applied_at
    })

@application_bp.route('/applications', methods=['POST'])
def create_application():
    data = request.json
    user_id = data.get('user_id')
    job_id = data.get('job_id')
    status = data.get('status', 'applied')

    # Validate required fields
    if not user_id or not job_id:
        return jsonify({'error': 'user_id and job_id are required'}), 400

    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Check if job exists
    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    # Prevent duplicate applications
    existing = Application.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({'error': 'You have already applied to this job'}), 409

    app = Application(
        user_id=user_id,
        job_id=job_id,
        status=status
    )
    db.session.add(app)
    db.session.commit()
    return jsonify({'message': 'Application created', 'id': app.id}), 201

@application_bp.route('/applications/<int:application_id>', methods=['PUT'])
def update_application(application_id):
    app = Application.query.get_or_404(application_id)
    data = request.json
    app.status = data.get('status', app.status)
    db.session.commit()
    return jsonify({'message': 'Application updated'})

@application_bp.route('/applications/<int:application_id>', methods=['DELETE'])
def delete_application(application_id):
    app = Application.query.get_or_404(application_id)
    db.session.delete(app)
    db.session.commit()
    return jsonify({'message': 'Application deleted'})
