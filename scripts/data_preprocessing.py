#!/usr/bin/env python3
"""
Data preprocessing pipeline for CounselChat mental health conversations.

This script cleans and standardizes the raw conversation data:
- Removes duplicate entries
- Cleans and normalizes text (HTML, special characters, encoding)
- Removes PII (Personally Identifiable Information)
- Standardizes formatting and validates quality
- Creates train/validation/test splits
- Saves processed data for ML training

"""

import os
import re
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Tuple, List, Dict, Set
import logging
from sklearn.model_selection import train_test_split
import html
import unicodedata
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataPreprocessor:
    """Comprehensive data preprocessing pipeline for mental health conversations."""
    
    def __init__(self, project_root: Path = None):
        """Initialize the preprocessor with project paths."""
        if project_root is None:
            project_root = Path(__file__).parent.parent
        
        self.project_root = project_root
        self.raw_data_dir = project_root / "data" / "raw"
        self.processed_data_dir = project_root / "data" / "processed"
        
        # Ensure processed directory exists
        self.processed_data_dir.mkdir(parents=True, exist_ok=True)
        
        # PII patterns for detection and removal
        self.pii_patterns = {
            'phone': re.compile(r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b'),
            'email': re.compile(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'),
            'ssn': re.compile(r'\b\d{3}-\d{2}-\d{4}\b'),
            'credit_card': re.compile(r'\b(?:\d{4}[-\s]?){3}\d{4}\b'),
            'url': re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'),
            'name_titles': re.compile(r'\b(?:Dr|Mr|Mrs|Ms|Miss|Prof|Professor|Sir|Madam)\.?\s+[A-Z][a-z]+\b'),
        }
        
        # Common therapeutic name placeholders to preserve
        self.preserve_patterns = [
            re.compile(r'\bNAME\b'),  # Already anonymized names
            re.compile(r'\b[A-Z]{2,}\b'),  # Acronyms like CBT, EMDR, etc.
        ]
    
    def load_raw_data(self, filename: str = "mental_health_conversations.csv") -> pd.DataFrame:
        """Load the raw dataset from CSV file."""
        file_path = self.raw_data_dir / filename
        logger.info(f"Loading raw data from {file_path}")
        
        try:
            df = pd.read_csv(file_path)
            logger.info(f"Loaded {len(df)} conversations with columns: {list(df.columns)}")
            return df
        except FileNotFoundError:
            logger.error(f"File not found: {file_path}")
            raise
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise
    
    def remove_duplicates(self, df: pd.DataFrame) -> pd.DataFrame:
        """Remove duplicate conversations based on content similarity."""
        logger.info("Removing duplicate conversations...")
        
        initial_count = len(df)
        
        # Remove exact duplicates first
        df = df.drop_duplicates(subset=['Context', 'Response'], keep='first')
        
        # Remove entries with duplicate contexts (same question, different responses)
        # Keep the longest response for each context
        df['response_length'] = df['Response'].str.len()
        df = df.sort_values('response_length', ascending=False)
        df = df.drop_duplicates(subset=['Context'], keep='first')
        df = df.drop(columns=['response_length'])
        
        final_count = len(df)
        removed_count = initial_count - final_count
        
        logger.info(f"Removed {removed_count} duplicate conversations ({removed_count/initial_count*100:.1f}%)")
        logger.info(f"Remaining conversations: {final_count}")
        
        return df.reset_index(drop=True)
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize individual text strings."""
        if pd.isna(text) or text == '':
            return ''
        
        # Convert to string if not already
        text = str(text)
        
        # Decode HTML entities
        text = html.unescape(text)
        
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', ' ', text)
        
        # Normalize Unicode characters
        text = unicodedata.normalize('NFKD', text)
        
        # Remove extra whitespace and normalize spacing
        text = re.sub(r'\s+', ' ', text)
        text = text.strip()
        
        # Remove very long URLs but preserve therapeutic website references
        text = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '[URL]', text)
        
        # Standardize quotes
        text = re.sub(r'["""]', '"', text)
        text = re.sub(r"[''']", "'", text)
        
        # Remove excessive punctuation
        text = re.sub(r'[.]{3,}', '...', text)
        text = re.sub(r'[!]{2,}', '!', text)
        text = re.sub(r'[?]{2,}', '?', text)
        
        return text
    
    def remove_pii(self, text: str) -> str:
        """Remove personally identifiable information from text."""
        if pd.isna(text) or text == '':
            return ''
        
        text = str(text)
        
        # Check if any preserve patterns exist (don't remove these)
        preserve_spans = []
        for pattern in self.preserve_patterns:
            for match in pattern.finditer(text):
                preserve_spans.append((match.start(), match.end()))
        
        # Remove PII patterns while preserving therapeutic terms
        for pii_type, pattern in self.pii_patterns.items():
            matches = list(pattern.finditer(text))
            for match in reversed(matches):  # Reverse to maintain indices
                start, end = match.span()
                # Check if this match overlaps with any preserve span
                should_preserve = any(
                    (start < p_end and end > p_start) 
                    for p_start, p_end in preserve_spans
                )
                
                if not should_preserve:
                    if pii_type == 'phone':
                        replacement = '[PHONE]'
                    elif pii_type == 'email':
                        replacement = '[EMAIL]'
                    elif pii_type == 'ssn':
                        replacement = '[SSN]'
                    elif pii_type == 'credit_card':
                        replacement = '[CARD]'
                    elif pii_type == 'url':
                        replacement = '[URL]'
                    elif pii_type == 'name_titles':
                        replacement = '[THERAPIST]'
                    else:
                        replacement = '[REDACTED]'
                    
                    text = text[:start] + replacement + text[end:]
        
        # Additional name detection (common first names)
        # This is conservative to avoid removing therapeutic terms
        common_names = [
            r'\bRobin\s+[A-Z][a-z]+',  # Specific therapist names we saw in data
            r'\bMarie\b(?!\s+(?:Curie|Antoinette))',  # Common name but avoid historical figures
        ]
        
        for name_pattern in common_names:
            text = re.sub(name_pattern, '[THERAPIST]', text, flags=re.IGNORECASE)
        
        return text
    
    def validate_conversation_quality(self, context: str, response: str) -> bool:
        """Validate that a conversation meets quality standards."""
        # Check minimum length requirements
        if len(context.strip()) < 10 or len(response.strip()) < 10:
            return False
        
        # Check maximum length requirements (remove extremely long outliers)
        if len(context) > 5000 or len(response) > 50000:
            return False
        
        # Check for meaningful content (not just punctuation or numbers)
        if len(re.sub(r'[^a-zA-Z]', '', context)) < 5:
            return False
        if len(re.sub(r'[^a-zA-Z]', '', response)) < 10:
            return False
        
        # Check for therapeutic relevance (basic keywords)
        therapeutic_keywords = [
            'feel', 'emotion', 'therapy', 'counseling', 'help', 'support', 'understand',
            'depression', 'anxiety', 'stress', 'mental', 'health', 'treatment', 'cope',
            'relationship', 'family', 'work', 'life', 'change', 'goal', 'hope', 'healing'
        ]
        
        combined_text = (context + ' ' + response).lower()
        has_therapeutic_content = any(keyword in combined_text for keyword in therapeutic_keywords)
        
        return has_therapeutic_content
    
    def create_data_splits(self, df: pd.DataFrame, 
                          train_size: float = 0.7, 
                          val_size: float = 0.15, 
                          test_size: float = 0.15,
                          random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Create train/validation/test splits with stratification."""
        
        # Ensure splits sum to 1.0
        assert abs(train_size + val_size + test_size - 1.0) < 1e-6, "Split sizes must sum to 1.0"
        
        logger.info(f"Creating data splits: train={train_size:.1%}, val={val_size:.1%}, test={test_size:.1%}")
        
        # First split: train vs (val + test)
        train_df, temp_df = train_test_split(
            df, 
            test_size=(val_size + test_size), 
            random_state=random_state,
            shuffle=True
        )
        
        # Second split: val vs test
        val_df, test_df = train_test_split(
            temp_df,
            test_size=(test_size / (val_size + test_size)),
            random_state=random_state,
            shuffle=True
        )
        
        logger.info(f"Split sizes: train={len(train_df)}, val={len(val_df)}, test={len(test_df)}")
        
        return train_df, val_df, test_df
    
    def process_dataset(self, input_filename: str = "mental_health_conversations.csv") -> Dict[str, pd.DataFrame]:
        """Run the complete preprocessing pipeline."""
        logger.info("=" * 60)
        logger.info("STARTING DATA PREPROCESSING PIPELINE")
        logger.info("=" * 60)
        
        # Step 1: Load raw data
        df = self.load_raw_data(input_filename)
        
        # Step 2: Remove duplicates
        df = self.remove_duplicates(df)
        
        # Step 3: Clean text data
        logger.info("Cleaning and normalizing text data...")
        df['Context'] = df['Context'].apply(self.clean_text)
        df['Response'] = df['Response'].apply(self.remove_pii)
        df['Response'] = df['Response'].apply(self.clean_text)
        
        # Step 4: Remove PII from context as well
        logger.info("Removing PII from conversations...")
        df['Context'] = df['Context'].apply(self.remove_pii)
        
        # Step 5: Validate conversation quality
        logger.info("Validating conversation quality...")
        quality_mask = df.apply(
            lambda row: self.validate_conversation_quality(row['Context'], row['Response']), 
            axis=1
        )
        
        initial_count = len(df)
        df = df[quality_mask].reset_index(drop=True)
        removed_count = initial_count - len(df)
        
        logger.info(f"Removed {removed_count} low-quality conversations ({removed_count/initial_count*100:.1f}%)")
        logger.info(f"Final dataset size: {len(df)} conversations")
        
        # Step 6: Create train/validation/test splits
        train_df, val_df, test_df = self.create_data_splits(df)
        
        # Step 7: Add metadata
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Add metadata to all splits
        train_df = train_df.copy()
        val_df = val_df.copy()
        test_df = test_df.copy()
        df = df.copy()
        
        for split_df, split_name in [(train_df, 'train'), (val_df, 'val'), (test_df, 'test')]:
            split_df['split'] = split_name
            split_df['processed_date'] = timestamp
            split_df['context_length'] = split_df['Context'].str.len()
            split_df['response_length'] = split_df['Response'].str.len()
        
        # Add metadata to full dataset
        df['split'] = 'full'
        df['processed_date'] = timestamp
        df['context_length'] = df['Context'].str.len()
        df['response_length'] = df['Response'].str.len()
        
        return {
            'train': train_df,
            'validation': val_df,
            'test': test_df,
            'full': df
        }
    
    def save_processed_data(self, datasets: Dict[str, pd.DataFrame]) -> None:
        """Save processed datasets to CSV files."""
        logger.info("Saving processed datasets...")
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        for split_name, df in datasets.items():
            if split_name == 'full':
                filename = f"conversations_cleaned_{timestamp}.csv"
            else:
                filename = f"conversations_{split_name}_{timestamp}.csv"
            
            filepath = self.processed_data_dir / filename
            df.to_csv(filepath, index=False)
            
            logger.info(f"Saved {split_name} split: {len(df)} conversations → {filepath}")
        
        # Also save the latest versions without timestamp for easy access
        for split_name, df in datasets.items():
            if split_name == 'full':
                filename = "conversations_cleaned.csv"
            else:
                filename = f"conversations_{split_name}.csv"
            
            filepath = self.processed_data_dir / filename
            df.to_csv(filepath, index=False)
        
        # Create processing summary
        summary_path = self.processed_data_dir / "preprocessing_summary.txt"
        with open(summary_path, 'w') as f:
            f.write(f"Data Preprocessing Summary\n")
            f.write(f"========================\n\n")
            f.write(f"Processing Date: {timestamp}\n")
            f.write(f"Source File: mental_health_conversations.csv\n\n")
            
            for split_name, df in datasets.items():
                f.write(f"{split_name.upper()} Split:\n")
                f.write(f"  Conversations: {len(df)}\n")
                f.write(f"  Avg Context Length: {df['context_length'].mean():.1f} chars\n")
                f.write(f"  Avg Response Length: {df['response_length'].mean():.1f} chars\n")
                f.write(f"  File: conversations_{split_name}.csv\n\n")
        
        logger.info(f"Processing summary saved to {summary_path}")

def main():
    """Main function to run the preprocessing pipeline."""
    try:
        # Initialize preprocessor
        preprocessor = DataPreprocessor()
        
        # Run preprocessing pipeline
        datasets = preprocessor.process_dataset()
        
        # Save processed data
        preprocessor.save_processed_data(datasets)
        
        logger.info("=" * 60)
        logger.info("DATA PREPROCESSING COMPLETED SUCCESSFULLY!")
        logger.info("=" * 60)
        
        # Print final statistics
        print(f"\n📊 PROCESSING RESULTS:")
        print(f"{'Split':<12} {'Count':<8} {'Avg Context':<12} {'Avg Response':<12}")
        print("-" * 50)
        
        for split_name, df in datasets.items():
            if split_name != 'full':
                avg_context = df['context_length'].mean()
                avg_response = df['response_length'].mean()
                print(f"{split_name.capitalize():<12} {len(df):<8} {avg_context:<12.0f} {avg_response:<12.0f}")
        
        print(f"\n✅ All processed datasets saved to: data/processed/")
        
    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        raise

if __name__ == "__main__":
    main()