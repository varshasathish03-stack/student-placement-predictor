"""
backend/app/routers/auth.py
Authentication endpoints: register, login, logout, verify email,
forgot/reset password, /me, change password, profile update, delete account.
"""
import os
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from jose import JWTError

from backend.app.database import get_db
from backend.app import models
from backend.app.schemas import (
    UserRegister, UserLogin, TokenResponse, UserResponse,
    ForgotPasswordRequest, ResetPasswordRequest,
    ChangePasswordRequest, UpdateProfileRequest, MessageResponse,
)
from backend.app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    decode_token, generate_secure_token,
    ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS,
)
from backend.app.core.dependencies import get_current_user
from backend.app.core.email import send_verification_email, send_password_reset_email

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ─── Helpers ───────────────────────────────────────────────────────────────────

def _log_event(db: Session, event: str, user_id: Optional[int], request: Request, detail: str = ""):
    log = models.AuditLog(
        user_id=user_id,
        event=event,
        ip_address=request.client.host if request.client else None,
        details=detail,
    )
    db.add(log)
    db.commit()


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str, remember: bool):
    max_age = REFRESH_TOKEN_EXPIRE_DAYS * 86400 if remember else None
    response.set_cookie(
        "access_token", access_token,
        httponly=True, samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        "refresh_token", refresh_token,
        httponly=True, samesite="lax",
        max_age=max_age,
    )


# ─── Register ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegister, request: Request, db: Session = Depends(get_db)):
    # Check duplicate email
    existing = db.query(models.User).filter(models.User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user = models.User(
        full_name=data.full_name.strip(),
        email=data.email.lower().strip(),
        password_hash=hash_password(data.password),
        college=data.college,
        department=data.department,
        graduation_year=data.graduation_year,
        role=data.role,
        email_verified=False,
        is_active=True,
    )
    db.add(user)
    db.flush()  # get user.id before commit

    # Create email verification token (expires in 24h)
    raw_token = generate_secure_token()
    ev_token = models.EmailVerificationToken(
        user_id=user.id,
        token=raw_token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    )
    db.add(ev_token)
    db.commit()

    # Send verification email (logged to console in dev)
    send_verification_email(user.email, user.full_name, raw_token)
    _log_event(db, "registration", user.id, request)

    return MessageResponse(message="Account created. Please check your email to verify your account.")


# ─── Login ────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, request: Request, response: Response, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email.lower()).first()

    if not user or not verify_password(data.password, user.password_hash):
        if user:
            _log_event(db, "login_failure", user.id, request)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled. Please contact support.",
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email address before logging in.",
        )

    access_token = create_access_token(sub=str(user.id), role=user.role)
    refresh_token = create_refresh_token(sub=str(user.id))

    _set_auth_cookies(response, access_token, refresh_token, data.remember_me)

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()
    _log_event(db, "login_success", user.id, request)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ─── Logout ───────────────────────────────────────────────────────────────────

@router.post("/logout", response_model=MessageResponse)
def logout(request: Request, response: Response, db: Session = Depends(get_db),
           refresh_token: Optional[str] = Cookie(default=None)):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    # If we had a refresh token blocklist, we'd add it here.
    return MessageResponse(message="Logged out successfully.")


# ─── Refresh Token ────────────────────────────────────────────────────────────

@router.post("/refresh", response_model=TokenResponse)
def refresh_access_token(response: Response, db: Session = Depends(get_db),
                         refresh_token: Optional[str] = Cookie(default=None)):
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token provided.")
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type.")
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token.")

    user = db.query(models.User).filter(models.User.id == user_id, models.User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    access_token = create_access_token(sub=str(user.id), role=user.role)
    response.set_cookie("access_token", access_token, httponly=True, samesite="lax",
                        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


# ─── Get current user ─────────────────────────────────────────────────────────

@router.get("/me", response_model=UserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user


# ─── Email Verification ───────────────────────────────────────────────────────

@router.post("/verify-email", response_model=MessageResponse)
def verify_email(token: str, request: Request, db: Session = Depends(get_db)):
    ev = (
        db.query(models.EmailVerificationToken)
        .filter(
            models.EmailVerificationToken.token == token,
            models.EmailVerificationToken.used == False,
        )
        .first()
    )
    if not ev:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or already used verification token.")

    if ev.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Verification token has expired. Please request a new one.")

    ev.used = True
    ev.user.email_verified = True
    db.commit()
    _log_event(db, "email_verified", ev.user_id, request)
    return MessageResponse(message="Email verified successfully. You may now log in.")


@router.post("/resend-verification", response_model=MessageResponse)
def resend_verification(data: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email.lower()).first()
    # Always return same message to avoid email enumeration
    if not user or user.email_verified:
        return MessageResponse(message="If this email is registered and unverified, a new link has been sent.")

    # Invalidate old tokens
    db.query(models.EmailVerificationToken).filter(
        models.EmailVerificationToken.user_id == user.id,
        models.EmailVerificationToken.used == False,
    ).update({"used": True})

    raw_token = generate_secure_token()
    ev_token = models.EmailVerificationToken(
        user_id=user.id,
        token=raw_token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
    )
    db.add(ev_token)
    db.commit()
    send_verification_email(user.email, user.full_name, raw_token)
    return MessageResponse(message="If this email is registered and unverified, a new link has been sent.")


# ─── Forgot Password ──────────────────────────────────────────────────────────

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest, request: Request, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email.lower()).first()
    # Always return same message to prevent email enumeration
    if not user or not user.is_active:
        return MessageResponse(
            message="If an account exists for this email, we've sent password reset instructions."
        )

    # Invalidate old reset tokens
    db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.user_id == user.id,
        models.PasswordResetToken.used == False,
    ).update({"used": True})

    raw_token = generate_secure_token()
    reset_token = models.PasswordResetToken(
        user_id=user.id,
        token=raw_token,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db.add(reset_token)
    db.commit()

    send_password_reset_email(user.email, user.full_name, raw_token)
    _log_event(db, "password_reset_requested", user.id, request)

    return MessageResponse(
        message="If an account exists for this email, we've sent password reset instructions."
    )


# ─── Reset Password ───────────────────────────────────────────────────────────

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, request: Request, db: Session = Depends(get_db)):
    rt = (
        db.query(models.PasswordResetToken)
        .filter(
            models.PasswordResetToken.token == data.token,
            models.PasswordResetToken.used == False,
        )
        .first()
    )
    if not rt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or already used reset token.")
    if rt.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired. Please request a new one.")

    rt.user.password_hash = hash_password(data.new_password)
    rt.used = True
    db.commit()
    _log_event(db, "password_reset_completed", rt.user_id, request)
    return MessageResponse(message="Your password has been reset successfully. You may now log in.")


# ─── Change Password ──────────────────────────────────────────────────────────

@router.put("/change-password", response_model=MessageResponse)
def change_password(data: ChangePasswordRequest, request: Request,
                    current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")

    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    _log_event(db, "password_change", current_user.id, request)
    return MessageResponse(message="Password changed successfully.")


# ─── Update Profile ───────────────────────────────────────────────────────────

@router.put("/profile", response_model=UserResponse)
def update_profile(data: UpdateProfileRequest, current_user=Depends(get_current_user),
                   db: Session = Depends(get_db)):
    if data.full_name is not None:
        current_user.full_name = data.full_name.strip()
    if data.college is not None:
        current_user.college = data.college
    if data.department is not None:
        current_user.department = data.department
    if data.graduation_year is not None:
        current_user.graduation_year = data.graduation_year
    current_user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(current_user)
    return current_user


# ─── Delete Account ───────────────────────────────────────────────────────────

@router.delete("/account", response_model=MessageResponse)
def delete_account(request: Request, response: Response, current_user=Depends(get_current_user),
                   db: Session = Depends(get_db)):
    _log_event(db, "account_deleted", current_user.id, request)
    db.delete(current_user)
    db.commit()
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return MessageResponse(message="Your account has been deleted.")
