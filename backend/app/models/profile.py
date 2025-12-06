from ..database import db

class Profile(db.Model):
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    phone = db.Column(db.String(20))
    location = db.Column(db.String(120))
    summary = db.Column(db.Text)
    profile_pic = db.Column(db.String(255))
    resume = db.Column(db.String(255))  # Path to uploaded resume file
    completeness = db.Column(db.Integer, default=0)
    user = db.relationship('User', back_populates='profile')
    experiences = db.relationship('Experience', back_populates='profile', cascade='all, delete-orphan')
