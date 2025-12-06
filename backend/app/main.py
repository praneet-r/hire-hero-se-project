from app import create_app
from app.database import db
from app.config import Config
from flask import Flask
import os

app = create_app()

if __name__ == '__main__':
    # create tables if not exists (for quick dev)
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)