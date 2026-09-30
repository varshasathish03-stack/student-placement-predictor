from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class StudentInput(BaseModel):
    gender: str = Field("M", description="M or F")
    ssc_p: float = Field(..., ge=0, le=100, description="10th percentage")
    ssc_b: str = Field("Central", description="Central or Others")
    hsc_p: float = Field(..., ge=0, le=100, description="12th percentage")
    hsc_b: str = Field("Central", description="Central or Others")
    hsc_s: str = Field("Commerce", description="Commerce, Science, or Arts")
    degree_p: float = Field(..., ge=0, le=100, description="Degree percentage")
    degree_t: str = Field("Comm&Mgmt", description="Sci&Tech, Comm&Mgmt, or Others")
    workex: str = Field("No", description="Yes or No")
    etest_p: float = Field(..., ge=0, le=100, description="Employability test percentage")
    specialisation: str = Field("Mkt&Fin", description="Mkt&HR or Mkt&Fin")
    mba_p: float = Field(..., ge=0, le=100, description="MBA percentage")

class FeatureContribution(BaseModel):
    feature: str
    feature_val: Any
    impact: float
    description: str

class PredictionResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    prediction: str
    probability: float
    model_version: str
    explanation: List[FeatureContribution]

class SkillAnalysisRequest(BaseModel):
    skills: List[str]
    target_role_id: str

class SkillAnalysisResponse(BaseModel):
    role_id: str
    role_name: str
    student_skills: List[str]
    matched_skills: List[str]
    missing_required: List[str]
    missing_preferred: List[str]
    match_score: float
    status: str

class RoleMatchingRequest(BaseModel):
    skills: List[str]

class RoleMatchResult(BaseModel):
    role_id: str
    role_name: str
    match_score: float
    matched_skills: List[str]
    missing_count: int

class RoadmapRequest(BaseModel):
    skills: List[str]
    target_role_id: str

class RoadmapItem(BaseModel):
    step: int
    skill: str
    category: str
    description: str
    estimated_weeks: int
    topics: List[str]

class RoadmapResponse(BaseModel):
    role_id: str
    role_name: str
    current_skills: List[str]
    roadmap: List[RoadmapItem]
    total_weeks: int

class StudentProfileSchema(BaseModel):
    full_name: str
    email: str
    gender: str
    ssc_p: float
    ssc_b: str
    hsc_p: float
    hsc_b: str
    hsc_s: str
    degree_p: float
    degree_t: str
    workex: str
    etest_p: float
    specialisation: str
    mba_p: float
    skills: List[str]
    target_role_id: str

class HealthResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    status: str
    model_loaded: bool
    model_version: str


# ─── Auth Schemas ──────────────────────────────────────────────────────────────

from pydantic import EmailStr, field_validator
from datetime import datetime
import re


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str
    college: Optional[str] = Field(None, max_length=255)
    department: Optional[str] = Field(None, max_length=255)
    graduation_year: Optional[int] = Field(None, ge=2000, le=2040)
    role: str = Field("student")

    @field_validator("role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        allowed = {"student", "faculty"}
        if v not in allowed:
            raise ValueError("Role must be 'student' or 'faculty'")
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class UserResponse(BaseModel):
    model_config = {"from_attributes": True, "protected_namespaces": ()}
    id: int
    full_name: str
    email: str
    role: str
    college: Optional[str]
    department: Optional[str]
    graduation_year: Optional[int]
    email_verified: bool
    is_active: bool
    created_at: datetime
    last_login_at: Optional[datetime]


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one number")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if "new_password" in info.data and v != info.data["new_password"]:
            raise ValueError("Passwords do not match")
        return v


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    college: Optional[str] = Field(None, max_length=255)
    department: Optional[str] = Field(None, max_length=255)
    graduation_year: Optional[int] = Field(None, ge=2000, le=2040)


class MessageResponse(BaseModel):
    message: str
