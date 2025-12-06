from ..database import db
from datetime import datetime

class Application(db.Model):
    __tablename__ = 'applications'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False, default='applied')
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    user = db.relationship('User', back_populates='applications')
    job = db.relationship('Job', back_populates='applications')
