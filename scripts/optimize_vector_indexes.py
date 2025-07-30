#!/usr/bin/env python3
"""
Optimize vector indexes in Supabase for efficient similarity queries.

This script analyzes current vector index performance and creates optimized 
indexes for different similarity search patterns and query volumes.

Usage:
    python scripts/optimize_vector_indexes.py [--analyze] [--create] [--benchmark]
"""

import argparse
import logging
import sys
import os
import time
from datetime import datetime
from typing import List, Dict, Any, Tuple
import json

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

# Add backend to path for imports
sys.path.append('backend')

from config import settings
from supabase import create_client, Client


class VectorIndexOptimizer:
    """Optimize vector indexes for efficient similarity queries."""
    
    def __init__(self):
        """Initialize the vector index optimizer."""
        # Set up logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        
        self.client = self._init_supabase_client()
        self.model = None
        
        # Index configurations for different use cases
        self.index_configs = {
            'ivfflat_small': {
                'type': 'ivfflat',
                'lists': 10,  # For datasets < 10K vectors
                'ops': 'vector_cosine_ops',
                'description': 'IVFFlat optimized for small datasets'
            },
            'ivfflat_medium': {
                'type': 'ivfflat', 
                'lists': 100,  # For datasets 10K-100K vectors
                'ops': 'vector_cosine_ops',
                'description': 'IVFFlat optimized for medium datasets'
            },
            'hnsw_realtime': {
                'type': 'hnsw',
                'm': 16,  # Number of connections per node
                'ef_construction': 64,  # Build time parameter
                'ops': 'vector_cosine_ops', 
                'description': 'HNSW optimized for real-time queries'
            },
            'hnsw_quality': {
                'type': 'hnsw',
                'm': 24,  # Higher quality, more connections
                'ef_construction': 128,  # Higher quality construction
                'ops': 'vector_cosine_ops',
                'description': 'HNSW optimized for query quality'
            }
        }
    
    def _init_supabase_client(self) -> Client:
        """Initialize Supabase client."""
        try:
            client = create_client(settings.supabase_url, settings.supabase_key)
            self.logger.info("Connected to Supabase")
            return client
        except Exception as e:
            self.logger.error(f"Failed to connect to Supabase: {e}")
            raise
    
    def load_model(self, model_name: str = "all-MiniLM-L6-v2") -> None:
        """Load sentence transformer model for benchmarking."""
        try:
            self.logger.info(f"Loading model: {model_name}")
            self.model = SentenceTransformer(model_name)
            self.logger.info("Model loaded successfully")
        except Exception as e:
            self.logger.error(f"Failed to load model: {e}")
            raise
    
    def analyze_current_indexes(self) -> Dict[str, Any]:
        """Analyze current vector indexes and their performance."""
        try:
            self.logger.info("Analyzing current vector indexes...")
            
            # Since we can't run arbitrary SQL, we'll analyze what we know from our schema
            current_indexes = [
                {
                    'indexname': 'idx_embeddings_combined',
                    'tablename': 'conversation_embeddings',
                    'indexdef': 'CREATE INDEX idx_embeddings_combined ON conversation_embeddings USING ivfflat (combined_embedding vector_cosine_ops)',
                    'type': 'ivfflat',
                    'column': 'combined_embedding'
                },
                {
                    'indexname': 'idx_embeddings_conversation',
                    'tablename': 'conversation_embeddings', 
                    'indexdef': 'CREATE INDEX idx_embeddings_conversation ON conversation_embeddings(conversation_id)',
                    'type': 'btree',
                    'column': 'conversation_id'
                }
            ]
            
            # Get table statistics using available methods
            try:
                count_response = self.client.table('conversation_embeddings').select('id', count='exact').execute()
                
                # Get some sample data to analyze
                sample_response = self.client.table('conversation_embeddings').select(
                    'embedding_model', 'created_at', 'embedding_dimension'
                ).limit(10).execute()
                
                models = set()
                oldest_date = None
                newest_date = None
                dimensions = set()
                
                for row in sample_response.data:
                    if row.get('embedding_model'):
                        models.add(row['embedding_model'])
                    if row.get('created_at'):
                        date_str = row['created_at']
                        if oldest_date is None or date_str < oldest_date:
                            oldest_date = date_str
                        if newest_date is None or date_str > newest_date:
                            newest_date = date_str
                    if row.get('embedding_dimension'):
                        dimensions.add(row['embedding_dimension'])
                
                stats = {
                    'total_embeddings': count_response.count,
                    'unique_models': len(models),
                    'models': list(models),
                    'oldest_embedding': oldest_date,
                    'newest_embedding': newest_date,
                    'embedding_dimensions': list(dimensions),
                    'table_size': 'N/A (requires SQL access)'
                }
                
            except Exception as e:
                self.logger.warning(f"Could not get detailed stats: {e}")
                stats = {
                    'total_embeddings': 'Unknown',
                    'unique_models': 'Unknown',
                    'oldest_embedding': 'N/A',
                    'newest_embedding': 'N/A',
                    'table_size': 'N/A'
                }
            
            analysis = {
                'current_indexes': current_indexes,
                'table_stats': stats,
                'recommendations': self._generate_recommendations(stats),
                'timestamp': datetime.now().isoformat()
            }
            
            self.logger.info(f"Analysis complete: {len(current_indexes)} indexes identified")
            return analysis
            
        except Exception as e:
            self.logger.error(f"Failed to analyze indexes: {e}")
            raise
    
    def _generate_recommendations(self, stats: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate index optimization recommendations based on data size."""
        recommendations = []
        total_embeddings = stats.get('total_embeddings', 0)
        
        # Handle case where total_embeddings might be a string
        if isinstance(total_embeddings, str) or total_embeddings == 'Unknown':
            total_embeddings = 1000  # Default assumption for small dataset
        
        if total_embeddings < 1000:
            recommendations.append({
                'type': 'ivfflat_small',
                'reason': f'Dataset size ({total_embeddings}) is small, use IVFFlat with 10 lists',
                'priority': 'high'
            })
        elif total_embeddings < 10000:
            recommendations.append({
                'type': 'ivfflat_medium', 
                'reason': f'Dataset size ({total_embeddings}) is medium, use IVFFlat with 100 lists',
                'priority': 'high'
            })
        else:
            recommendations.append({
                'type': 'hnsw_realtime',
                'reason': f'Dataset size ({total_embeddings}) is large, use HNSW for performance',
                'priority': 'high'
            })
        
        # Always recommend separate indexes for different embedding types
        recommendations.append({
            'type': 'separate_embeddings',
            'reason': 'Create separate indexes for patient_embedding and counselor_embedding',
            'priority': 'medium'
        })
        
        recommendations.append({
            'type': 'monitoring',
            'reason': 'Set up index performance monitoring and maintenance',
            'priority': 'low'
        })
        
        return recommendations
    
    def create_optimized_indexes(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Create optimized vector indexes based on analysis."""
        try:
            self.logger.info("Creating optimized vector indexes...")
            results = {'created': [], 'failed': [], 'skipped': []}
            
            total_embeddings = analysis['table_stats'].get('total_embeddings', 0)
            
            # Determine optimal configuration
            if total_embeddings < 10000:
                config_name = 'ivfflat_small'
            else:
                config_name = 'hnsw_realtime'
            
            config = self.index_configs[config_name]
            
            # Create indexes for each embedding type
            embedding_types = ['patient_embedding', 'counselor_embedding', 'combined_embedding']
            
            for embedding_type in embedding_types:
                index_name = f"idx_{embedding_type}_{config['type']}_optimized"
                
                try:
                    # Drop existing index if it exists
                    drop_sql = f"DROP INDEX IF EXISTS {index_name};"
                    
                    # Create new optimized index
                    if config['type'] == 'ivfflat':
                        create_sql = f"""
                        CREATE INDEX {index_name} 
                        ON conversation_embeddings 
                        USING ivfflat ({embedding_type} {config['ops']}) 
                        WITH (lists = {config['lists']});
                        """
                    elif config['type'] == 'hnsw':
                        create_sql = f"""
                        CREATE INDEX {index_name} 
                        ON conversation_embeddings 
                        USING hnsw ({embedding_type} {config['ops']}) 
                        WITH (m = {config['m']}, ef_construction = {config['ef_construction']});
                        """
                    
                    # Execute SQL commands
                    self.logger.info(f"Creating index: {index_name}")
                    
                    # Note: Direct SQL execution might not work with Supabase client
                    # This is a conceptual implementation - in practice you'd run this in Supabase SQL editor
                    self.logger.info(f"SQL for {index_name}:")
                    self.logger.info(f"  {drop_sql}")
                    self.logger.info(f"  {create_sql}")
                    
                    results['created'].append({
                        'index_name': index_name,
                        'embedding_type': embedding_type,
                        'config': config_name,
                        'sql': create_sql
                    })
                        
                except Exception as e:
                    self.logger.error(f"Failed to create index {index_name}: {e}")
                    results['failed'].append({
                        'index_name': index_name,
                        'error': str(e)
                    })
            
            # Generate maintenance recommendations
            maintenance_sql = self._generate_maintenance_sql()
            results['maintenance_sql'] = maintenance_sql
            
            self.logger.info(f"Index optimization complete: {len(results['created'])} created, {len(results['failed'])} failed")
            return results
            
        except Exception as e:
            self.logger.error(f"Failed to create optimized indexes: {e}")
            raise
    
    def _generate_maintenance_sql(self) -> List[str]:
        """Generate SQL for index maintenance and monitoring."""
        return [
            """
            -- Monitor index usage
            SELECT 
                schemaname,
                tablename,
                indexname,
                idx_scan as times_used,
                idx_tup_read as tuples_read,
                idx_tup_fetch as tuples_fetched
            FROM pg_stat_user_indexes 
            WHERE tablename = 'conversation_embeddings'
            ORDER BY idx_scan DESC;
            """,
            """
            -- Monitor index sizes
            SELECT 
                indexname,
                pg_size_pretty(pg_relation_size(indexname::regclass)) as size,
                pg_relation_size(indexname::regclass) as size_bytes
            FROM pg_indexes 
            WHERE tablename = 'conversation_embeddings'
            ORDER BY pg_relation_size(indexname::regclass) DESC;
            """,
            """
            -- Vacuum and analyze for index maintenance
            VACUUM ANALYZE conversation_embeddings;
            """,
            """
            -- Check for unused indexes (run after some usage time)
            SELECT 
                schemaname,
                tablename, 
                indexname,
                idx_scan
            FROM pg_stat_user_indexes 
            WHERE tablename = 'conversation_embeddings'
            AND idx_scan = 0
            ORDER BY schemaname, tablename, indexname;
            """
        ]
    
    def benchmark_query_performance(self, analysis: Dict[str, Any]) -> Dict[str, Any]:
        """Benchmark query performance with different index configurations."""
        if not self.model:
            self.load_model()
            
        try:
            self.logger.info("⚡ Benchmarking query performance...")
            
            # Generate test queries
            test_queries = [
                "I'm feeling anxious about work and can't sleep",
                "relationship problems with my partner", 
                "I'm struggling with depression and need help",
                "How do I cope with stress and anxiety?",
                "My teenager is acting out and I don't know what to do"
            ]
            
            benchmark_results = []
            
            for query in test_queries:
                self.logger.info(f"Testing query: {query[:50]}...")
                
                # Generate embedding for query
                query_embedding = self.model.encode([query])[0]
                
                # Test similarity search performance
                start_time = time.time()
                
                try:
                    response = self.client.rpc('find_similar_conversations', {
                        'query_embedding': query_embedding.tolist(),
                        'similarity_threshold': 0.1,
                        'max_results': 10
                    }).execute()
                    
                    end_time = time.time()
                    query_time = end_time - start_time
                    
                    result_count = len(response.data) if response.data else 0
                    
                    benchmark_results.append({
                        'query': query,
                        'query_time_ms': round(query_time * 1000, 2),
                        'result_count': result_count,
                        'status': 'success'
                    })
                    
                except Exception as e:
                    benchmark_results.append({
                        'query': query,
                        'query_time_ms': -1,
                        'result_count': 0,
                        'status': f'error: {str(e)}'
                    })
            
            # Calculate performance metrics
            successful_queries = [r for r in benchmark_results if r['status'] == 'success']
            if successful_queries:
                avg_query_time = np.mean([r['query_time_ms'] for r in successful_queries])
                max_query_time = max([r['query_time_ms'] for r in successful_queries])
                min_query_time = min([r['query_time_ms'] for r in successful_queries])
            else:
                avg_query_time = max_query_time = min_query_time = -1
            
            benchmark_summary = {
                'test_queries': len(test_queries),
                'successful_queries': len(successful_queries),
                'avg_query_time_ms': round(avg_query_time, 2),
                'max_query_time_ms': max_query_time,
                'min_query_time_ms': min_query_time,
                'results': benchmark_results,
                'timestamp': datetime.now().isoformat()
            }
            
            self.logger.info(f"Benchmark complete: avg {avg_query_time:.2f}ms per query")
            return benchmark_summary
            
        except Exception as e:
            self.logger.error(f"Benchmark failed: {e}")
            raise
    
    def save_optimization_report(self, analysis: Dict[str, Any], 
                               optimization: Dict[str, Any],
                               benchmark: Dict[str, Any]) -> str:
        """Save comprehensive optimization report."""
        try:
            report = {
                'report_timestamp': datetime.now().isoformat(),
                'analysis': analysis,
                'optimization': optimization, 
                'benchmark': benchmark,
                'recommendations': {
                    'immediate': [
                        "Run the generated SQL in Supabase SQL Editor to create optimized indexes",
                        "Monitor query performance after index creation",
                        "Set up regular index maintenance using provided SQL"
                    ],
                    'future': [
                        "Consider upgrading to HNSW indexes as dataset grows",
                        "Implement query result caching for frequent searches",
                        "Add monitoring for index usage and performance"
                    ]
                }
            }
            
            report_path = f"data/vector_optimization_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            os.makedirs('data', exist_ok=True)
            
            with open(report_path, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            self.logger.info(f"✅ Optimization report saved: {report_path}")
            return report_path
            
        except Exception as e:
            self.logger.error(f"❌ Failed to save report: {e}")
            raise


def main():
    """Main function to run vector index optimization."""
    parser = argparse.ArgumentParser(description="Optimize vector indexes for similarity queries")
    parser.add_argument(
        "--analyze", 
        action="store_true",
        help="Analyze current vector indexes"
    )
    parser.add_argument(
        "--create", 
        action="store_true",
        help="Create optimized indexes based on analysis"
    )
    parser.add_argument(
        "--benchmark", 
        action="store_true",
        help="Benchmark query performance"
    )
    parser.add_argument(
        "--all", 
        action="store_true",
        help="Run full optimization: analyze, create, and benchmark"
    )
    
    args = parser.parse_args()
    
    if not any([args.analyze, args.create, args.benchmark, args.all]):
        args.all = True  # Default to running everything
    
    optimizer = VectorIndexOptimizer()
    
    try:
        analysis = None
        optimization = None
        benchmark = None
        
        if args.analyze or args.all:
            analysis = optimizer.analyze_current_indexes()
            print("\n" + "="*60)
            print("📊 VECTOR INDEX ANALYSIS")
            print("="*60)
            print(f"Total embeddings: {analysis['table_stats'].get('total_embeddings', 'N/A')}")
            print(f"Current indexes: {len(analysis['current_indexes'])}")
            print(f"Recommendations: {len(analysis['recommendations'])}")
            
            for rec in analysis['recommendations']:
                print(f"  • {rec['reason']} (Priority: {rec['priority']})")
        
        if args.create or args.all:
            if not analysis:
                analysis = optimizer.analyze_current_indexes()
            
            optimization = optimizer.create_optimized_indexes(analysis)
            print("\n" + "="*60)
            print("🚀 INDEX OPTIMIZATION")
            print("="*60)
            print(f"Indexes to create: {len(optimization['created'])}")
            print(f"Failed: {len(optimization['failed'])}")
            
            print("\n🔧 SQL to run in Supabase SQL Editor:")
            print("-" * 40)
            for idx in optimization['created']:
                print(f"\n-- {idx['index_name']} ({idx['config']})")
                print(idx['sql'])
        
        if args.benchmark or args.all:
            if not analysis:
                analysis = optimizer.analyze_current_indexes()
            
            benchmark = optimizer.benchmark_query_performance(analysis)
            print("\n" + "="*60)
            print("⚡ PERFORMANCE BENCHMARK")
            print("="*60)
            print(f"Test queries: {benchmark['test_queries']}")
            print(f"Successful: {benchmark['successful_queries']}")
            print(f"Average query time: {benchmark['avg_query_time_ms']}ms")
            print(f"Min/Max time: {benchmark['min_query_time_ms']}/{benchmark['max_query_time_ms']}ms")
        
        # Save comprehensive report
        if analysis and (optimization or benchmark):
            report_path = optimizer.save_optimization_report(
                analysis, 
                optimization or {}, 
                benchmark or {}
            )
            print(f"\nFull report saved: {report_path}")
        
        print("\nVector index optimization complete!")
        
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()