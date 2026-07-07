cd backend
.\venv\Scripts\activate
# Add your GEMINI_API_KEY to .env
uvicorn main:app --reload --port 8000
# API Docs: http://localhost:8000/docs
------for backend------------------
cd frontend
npm run dev
# App: http://localhost:5173

