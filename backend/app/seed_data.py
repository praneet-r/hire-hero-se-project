from .database import db
from .models import User, Profile, Job, Application, Employee, Performance, Education, Experience, Interview
from datetime import datetime, timedelta
import random

# ==========================================
# CONFIGURATION
# Set to False to disable dummy data generation
# ==========================================
CREATE_DUMMY_DATA = True 

def seed_database():
    """
    Populates the database with dummy data for testing/demo purposes.
    """
    if not CREATE_DUMMY_DATA:
        return

    print("--- Clearing existing data ---")
    db.drop_all()
    db.create_all()
    print("--- Database cleared ---")

    print("--- Seeding with Dummy Data ---")
    
    # --- Data Lists ---
    male_names = ["Aarav", "Vihaan", "Aditya", "Arjun", "Sai", "Reyansh", "Muhammad", "Rahul", "Amit", "Vikram", "Rohan", "Karthik", "Siddharth", "Manish", "Varun"]
    female_names = ["Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Fatima", "Priya", "Neha", "Sneha", "Anjali", "Kavya", "Isha", "Meera", "Riya", "Pooja"]
    last_names = ["Kumar", "Sharma", "Patel", "Singh", "Das", "Nair", "Reddy", "Gupta", "Khan", "Mishra", "Joshi", "Chopra", "Desai", "Mehta", "Iyer"]
    
    companies = ["Google", "Microsoft", "Tesla", "Apple", "Amazon", "Netflix", "Meta", "IBM", "Infosys", "TCS", "Wipro", "HCL", "Zoho", "Swiggy", "Zomato"]
    
    institutes = ["IIT Madras", "IIT Bombay", "NIT Trichy", "BITS Pilani", "Anna University", "Delhi University", "VIT Vellore", "Manipal Institute", "SRM University"]
    degrees = ["B.Tech in Computer Science", "B.E. in Electronics", "M.Tech in Data Science", "MBA", "B.Sc in Mathematics"]
    
    descriptions_exp = [
        "Led the migration of legacy monoliths to microservices architecture, improving system scalability by 40%.",
        "Developed and maintained high-traffic web applications using React and Python, ensuring 99.9% uptime.",
        "Collaborated with cross-functional teams to design and implement new features for the flagship product.",
        "Optimized database queries and implemented caching strategies, reducing page load times by 30%.",
        "Mentored junior developers and conducted code reviews to maintain high code quality standards."
    ]

    descriptions_edu = [
        "Specialized in Artificial Intelligence and Machine Learning. Graduated with First Class Distinction.",
        "Served as President of the Computer Science Society. Completed capstone project on Distributed Systems.",
        "Focus on Software Engineering and Database Management Systems. consistently ranked in top 5% of class.",
        "Participated in multiple hackathons and coding competitions. Minor in Business Administration."
    ]

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

    # --- 1. Create HR Users (3) ---
    hr_users = []
    print("\n--- Seeding HR Users ---")
    for i in range(1, 4):
        is_female = random.choice([True, False])
        fname = random.choice(female_names) if is_female else random.choice(male_names)
        lname = random.choice(last_names)
        
        hr = create_user(f"hr{i}@gmail.com", fname, lname, "hr", "HireHero Corp")
        hr_users.append(hr)
        
        if not hr.profile:
            profile = Profile(
                user_id=hr.id,
                phone=gen_phone(),
                location="Bangalore, India",
                summary="Experienced HR Professional specializing in technical recruitment.",
                profile_pic=f"/uploads/{'woman.png' if is_female else 'man.png'}",
                profile_pic_url=f"/uploads/{'woman.png' if is_female else 'man.png'}"
            )
            db.session.add(profile)
    db.session.commit()

    # --- 2. Create Employees (15) ---
    print("\n--- Seeding Employees ---")
    emp_departments = ["Engineering", "Marketing", "Design", "HR", "Sales", "Product"]
    emp_locations = ["Remote", "Bangalore", "Hyderabad", "Pune", "Mumbai", "Chennai", "Delhi NCR"]
    emp_titles = ["Senior Developer", "Marketing Specialist", "UX Designer", "Sales Lead", "Product Owner", "Data Analyst"]
    
    for i in range(1, 16):
        is_female = random.choice([True, False])
        fname = random.choice(female_names) if is_female else random.choice(male_names)
        lname = random.choice(last_names)
        
        emp_user = create_user(f"employee{i}@gmail.com", fname, lname, "employee")
        
        if not emp_user.employee:
            emp = Employee(
                user_id=emp_user.id,
                job_title=random.choice(emp_titles),
                department=random.choice(emp_departments),
                job_location=random.choice(emp_locations),
                hired_at=datetime.utcnow() - timedelta(days=random.randint(30, 1000)),
                photo=f"/uploads/{'woman.png' if is_female else 'man.png'}"
            )
            db.session.add(emp)
            db.session.commit()
            
            for _ in range(random.randint(1, 4)):
                perf = Performance(
                    employee_id=emp.id,
                    metric="Quarterly Review",
                    value=str(random.randint(70, 100)),
                    date=datetime.utcnow() - timedelta(days=random.randint(1, 365))
                )
                db.session.add(perf)
    db.session.commit()

    # --- 3. Create Job Listings (25) ---
    print("\n--- Seeding Jobs ---")
    jobs = []
    base_titles = [
        "Senior React Developer", "Product Marketing Manager", "UX/UI Designer", 
        "Backend Engineer (Python)", "Sales Representative", "HR Generalist", 
        "DevOps Engineer", "Data Scientist", "Full Stack Developer", 
        "Business Analyst", "Machine Learning Engineer", "Content Writer"
    ]

    for i in range(25):
        title = random.choice(base_titles)
        dept = "Engineering" if "Developer" in title or "Engineer" in title or "Scientist" in title else "General"
        if "Marketing" in title: dept = "Marketing"
        if "Sales" in title: dept = "Sales"
        if "HR" in title: dept = "HR"
        if "Design" in title: dept = "Design"

        company_name = random.choice(companies)
        
        job = Job(
            title=title,
            company=company_name,
            department=dept,
            description=f"We at {company_name} are looking for a talented {title} to join our growing {dept} team. You will work on cutting-edge projects and collaborate with cross-functional teams to deliver high-quality solutions.",
            location=random.choice(emp_locations),
            type=random.choice(["Full-Time", "Contract"]),
            remote_option=random.choice(["Remote", "Hybrid", "On-site"]),
            experience_level=random.choice(["Junior", "Mid", "Senior", "Lead"]),
            education="Bachelor's Degree",
            salary=f"{random.randint(5, 35)} LPA",
            tags=f"{dept},Tech,{title.split(' ')[0]},{random.choice(['Python','React','Java','Figma','Sales','Management'])}",
            benefits="Health Insurance,Paid Leave,Remote Work",
            application_deadline=(datetime.utcnow() + timedelta(days=random.randint(10, 60))).strftime('%Y-%m-%d'),
            posted_by=random.choice(hr_users).id
        )
        db.session.add(job)
        jobs.append(job)
    db.session.commit()
    print(f"  [+] Created {len(jobs)} Job Listings")

    # --- 4. Create Job Seekers (15) ---
    print("\n--- Seeding Job Seekers ---")
    seekers = []
    
    for i in range(1, 16):
        is_female = (i % 2 == 0)
        fname = random.choice(female_names) if is_female else random.choice(male_names)
        lname = random.choice(last_names)
        email = f"js{i}@gmail.com"
        
        seeker = create_user(email, fname, lname, "candidate")
        seekers.append(seeker)
        
        # --- Configure JS1 Specifically for Demo ---
        if i == 1:
            resume_url = "/uploads/sample_resume.pdf"
            summary = "Ambitious Software Engineer with 5+ years of experience in full-stack development. Passionate about building scalable solutions and leveraging AI in recruitment technology."
            pic = "/uploads/man.png" # Assuming JS1 is male for consistency, or generic
            
            if not seeker.profile:
                profile = Profile(
                    user_id=seeker.id,
                    phone="9876543210",
                    location="Bangalore, India",
                    summary=summary,
                    completeness=90,
                    profile_pic_url=pic,
                    profile_pic=pic,
                    resume=resume_url
                )
                db.session.add(profile)
                db.session.flush()

                # Logic: No overlap. Job 2 (Recent) -> Job 1 (Past)
                # Current/Recent Job
                exp1 = Experience(
                    profile_id=profile.id,
                    title="Senior Software Engineer",
                    company="TechSolutions India",
                    start_date=datetime.utcnow() - timedelta(days=700), # ~2 years ago
                    end_date=None, # Present
                    description="Leading the frontend team in migrating to React 18. Improved application performance by 25%."
                )
                db.session.add(exp1)

                # Past Job
                exp2 = Experience(
                    profile_id=profile.id,
                    title="Software Developer",
                    company="Innovate Corp",
                    start_date=datetime.utcnow() - timedelta(days=1500), # ~4 years ago
                    end_date=datetime.utcnow() - timedelta(days=730), # Left 2 years ago
                    description="Developed RESTful APIs using Python Flask. Collaborated with UI/UX teams to implement responsive designs."
                )
                db.session.add(exp2)

                # Education
                edu = Education(
                    profile_id=profile.id,
                    degree="B.Tech in Computer Science",
                    institution="IIT Madras",
                    start_date=datetime.utcnow() - timedelta(days=2600),
                    end_date=datetime.utcnow() - timedelta(days=1550),
                    description="Graduated with First Class Distinction. Active member of the Coding Club."
                )
                db.session.add(edu)
        
        # --- Random Config for other seekers ---
        else:
            if not seeker.profile:
                pic = f"/uploads/{'woman.png' if is_female else 'man.png'}"
                profile = Profile(
                    user_id=seeker.id,
                    phone=gen_phone(),
                    location=random.choice(emp_locations),
                    summary=f"Professional looking for opportunities in {random.choice(emp_departments)}.",
                    completeness=random.choice([60, 80, 90, 100]),
                    profile_pic_url=pic,
                    profile_pic=pic
                )
                db.session.add(profile)
                db.session.flush()

                # Add 1-2 random past experiences
                for _ in range(random.randint(1, 2)):
                    start_dt = datetime.utcnow() - timedelta(days=random.randint(500, 2000))
                    end_dt = start_dt + timedelta(days=random.randint(200, 600))
                    exp = Experience(
                        profile_id=profile.id,
                        title=random.choice(emp_titles),
                        company=random.choice(companies),
                        start_date=start_dt,
                        end_date=end_dt,
                        description=random.choice(descriptions_exp)
                    )
                    db.session.add(exp)
                
                # Add Education
                edu = Education(
                    profile_id=profile.id,
                    degree=random.choice(degrees),
                    institution=random.choice(institutes),
                    start_date=datetime.utcnow() - timedelta(days=3000),
                    end_date=datetime.utcnow() - timedelta(days=1600),
                    description=random.choice(descriptions_edu)
                )
                db.session.add(edu)

    db.session.commit()

    # --- 5. Create Applications & Interviews (SKIP JS1) ---
    print("\n--- Seeding Applications & Interviews ---")
    statuses = ['applied', 'screening', 'interviewing', 'under_review', 'offer_extended', 'rejected']
    app_count = 0
    interview_count = 0
    
    # Iterate through all seekers EXCEPT the first one (JS1)
    for seeker in seekers[1:]: 
        applied_jobs = random.sample(jobs, k=random.randint(2, 4))
        for job in applied_jobs:
            if not Application.query.filter_by(user_id=seeker.id, job_id=job.id).first():
                status = random.choice(statuses)
                app = Application(
                    user_id=seeker.id,
                    job_id=job.id,
                    status=status,
                    applied_at=datetime.utcnow() - timedelta(days=random.randint(1, 20))
                )
                db.session.add(app)
                db.session.flush() 
                app_count += 1

                if status == 'interviewing':
                    loc_type = random.choice(['video', 'phone', 'in_person'])
                    loc_detail = ""
                    if loc_type == 'video':
                        loc_detail = f"https://meet.google.com/{''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=3))}-{''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=4))}-{''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=3))}"
                    elif loc_type == 'phone':
                        loc_detail = gen_phone()
                    else:
                        loc_detail = f"Building {random.choice(['A','B','C'])}, Room {random.randint(100,500)}"

                    interview = Interview(
                        application_id=app.id,
                        stage="Technical Round",
                        scheduled_at=datetime.utcnow() + timedelta(days=random.randint(1, 7), hours=random.randint(9, 17)),
                        location_type=loc_type,
                        location_detail=loc_detail
                    )
                    db.session.add(interview)
                    interview_count += 1

    db.session.commit()
    print(f"  [+] Created {app_count} applications (Skipped JS1).")
    print(f"  [+] Created {interview_count} scheduled interviews.")
    
    print("--- Database Seed Complete ---")
    print("DEMO CREDENTIALS:")
    print("  HR Account: hr1@gmail.com / 123")
    print("  Job Seeker: js1@gmail.com / 123 (Clean slate, pre-filled profile)")