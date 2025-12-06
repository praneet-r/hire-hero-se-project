from flask import Blueprint, request, jsonify
# from ..services.chatbot_engine import generate_response # If exists

genai_bp = Blueprint('genai_bp', __name__)

@genai_bp.route('/gen-ai/chat', methods=['POST'])
def chat_with_ai():
    data = request.json or {}
    prompt = data.get('prompt')
    session_id = data.get('session_id')
    context = data.get('context')
    
    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    # Mock response for now or use existing engine
    reply = f"AI Response to: {prompt}"
    
    return jsonify({
        'reply': reply,
        'session_id': session_id or 'new_session_123',
        'follow_up_questions': ['Tell me more', 'Explain?']
    })

@genai_bp.route('/gen-ai/parse-resume', methods=['POST'])
def parse_resume():
    if 'resume_file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    # Mock parsing
    return jsonify({
        'parsed_profile': {
            'first_name': 'Jane',
            'last_name': 'Doe',
            'skills': ['Python', 'Flask']
        }
    })

@genai_bp.route('/gen-ai/generate-jd', methods=['POST'])
def generate_jd():
    data = request.json
    title = data.get('title')
    
    return jsonify({
        'generated_description': f"Job Description for {title}...",
        'generated_responsibilities': ['Do X', 'Do Y'],
        'generated_qualifications': ['Skill A', 'Skill B']
    })

@genai_bp.route('/gen-ai/generate-cover-letter', methods=['POST'])
def generate_cover_letter():
    data = request.json
    
    return jsonify({
        'generated_draft': "Dear Hiring Manager, ..."
    })

@genai_bp.route('/gen-ai/generate-interview-guide', methods=['POST'])
def generate_interview_guide():
    return jsonify({
        'job_title': 'Role',
        'behavioral_questions': ['Q1'],
        'technical_questions': ['Q2'],
        'scoring_rubric': 'Rubric...'
    })

@genai_bp.route('/gen-ai/summarize-feedback', methods=['POST'])
def summarize_feedback():
    return jsonify({
        'summary': 'Good candidate',
        'strengths': ['A'],
        'weaknesses': ['B'],
        'recommendation': 'Hire'
    })
