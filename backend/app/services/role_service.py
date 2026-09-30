from typing import Dict, List, Any

JOB_ROLES_CATALOGUE: Dict[str, Dict[str, Any]] = {
    "data-analyst": {
        "role_id": "data-analyst",
        "role_name": "Data Analyst",
        "description": "Analyzes data to extract insights, create dashboards, and support business decisions.",
        "required_skills": ["SQL", "Python", "Data Visualization", "Statistics", "Excel"],
        "preferred_skills": ["Tableau", "PowerBI", "Pandas", "A/B Testing"],
        "average_salary_range": "$65,000 - $95,000",
        "demand_level": "High"
    },
    "software-developer": {
        "role_id": "software-developer",
        "role_name": "Software Developer",
        "description": "Designs, builds, and maintains software applications using core programming principles.",
        "required_skills": ["Data Structures", "Algorithms", "Git", "Object-Oriented Programming", "Problem Solving"],
        "preferred_skills": ["System Design", "Docker", "CI/CD", "Unit Testing"],
        "average_salary_range": "$75,000 - $115,000",
        "demand_level": "Very High"
    },
    "python-developer": {
        "role_id": "python-developer",
        "role_name": "Python Developer",
        "description": "Specializes in building backend APIs, automation scripts, and data processing tools with Python.",
        "required_skills": ["Python", "FastAPI", "SQL", "Git", "REST APIs"],
        "preferred_skills": ["Django", "PostgreSQL", "Docker", "AsyncIO"],
        "average_salary_range": "$80,000 - $120,000",
        "demand_level": "High"
    },
    "ml-engineer": {
        "role_id": "ml-engineer",
        "role_name": "ML Engineer",
        "description": "Builds and deploys machine learning models into scalable production applications.",
        "required_skills": ["Python", "Machine Learning", "Scikit-Learn", "SQL", "Statistics"],
        "preferred_skills": ["PyTorch", "TensorFlow", "MLOps", "Feature Engineering", "Docker"],
        "average_salary_range": "$95,000 - $145,000",
        "demand_level": "Very High"
    },
    "web-developer": {
        "role_id": "web-developer",
        "role_name": "Web Developer",
        "description": "Builds responsive, interactive web frontend and fullstack interfaces.",
        "required_skills": ["HTML", "CSS", "JavaScript", "React", "Git"],
        "preferred_skills": ["TypeScript", "Tailwind CSS", "Next.js", "REST APIs"],
        "average_salary_range": "$70,000 - $105,000",
        "demand_level": "High"
    },
    "backend-developer": {
        "role_id": "backend-developer",
        "role_name": "Backend Developer",
        "description": "Constructs robust server architectures, database systems, and RESTful APIs.",
        "required_skills": ["Python", "SQL", "REST APIs", "Git", "Database Design"],
        "preferred_skills": ["PostgreSQL", "Redis", "Docker", "Microservices", "FastAPI"],
        "average_salary_range": "$85,000 - $125,000",
        "demand_level": "High"
    },
    "qa-engineer": {
        "role_id": "qa-engineer",
        "role_name": "QA Engineer",
        "description": "Ensures software quality through automated testing, test suites, and bug tracking.",
        "required_skills": ["Software Testing", "Python", "Test Automation", "Git", "Bug Tracking"],
        "preferred_skills": ["Selenium", "Pytest", "API Testing", "Postman"],
        "average_salary_range": "$65,000 - $95,000",
        "demand_level": "Medium"
    },
    "business-analyst": {
        "role_id": "business-analyst",
        "role_name": "Business Analyst",
        "description": "Bridges the gap between business needs and technical solutions through data and process analysis.",
        "required_skills": ["Excel", "SQL", "Data Visualization", "Requirements Analysis", "Communication"],
        "preferred_skills": ["PowerBI", "Agile/Scrum", "Process Mapping", "Python"],
        "average_salary_range": "$70,000 - $100,000",
        "demand_level": "High"
    },
    "devops-engineer": {
        "role_id": "devops-engineer",
        "role_name": "DevOps Engineer",
        "description": "Automates deployment pipelines, cloud infrastructure, and operational monitoring.",
        "required_skills": ["Git", "Linux", "Docker", "CI/CD", "Cloud Computing"],
        "preferred_skills": ["Kubernetes", "Terraform", "AWS", "Python"],
        "average_salary_range": "$90,000 - $135,000",
        "demand_level": "High"
    },
    "data-scientist": {
        "role_id": "data-scientist",
        "role_name": "Data Scientist",
        "description": "Applies statistical modeling, machine learning, and domain knowledge to solve complex data problems.",
        "required_skills": ["Python", "Statistics", "Machine Learning", "SQL", "Pandas"],
        "preferred_skills": ["Scikit-Learn", "Data Visualization", "Deep Learning", "A/B Testing"],
        "average_salary_range": "$95,000 - $140,000",
        "demand_level": "Very High"
    }
}

AVAILABLE_SKILLS = sorted(list(set(
    skill for role in JOB_ROLES_CATALOGUE.values()
    for skill in role["required_skills"] + role["preferred_skills"]
)))

def get_all_roles() -> List[Dict[str, Any]]:
    return list(JOB_ROLES_CATALOGUE.values())

def get_role_by_id(role_id: str) -> Dict[str, Any]:
    return JOB_ROLES_CATALOGUE.get(role_id, JOB_ROLES_CATALOGUE["data-analyst"])
