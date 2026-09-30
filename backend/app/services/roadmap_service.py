from typing import List
from backend.app.services.role_service import get_role_by_id
from backend.app.schemas import RoadmapResponse, RoadmapItem

SKILL_CURRICULUM = {
    "SQL": {
        "category": "Database & Querying",
        "description": "Master relational database design, complex joins, aggregation, subqueries, and window functions.",
        "estimated_weeks": 2,
        "topics": ["SELECT & Filtering", "JOIN Types & Conditions", "GROUP BY & Aggregations", "Window Functions (ROW_NUMBER, RANK)", "Database Schema Design"]
    },
    "Python": {
        "category": "Core Programming",
        "description": "Learn fundamentals of Python programming, data structures, control flow, functions, and object-oriented concepts.",
        "estimated_weeks": 3,
        "topics": ["Variables & Data Types", "Control Flow & Loops", "Functions & Modules", "File I/O & Error Handling", "Object-Oriented Programming"]
    },
    "Data Visualization": {
        "category": "Analytics & Reporting",
        "description": "Create intuitive visual charts, dashboards, and storytelling presentations using Matplotlib, Seaborn, or Tableau.",
        "estimated_weeks": 2,
        "topics": ["Chart Selection Best Practices", "Matplotlib & Seaborn Fundamentals", "Interactive Dashboard Principles", "Visual Storytelling"]
    },
    "Statistics": {
        "category": "Data Science Foundation",
        "description": "Understand core statistical measures, probability distributions, hypothesis testing, and regression analysis.",
        "estimated_weeks": 3,
        "topics": ["Descriptive Statistics (Mean, Std Dev)", "Probability Distributions", "Hypothesis Testing & p-values", "Linear & Logistic Regression Fundamentals"]
    },
    "Machine Learning": {
        "category": "AI & Modeling",
        "description": "Build, evaluate, and tune supervised and unsupervised machine learning algorithms.",
        "estimated_weeks": 4,
        "topics": ["Supervised vs Unsupervised Learning", "Classification Models (Decision Trees, Random Forests)", "Model Evaluation Metrics (F1, ROC-AUC)", "Cross-Validation & Hyperparameter Tuning"]
    },
    "FastAPI": {
        "category": "Backend Engineering",
        "description": "Build high-performance asynchronous RESTful APIs using Python, Pydantic, and OpenAPI standards.",
        "estimated_weeks": 2,
        "topics": ["Routing & Request Handlers", "Pydantic Schemas & Validation", "Dependency Injection", "Database Integration with SQLAlchemy", "API Testing & Documentation"]
    },
    "React": {
        "category": "Frontend Development",
        "description": "Master component-driven web user interfaces with React, state management, and modern React hooks.",
        "estimated_weeks": 3,
        "topics": ["JSX & Component Design", "State & Props Management (useState, useEffect)", "Custom Hooks", "API Integration & Async State", "Component Optimization"]
    },
    "Git": {
        "category": "Version Control",
        "description": "Learn collaborative source code management, branching strategies, code reviews, and Git workflows.",
        "estimated_weeks": 1,
        "topics": ["Git Init, Commit, & Status", "Branching & Merging", "Resolving Merge Conflicts", "Pull Requests & GitHub Workflows"]
    },
    "Docker": {
        "category": "DevOps & Deployment",
        "description": "Containerize applications to ensure consistent runtime execution across development and production.",
        "estimated_weeks": 2,
        "topics": ["Containers vs Virtual Machines", "Dockerfile Instructions", "Building & Running Images", "Docker Compose Multi-Container Setup"]
    },
    "Scikit-Learn": {
        "category": "Machine Learning Framework",
        "description": "Implement feature scaling, categorical encoding, model pipelines, and cross-validation.",
        "estimated_weeks": 2,
        "topics": ["ColumnTransformer & Pipelines", "StandardScaler & OneHotEncoder", "Model Selection & GridSearch", "Joblib Serialization"]
    }
}

DEFAULT_ITEM = {
    "category": "Technical Competency",
    "description": "Gain hands-on proficiency through practical coding exercises and real-world project scenarios.",
    "estimated_weeks": 2,
    "topics": ["Fundamentals & Principles", "Practical Hands-on Exercises", "Project Building & Review"]
}

def generate_roadmap(user_skills: List[str], target_role_id: str) -> RoadmapResponse:
    role = get_role_by_id(target_role_id)
    user_skills_set = set(s.strip().lower() for s in user_skills)

    all_target_skills = role["required_skills"] + role["preferred_skills"]
    missing_skills = [s for s in all_target_skills if s.strip().lower() not in user_skills_set]

    # If user has all skills or very few missing, suggest advanced topics
    if not missing_skills:
        missing_skills = role["preferred_skills"][:2] or ["System Design", "Advanced Optimization"]

    roadmap_items = []
    total_weeks = 0

    for idx, skill in enumerate(missing_skills, start=1):
        info = SKILL_CURRICULUM.get(skill, DEFAULT_ITEM)
        roadmap_items.append(RoadmapItem(
            step=idx,
            skill=skill,
            category=info["category"],
            description=info["description"],
            estimated_weeks=info["estimated_weeks"],
            topics=info["topics"]
        ))
        total_weeks += info["estimated_weeks"]

    return RoadmapResponse(
        role_id=role["role_id"],
        role_name=role["role_name"],
        current_skills=user_skills,
        roadmap=roadmap_items,
        total_weeks=total_weeks
    )
