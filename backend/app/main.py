from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY
from app.api import bundle
from app.core.config import settings
from app.services.data_service import DataService
from app.optimization.bundler import BenefitBundler
from app.services.bundle_service import BundleService
import logging
import time

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ichra.api")

app = FastAPI(
    title="ICHRA Benefit Bundler API",
    description="API for bundling Individual Coverage Health Reimbursement Arrangement (ICHRA) benefits",
    version="1.0.0"
)

# CORS for localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger.info(f"Request: {request.method} {request.url}")
        start_time = time.time()
        response = await call_next(request)
        duration = (time.time() - start_time) * 1000
        logger.info(f"Response: {request.method} {request.url} - {response.status_code} ({duration:.2f} ms)")
        return response

app.add_middleware(LoggingMiddleware)

# Dependency injection for services
# (Could use FastAPI Depends, but here we use singletons for startup event)
data_service = DataService()
optimizer = BenefitBundler()
bundle_service = BundleService(data_service, optimizer)

# Startup event to load CMS data
@app.on_event("startup")
def load_cms_data():
    logger.info("Loading CMS data on startup...")
    data_service.load_cms_data("data")
    logger.info("CMS data loaded.")

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTPException: {exc.detail}")
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {str(exc)}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

# Include routers
app.include_router(bundle.router, prefix="/api", tags=["bundles"])

# Root endpoint
@app.get("/")
async def root():
    return {"message": "ICHRA Benefit Bundler API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.DEBUG
    ) 