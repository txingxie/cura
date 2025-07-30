"""
Cura Backend - FastAPI Application Entry Point
AI-Powered Counselor Guidance Platform

Three-Layer AI Response System:
1. Semantic Search - Find similar therapeutic conversations
2. ML Classification - Identify appropriate interventions  
3. LLM Generation - Generate contextual therapeutic advice
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import time
import logging

from api.routes import router
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application instance
app = FastAPI(
    title="Cura Therapeutic AI API",
    description="""
    AI-Powered Counselor Guidance Platform Backend
    
    ## Features
    - **Semantic Search**: Find similar therapeutic conversations using vector similarity
    - **ML Classification**: Zero-shot intervention classification with confidence scoring
    - **Therapeutic Inference**: Unified context synthesis for counselor guidance
    
    ## Architecture
    Built on validated therapeutic ML models with sub-5s response times.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "Cura Development Team",
        "url": "https://github.com/cura-ai/cura"
    }
)

# Performance monitoring middleware
@app.middleware("http")
async def performance_middleware(request: Request, call_next):
    """Track request performance metrics"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # Log slow requests (>5s)
    if process_time > 5.0:
        logger.warning(f"Slow request: {request.method} {request.url.path} took {process_time:.2f}s")
    
    return response

# Configure CORS with environment-based origins
cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if hasattr(settings, 'cors_origins') and settings.cors_origins:
    cors_origins.extend(settings.cors_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"]
)

# Add trusted host middleware for security
trusted_hosts = ["localhost", "127.0.0.1", "*.localhost"]
if hasattr(settings, 'allowed_hosts') and settings.allowed_hosts:
    trusted_hosts.extend(settings.allowed_hosts)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=trusted_hosts
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors gracefully"""
    logger.error(f"Unhandled exception on {request.method} {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": "An unexpected error occurred. Please try again.",
            "path": str(request.url.path)
        }
    )

# Include API routes
app.include_router(router, prefix="/api/v1")

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint for health checking"""
    return {
        "message": "Cura Backend API",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 