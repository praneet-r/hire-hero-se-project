from ..database import db
from datetime import datetime

class Performance(db.Model):
    __tablename__ = 'performances'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    metric = db.Column(db.String(120), nullable=False)
    value = db.Column(db.String(120))
    date = db.Column(db.Date, default=datetime.utcnow)
    employee = db.relationship('Employee', back_populates='performances')
