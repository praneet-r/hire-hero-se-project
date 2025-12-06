from flask import Blueprint, request, jsonify
from ..database import db
from ..models import Job
from ..utils import get_current_user

job_bp = Blueprint('job_bp', __name__)

# --- Job Seeker - Jobs Endpoints ---

@job_bp.route('/jobs', methods=['GET'])
def get_jobs():
    # Helper for pagination
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)

    # In a real app, use .paginate()
    jobs = Job.query.all() # Fetch all for now, slice later or update query

    # Simple pagination simulation
    start = (page - 1) * limit
    end = start + limit
    paginated_jobs = jobs[start:end]

    job_list = [{
        'id': job.id,
        'title': job.title,
        'company_name': job.company, # YAML says company_name, model has company
        'description': job.description,
        'location': job.location, # Model might be string, YAML allows object or string
        'employment_type': job.type, # YAML: employment_type, model: type
        'job_type': getattr(job, 'job_type', job.remote_option), # YAML: job_type, model: remote_option?
        'salary_min': getattr(job, 'salary_min', None), # Model might need update
        'salary_max': getattr(job, 'salary_max', None),
        'salary_currency': getattr(job, 'salary_currency', 'USD'),
        'tags': job.tags.split(',') if job.tags else [],
        'created_at': job.created_at,
        'company_logo_url': getattr(job, 'company_logo_url', '')
    } for job in paginated_jobs]

    return jsonify({
        'pagination': {
            'page': page,
            'per_page': limit,
            'total_items': len(jobs),
            'total_pages': (len(jobs) + limit - 1) // limit
        },
        'jobs': job_list
    })

@job_bp.route('/jobs/search', methods=['GET'])
def search_jobs():
    q = request.args.get('q', '').lower()
    location = request.args.get('location', '').lower()
    # ... other filters

    # Simple search implementation
    all_jobs = Job.query.all()
    filtered = []
    for job in all_jobs:
        match = True
        if q:
            text = (job.title + job.description + (job.tags or '')).lower()
            if q not in text:
                match = False
        if location:
            if location not in (job.location or '').lower():
                match = False

        if match:
            filtered.append(job)

    return jsonify({
        'pagination': {'total_items': len(filtered)},
        'jobs': [{
            'id': job.id,
            'title': job.title,
            'company_name': job.company,
            'location': job.location,
            'description': job.description
            # ... add other fields
        } for job in filtered]
    })

@job_bp.route('/jobs/<int:job_id>', methods=['GET'])
def get_job(job_id):
    job = Job.query.get_or_404(job_id)
    return jsonify({
        'id': job.id,
        'title': job.title,
        'company_name': job.company,
        'description': job.description,
        'department': job.department,
        'location': job.location,
        'employment_type': job.type,
        'job_type': job.remote_option,
        'salary': job.salary,
        'tags': job.tags.split(',') if job.tags else [],
        'benefits': job.benefits,
        'application_deadline': job.application_deadline,
        'created_at': job.created_at
    })

# --- HR - Jobs Endpoints ---

@job_bp.route('/hr/jobs', methods=['POST'])
def create_job():
    user = get_current_user()
    if not user or user.role != 'hr':
        return jsonify({'error': 'Unauthorized: HR role required'}), 403

    data = request.json
    company = data.get('company_name') or data.get('company')
    if not company:
        company = user.company_name or "Unknown Company"

    job = Job(
        title=data.get('title'),
        description=data.get('description'),
        company=company,
        department=data.get('department'),
        location=data.get('location'),
        type=data.get('employment_type') or data.get('type'),
        remote_option=data.get('job_type') or data.get('remoteOption'),
        # experience_level=data.get('experienceLevel'),
        # education=data.get('education'),
        salary=data.get('salary_min'), # Simplified mapping
        tags=','.join(data.get('tags', [])) if isinstance(data.get('tags'), list) else data.get('tags'),
        benefits=data.get('benefits'),
        application_deadline=data.get('applicationDeadline')
    )
    db.session.add(job)
    db.session.commit()
    return jsonify({'message': 'Job created successfully', 'id': job.id}), 201

@job_bp.route('/hr/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    # TODO: Auth Check (HR Role)
    job = Job.query.get_or_404(job_id)
    data = request.json

    if 'title' in data: job.title = data['title']
    if 'description' in data: job.description = data['description']
    if 'company_name' in data: job.company = data['company_name']
    elif 'company' in data: job.company = data['company']

    # ... map other fields

    db.session.commit()
    return jsonify({'message': 'Job updated successfully'})

@job_bp.route('/hr/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    # TODO: Auth Check (HR Role)
    job = Job.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job deleted successfully'})
