from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, clients, cars, orders, warehouse, finance
from app.core.config import settings

app = FastAPI(title=settings.APP_NAME, version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth.router)
app.include_router(clients.router)
app.include_router(cars.router)
app.include_router(orders.router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}
