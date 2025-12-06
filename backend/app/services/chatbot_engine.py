import os
import requests
import json

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

def generate_response(prompt):
    # FAQ answers
    FAQ_ANSWERS = [
        (r'^(hi+|hello+|hey+|hii+|greetings)[!. ]*$', "Hello! How can I help you today?"),
        (r'status.*application', "You can check your application status in the 'My Applications' section."),
        (r'salary.*analyst', "The salary range for Analyst roles is typically ₹40k–₹60k per month."),
        (r'interview.*process', "The interview process usually takes 5–7 business days."),
        (r'update.*resume', "Yes, you can update your resume from your profile page."),
        (r'core values', "Our company values innovation, integrity, and teamwork."),
        (r'help|support', "For help, contact support@company.com or use this chatbot!"),
    ]
    import re
    for pattern, answer in FAQ_ANSWERS:
        if re.search(pattern, prompt, re.IGNORECASE):
            return answer

    # ...existing Gemini API code...
    api_key = GEMINI_API_KEY or 'REPLACE_WITH_KEY'
    url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
    headers = {'Content-Type': 'application/json'}
    params = {'key': api_key}
    payload = {
        'instances': [{'input': prompt}]
    }
    try:
        resp = requests.post(url, headers=headers, params=params, json=payload, timeout=15)
        if resp.status_code == 200:
            j = resp.json()
            text = j.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text')
            if text:
                return text
            return json.dumps(j)
        else:
            return "Sorry, I couldn't answer that right now. Please try again later or ask something else!"
    except Exception as e:
        return "Sorry, I couldn't answer that right now. Please try again later or ask something else!"