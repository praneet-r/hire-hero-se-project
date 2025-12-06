# 🧠 Recruitment System

A full-stack Recruitment Management Platform built with **React (Vite)**, **Flask**, and **PostgreSQL**.
It streamlines recruitment workflows — from job posting, candidate tracking, and resume–JD matching,
to AI-driven insights and chatbot assistance using **Google Gemini API**.

---

## 🚀 Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React (Vite) + Tailwind CSS + React Router |
| **Backend** | Flask + SQLAlchemy + REST API Architecture |
| **Database** | PostgreSQL |
| **AI Chatbot** | Google Gemini API Integration |
| **Auth** | Context-based login (JWT-ready) |
| **Styling** | Tailwind CSS |

---

## 🏗️ Project Structure

```
recruitment-system/
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ChatbotWidget.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ChatbotPage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── chatbotService.js
│   │   └── styles/
│   │       └── globals.css
│   ├── vite.config.js
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py
│   │   ├── main.py
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   ├── requirements.txt
│   └── run.py
│
└── database/
    ├── init_db.sql
    └── seed_data.sql
```

---

## ⚙️ Setup Guide

### 🧩 1. Clone the Repository
```bash
git clone https://github.com/yourusername/recruitment-system.git
cd recruitment-system
```

---

### 🖥️ 2. Backend Setup (Flask)
```bash
cd backend
python -m venv venv
source venv/bin/activate       # or venv\Scripts\activate (Windows)
pip install -r requirements.txt
```

Create a `.env` file (already provided) and update your credentials:
```bash
FLASK_ENV=development
SECRET_KEY=your_secret_key_here
DATABASE_URL=postgresql://username:password@localhost:5432/recruitment_db
GEMINI_API_KEY=your_gemini_api_key_here
```

Run the Flask server:
```bash
flask --app app.main run --port 5000
```

Backend runs at 👉 **http://localhost:5000**

---

### 💅 3. Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at 👉 **http://localhost:3000**

The Vite proxy is already configured to forward all API calls from
`/api/*` → **http://localhost:5000/api/** (Flask backend).

---

## 🤖 Google Gemini Chatbot Integration

The backend includes a placeholder service:
```python
# backend/app/services/chatbot_engine.py
def generate_response(prompt):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    params = {"key": GEMINI_API_KEY}
    ...
```

Frontend chatbot widget:
```jsx
const res = await axios.post("/api/chatbot/ask", { prompt })
setReply(res.data.reply)
```

✅ Replace the placeholder logic with your official Gemini API implementation.

---

## 🧠 Key Features

- **Job Posting & Management**
- **Candidate Registration & Login**
- **HR Dashboard for Recruiters**
- **Chatbot Assistant** using Google Gemini for:
  - JD Generation
  - Resume-JD Matching Insights
  - Candidate Q&A
- **Responsive UI** built with Tailwind CSS
- **React Router** navigation for modular pages

---

## 🧪 Future Enhancements
- JWT-based authentication system
- File upload for resume parsing
- Advanced Gemini prompts for candidate evaluation
- Role-based dashboards (Recruiter, Candidate, Admin)
- Analytics & Reporting with Chart.js

---

## 🧰 Scripts

| Command | Description |
|----------|--------------|
| `npm run dev` | Start Vite frontend |
| `flask run` | Start Flask backend |
| `npm run build` | Build frontend for production |

---

## 🧑‍💻 Contributors
- **Punit Kumar (23f1002051)** - Project Manager
- **Ayush Kumar (21f1002770)** – Lead Developer
- **Geethanjaly MT (21f1006940)**
- **Laxmi Narayan (21f1003804)**
- **Poornesh Rajeevamu U (21f1001683)**
- **Pranav Joshi (22f3003006)**
- **Praneet R (21f1003420)**
- **Siddhi Ganesh (21f1000100)**

---