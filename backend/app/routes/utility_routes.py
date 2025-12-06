from flask import Blueprint, jsonify, send_from_directory, current_app
import os

utility_bp = Blueprint('utility_bp', __name__)

@utility_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

@utility_bp.route('/uploads/<path:filename>', methods=['GET'])
def get_uploaded_file(filename):
    upload_folder = os.path.join(current_app.root_path, 'uploads')
    return send_from_directory(upload_folder, filename)
