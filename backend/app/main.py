"""
backend/app/main.py
FastAPI application entry point — includes CORS, auth, and ML API routers.
"""
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env before anything else

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.routers.api_router import router as api_router
from backend.app.routers.auth import router as auth_router

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
if FRONTEND_URL:
    for u in FRONTEND_URL.split(","):
        clean_u = u.strip().rstrip("/")
        if clean_u and clean_u not in origins:
            origins.append(clean_u)

app = FastAPI(
    title="Student Placement & Skill Analyzer API",
    description="ML service for student placement prediction, skill gap analysis, job role matching, and career roadmaps.",
    version="2.0.0",
)

# CORS — allow frontend origin with credentials for cookie-based auth
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve EDA figures statically
figures_path = "ml/outputs/figures"
if os.path.exists(figures_path):
    app.mount("/figures", StaticFiles(directory=figures_path), name="figures")

# Routers
app.include_router(auth_router)
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
