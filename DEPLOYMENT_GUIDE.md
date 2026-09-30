# Deploying Student Placement & Career Skill Intelligence

This project is prepared for **free cloud deployment**:
- **Backend**: [Render](https://render.com) (or Railway)
- **Frontend**: [Vercel](https://vercel.com) (or Netlify)

---

## Step 1: Push Code to GitHub

Open terminal in the project root:

```bash
git init
git add .
git commit -m "Initial production commit"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render (Free)

1. Sign in to [Render](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Fill in the following:
   - **Name**: `student-placement-api` (or any name)
   - **Language**: `Python 3`
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && python -c "from backend.app.database import engine, Base; import backend.app.models; Base.metadata.create_all(bind=engine)"
     ```
   - **Start Command**:
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
     ```
5. In **Environment Variables**, add:
   - `JWT_SECRET`: `super-secret-key-32chars-minimum-prod-key`
   - `JWT_ALGORITHM`: `HS256`
   - `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
   - `JWT_REFRESH_TOKEN_EXPIRE_DAYS`: `7`
   - `EMAIL_PROVIDER`: `log`
   - `FRONTEND_URL`: `http://localhost:5173` *(You can update this after deploying frontend)*
6. Click **Create Web Service**.
7. Render will provide your public URL:
   `https://student-placement-api.onrender.com`

---

## Step 3: Deploy Frontend to Vercel (Free)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. In **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://student-placement-api.onrender.com` *(Your Render backend URL)*
6. Click **Deploy**.
7. Vercel will build and give you a live production URL:
   `https://your-project.vercel.app`

---

## Step 4: Link CORS & Verify

1. Go back to your **Render Web Service** -> **Environment**.
2. Update `FRONTEND_URL` to your Vercel URL:
   `https://your-project.vercel.app`
3. Click **Save Changes** (Render will re-deploy automatically).
4. Open your live Vercel URL and sign in using the demo account:
   - **Email**: `student@example.com`
   - **Password**: `Student@123`
