from flask import Flask, jsonify, send_from_directory
from .config import Config
import os
from .database import db
from .routes.auth_routes import auth_bp, init_oauth
from .routes.chatbot_routes import chatbot_bp
from .models import User, Job, Profile, Experience, Application, Employee, Performance, Analytics, ChatMessage
from .routes.job_routes import job_bp
from .routes.application_routes import application_bp
from .routes.profile_routes import profile_bp
from .routes.employee_routes import employee_bp
from .routes.analytics_routes import analytics_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Serve uploaded files (profile pics, resumes)
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        upload_folder = os.path.join(app.root_path, 'uploads')
        return send_from_directory(upload_folder, filename)


    db.init_app(app)

    with app.app_context():
        db.create_all()

    # register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(job_bp, url_prefix='/api')
    app.register_blueprint(application_bp, url_prefix='/api')
    app.register_blueprint(profile_bp, url_prefix='/api')
    app.register_blueprint(employee_bp, url_prefix='/api')
    app.register_blueprint(analytics_bp, url_prefix='/api')

    # Initialize OAuth
    init_oauth(app)

    @app.route('/api/health')
    def health():
        return jsonify({'status':'ok'})

    return app