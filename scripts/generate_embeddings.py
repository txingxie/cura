#!/usr/bin/env python3
"""
Generate vector embeddings for conversation data using sentence-transformers.

This script loads conversation data from Supabase, generates embeddings for
patient questions and counselor responses, and stores them in the database
for semantic search functionality.

Usage:
    python scripts/generate_embeddings.py [--model MODEL_NAME] [--batch-size BATCH_SIZE]
"""

import argparse
import logging
import sys
import os
from datetime import datetime
from typing import List, Dict, Any, Optional
import time

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# Add backend to path for imports
sys.path.append('backend')

from config import settings
from supabase import create_client, Client


class EmbeddingGenerator:
    """Generate and store vector embeddings for conversation data."""
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", batch_size: int = 32):
        """
        Initialize embedding generator.
        
        Args:
            model_name: Sentence transformer model name
            batch_size: Batch size for processing
        """
        # Set up logging first
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        self.model_name = model_name
        self.batch_size = batch_size
        self.client = self._init_supabase_client()
        self.model = None
    
    def _init_supabase_client(self) -> Client:
        """Initialize Supabase client."""
        try:
            client = create_client(settings.supabase_url, settings.supabase_key)
            self.logger.info("Connected to Supabase")
            return client
        except Exception as e:
            self.logger.error(f"Failed to connect to Supabase: {e}")
            raise
    
    def load_model(self) -> None:
        """Load the sentence transformer model."""
        try:
            self.logger.info(f"Loading model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            self.logger.info(f"Model loaded successfully")
            self.logger.info(f"Embedding dimension: {self.model.get_sentence_embedding_dimension()}")
        except Exception as e:
            self.logger.error(f"Failed to load model: {e}")
            raise
    
    def load_conversations(self) -> pd.DataFrame:
        """Load conversation data from Supabase."""
        try:
            self.logger.info("Loading conversations from database...")
            
            # Fetch all conversations with required fields
            response = self.client.table('conversations').select(
                'id, conversation_id, patient_question, counselor_response, data_split'
            ).execute()
            
            if not response.data:
                raise ValueError("No conversations found in database")
            
            df = pd.DataFrame(response.data)
            self.logger.info(f"Loaded {len(df)} conversations")
            self.logger.info(f"Data splits: {df['data_split'].value_counts().to_dict()}")
            
            return df
        except Exception as e:
            self.logger.error(f"Failed to load conversations: {e}")
            raise
    
    def generate_embeddings(self, texts: List[str]) -> np.ndarray:
        """
        Generate embeddings for a list of texts.
        
        Args:
            texts: List of texts to embed
            
        Returns:
            Array of embeddings
        """
        if not self.model:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        try:
            embeddings = self.model.encode(
                texts, 
                batch_size=self.batch_size,
                show_progress_bar=False,
                convert_to_numpy=True
            )
            return embeddings
        except Exception as e:
            self.logger.error(f"Failed to generate embeddings: {e}")
            raise
    
    def clear_existing_embeddings(self) -> None:
        """Clear existing embeddings from database."""
        try:
            self.logger.info("Clearing existing embeddings...")
            response = self.client.table('conversation_embeddings').delete().gte('id', 0).execute()
            self.logger.info("Existing embeddings cleared")
        except Exception as e:
            self.logger.warning(f"Could not clear existing embeddings: {e}")
    
    def store_embeddings(self, conversation_id: str, question_embedding: np.ndarray, 
                        response_embedding: np.ndarray, embedding_model: str) -> bool:
        """
        Store embeddings in the database.
        
        Args:
            conversation_id: Unique conversation identifier
            question_embedding: Embedding for patient question
            response_embedding: Embedding for counselor response
            embedding_model: Name of the embedding model used
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Calculate combined embedding (average of question and response)
            combined_embedding = (question_embedding + response_embedding) / 2
            
            embedding_data = {
                'conversation_id': conversation_id,
                'patient_embedding': question_embedding.tolist(),
                'counselor_embedding': response_embedding.tolist(),
                'combined_embedding': combined_embedding.tolist(),
                'embedding_model': embedding_model,
                'embedding_dimension': len(question_embedding),
                'created_at': datetime.now().isoformat()
            }
            
            response = self.client.table('conversation_embeddings').insert(embedding_data).execute()
            return True
        except Exception as e:
            self.logger.error(f"Failed to store embedding for {conversation_id}: {e}")
            return False
    
    def process_conversations_batch(self, conversations_df: pd.DataFrame, 
                                  start_idx: int, end_idx: int) -> Dict[str, Any]:
        """
        Process a batch of conversations.
        
        Args:
            conversations_df: DataFrame with conversation data
            start_idx: Start index for batch
            end_idx: End index for batch
            
        Returns:
            Dictionary with batch processing results
        """
        batch_df = conversations_df.iloc[start_idx:end_idx]
        
        # Prepare texts for embedding
        questions = batch_df['patient_question'].tolist()
        responses = batch_df['counselor_response'].tolist()
        
        # Generate embeddings
        question_embeddings = self.generate_embeddings(questions)
        response_embeddings = self.generate_embeddings(responses)
        
        # Store embeddings
        success_count = 0
        failed_count = 0
        
        for idx, (_, row) in enumerate(batch_df.iterrows()):
            success = self.store_embeddings(
                conversation_id=row['conversation_id'],
                question_embedding=question_embeddings[idx],
                response_embedding=response_embeddings[idx],
                embedding_model=self.model_name
            )
            
            if success:
                success_count += 1
            else:
                failed_count += 1
        
        return {
            'success_count': success_count,
            'failed_count': failed_count,
            'batch_size': len(batch_df)
        }
    
    def generate_all_embeddings(self, clear_existing: bool = True) -> Dict[str, Any]:
        """
        Generate embeddings for all conversations.
        
        Args:
            clear_existing: Whether to clear existing embeddings first
            
        Returns:
            Dictionary with processing results
        """
        start_time = time.time()
        
        # Clear existing embeddings if requested
        if clear_existing:
            self.clear_existing_embeddings()
        
        # Load conversations
        conversations_df = self.load_conversations()
        total_conversations = len(conversations_df)
        
        # Process in batches
        total_success = 0
        total_failed = 0
        
        self.logger.info(f"Starting embedding generation for {total_conversations} conversations")
        self.logger.info(f"Batch size: {self.batch_size}")
        self.logger.info(f"Model: {self.model_name}")
        
        with tqdm(total=total_conversations, desc="Generating embeddings") as pbar:
            for start_idx in range(0, total_conversations, self.batch_size):
                end_idx = min(start_idx + self.batch_size, total_conversations)
                
                try:
                    batch_results = self.process_conversations_batch(
                        conversations_df, start_idx, end_idx
                    )
                    
                    total_success += batch_results['success_count']
                    total_failed += batch_results['failed_count']
                    
                    pbar.update(batch_results['batch_size'])
                    pbar.set_postfix({
                        'Success': total_success,
                        'Failed': total_failed,
                        'Rate': f"{total_success/(total_success+total_failed)*100:.1f}%" if (total_success+total_failed) > 0 else "0%"
                    })
                    
                except Exception as e:
                    self.logger.error(f"Failed to process batch {start_idx}-{end_idx}: {e}")
                    total_failed += end_idx - start_idx
                    pbar.update(end_idx - start_idx)
        
        # Calculate metrics
        end_time = time.time()
        processing_time = end_time - start_time
        records_per_second = total_conversations / processing_time if processing_time > 0 else 0
        success_rate = total_success / total_conversations * 100 if total_conversations > 0 else 0
        
        results = {
            'total_conversations': total_conversations,
            'successful_embeddings': total_success,
            'failed_embeddings': total_failed,
            'success_rate': success_rate,
            'processing_time': processing_time,
            'records_per_second': records_per_second,
            'model_used': self.model_name,
            'embedding_dimension': self.model.get_sentence_embedding_dimension()
        }
        
        return results
    
    def test_semantic_search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Test semantic search functionality.
        
        Args:
            query: Search query
            top_k: Number of results to return
            
        Returns:
            List of similar conversations
        """
        try:
            self.logger.info(f"Testing semantic search with query: '{query}'")
            
            # Generate embedding for query
            query_embedding = self.generate_embeddings([query])[0]
            
            # Use the find_similar_conversations function from our schema
            response = self.client.rpc('find_similar_conversations', {
                'query_embedding': query_embedding.tolist(),
                'similarity_threshold': 0.1,
                'max_results': top_k
            }).execute()
            
            if response.data:
                self.logger.info(f"Found {len(response.data)} similar conversations")
                return response.data
            else:
                self.logger.warning("No similar conversations found")
                return []
                
        except Exception as e:
            self.logger.error(f"Semantic search test failed: {e}")
            return []


def main():
    """Main function to run embedding generation."""
    parser = argparse.ArgumentParser(description="Generate conversation embeddings")
    parser.add_argument(
        "--model", 
        default="all-MiniLM-L6-v2",
        help="Sentence transformer model name (default: all-MiniLM-L6-v2)"
    )
    parser.add_argument(
        "--batch-size", 
        type=int, 
        default=32,
        help="Batch size for processing (default: 32)"
    )
    parser.add_argument(
        "--no-clear", 
        action="store_true",
        help="Don't clear existing embeddings before generating new ones"
    )
    parser.add_argument(
        "--test-search", 
        type=str,
        help="Test semantic search with the provided query"
    )
    
    args = parser.parse_args()
    
    # Initialize generator
    generator = EmbeddingGenerator(
        model_name=args.model,
        batch_size=args.batch_size
    )
    
    try:
        # Load model
        generator.load_model()
        
        # Generate embeddings
        if not args.test_search:
            results = generator.generate_all_embeddings(clear_existing=not args.no_clear)
            
            # Print results
            print("\n" + "="*60)
            print("EMBEDDING GENERATION REPORT")
            print("="*60)
            print(f"Total conversations: {results['total_conversations']}")
            print(f"Successful embeddings: {results['successful_embeddings']}")
            print(f"Failed embeddings: {results['failed_embeddings']}")
            print(f"Success rate: {results['success_rate']:.1f}%")
            print(f"Processing time: {results['processing_time']:.2f} seconds")
            print(f"Records per second: {results['records_per_second']:.1f}")
            print(f"Model used: {results['model_used']}")
            print(f"Embedding dimension: {results['embedding_dimension']}")
            print("="*60)
            
            if results['success_rate'] == 100.0:
                print("All embeddings generated successfully!")
                print("Database ready for semantic search!")
            else:
                print("Some embeddings failed to generate.")
        
        # Test semantic search if requested
        if args.test_search:
            similar_conversations = generator.test_semantic_search(args.test_search)
            
            print(f"\nSemantic Search Results for: '{args.test_search}'")
            print("-" * 60)
            
            for i, conv in enumerate(similar_conversations, 1):
                similarity = conv.get('similarity', 'N/A')
                if isinstance(similarity, (int, float)):
                    similarity_str = f"{similarity:.3f}"
                else:
                    similarity_str = str(similarity)
                print(f"\n{i}. Similarity: {similarity_str}")
                print(f"   Question: {conv.get('patient_question', 'N/A')[:100]}...")
                print(f"   Response: {conv.get('counselor_response', 'N/A')[:100]}...")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()