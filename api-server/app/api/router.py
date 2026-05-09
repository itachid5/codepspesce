from fastapi import APIRouter

from app.api.cloudinary.routes import router as cloudinary_router

api_router = APIRouter(prefix="/api")
api_router.include_router(cloudinary_router)
