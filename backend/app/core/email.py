"""
backend/app/core/email.py
Email service — logs to console in dev, sends via SMTP in production.
"""
import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "log")
EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@placementanalyzer.local")
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")


def _send_smtp(to: str, subject: str, html_body: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = EMAIL_FROM
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(EMAIL_FROM, [to], msg.as_string())


def _send(to: str, subject: str, html_body: str) -> None:
    if EMAIL_PROVIDER == "smtp":
        try:
            _send_smtp(to, subject, html_body)
        except Exception as exc:
            logger.error("SMTP send failed: %s", exc)
    else:
        # Log mode — print to console for local development
        logger.info(
            "\n" + "=" * 60 +
            f"\n📧  EMAIL TO: {to}"
            f"\n📌  SUBJECT: {subject}"
            f"\n📝  BODY (HTML stripped):\n{html_body}"
            "\n" + "=" * 60
        )


def send_verification_email(to: str, full_name: str, token: str) -> None:
    link = f"{FRONTEND_URL}/verify-email?token={token}"
    html = f"""
    <h2>Verify your email — Student Placement Analyzer</h2>
    <p>Hi {full_name},</p>
    <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
    <a href="{link}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
      Verify Email
    </a>
    <p>Or copy this URL: {link}</p>
    <p>If you did not register, ignore this email.</p>
    """
    _send(to, "Verify your email — Student Placement Analyzer", html)


def send_password_reset_email(to: str, full_name: str, token: str) -> None:
    link = f"{FRONTEND_URL}/reset-password?token={token}"
    html = f"""
    <h2>Password Reset — Student Placement Analyzer</h2>
    <p>Hi {full_name},</p>
    <p>We received a request to reset your password. Click the link below (expires in 1 hour).</p>
    <a href="{link}" style="background:#6366f1;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
      Reset Password
    </a>
    <p>Or copy this URL: {link}</p>
    <p>If you did not request a password reset, ignore this email.</p>
    """
    _send(to, "Reset your password — Student Placement Analyzer", html)
