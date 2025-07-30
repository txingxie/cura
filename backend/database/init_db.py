"""
Database Initialization for Cura Backend
Creates tables and indexes in Supabase
"""

import asyncio
import logging
from typing import Optional
from supabase import Client

from .connection import get_database_client, ensure_connection
from .models import DATABASE_SCHEMA, get_conversation_schema

# Configure logging
logger = logging.getLogger(__name__)

async def create_tables(client: Client) -> bool:
    """
    Create all required tables in Supabase
    Returns True if successful, False otherwise
    """
    try:
        # Enable vector extension for embeddings
        logger.info("Enabling vector extension...")
        enable_vector_sql = "CREATE EXTENSION IF NOT EXISTS vector;"
        
        # Note: This might need to be run as superuser in Supabase
        # For development, we'll handle this gracefully
        try:
            client.rpc('exec_sql', {'sql': enable_vector_sql}).execute()
        except Exception as e:
            logger.warning(f"Could not enable vector extension (may need superuser): {e}")
        
        # Create tables in order (respecting foreign key dependencies)
        table_order = ["conversations", "conversation_embeddings", "conversation_classifications"]
        
        for table_name in table_order:
            logger.info(f"Creating table: {table_name}")
            sql = DATABASE_SCHEMA[table_name]
            
            try:
                # Execute SQL using Supabase RPC function
                result = client.rpc('exec_sql', {'sql': sql}).execute()
                logger.info(f"Successfully created {table_name}")
            except Exception as e:
                logger.error(f"Failed to create {table_name}: {e}")
                return False
        
        logger.info("All tables created successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

async def verify_tables(client: Client) -> bool:
    """
    Verify that all required tables exist
    """
    try:
        required_tables = ["conversations", "conversation_embeddings", "conversation_classifications"]
        
        for table_name in required_tables:
            try:
                # Try to query the table (limit 0 to avoid data)
                result = client.table(table_name).select('*').limit(0).execute()
                logger.info(f"Table {table_name} exists and is accessible")
            except Exception as e:
                logger.error(f"Table {table_name} not accessible: {e}")
                return False
        
        return True
        
    except Exception as e:
        logger.error(f"Table verification failed: {e}")
        return False

async def initialize_database() -> bool:
    """
    Complete database initialization process
    """
    try:
        logger.info("Starting database initialization...")
        
        # Get database client
        client = get_database_client()
        if not client:
            logger.error("No database connection available")
            return False
        
        # Create tables
        if not await create_tables(client):
            logger.error("Failed to create tables")
            return False
        
        # Verify tables
        if not await verify_tables(client):
            logger.error("Table verification failed")
            return False
        
        logger.info("Database initialization completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        return False

# Alternative approach for Supabase (using direct SQL execution)
def create_tables_direct() -> bool:
    """
    Create tables using direct SQL execution (fallback method)
    This can be used if RPC method doesn't work
    """
    try:
        client = get_database_client()
        if not client:
            logger.error("No database connection available")
            return False
        
        # For direct table creation, we might need to use Supabase dashboard
        # or connect via psycopg2 directly
        logger.info("Direct table creation - use this SQL in Supabase dashboard:")
        print("\n" + "="*50)
        print("COPY THIS SQL TO SUPABASE SQL EDITOR:")
        print("="*50)
        print(get_conversation_schema())
        print("="*50 + "\n")
        
        return True
        
    except Exception as e:
        logger.error(f"Direct table creation failed: {e}")
        return False

def get_schema_sql() -> str:
    """
    Get the complete SQL schema for manual execution
    """
    return f"""
-- Cura Database Schema for Supabase
-- Enable vector extension (run this first as superuser if needed)
CREATE EXTENSION IF NOT EXISTS vector;

{get_conversation_schema()}

-- Additional helpful queries
-- Check table creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name LIKE 'conversation%';

-- Check vector extension
SELECT * FROM pg_extension WHERE extname = 'vector';
"""

if __name__ == "__main__":
    # Run initialization
    print("Cura Database Initialization")
    print("="*30)
    
    # Try direct method first (for development)
    if create_tables_direct():
        print("✅ Schema SQL generated - please run in Supabase dashboard")
    else:
        print("❌ Failed to generate schema") 