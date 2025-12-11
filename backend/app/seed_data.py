from .database import db
from .models import User, Profile, Job, Application, Employee, Performance, Education, Experience, Interview
from .services.matching_service import matching_service
from datetime import datetime, timedelta
import random
import csv
import os

# ==========================================
# CONFIGURATION
# Set to False to disable dummy data generation
# ==========================================
CREATE_DUMMY_DATA = False

def seed_database():
    if not CREATE_DUMMY_DATA:
        return

    print("--- Clearing existing data ---")
    db.drop_all()
    db.create_all()
    print("--- Database cleared ---")

    print("--- Seeding with Dummy Data ---")
    
    # --- Data Lists ---
    male_names = [
        "Aarav", "Vihaan", "Aditya", "Arjun", "Sai", "Reyansh", "Rahul", "Amit", 
        "Vikram", "Rohan", "Karthik", "Siddharth", "Manish", "Varun", "Nikhil", 
        "Pranav", "Ishaan", "Dhruv", "Krishna", "Om"
    ]
    female_names = [
        "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Priya", "Neha", "Sneha", 
        "Anjali", "Kavya", "Isha", "Meera", "Riya", "Pooja", "Aditi", "Nisha", 
        "Kriti", "Tanvi", "Shruti", "Radha"
    ]
    last_names = [
        "Kumar", "Sharma", "Patel", "Singh", "Das", "Nair", "Reddy", "Gupta", 
        "Mishra", "Joshi", "Chopra", "Desai", "Mehta", "Iyer", "Verma", "Rao", 
        "Saxena", "Malhotra", "Bhatia", "Kapoor"
    ]
    
    # --- 10 Field Definitions (Grouped by Similarity) ---
    fields_config = [
        # Group A: Tech
        {
            "name": "Software Engineering",
            "company": "TechNova Solutions",
            "jobs": ["Senior Full Stack Developer", "DevOps Engineer"],
            "skills": ["Python", "JavaScript", "React", "AWS", "Docker", "Kubernetes", "SQL", "Git", "CI/CD", "Node.js"],
            "degrees": ["B.Tech in Computer Science", "M.S. in Software Engineering"],
            "summaries": ["Passionate Software Engineer with 6+ years of experience building scalable web applications. Expert in Python and JavaScript ecosystems.", "DevOps specialist with a background in automating infrastructure and deployment pipelines."]
        },
        {
            "name": "Data Science",
            "company": "TechNova Solutions",
            "jobs": ["Data Scientist", "Machine Learning Engineer"],
            "skills": ["Python", "Machine Learning", "Pandas", "NumPy", "TensorFlow", "SQL", "Data Analysis", "Statistics", "AWS", "Visualization"],
            "degrees": ["M.S. in Data Science", "B.Tech in Computer Science"],
            "summaries": ["Analytical Data Scientist with a strong background in machine learning and statistical modeling. Experienced in building predictive models.", "Machine Learning Engineer focused on deploying scalable AI solutions. Proficient in Python and deep learning frameworks."]
        },
        # Group B: Medical
        {
            "name": "Healthcare",
            "company": "City General Hospital",
            "jobs": ["Registered Nurse (ICU)", "Medical Laboratory Technician"],
            "skills": ["Patient Care", "ICU", "Vital Signs", "Phlebotomy", "Medical Terminology", "ACLS", "BLS", "Laboratory Safety", "Biology"],
            "degrees": ["Bachelor of Science in Nursing", "Associate Degree in Medical Technology"],
            "summaries": ["Dedicated Registered Nurse with extensive experience in critical care settings. Compassionate and detail-oriented.", "Skilled Medical Laboratory Technician with expertise in diagnostic testing and analysis. Committed to accuracy."]
        },
        {
            "name": "Pharmacy",
            "company": "City General Hospital",
            "jobs": ["Pharmacist", "Pharmacy Technician"],
            "skills": ["Pharmacology", "Medication Dispensing", "Patient Counseling", "Pharmacy Law", "Drug Interactions", "Inventory Management", "Calculations", "Biology"],
            "degrees": ["Doctor of Pharmacy (Pharm.D.)", "Pharmacy Technician Certification"],
            "summaries": ["Licensed Pharmacist with a focus on patient safety and medication therapy management. Strong knowledge of drug interactions.", "Certified Pharmacy Technician with experience in retail and hospital settings. Efficient and organized."]
        },
        # Group C: Marketing
        {
            "name": "Digital Marketing",
            "company": "GrowthHive Agency",
            "jobs": ["Digital Marketing Manager", "SEO Specialist"],
            "skills": ["SEO", "SEM", "Google Analytics", "Content Marketing", "Social Media Management", "Copywriting", "Email Marketing", "PPC"],
            "degrees": ["B.A. in Marketing", "Master's in Digital Communications"],
            "summaries": ["Results-driven Digital Marketing Manager with a focus on growth strategies and brand development. Expert in SEO and PPC.", "Creative SEO Specialist with a knack for optimizing web content and improving organic search rankings."]
        },
        {
            "name": "Public Relations",
            "company": "GrowthHive Agency",
            "jobs": ["Public Relations Manager", "Content Strategist"],
            "skills": ["Public Relations", "Media Relations", "Press Releases", "Content Strategy", "Crisis Management", "Communications", "Social Media", "Writing"],
            "degrees": ["B.A. in Public Relations", "B.A. in Communications"],
            "summaries": ["Strategic Public Relations Manager with a proven track record of managing media relations and corporate communications.", "Content Strategist passionate about storytelling and brand messaging. Experienced in creating engaging content."]
        },
        # Group D: Legal
        {
            "name": "Legal",
            "company": "Vanguard Law Firm",
            "jobs": ["Corporate Attorney", "Legal Paralegal"],
            "skills": ["Corporate Law", "Contract Negotiation", "Legal Research", "Litigation Support", "Compliance", "Drafting", "Case Management"],
            "degrees": ["Juris Doctor (J.D.)", "Paralegal Certificate"],
            "summaries": ["Experienced Corporate Attorney specializing in mergers and acquisitions. Strong negotiator with a deep understanding of business law.", "Detail-oriented Paralegal with strong organizational skills and experience in legal research and document preparation."]
        },
        {
            "name": "Corporate Compliance",
            "company": "Vanguard Law Firm",
            "jobs": ["Compliance Officer", "Risk Manager"],
            "skills": ["Compliance", "Risk Management", "Auditing", "Regulations", "Policy Development", "Legal Research", "Analysis", "Corporate Law"],
            "degrees": ["Master's in Business Law", "B.S. in Business Administration"],
            "summaries": ["Compliance Officer dedicated to ensuring organizational adherence to laws and regulations. Strong background in risk assessment.", "Risk Manager with experience in identifying and mitigating business risks. Skilled in developing control systems."]
        },
        # Group E: Finance
        {
            "name": "Finance",
            "company": "Summit Capital",
            "jobs": ["Investment Banker", "Financial Analyst"],
            "skills": ["Financial Modeling", "Valuation", "Excel", "Data Analysis", "Accounting", "Risk Management", "Investment Banking", "Reporting"],
            "degrees": ["MBA in Finance", "B.S. in Economics"],
            "summaries": ["Ambitious Investment Banker with expertise in financial modeling and valuation. Proven ability to analyze complex market data.", "Analytical Financial Analyst with a strong background in budgeting and forecasting. Skilled in providing actionable insights."]
        },
        {
            "name": "Accounting",
            "company": "Summit Capital",
            "jobs": ["Senior Accountant", "Tax Consultant"],
            "skills": ["Accounting", "GAAP", "Taxation", "Financial Reporting", "Auditing", "Excel", "Bookkeeping", "Compliance"],
            "degrees": ["B.S. in Accounting", "CPA Certification"],
            "summaries": ["Senior Accountant with a thorough knowledge of GAAP and financial reporting. Experienced in managing month-end close processes.", "Tax Consultant with expertise in tax planning and compliance. Dedicated to minimizing tax liabilities for clients."]
        }
    ]

    schools = [
        "Delhi Public School", "Kendriya Vidyalaya", "National Public School", 
        "The Doon School", "Mayo College", "St. Xavier's High School", 
        "DAV Public School", "Ryan International School", "Army Public School"
    ]

    hs_descriptions = [
        "Completed Senior Secondary education with a focus on Physics, Chemistry, and Mathematics (PCM). Achieved an aggregate score of 95% in the board examinations.",
        "Graduated High School with honors in the Commerce stream. Served as the School Prefect and organized various cultural and sports events."
    ]

    # --- Job Description Generator ---
    def generate_job_description(title, company, dept):
        csv_path = os.path.join(os.path.dirname(__file__), 'job_descriptions.csv')
        description_map = {}
        try:
            with open(csv_path, mode='r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    description_map[row['title'].strip()] = row['description'].strip()
        except FileNotFoundError:
            print(f"Warning: {csv_path} not found.")

        specific_desc = description_map.get(title, f"We are looking for a {title} to join our {dept} team.")
        
        return f"""
{specific_desc}

Company Culture:
At {company}, we foster a culture of innovation and collaboration. We believe in empowering our employees to take ownership of their work.

Benefits:
- Competitive salary and comprehensive health insurance packages.
- Flexible working hours and remote work options.
- Professional development and training.
"""

    # --- Helper: Create User ---
    def create_user(email, first, last, role, company=None):
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                first_name=first,
                last_name=last,
                email=email,
                role=role,
                company_name=company
            )
            user.set_password("123") 
            db.session.add(user)
            db.session.commit()
            print(f"  [+] Created {role}: {first} {last} ({email})")
        return user

    # --- Helper: Generate Phone ---
    def gen_phone():
        return f"{random.choice(['9', '8', '7'])}{random.randint(100000000, 999999999)}"

    # --- 1. Create HR Users (5) ---
    print("\n--- Seeding HR Users ---")
    hr_users = []
    
    hr_names = [
        ("Vikram", "Malhotra"), ("Anjali", "Desai"), ("Rohan", "Mehta"), 
        ("Priya", "Iyer"), ("Siddharth", "Reddy")
    ]

    for i in range(5):
        field_primary = fields_config[i * 2]
        field_similar = fields_config[i * 2 + 1]
        
        fname, lname = hr_names[i]
        email = f"hr{i+1}@gmail.com" 
        
        hr = create_user(email, fname, lname, "hr", field_primary["company"])
        hr_users.append((hr, [field_primary, field_similar]))
        
        if not hr.profile:
            profile = Profile(
                user_id=hr.id,
                phone=gen_phone(),
                location="Bangalore, India",
                summary=f"HR Head at {field_primary['company']}.",
                profile_pic=f"/uploads/{'woman.png' if (i%2!=0) else 'man.png'}",
            )
            db.session.add(profile)
    db.session.commit()

    # --- 2. Create Employees (15) ---
    print("\n--- Seeding Employees ---")
    
    for i in range(1, 16):
        full_name = random.choice(male_names + female_names)
        is_female = full_name in female_names
        fname = full_name
        lname = random.choice(last_names)
        email = f"employee{i}@gmail.com"
        
        assigned_hr, assigned_fields = hr_users[(i-1) % 5]
        field_data = random.choice(assigned_fields)
        
        emp_user = create_user(email, fname, lname, "employee")
        
        if not emp_user.profile:
            profile = Profile(
                user_id=emp_user.id,
                phone=gen_phone(),
                location="Bangalore",
                summary=f"Employee at {field_data['company']}.",
                profile_pic=f"/uploads/{'woman.png' if is_female else 'man.png'}"
            )
            db.session.add(profile)
            db.session.flush()

        if not emp_user.employee:
            emp = Employee(
                user_id=emp_user.id,
                job_title=random.choice(field_data["jobs"]),
                department=field_data["name"],
                job_location="Bangalore",
                hired_at=datetime.utcnow() - timedelta(days=random.randint(30, 1000)),
                photo=f"/uploads/{'woman.png' if is_female else 'man.png'}",
                hired_by=assigned_hr.id
            )
            db.session.add(emp)
            db.session.commit()
            
            for _ in range(random.randint(1, 3)):
                perf = Performance(
                    employee_id=emp.id,
                    metric="Annual Review",
                    value=str(random.randint(75, 100)),
                    date=datetime.utcnow() - timedelta(days=random.randint(1, 365))
                )
                db.session.add(perf)
    db.session.commit()

    # --- 3. Create Jobs (10) ---
    print("\n--- Seeding Jobs ---")
    all_jobs = []
    
    for hr, assigned_fields in hr_users:
        for field_data in assigned_fields:
            title = field_data["jobs"][0]
            job = Job(
                title=title,
                company=field_data["company"],
                department=field_data["name"],
                description=generate_job_description(title, field_data["company"], field_data["name"]),
                location="Bangalore",
                type="Full-Time",
                remote_option="Hybrid",
                experience_level="Mid",
                education="Bachelor's",
                salary="Competitive",
                tags=",".join(field_data["skills"][:5]),
                benefits="Health Insurance,Paid Leave,Remote Work",
                application_deadline=(datetime.utcnow() + timedelta(days=random.randint(10, 60))).strftime('%Y-%m-%d'),
                posted_by=hr.id
            )
            db.session.add(job)
            all_jobs.append(job)
            
    db.session.commit()
    print(f"  [+] Created {len(all_jobs)} Job Listings")

    # --- 4. Create Job Seekers (20) ---
    print("\n--- Seeding Job Seekers ---")
    seekers = []
    seeker_names = (male_names + female_names)[:20]
    
    for i in range(20):
        field_idx = i % 10
        field_data = fields_config[field_idx]
        
        full_name = seeker_names[i]
        is_female = full_name in female_names
        fname = full_name
        lname = random.choice(last_names)
        email = f"js{i+1}@gmail.com"
        
        seeker = create_user(email, fname, lname, "candidate")
        seekers.append((seeker, field_data)) 
        
        if not seeker.profile:
            pic = f"/uploads/{'woman.png' if is_female else 'man.png'}"
            
            skills_str = ", ".join(field_data["skills"])
            summary_text = f"{random.choice(field_data['summaries'])}\n\nCore Skills: {skills_str}"
            
            profile = Profile(
                user_id=seeker.id,
                phone=gen_phone(),
                location="Bangalore",
                summary=summary_text,
                completeness=95,
                profile_pic=pic
            )
            db.session.add(profile)
            db.session.flush()

            # Education
            uni_start = datetime.utcnow() - timedelta(days=2000)
            uni_end = datetime.utcnow() - timedelta(days=600)
            edu_uni = Education(
                profile_id=profile.id,
                degree=random.choice(field_data["degrees"]),
                institution="Premier Institute of Technology",
                start_date=uni_start,
                end_date=uni_end,
                description=f"Specialized in {field_data['name']} studies."
            )
            db.session.add(edu_uni)

            # High School
            hs_end = uni_start - timedelta(days=90)
            hs_start = hs_end - timedelta(days=730)
            edu_hs = Education(
                profile_id=profile.id,
                degree="Senior Secondary (Class XII)",
                institution=random.choice(schools),
                start_date=hs_start,
                end_date=hs_end,
                description=random.choice(hs_descriptions)
            )
            db.session.add(edu_hs)

            # Experience
            exp = Experience(
                profile_id=profile.id,
                title=field_data["jobs"][0],
                company="Global Corp",
                start_date=datetime.utcnow() - timedelta(days=500),
                end_date=None,
                description=f"Working as a key member of the team in {field_data['name']} domain. Leveraging skills in {skills_str[:50]}..."
            )
            db.session.add(exp)

    db.session.commit()

    # --- 5. Create Applications & Interviews ---
    print("\n--- Seeding Applications ---")
    app_count = 0
    statuses = ['applied', 'interviewing', 'under_review', 'offer_extended', 'accepted', 'rejected']

    for seeker, expert_field_data in seekers:
        expert_dept = expert_field_data["name"]
        
        idx = -1
        for k, f in enumerate(fields_config):
            if f["name"] == expert_dept:
                idx = k
                break
        
        similar_idx = idx + 1 if idx % 2 == 0 else idx - 1
        similar_dept = fields_config[similar_idx]["name"]
        
        high_jobs = [j for j in all_jobs if j.department == expert_dept]
        med_jobs = [j for j in all_jobs if j.department == similar_dept]
        low_jobs = [j for j in all_jobs if j.department != expert_dept and j.department != similar_dept]
        
        target_jobs = []
        if high_jobs: target_jobs.append(random.choice(high_jobs))
        if med_jobs: target_jobs.append(random.choice(med_jobs))
        if low_jobs: target_jobs.append(random.choice(low_jobs))
            
        for job in target_jobs:
            if not Application.query.filter_by(user_id=seeker.id, job_id=job.id).first():
                status = random.choice(statuses)
                
                score = 0.0
                try:
                    score = matching_service.calculate_score(seeker.profile, job)
                except Exception as e:
                    print(f"Error calculating score: {e}")
                
                app = Application(
                    user_id=seeker.id,
                    job_id=job.id,
                    status=status,
                    applied_at=datetime.utcnow() - timedelta(days=random.randint(1, 20)),
                    match_score=score,
                    match_explanation=None
                )
                db.session.add(app)
                db.session.flush()
                app_count += 1
                
                if status == 'interviewing':
                    interview = Interview(
                        application_id=app.id,
                        stage="Technical Round",
                        scheduled_at=datetime.utcnow() + timedelta(days=random.randint(1, 7), hours=random.randint(9, 17)),
                        location_type="video",
                        location_detail="https://meet.google.com/abc-defg-hij"
                    )
                    db.session.add(interview)

    db.session.commit()
    print(f"  [+] Created {app_count} applications.")
    print("--- Database Seed Complete ---")
    print("DEMO CREDENTIALS:")
    print("  HR (Software/Data): hr1@gmail.com / 123")
    print("  JS (Software Exp): js1@gmail.com / 123")