"""
Usage:
  cd backend
  pip install -r requirements.txt
  docker compose up -d  (from project root)

  # Initialize database
  alembic upgrade head

  # Run server
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
