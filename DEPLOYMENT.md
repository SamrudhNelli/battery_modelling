# 🚀 Deployment Guide

## Unified Application (Flask + React in One Place)

The app is now configured as a **single unified Flask application** that:
- Serves the React build from `neoride-frontend/dist/`
- Provides API endpoints at `/api/*`
- Runs on a single port

---

## 🔥 Local Unified Mode

### **1. Rebuild React**
```bash
cd neoride-frontend
npm run build
cd ..
```

### **2. Run Unified Flask App**
```bash
python app.py
```

✅ **Everything at**: `http://localhost:5000`
- React frontend: `http://localhost:5000/`
- API: `http://localhost:5000/api/*`

---

## ☁️ Deploy to Render (Recommended)

Render is perfect for Python + static frontend deployments.

### **Steps:**

1. **Push to GitHub** (if not already)
   ```bash
   git add .
   git commit -m "Add full-stack unified app"
   git push origin main
   ```

2. **Sign in to Render**
   - Go to https://render.com
   - Sign in with GitHub

3. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository: `NeoRide_Battery_Modelling`

4. **Configure Service**
   - **Name**: `neoride-battery-modelling`
   - **Environment**: `Python 3`
   - **Build Command**:
     ```bash
     pip install -r requirements.txt && pip install flask flask-cors && cd neoride-frontend && npm install && npm run build
     ```
   - **Start Command**:
     ```bash
     python app.py
     ```
   - **Plan**: Free (or paid for better performance)

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait ~5-10 minutes for build
   - You'll get a URL like: `https://neoride-battery-modelling.onrender.com`

### **Environment Variables (if needed):**
- `PYTHON_VERSION`: `3.11.0` (or your version)
- `PORT`: Automatically set by Render

---

## 🐳 Docker Deployment (Alternative)

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Copy Python files
COPY requirements.txt .
COPY src/ src/
COPY data/ data/
COPY app.py .

# Install Python deps
RUN pip install --no-cache-dir -r requirements.txt flask flask-cors

# Copy and build React
COPY neoride-frontend/ neoride-frontend/
RUN cd neoride-frontend && npm install && npm run build

EXPOSE 5000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t neoride-battery .
docker run -p 5000:5000 neoride-battery
```

---

## 🔧 Troubleshooting

### **"Module not found" on Render**
- Add all Python deps to `requirements.txt`
- Ensure `flask` and `flask-cors` are in build command

### **"npm: command not found"**
- Render's Python environment includes Node.js
- If not, add: `apt-get install nodejs npm` to build command

### **React blank page**
- Check Flask `static_folder` path is correct
- Verify `neoride-frontend/dist/` exists after build
- Check browser console for 404 errors

### **API not working on deployed site**
- Check Render logs for Python errors
- Verify CSV upload size limits (Render free tier has limits)

---

## 📦 What Gets Deployed

```
Your Deployed App
├── React Frontend (/)
│   ├── Project Docs page
│   └── Live Pipeline page
└── Flask API (/api/*)
    ├── /api/health
    └── /api/run-pipeline
```

All in one URL, one deployment, one command to run!

---

## ⚡ Quick Commands

```bash
# Local unified mode
python app.py

# Rebuild React after changes
cd neoride-frontend && npm run build && cd ..

# Test locally
curl http://localhost:5000/api/health

# Docker
docker build -t neoride-battery . && docker run -p 5000:5000 neoride-battery
```

---

**Ready to deploy!** 🚀
