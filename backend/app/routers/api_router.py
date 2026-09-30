from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.database import get_db, engine
from backend.app import models
from backend.app.schemas import (
    StudentInput, PredictionResponse, SkillAnalysisRequest, SkillAnalysisResponse,
    RoleMatchingRequest, RoleMatchResult, RoadmapRequest, RoadmapResponse,
    StudentProfileSchema, HealthResponse
)
from backend.app.services.prediction_service import prediction_service
from backend.app.services.role_service import get_all_roles, get_role_by_id, AVAILABLE_SKILLS
from backend.app.services.skill_analyzer_service import analyze_skill_gap, match_user_to_all_roles
from backend.app.services.roadmap_service import generate_roadmap

models.Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=prediction_service.pipeline is not None,
        model_version=prediction_service.metadata.get("model_name", "LogisticRegression")
    )

@router.post("/api/prediction", response_model=PredictionResponse)
def make_prediction(student_data: StudentInput, db: Session = Depends(get_db)):
    try:
        res = prediction_service.predict(student_data)
        
        # Save to database execution history
        db_pred = models.Prediction(
            prediction=res.prediction,
            probability=res.probability,
            model_version=res.model_version,
            explanation=[e.model_dump() for e in res.explanation],
            inputs=student_data.model_dump()
        )
        db.add(db_pred)
        db.commit()
        db.refresh(db_pred)

        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/skills/analyze", response_model=SkillAnalysisResponse)
def analyze_skills(req: SkillAnalysisRequest):
    return analyze_skill_gap(req.skills, req.target_role_id)

@router.get("/api/roles")
def get_roles():
    return {
        "roles": get_all_roles(),
        "available_skills": AVAILABLE_SKILLS
    }

@router.get("/api/roles/{role_id}")
def get_role_details(role_id: str):
    role = get_role_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.post("/api/roles/match", response_model=List[RoleMatchResult])
def match_roles(req: RoleMatchingRequest):
    return match_user_to_all_roles(req.skills)

@router.post("/api/roadmap", response_model=RoadmapResponse)
def get_career_roadmap(req: RoadmapRequest):
    return generate_roadmap(req.skills, req.target_role_id)

@router.get("/api/student/profile")
def get_student_profile(db: Session = Depends(get_db)):
    profile = db.query(models.StudentProfile).first()
    if not profile:
        profile = models.StudentProfile(
            full_name="Alex Johnson",
            email="alex.johnson@university.edu",
            gender="M",
            ssc_p=78.5,
            ssc_b="Central",
            hsc_p=82.0,
            hsc_b="Central",
            hsc_s="Science",
            degree_p=75.4,
            degree_t="Sci&Tech",
            workex="Yes",
            etest_p=85.0,
            specialisation="Mkt&Fin",
            mba_p=72.8,
            skills=["Python", "SQL", "Git"],
            target_role_id="data-analyst"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/api/student/profile")
def update_student_profile(profile_data: StudentProfileSchema, db: Session = Depends(get_db)):
    profile = db.query(models.StudentProfile).first()
    if not profile:
        profile = models.StudentProfile()
        db.add(profile)

    for key, value in profile_data.model_dump().items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/api/student/history")
def get_prediction_history(db: Session = Depends(get_db)):
    predictions = db.query(models.Prediction).order_by(models.Prediction.created_at.desc()).all()
    return predictions
