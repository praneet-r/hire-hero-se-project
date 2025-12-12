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
    
    # --- Locations List ---
    locations = [
        "Bangalore", "Mumbai", "Delhi", "Hyderabad", "Pune", "Chennai", 
        "Gurgaon", "Noida", "Kolkata", "Ahmedabad"
    ]

    # --- Companies & Institutions ---
    company_names = [
        "TechNova Solutions", "Global Corp", "Innovate Inc", "Apex Systems", 
        "CloudWalkers", "DataMinds", "HealthPlus", "FinServe", "Creative Hive", "SoftSynergy"
    ]
    
    universities = [
        "IIT Bombay", "IIT Delhi", "BITS Pilani", "Anna University", 
        "University of Mumbai", "Delhi University", "VIT Vellore", 
        "Manipal Institute of Technology", "SRM University", "Amity University"
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

    # --- Helper: Generate Salary ---
    def gen_salary():
        return str(random.randint(5, 45) * 100000)

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
                location=random.choice(locations),
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
        
        emp_location = random.choice(locations)

        if not emp_user.profile:
            profile = Profile(
                user_id=emp_user.id,
                phone=gen_phone(),
                location=emp_location,
                summary=f"Employee at {field_data['company']}.",
                profile_pic=f"/uploads/{'woman.png' if is_female else 'man.png'}"
            )
            db.session.add(profile)
            db.session.flush()

        if not emp_user.employee:
            # Randomize employee job location (On-site, Hybrid, Remote)
            loc_type = random.choice(["On-site", "Hybrid", "Remote"])
            if loc_type == "On-site":
                job_loc = emp_location
            elif loc_type == "Hybrid":
                job_loc = f"Hybrid ({emp_location})"
            else:
                job_loc = "Remote"

            emp_type = random.choice(["Full-Time", "Part-Time", "Contract", "Internship"])

            emp = Employee(
                user_id=emp_user.id,
                job_title=random.choice(field_data["jobs"]),
                department=field_data["name"],
                job_location=job_loc,
                employment_type=emp_type,
                salary=gen_salary(),
                hired_at=datetime.utcnow() - timedelta(days=random.randint(30, 1000)),
                photo=f"/uploads/{'woman.png' if is_female else 'man.png'}",
                hired_by=assigned_hr.id
            )
            db.session.add(emp)
            db.session.commit()
            
            # --- PERFORMANCE SEEDING ---
            # Create 1-4 reviews per employee
            for _ in range(random.randint(1, 4)):
                # Generate a random date within the last year
                review_date = datetime.utcnow() - timedelta(days=random.randint(1, 365))
                
                # Generate a realistic rating (mostly 3.0 to 5.0)
                rating = round(random.uniform(3.0, 5.0), 1)
                
                # Generate dummy comments
                comments_pool = [
                    "Exceeds expectations in delivery.",
                    "Needs to improve communication skills.",
                    "Great team player, always helpful.",
                    "Consistent performance throughout the quarter.",
                    "Showed great initiative on the last project.",
                    "Technical skills are strong, but missed a few deadlines."
                ]
                
                perf = Performance(
                    employee_id=emp.id,
                    rating=rating,
                    comments=random.choice(comments_pool),
                    date=review_date
                )
                db.session.add(perf)
    db.session.commit()

    # --- 3. Create Jobs (10) ---
    print("\n--- Seeding Jobs ---")
    all_jobs = []
    
    # Options for randomized job fields
    job_types = ["Full-Time", "Part-Time", "Contract", "Internship"]
    remote_options = ["Remote", "Hybrid", "On-site"]
    exp_levels = ["Junior", "Mid", "Senior", "Lead"]
    edu_reqs = ["Bachelor's", "Master's", "PhD"]
    benefit_opts = ["Health Insurance", "Paid Leave", "Remote Work", "Gym Membership", "Stock Options"]

    for hr, assigned_fields in hr_users:
        for field_data in assigned_fields:
            title = field_data["jobs"][0]
            
            # Pick random benefits (2-3)
            job_benefits = ",".join(random.sample(benefit_opts, k=random.randint(2, 3)))
            
            job_loc = random.choice(locations)
            rem_opt = random.choice(remote_options)
            
            # If Remote, location field should explicitly say Remote or a base location
            if rem_opt == "Remote":
                job_loc = "Remote"

            job = Job(
                title=title,
                company=field_data["company"],
                department=field_data["name"],
                description=generate_job_description(title, field_data["company"], field_data["name"]),
                location=job_loc,
                type=random.choice(job_types),
                remote_option=rem_opt,
                experience_level=random.choice(exp_levels),
                education=random.choice(edu_reqs),
                salary=gen_salary(),
                tags=",".join(field_data["skills"][:5]),
                benefits=job_benefits,
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
            
            # Calculate Dynamic Completeness
            comp_score = 0 # Base for having a user
            if summary_text: comp_score += 10
            if pic: comp_score += 10
            # Phone + Location
            phone_num = gen_phone()
            loc = random.choice(locations)
            if phone_num: comp_score += 10
            if loc: comp_score += 10
            
            # We will add education and experience below, so we'll estimate full here or update later.
            # Let's assume they will have them since we add them right after.
            comp_score += 20 # Education
            comp_score += 20 # Experience

            profile = Profile(
                user_id=seeker.id,
                phone=phone_num,
                location=loc,
                summary=summary_text,
                completeness=min(comp_score, 100),
                profile_pic=pic,
                views=random.randint(2, 15)
            )
            db.session.add(profile)
            db.session.flush()

            # Education
            uni_start = datetime.utcnow() - timedelta(days=2000)
            uni_end = datetime.utcnow() - timedelta(days=600)
            edu_uni = Education(
                profile_id=profile.id,
                degree=random.choice(field_data["degrees"]),
                institution=random.choice(universities),
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
                company=random.choice(company_names),
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