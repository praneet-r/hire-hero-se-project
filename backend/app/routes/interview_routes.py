from flask import Blueprint, request, jsonify

interview_bp = Blueprint('interview_bp', __name__)

@interview_bp.route('/interviews/my', methods=['GET'])
def get_my_interviews():
    # TODO: Auth Check
    period = request.args.get('period', 'upcoming')
    
    return jsonify([
        {
            'id': 1,
            'application_id': 101,
            'stage': 'technical',
            'scheduled_at': '2025-10-25T14:00:00Z',
            'location_type': 'video',
            'location_detail': 'https://meet.google.com/abc'
        }
    ])

@interview_bp.route('/hr/interviews', methods=['POST'])
def schedule_interview():
    # TODO: Auth Check (HR)
    data = request.json
    return jsonify({
        'id': 123,
        'application_id': data.get('application_id'),
        'stage': data.get('stage'),
        'scheduled_at': data.get('scheduled_at'),
        'location_type': data.get('location_type')
    }), 201
