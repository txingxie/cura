#!/usr/bin/env python3
"""
Load Processed Conversation Data into Supabase Database

This script loads the cleaned and processed conversation data from CSV files
into the Supabase database, transforming the data to match the database schema.

Features:
- Batch loading for performance
- Progress tracking and error handling  
- Data validation and quality checks
- Support for different data splits (train/val/test)
- Automatic conversation ID generation
- Comprehensive reporting

Usage:
    python scripts/load_conversation_data.py [--split train|validation|test|all]
"""

import sys
import os
import argparse
import pandas as pd
import uuid
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional, Tuple
import logging
from tqdm import tqdm
import time

# Add backend directory to path
project_root = Path(__file__).parent.parent
backend_path = project_root / "backend"
sys.path.append(str(backend_path))

try:
    from supabase import create_client, Client
    from config import settings
except ImportError as e:
    print(f"Import error: {e}")
    print("Make sure to install requirements: pip install -r backend/requirements.txt")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ConversationDataLoader:
    """Handles loading conversation data into Supabase database"""
    
    def __init__(self, batch_size: int = 50):
        """Initialize the data loader"""
        self.batch_size = batch_size
        self.client: Optional[Client] = None
        self.processed_data_dir = project_root / "data" / "processed"
        self.stats = {
            'total_processed': 0,
            'successful_inserts': 0,
            'failed_inserts': 0,
            'start_time': None,
            'end_time': None
        }
        
    def connect_to_database(self) -> bool:
        """Establish connection to Supabase database"""
        try:
            if not settings.supabase_url or not settings.supabase_key:
                logger.error("Database credentials not found in environment")
                logger.error("Create backend/.env with SUPABASE_URL and SUPABASE_KEY")
                return False
            
            self.client = create_client(settings.supabase_url, settings.supabase_key)
            logger.info(f"Connected to Supabase: {settings.supabase_url}")
            
            # Test connection with a simple query
            result = self.client.table('conversations').select('id').limit(1).execute()
            logger.info("Database connection verified successfully")
            return True
            
        except Exception as e:
            if "relation" in str(e).lower() and "does not exist" in str(e).lower():
                logger.error("Database tables don't exist!")
                logger.error("Please execute database/schema.sql in Supabase SQL Editor first")
            else:
                logger.error(f"Database connection failed: {e}")
            return False
    
    def load_processed_data(self, split: str = "all") -> Dict[str, pd.DataFrame]:
        """Load processed conversation data from CSV files"""
        logger.info(f"Loading processed conversation data (split: {split})")
        
        datasets = {}
        
        if split == "all":
            # Load all splits
            splits_to_load = ["train", "validation", "test"]
        else:
            splits_to_load = [split]
        
        for split_name in splits_to_load:
            file_path = self.processed_data_dir / f"conversations_{split_name}.csv"
            
            if not file_path.exists():
                logger.warning(f"File not found: {file_path}")
                continue
            
            try:
                df = pd.read_csv(file_path)
                datasets[split_name] = df
                logger.info(f"Loaded {len(df)} conversations from {split_name} split")
            except Exception as e:
                logger.error(f"Failed to load {file_path}: {e}")
        
        return datasets
    
    def transform_data_for_database(self, df: pd.DataFrame, split_name: str) -> List[Dict]:
        """Transform CSV data to match database schema"""
        logger.info(f"Transforming {len(df)} conversations for database insertion")
        
        transformed_records = []
        
        for idx, row in df.iterrows():
            # Generate unique conversation ID
            conversation_id = f"{split_name}_{idx:04d}_{uuid.uuid4().hex[:8]}"
            
            # Transform data to match database schema
            record = {
                'conversation_id': conversation_id,
                'patient_question': str(row['Context']).strip(),
                'counselor_response': str(row['Response']).strip(),
                'data_split': str(row['split']) if 'split' in row else split_name,  # Add explicit split tracking
                'topic_tags': [],  # Will be populated later with ML analysis
                'estimated_age_group': None,  # Will be populated later with analysis
                'presenting_concerns': [],  # Will be populated later with ML analysis
                'response_length': int(row['response_length']) if pd.notna(row['response_length']) else len(str(row['Response'])),
                'quality_score': None,  # Will be calculated later
                'is_validated': False,  # Manual validation pending
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            # Validate required fields
            if len(record['patient_question']) < 10 or len(record['counselor_response']) < 10:
                logger.warning(f"Skipping record {idx} - insufficient content")
                continue
            
            transformed_records.append(record)
        
        logger.info(f"Transformed {len(transformed_records)} valid records")
        return transformed_records
    
    def insert_batch(self, records: List[Dict]) -> Tuple[int, int]:
        """Insert a batch of records into the database"""
        try:
            result = self.client.table('conversations').insert(records).execute()
            return len(records), 0  # successful, failed
        except Exception as e:
            logger.error(f"Batch insert failed: {e}")
            # Try individual inserts to identify problematic records
            successful = 0
            failed = 0
            
            for record in records:
                try:
                    self.client.table('conversations').insert(record).execute()
                    successful += 1
                except Exception as individual_error:
                    logger.warning(f"Failed to insert record {record['conversation_id']}: {individual_error}")
                    failed += 1
            
            return successful, failed
    
    def load_conversations_to_database(self, datasets: Dict[str, pd.DataFrame]) -> Dict:
        """Load all conversation data to database with batch processing"""
        logger.info("Starting batch loading to database...")
        self.stats['start_time'] = datetime.now()
        
        total_records = sum(len(df) for df in datasets.values())
        logger.info(f"Total records to process: {total_records}")
        
        overall_progress = tqdm(total=total_records, desc="Loading conversations", unit="records")
        
        for split_name, df in datasets.items():
            logger.info(f"Processing {split_name} split ({len(df)} records)")
            
            # Transform data for database
            records = self.transform_data_for_database(df, split_name)
            self.stats['total_processed'] += len(records)
            
            # Process in batches
            for i in range(0, len(records), self.batch_size):
                batch = records[i:i + self.batch_size]
                
                successful, failed = self.insert_batch(batch)
                self.stats['successful_inserts'] += successful
                self.stats['failed_inserts'] += failed
                
                overall_progress.update(len(batch))
                
                # Brief pause to avoid overwhelming the database
                time.sleep(0.1)
        
        overall_progress.close()
        self.stats['end_time'] = datetime.now()
        
        return self.stats
    
    def validate_loaded_data(self) -> Dict:
        """Validate that data was loaded correctly"""
        logger.info("Validating loaded data...")
        
        validation_results = {}
        
        try:
            # Count total records
            total_result = self.client.table('conversations').select('id', count='exact').execute()
            total_count = total_result.count
            validation_results['total_records'] = total_count
            
            # Check for duplicate conversation_ids
            duplicate_check = self.client.rpc('check_duplicate_conversation_ids').execute()
            validation_results['duplicate_ids'] = len(duplicate_check.data) if duplicate_check.data else 0
            
            # Sample a few records for content validation
            sample_result = self.client.table('conversations').select('*').limit(5).execute()
            validation_results['sample_records'] = len(sample_result.data)
            
            # Check data quality metrics
            quality_check = self.client.table('conversations').select('response_length').execute()
            if quality_check.data:
                lengths = [r['response_length'] for r in quality_check.data if r['response_length']]
                validation_results['avg_response_length'] = sum(lengths) / len(lengths) if lengths else 0
                validation_results['min_response_length'] = min(lengths) if lengths else 0
                validation_results['max_response_length'] = max(lengths) if lengths else 0
            
            logger.info("Data validation completed successfully")
            
        except Exception as e:
            logger.error(f"Data validation failed: {e}")
            validation_results['validation_error'] = str(e)
        
        return validation_results
    
    def generate_loading_report(self, validation_results: Dict) -> None:
        """Generate comprehensive loading report"""
        duration = self.stats['end_time'] - self.stats['start_time']
        
        print("\n" + "="*60)
        print("CONVERSATION DATA LOADING REPORT")
        print("="*60)
        
        print(f"\nLOADING STATISTICS:")
        print(f"{'Total processed:':<25} {self.stats['total_processed']}")
        print(f"{'Successful inserts:':<25} {self.stats['successful_inserts']}")
        print(f"{'Failed inserts:':<25} {self.stats['failed_inserts']}")
        print(f"{'Success rate:':<25} {self.stats['successful_inserts']/self.stats['total_processed']*100:.1f}%")
        print(f"{'Processing time:':<25} {duration}")
        print(f"{'Records per second:':<25} {self.stats['total_processed']/duration.total_seconds():.1f}")
        
        print(f"\nDATA VALIDATION:")
        print(f"{'Records in database:':<25} {validation_results.get('total_records', 'N/A')}")
        print(f"{'Duplicate IDs found:':<25} {validation_results.get('duplicate_ids', 'N/A')}")
        print(f"{'Sample records verified:':<25} {validation_results.get('sample_records', 'N/A')}")
        
        if 'avg_response_length' in validation_results:
            print(f"\n📏 CONTENT METRICS:")
            print(f"{'Avg response length:':<25} {validation_results['avg_response_length']:.0f} chars")
            print(f"{'Min response length:':<25} {validation_results['min_response_length']} chars")
            print(f"{'Max response length:':<25} {validation_results['max_response_length']} chars")
        
        if self.stats['failed_inserts'] > 0:
            print(f"\nWARNINGS:")
            print(f"Some records failed to insert. Check logs for details.")
        
        print(f"\DATABASE READY FOR:")
        print(f"- Vector embedding generation (Task 2.5)")
        print(f"- ML model training and classification") 
        print(f"- Semantic similarity search")
        
        print("="*60)
    
    def clean_existing_data(self, confirm: bool = False) -> bool:
        """Clean existing conversation data (use with caution)"""
        if not confirm:
            response = input("This will delete ALL existing conversation data. Continue? (y/N): ")
            if response.lower() != 'y':
                logger.info("Data cleaning cancelled")
                return False
        
        try:
            # Delete in reverse order due to foreign key constraints
            self.client.table('conversation_classifications').delete().neq('id', 0).execute()
            self.client.table('conversation_embeddings').delete().neq('id', 0).execute()
            self.client.table('conversations').delete().neq('id', 0).execute()
            
            logger.info("Existing conversation data cleaned successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to clean existing data: {e}")
            return False

def main():
    """Main function to load conversation data"""
    parser = argparse.ArgumentParser(description="Load processed conversation data into Supabase")
    parser.add_argument('--split', choices=['train', 'validation', 'test', 'all'], 
                       default='all', help='Which data split to load')
    parser.add_argument('--batch-size', type=int, default=50, 
                       help='Batch size for database inserts')
    parser.add_argument('--clean', action='store_true', 
                       help='Clean existing data before loading')
    
    args = parser.parse_args()
    
    print("🚀 CURA CONVERSATION DATA LOADER")
    print("="*40)
    
    # Initialize loader
    loader = ConversationDataLoader(batch_size=args.batch_size)
    
    # Connect to database
    if not loader.connect_to_database():
        logger.error("Failed to connect to database")
        return 1
    
    # Clean existing data if requested
    if args.clean:
        if not loader.clean_existing_data():
            return 1
    
    # Load processed data
    datasets = loader.load_processed_data(args.split)
    if not datasets:
        logger.error("No data to load")
        return 1
    
    # Load to database
    stats = loader.load_conversations_to_database(datasets)
    
    # Validate loaded data
    validation_results = loader.validate_loaded_data()
    
    # Generate report
    loader.generate_loading_report(validation_results)
    
    # Return success/failure code
    if stats['failed_inserts'] == 0:
        logger.info("All data loaded successfully!")
        return 0
    else:
        logger.warning(f"Loading completed with {stats['failed_inserts']} failures")
        return 1

if __name__ == "__main__":
    sys.exit(main())