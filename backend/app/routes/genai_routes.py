from flask import Blueprint, request, jsonify
from ..services.llm_service import llm_service
from ..models import Job, Application, User, ChatMessage, Employee
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
    full_name = f"{user.first_name} {user.last_name}"

    # UPDATED PROMPT LOGIC
    system_prompt = """You are a professional cover letter generator. 
    Output ONLY the final cover letter text. 
    Do not include any conversational filler (like "Here is a draft", "Good luck"), instructions, or advice.
    Start directly with the candidate's header and end with the signature.
    """

    user_prompt = f"""
    Write a professional cover letter using the following details:
    
    CANDIDATE NAME: {full_name}
    JOB TITLE: {job.title}
    COMPANY NAME: {job.company}
    PROFILE SUMMARY: {profile_summary}
    USER NOTES: {user_notes}

    Requirements:
    1. Use the Candidate Name ({full_name}) in the header and signature.
    2. Use the Company Name ({job.company}) and Job Title ({job.title}) in the body of the letter.
    3. Use placeholders ONLY for missing contact info: "[Your Address]", "[Your Phone Number]", "[Your Email]", and "[Date]".
    4. The tone should be professional and enthusiastic.
    """

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

@genai_bp.route('/gen-ai/performance-insights', methods=['POST'])
def generate_performance_insights():
    user = get_current_user()
    if not user or user.role != 'hr':
        return jsonify({'error': 'Unauthorized'}), 403

    # 1. Fetch Data
    employees = Employee.query.filter_by(hired_by=user.id).all()
    if not employees:
        return jsonify([])

    # 2. Pre-process Stats (Python side)
    dept_scores = {}
    recent_comments = []
    total_rating = 0
    rating_count = 0
    
    for emp in employees:
        emp_ratings = [p.rating for p in emp.performances if p.rating]
        if emp_ratings:
            avg = sum(emp_ratings) / len(emp_ratings)
            
            # Dept Stats
            dept = emp.department or "Unknown"
            if dept not in dept_scores:
                dept_scores[dept] = {'sum': 0, 'count': 0}
            dept_scores[dept]['sum'] += avg
            dept_scores[dept]['count'] += 1
            
            total_rating += avg
            rating_count += 1

        # Collect last 2 comments per employee
        if emp.performances:
            # Sort reviews by date descending
            sorted_reviews = sorted(emp.performances, key=lambda x: x.date, reverse=True)
            for p in sorted_reviews[:2]:
                if p.comments:
                    recent_comments.append(f"[{emp.department}] {p.comments}")

    # Limit comments to avoid token limits
    recent_comments = recent_comments[:15]

    # 3. Construct Prompts Locally
    dept_summary = ", ".join([
        f"{d}: {round(v['sum']/v['count'], 1)}" 
        for d, v in dept_scores.items()
    ])
    
    global_avg = round(total_rating / rating_count, 1) if rating_count else 0

    stats_context = f"""
    Global Average Rating: {global_avg}/5.0
    Department Averages: {dept_summary}
    Recent Review Sample:
    {chr(10).join(recent_comments)}
    """

    system_prompt = """
    You are an HR Data Analyst for HireHero. Analyze the provided performance metrics and review comments.
    Generate exactly 3 actionable insights in strict JSON format.
    
    The JSON output must be a list of objects with these keys:
    - "title": Short headline (e.g., "Engineering Risk", "Top Talent").
    - "detail": A 1-2 sentence explanation of the finding.
    - "type": One of "success" (positive), "warning" (negative/risk), "info" (neutral).

    Focus on:
    1. Identifying departments with high/low averages.
    2. Spotting sentiment trends in recent comments (e.g., burnout, high energy).
    3. Flagging potential retention risks or training needs.
    
    Do not include markdown formatting like ```json ... ```.
    """
    
    user_prompt = f"Performance Data Analysis:\n{stats_context}"

    # 4. Call AI
    response_text = llm_service.generate_text(system_prompt, user_prompt)

    # Clean up markdown if Gemini adds it
    if response_text.startswith("```json"):
        response_text = response_text.replace("```json", "").replace("```", "")
    elif response_text.startswith("```"):
        response_text = response_text.replace("```", "")

    try:
        insights = json.loads(response_text)
        return jsonify(insights)
    except Exception as e:
        print(f"Insight Generation Error: {e}")
        return jsonify([
            {"title": "Analysis Error", "detail": "Could not generate insights from the data provided.", "type": "info"}
        ])
    
@genai_bp.route('/gen-ai/mock-interview/start', methods=['POST'])
def start_mock_interview():
    user = get_current_user()
    if not user: return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    job_id = data.get('job_id')
    
    job = Job.query.get(job_id)
    if not job: return jsonify({'error': 'Job not found'}), 404

    # Prompt for Questions
    system_prompt = """You are an expert technical interviewer. Generate 5 interview questions for the specified role.
    - 3 Questions must be Technical (specific to the skills/stack).
    - 2 Questions must be Behavioral (STAR method style).
    - Output strict JSON: A simple list of strings. ["Question 1", "Question 2", ...]
    - Do not include markdown formatting."""
    
    user_prompt = f"Role: {job.title}\nCompany: {job.company}\nDescription: {job.description[:500]}..."

    response_text = llm_service.generate_text(system_prompt, user_prompt)
    
    # Cleanup & Parse
    if response_text.startswith("```json"):
        response_text = response_text.replace("```json", "").replace("```", "")
    elif response_text.startswith("```"):
        response_text = response_text.replace("```", "")

    try:
        questions = json.loads(response_text)
        return jsonify({'questions': questions})
    except:
        # Fallback if AI fails json structure
        return jsonify({'questions': [
            "Tell me about yourself.",
            "What is your greatest strength?",
            "Describe a technical challenge you faced.",
            "Why do you want to join us?",
            "Where do you see yourself in 5 years?"
        ]})

@genai_bp.route('/gen-ai/mock-interview/submit', methods=['POST'])
def submit_mock_interview():
    user = get_current_user()
    if not user: return jsonify({'error': 'Unauthorized'}), 401

    data = request.json
    job_id = data.get('job_id')
    transcript = data.get('answers', []) # List of {question, answer}

    job = Job.query.get(job_id)
    if not job: return jsonify({'error': 'Job not found'}), 404

    # Format Transcript for AI
    transcript_text = ""
    for idx, item in enumerate(transcript):
        transcript_text += f"Q{idx+1}: {item['question']}\nCandidate Answer: {item['answer']}\n\n"

    system_prompt = """You are an expert Hiring Manager. specific job. 
    Evaluate the candidate's interview session.
    Output strict JSON with the following structure:
    {
        "overall_score": 8,  // Integer 1-10
        "overall_feedback": "One sentence summary.",
        "question_evaluations": [
            {
                "question": "The question text...",
                "rating": 7, // 1-10
                "feedback": "Specific advice on how to improve this specific answer."
            },
            ... for all 5 questions
        ]
    }
    Do not include markdown."""

    user_prompt = f"Job: {job.title}\n\nInterview Transcript:\n{transcript_text}"

    response_text = llm_service.generate_text(system_prompt, user_prompt)

    # Cleanup & Parse
    if response_text.startswith("```json"):
        response_text = response_text.replace("```json", "").replace("```", "")
    elif response_text.startswith("```"):
        response_text = response_text.replace("```", "")

    try:
        evaluation = json.loads(response_text)
        return jsonify(evaluation)
    except:
        return jsonify({'error': 'Failed to generate evaluation'}), 500