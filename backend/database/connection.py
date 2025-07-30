"""
Supabase Database Connection for Cura Backend
Handles database connection and configuration
"""

import os
from typing import Optional
from supabase import create_client, Client
from config import settings, validate_database_config
import logging

# Configure logging
logger = logging.getLogger(__name__)

class DatabaseConnection:
    """Supabase database connection manager"""
    
    def __init__(self):
        self.client: Optional[Client] = None
        self._initialize_connection()
    
    def _initialize_connection(self) -> None:
        """Initialize Supabase client connection"""
        try:
            if not validate_database_config():
                logger.warning("Database configuration not found - running in development mode")
                return
            
            self.client = create_client(
                settings.supabase_url,
                settings.supabase_key
            )
            logger.info("Supabase client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Supabase client: {e}")
            self.client = None
    
    def get_client(self) -> Optional[Client]:
        """Get the Supabase client instance"""
        return self.client
    
    def is_connected(self) -> bool:
        """Check if database connection is active"""
        return self.client is not None
    
    def test_connection(self) -> bool:
        """Test database connection with a simple query"""
        try:
            if not self.client:
                return False
            
            # Test with a simple query
            result = self.client.table('conversations').select('id').limit(1).execute()
            return True
            
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            return False

# Global database connection instance
db_connection = DatabaseConnection()

def get_database_client() -> Optional[Client]:
    """Get the global database client"""
    return db_connection.get_client()

def ensure_connection() -> Client:
    """Ensure database connection exists, raise exception if not"""
    client = get_database_client()
    if not client:
        raise ConnectionError("Database connection not available")
    return client 