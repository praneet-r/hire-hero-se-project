from flask import Blueprint, request, jsonify
from ..services.llm_service import llm_service
from ..models import Job, Application, User
from ..utils import get_current_user
import json

genai_bp = Blueprint('genai_bp', __name__)

@genai_bp.route('/gen-ai/chat', methods=['POST'])
def chat_with_ai():
    user = get_current_user()
    # Auth optional? YAML says bearerAuth, so yes.
    # But public might use it? YAML says "Authenticated user's status can be looked up".
    if not user:
         return jsonify({'error': 'Unauthorized'}), 401

    data = request.json or {}
    prompt = data.get('prompt')
    context = data.get('context', {}) # {job_id: 1, application_id: 2}

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    # Enrich context
    system_context = f"You are a helpful HR assistant named HireHero AI. The user is {user.first_name}."

    if context.get('job_id'):
        job = Job.query.get(context['job_id'])
        if job:
            system_context += f"\nContext: The user is asking about Job #{job.id}: {job.title} at {job.company}."

    if context.get('application_id'):
        app = Application.query.get(context['application_id'])
        if app:
            system_context += f"\nContext: The user is asking about Application #{app.id}. Status: {app.status}."

    reply = llm_service.generate_text(system_context, prompt)

    return jsonify({
        'reply': reply,
        'session_id': data.get('session_id', 'session_123'),
        'follow_up_questions': ['How can I improve my resume?', 'What is the interview process?']
    })

@genai_bp.route('/gen-ai/parse-resume', methods=['POST'])
def parse_resume():
    if 'resume_file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['resume_file']
    # In real app, read file content.
    parsed_data = llm_service.parse_resume_mock(file)

    return jsonify({
        'parsed_profile': parsed_data
    })

@genai_bp.route('/gen-ai/generate-jd', methods=['POST'])
def generate_jd():
    data = request.json
    title = data.get('title')
    company = data.get('company_name')

    system_prompt = "You are an expert HR assistant. Generate a job description."
    user_prompt = f"Generate a JD for {title} at {company}."

    response_text = llm_service.generate_text(system_prompt, user_prompt)

    # Try to parse JSON from mock response
    try:
        response_json = json.loads(response_text)
    except:
        response_json = {
            "generated_description": response_text,
            "generated_responsibilities": [],
            "generated_qualifications": []
        }

    return jsonify(response_json)

@genai_bp.route('/gen-ai/generate-cover-letter', methods=['POST'])
def generate_cover_letter():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    job_id = data.get('job_id')
    user_notes = data.get('user_notes', '')

    job = Job.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404

    # Fetch user profile
    profile = user.profile
    profile_summary = profile.summary if profile else ""

    system_prompt = "You are a career coach helping write a cover letter."
    user_prompt = f"Write a cover letter for {user.first_name} applying to {job.title} at {job.company}. User notes: {user_notes}. Profile summary: {profile_summary}"

    draft = llm_service.generate_text(system_prompt, user_prompt)

    return jsonify({
        'generated_draft': draft
    })

@genai_bp.route('/gen-ai/generate-interview-guide', methods=['POST'])
def generate_interview_guide():
    data = request.json
    jd_text = data.get('job_description')

    system_prompt = "Generate an interview guide based on the job description."
    user_prompt = f"JD: {jd_text}"

    response_text = llm_service.generate_text(system_prompt, user_prompt)
    try:
        response_json = json.loads(response_text)
    except:
         response_json = {
            "job_title": "Role",
            "behavioral_questions": [],
            "technical_questions": [],
            "scoring_rubric": response_text
        }

    return jsonify(response_json)

@genai_bp.route('/gen-ai/summarize-feedback', methods=['POST'])
def summarize_feedback():
    data = request.json
    notes = data.get('raw_feedback_notes')

    system_prompt = "Summarize the following interview feedback notes."
    user_prompt = notes

    response_text = llm_service.generate_text(system_prompt, user_prompt)
    try:
        response_json = json.loads(response_text)
    except:
        response_json = {
            "summary": response_text,
            "strengths": [],
            "weaknesses": [],
            "recommendation": "Needs Discussion"
        }
    return jsonify(response_json)
