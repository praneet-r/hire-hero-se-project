from flask import Blueprint, request, jsonify

matching_bp = Blueprint('matching_bp', __name__)

@matching_bp.route('/hr/matching/rank-resumes', methods=['POST'])
def rank_resumes():
    # TODO: Auth Check (HR)
    # Check for files and JD

    return jsonify({
        'ranking': [
            {
                'rank': 1,
                'match_score': 95.5,
                'file_name': 'resume1.pdf',
                'parsed_name': 'Jane Doe',
                'match_explanation': {
                    'summary': 'Good fit',
                    'matched_skills': ['Python'],
                    'missing_skills': []
                }
            }
        ]
    })
