from flask import Blueprint, request, jsonify
from ..services.chatbot_engine import generate_response

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/ask', methods=['POST'])
def ask():
    data = request.get_json() or {}
    prompt = data.get('prompt', 'Hello')
    reply = generate_response(prompt)
    return jsonify({'reply': reply})