"""
api/index.py
Vercel Serverless Function entry point for FastAPI backend.
Imports and exposes the existing FastAPI app from backend/app/main.py.
"""
import sys
import os

# Add root directory to python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app.main import app

# Vercel requires the app instance to be exposed as `app`
__all__ = ["app"]
