from flask import Blueprint, request, jsonify
from ..services.llm_service import llm_service
from ..models import Job, Application, User, ChatMessage # <--- Added ChatMessage
from ..database import db # <--- Added db
from ..utils import get_current_user
import json

genai_bp = Blueprint('genai_bp', __name__)

@genai_bp.route('/gen-ai/chat', methods=['POST'])
def chat_with_ai():
    user = get_current_user()
    if not user:
         return jsonify({'error': 'Unauthorized'}), 401

    data = request.json or {}
    prompt = data.get('prompt')
    context = data.get('context', {})

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    # 1. Save User Message
    user_msg = ChatMessage(user_id=user.id, sender='user', message=prompt)
    db.session.add(user_msg)
    db.session.commit()

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

    # Generate Response
    reply = llm_service.generate_text(system_context, prompt)

    # 2. Save Bot Response
    bot_msg = ChatMessage(user_id=user.id, sender='bot', message=reply)
    db.session.add(bot_msg)
    db.session.commit()

    return jsonify({
        'reply': reply,
        'session_id': data.get('session_id', 'session_123'),
        'follow_up_questions': ['How can I improve my resume?', 'What is the interview process?']
    })

# --- NEW: Get Chat History ---
@genai_bp.route('/gen-ai/history', methods=['GET'])
def get_chat_history():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Fetch all messages for this user, sorted by time
    messages = ChatMessage.query.filter_by(user_id=user.id).order_by(ChatMessage.timestamp.asc()).all()
    
    history = [{
        'sender': msg.sender,
        'text': msg.message,
        'timestamp': msg.timestamp
    } for msg in messages]
    
    return jsonify(history)

# --- NEW: Clear Chat History ---
@genai_bp.route('/gen-ai/history', methods=['DELETE'])
def clear_chat_history():
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
        
    ChatMessage.query.filter_by(user_id=user.id).delete()
    db.session.commit()
    
    return jsonify({'message': 'History cleared'})

# ... (keep existing parse_resume, generate_jd, etc. routes below) ...
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

    # UPDATED PROMPT: Explicitly ask for JSON structure
    system_prompt = """You are an expert HR assistant. Generate a detailed job description in strict JSON format. 
    The JSON must have the following keys:
    - "generated_description": A professional summary of the role.
    - "generated_responsibilities": A list of strings (3-5 bullet points).
    - "generated_qualifications": A list of strings (3-5 bullet points).
    Do not include any markdown formatting like ```json ... ```."""
    
    user_prompt = f"Generate a JD for {title} at {company}."

    response_text = llm_service.generate_text(system_prompt, user_prompt)

    # Clean up markdown if Gemini adds it despite instructions
    if response_text.startswith("```json"):
        response_text = response_text.replace("```json", "").replace("```", "")

    try:
        response_json = json.loads(response_text)
    except:
        # Fallback if JSON parsing fails
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

    # UPDATED PROMPT: Explicitly ask for JSON structure
    system_prompt = """You are an expert HR interviewer. Generate a structured interview guide in strict JSON format based on the job description.
    The JSON must have the following keys:
    - "job_title": The extracted job title.
    - "behavioral_questions": A list of 3-5 behavioral interview questions (strings).
    - "technical_questions": A list of 3-5 technical interview questions specific to the role (strings).
    - "scoring_rubric": A string containing a guide on how to evaluate candidates (e.g., "1 - Poor: ..., 3 - Average: ..., 5 - Excellent: ...").
    Do not include any markdown formatting like ```json ... ```."""

    user_prompt = f"JD: {jd_text}"

    response_text = llm_service.generate_text(system_prompt, user_prompt)

    # Clean up markdown if Gemini adds it despite instructions
    if response_text.startswith("```json"):
        response_text = response_text.replace("```json", "").replace("```", "")
    elif response_text.startswith("```"):
        response_text = response_text.replace("```", "")

    try:
        response_json = json.loads(response_text)
    except:
         # Fallback: puts text in rubric if parsing fails, but prevents crash
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

    # UPDATED PROMPT: Explicitly ask for JSON structure
    system_prompt = """You are an expert HR assistant. Summarize the following interview feedback notes into a structured JSON format.
    The JSON must have the following keys:
    - "summary": A concise paragraph summarizing the candidate's performance (string).
    - "strengths": A list of the candidate's key strengths (list of strings).
    - "weaknesses": A list of the candidate's key weaknesses or areas for improvement (list of strings).
    - "recommendation": A short recommendation string (e.g., "Hire", "Strong Hire", "No Hire", "Needs Discussion").
    Do not include any markdown formatting like ```json ... ```."""

    user_prompt = f"Notes:\n{notes}"

    response_text = llm_service.generate_text(system_prompt, user_prompt)

    # Clean up markdown if Gemini adds it despite instructions
    if response_text.startswith("```json"):
        response_text = response_text.replace("```json", "").replace("```", "")
    elif response_text.startswith("```"):
        response_text = response_text.replace("```", "")

    try:
        response_json = json.loads(response_text)
    except:
        # Fallback: put text in summary if parsing fails
        response_json = {
            "summary": response_text,
            "strengths": ["Could not parse strengths."],
            "weaknesses": ["Could not parse weaknesses."],
            "recommendation": "Needs Discussion"
        }

    return jsonify(response_json)