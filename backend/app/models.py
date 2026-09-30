"""
backend/app/models.py
SQLAlchemy ORM models — existing tables preserved, User + auth tables added.
"""
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey,
    Text, JSON, Boolean, Index
)
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.app.database import Base


# ─── Existing Models (unchanged) ──────────────────────────────────────────────

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, default="Student")
    email = Column(String, default="student@example.com")
    gender = Column(String, default="M")
    ssc_p = Column(Float, default=70.0)   # 10th %
    ssc_b = Column(String, default="Central")
    hsc_p = Column(Float, default=70.0)   # 12th %
    hsc_b = Column(String, default="Central")
    hsc_s = Column(String, default="Commerce")  # Stream
    degree_p = Column(Float, default=70.0)
    degree_t = Column(String, default="Comm&Mgmt")
    workex = Column(String, default="No")
    etest_p = Column(Float, default=70.0)
    specialisation = Column(String, default="Mkt&Fin")
    mba_p = Column(Float, default=70.0)
    skills = Column(JSON, default=list)       # list of skill names
    target_role_id = Column(String, default="data-analyst")
    created_at = Column(DateTime, default=datetime.utcnow)


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_profile_id = Column(Integer, ForeignKey("student_profiles.id"), nullable=True)
    # Optional link to the authenticated user who made this prediction
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    prediction = Column(String)         # Placed / Not Placed
    probability = Column(Float)
    model_version = Column(String)
    explanation = Column(JSON)          # List of feature contribution objects
    inputs = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Authentication Models ────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(320), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)

    # Profile fields
    college = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)

    # Role — student | faculty | admin | super_admin
    role = Column(String(50), nullable=False, default="student")

    # Account state
    email_verified = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    # Relationships
    email_tokens = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
    predictions = relationship("Prediction", foreign_keys=[Prediction.user_id], backref="user")

    __table_args__ = (
        Index("ix_users_email_active", "email", "is_active"),
    )


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(128), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="email_tokens")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(128), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="password_reset_tokens")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    event = Column(String(100), nullable=False)  # e.g. login_success, register
    ip_address = Column(String(45), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
