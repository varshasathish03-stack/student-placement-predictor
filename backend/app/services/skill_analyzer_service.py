from typing import List, Dict, Any
from backend.app.services.role_service import get_role_by_id, get_all_roles
from backend.app.schemas import SkillAnalysisResponse, RoleMatchResult

def analyze_skill_gap(user_skills: List[str], target_role_id: str) -> SkillAnalysisResponse:
    role = get_role_by_id(target_role_id)
    user_skills_set = set(s.strip().lower() for s in user_skills)
    
    req_skills = role["required_skills"]
    pref_skills = role["preferred_skills"]

    matched_skills = [s for s in req_skills + pref_skills if s.strip().lower() in user_skills_set]
    missing_req = [s for s in req_skills if s.strip().lower() not in user_skills_set]
    missing_pref = [s for s in pref_skills if s.strip().lower() not in user_skills_set]

    total_req = len(req_skills)
    matched_req_count = len([s for s in req_skills if s.strip().lower() in user_skills_set])
    match_score = round((matched_req_count / total_req) * 100, 1) if total_req > 0 else 0.0

    if match_score >= 80.0:
        status = "Role Ready"
    elif match_score >= 50.0:
        status = "Moderate Gap"
    else:
        status = "High Skill Gap"

    return SkillAnalysisResponse(
        role_id=role["role_id"],
        role_name=role["role_name"],
        student_skills=user_skills,
        matched_skills=matched_skills,
        missing_required=missing_req,
        missing_preferred=missing_pref,
        match_score=match_score,
        status=status
    )

def match_user_to_all_roles(user_skills: List[str]) -> List[RoleMatchResult]:
    user_skills_set = set(s.strip().lower() for s in user_skills)
    results = []

    for role in get_all_roles():
        req_skills = role["required_skills"]
        pref_skills = role["preferred_skills"]

        matched = [s for s in req_skills + pref_skills if s.strip().lower() in user_skills_set]
        total_req = len(req_skills)
        matched_req_count = len([s for s in req_skills if s.strip().lower() in user_skills_set])
        score = round((matched_req_count / total_req) * 100, 1) if total_req > 0 else 0.0

        results.append(RoleMatchResult(
            role_id=role["role_id"],
            role_name=role["role_name"],
            match_score=score,
            matched_skills=matched,
            missing_count=len(req_skills) - matched_req_count
        ))

    results.sort(key=lambda x: x.match_score, reverse=True)
    return results
