"""
Enhanced Configuration Management for Cura Backend
Handles environment variables, validation, and different deployment environments
"""

import os
import secrets
from typing import Optional, List, Any
from pydantic_settings import BaseSettings
from pydantic import Field, validator
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings with comprehensive environment variable support"""
    
    # ==============================================
    # ENVIRONMENT & DEPLOYMENT
    # ==============================================
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")
    secret_key: str = Field(default_factory=lambda: secrets.token_urlsafe(32), env="SECRET_KEY")
    
    # ==============================================
    # API CONFIGURATION
    # ==============================================
    app_name: str = Field(default="Cura Backend API", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    api_host: str = Field(default="127.0.0.1", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")
    
    # ==============================================
    # DATABASE CONFIGURATION
    # ==============================================
    supabase_url: Optional[str] = Field(default=None, env="SUPABASE_URL")
    supabase_key: Optional[str] = Field(default=None, env="SUPABASE_KEY")
    database_url: Optional[str] = Field(default=None, env="DATABASE_URL")
    
    # ==============================================
    # OPENAI CONFIGURATION
    # ==============================================
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-3.5-turbo", env="OPENAI_MODEL")
    openai_temperature: float = Field(default=0.7, env="OPENAI_TEMPERATURE")
    openai_max_tokens: int = Field(default=1000, env="OPENAI_MAX_TOKENS")
    
    # ==============================================
    # ML MODEL CONFIGURATION
    # ==============================================
    model_path: str = Field(default="./models", env="MODEL_PATH")
    embeddings_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2", 
        env="EMBEDDINGS_MODEL"
    )
    ml_confidence_threshold: float = Field(default=0.6, env="ML_CONFIDENCE_THRESHOLD")
    
    # ==============================================
    # SECURITY & CORS
    # ==============================================
    cors_origins: List[str] = Field(
        default=["http://localhost:3000"], 
        env="CORS_ORIGINS"
    )
    allowed_hosts: List[str] = Field(
        default=["localhost", "127.0.0.1"], 
        env="ALLOWED_HOSTS"
    )
    
    # ==============================================
    # RATE LIMITING
    # ==============================================
    rate_limit_requests: int = Field(default=100, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=3600, env="RATE_LIMIT_WINDOW")  # 1 hour
    
    # ==============================================
    # LOGGING & MONITORING
    # ==============================================
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    sentry_dsn: Optional[str] = Field(default=None, env="SENTRY_DSN")
    enable_request_logging: bool = Field(default=True, env="ENABLE_REQUEST_LOGGING")
    
    # ==============================================
    # PERFORMANCE SETTINGS
    # ==============================================
    max_request_size: int = Field(default=10485760, env="MAX_REQUEST_SIZE")  # 10MB
    request_timeout: int = Field(default=30, env="REQUEST_TIMEOUT")  # 30 seconds
    worker_count: int = Field(default=1, env="WORKER_COUNT")
    
    # ==============================================
    # FEATURE FLAGS
    # ==============================================
    enable_analytics: bool = Field(default=False, env="ENABLE_ANALYTICS")
    enable_caching: bool = Field(default=True, env="ENABLE_CACHING")
    enable_mock_data: bool = Field(default=False, env="ENABLE_MOCK_DATA")

    # ==============================================
    # VALIDATORS
    # ==============================================
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            # Handle JSON string format: '["origin1", "origin2"]'
            if v.startswith('[') and v.endswith(']'):
                import json
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            # Handle comma-separated format: 'origin1,origin2'
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @validator('allowed_hosts', pre=True)
    def parse_allowed_hosts(cls, v):
        if isinstance(v, str):
            if v.startswith('[') and v.endswith(']'):
                import json
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [host.strip() for host in v.split(',')]
        return v

    @validator('log_level')
    def validate_log_level(cls, v):
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f'Log level must be one of: {valid_levels}')
        return v.upper()

    # ==============================================
    # CONFIGURATION
    # ==============================================
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        
        # Allow extra fields for extensibility
        extra = "ignore"

    # ==============================================
    # COMPUTED PROPERTIES
    # ==============================================
    @property
    def is_development(self) -> bool:
        return self.environment.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"
    
    @property
    def is_testing(self) -> bool:
        return self.environment.lower() == "test"


# ==============================================
# SETTINGS INSTANCE
# ==============================================
@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()

# Global settings instance
settings = get_settings()


# ==============================================
# VALIDATION FUNCTIONS
# ==============================================
def validate_openai_config() -> bool:
    """Validate OpenAI API configuration"""
    return settings.openai_api_key is not None and len(settings.openai_api_key) > 0

def validate_database_config() -> bool:
    """Validate database configuration"""
    return (
        settings.supabase_url is not None and 
        settings.supabase_key is not None and
        len(settings.supabase_url) > 0 and
        len(settings.supabase_key) > 0
    )

def validate_required_config() -> List[str]:
    """Validate all required configuration and return missing items"""
    missing = []
    
    if not validate_database_config():
        missing.append("Database configuration (SUPABASE_URL, SUPABASE_KEY)")
    
    if not validate_openai_config():
        missing.append("OpenAI configuration (OPENAI_API_KEY)")
    
    return missing

def get_environment_info() -> dict:
    """Get current environment information for debugging"""
    return {
        "environment": settings.environment,
        "debug": settings.debug,
        "app_name": settings.app_name,
        "app_version": settings.app_version,
        "api_host": settings.api_host,
        "api_port": settings.api_port,
        "database_configured": validate_database_config(),
        "openai_configured": validate_openai_config(),
        "cors_origins": settings.cors_origins,
        "log_level": settings.log_level,
    }


# ==============================================
# HELPER FUNCTIONS
# ==============================================
def get_model_path(model_name: str) -> str:
    """Get full path for model file"""
    return os.path.join(settings.model_path, f"{model_name}.pkl")

def get_database_url() -> str:
    """Get database URL with fallback"""
    return settings.database_url or settings.supabase_url or ""

def setup_logging():
    """Setup logging configuration based on settings"""
    import logging
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, settings.log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Setup Sentry if configured
    if settings.sentry_dsn and settings.is_production:
        try:
            import sentry_sdk
            sentry_sdk.init(dsn=settings.sentry_dsn)
        except ImportError:
            logging.warning("Sentry SDK not installed but DSN provided")

# Initialize logging when module is imported
setup_logging() 