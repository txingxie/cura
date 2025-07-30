#!/usr/bin/env python3
"""
Therapeutic Inference Service - Integration of Semantic Search + Zero-Shot Classification

This service combines semantic search for similar therapeutic contexts with zero-shot
classification for intervention recommendations, providing unified therapeutic inference.

Usage:
    python scripts/therapeutic_inference_service.py --query "I feel anxious about work"
"""

import argparse
import logging
import sys
import os
import asyncio
import time
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import json

import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from transformers import pipeline
import torch

# Add backend to path for imports
sys.path.append('backend')

from config import settings
from supabase import create_client, Client


@dataclass
class SemanticSearchResult:
    """Result from semantic search query."""
    conversation_id: str
    patient_question: str
    counselor_response: str
    similarity_score: float


@dataclass
class InterventionPrediction:
    """Intervention prediction with confidence score."""
    intervention: str
    label: str
    confidence: float
    is_predicted: bool
    is_primary: bool  # confidence > 0.6


@dataclass
class TherapeuticContext:
    """Unified therapeutic context combining search and classification results."""
    query: str
    similar_examples: List[SemanticSearchResult]
    intervention_predictions: List[InterventionPrediction]
    primary_interventions: List[InterventionPrediction]
    recommended_response_patterns: List[str]
    confidence_summary: Dict[str, float]
    processing_time_ms: float


class TherapeuticInferenceService:
    """
    Unified therapeutic inference service combining semantic search and zero-shot classification.
    
    Architecture:
    1. Parallel execution of semantic search + zero-shot classification
    2. Confidence-based intervention filtering (>0.6 primary, >0.3 supplementary)
    3. Context synthesis with therapeutic recommendations
    """

    def __init__(self, 
                 embeddings_model: str = "sentence-transformers/all-MiniLM-L6-v2",
                 classification_model: str = "facebook/bart-large-mnli"):
        """Initialize the therapeutic inference service."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

        # Initialize models
        self.logger.info(f"Loading models: {embeddings_model}, {classification_model}")
        self.embeddings_model = SentenceTransformer(embeddings_model)
        self.classifier = pipeline(
            "zero-shot-classification",
            model=classification_model,
            device=0 if torch.cuda.is_available() else -1
        )
        self.logger.info(f"Models loaded successfully. CUDA available: {torch.cuda.is_available()}")

        # Initialize Supabase client
        self.client = self._init_supabase_client()

        # Intervention categories with validated performance metrics
        self.intervention_categories = {
            'validation_empathy': {
                'label': 'Validation and Empathy',
                'description': 'expressing understanding, validation of feelings, emotional support, empathetic responses',
                'prevalence': 100.0,  # From validation results
                'avg_confidence': 0.899
            },
            'cognitive_restructuring': {
                'label': 'Cognitive Restructuring', 
                'description': 'challenging thoughts, examining thinking patterns, reframing perspectives, addressing cognitive distortions',
                'prevalence': 94.6,
                'avg_confidence': 0.789
            },
            'behavioral_activation': {
                'label': 'Behavioral Activation',
                'description': 'encouraging action, activity planning, behavioral change, goal setting, taking steps',
                'prevalence': 93.2,
                'avg_confidence': 0.683
            },
            'mindfulness_grounding': {
                'label': 'Mindfulness and Grounding',
                'description': 'present moment awareness, breathing exercises, mindfulness techniques, grounding exercises',
                'prevalence': 78.4,
                'avg_confidence': 0.564
            },
            'problem_solving': {
                'label': 'Problem Solving',
                'description': 'solution finding, strategic thinking, resource identification, practical problem solving',
                'prevalence': 48.6,
                'avg_confidence': 0.385
            },
            'psychoeducation': {
                'label': 'Psychoeducation',
                'description': 'providing information, explaining concepts, normalizing experiences, educational content',
                'prevalence': 9.5,
                'avg_confidence': 0.201
            }
        }

        # Confidence thresholds based on validation results
        self.confidence_thresholds = {
            'primary': 0.6,      # High-confidence recommendations
            'supplementary': 0.3, # Supporting interventions
            'prediction': {      # Intervention-specific thresholds
                'validation_empathy': 0.30,
                'behavioral_activation': 0.30, 
                'mindfulness_grounding': 0.35,
                'problem_solving': 0.40,
                'psychoeducation': 0.40,
                'cognitive_restructuring': 0.45
            }
        }

    def _init_supabase_client(self) -> Client:
        """Initialize Supabase client."""
        try:
            if not settings.supabase_url or not settings.supabase_key:
                self.logger.error("Missing Supabase configuration")
                raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in configuration")
            
            client = create_client(settings.supabase_url, settings.supabase_key)
            
            # Test connection
            test_response = client.table('conversations').select('id').limit(1).execute()
            self.logger.info(f"Successfully connected to Supabase: {settings.supabase_url}")
            
            return client
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Supabase client: {e}")
            raise

    async def semantic_search(self, query: str, top_k: int = 3, similarity_threshold: float = 0.1) -> List[SemanticSearchResult]:
        """
        Perform semantic search for similar therapeutic conversations.
        
        Args:
            query: User query text
            top_k: Number of similar conversations to retrieve
            similarity_threshold: Minimum similarity score
            
        Returns:
            List of similar conversation results
        """
        try:
            self.logger.info(f"Performing semantic search for: '{query[:50]}...'")
            
            # Generate embedding for query
            query_embedding = self.embeddings_model.encode([query])[0]
            
            # Call the find_similar_conversations function
            response = self.client.rpc('find_similar_conversations', {
                'query_embedding': query_embedding.tolist(),
                'similarity_threshold': similarity_threshold,
                'max_results': top_k
            }).execute()
            
            results = []
            if response.data:
                for item in response.data:
                    result = SemanticSearchResult(
                        conversation_id=item['conversation_id'],
                        patient_question=item['patient_question'],
                        counselor_response=item['counselor_response'],
                        similarity_score=item['similarity_score']
                    )
                    results.append(result)
                
                self.logger.info(f"Found {len(results)} similar conversations")
            else:
                self.logger.warning("No similar conversations found")
            
            return results
            
        except Exception as e:
            self.logger.error(f"Semantic search failed: {e}")
            return []

    async def classify_interventions(self, query: str) -> List[InterventionPrediction]:
        """
        Classify therapeutic interventions using zero-shot classification.
        
        Args:
            query: User query text
            
        Returns:
            List of intervention predictions with confidence scores
        """
        try:
            self.logger.info(f"Classifying interventions for: '{query[:50]}...'")
            
            # Prepare labels for classification
            labels = [details['description'] for details in self.intervention_categories.values()]
            
            # Run zero-shot classification
            result = self.classifier(query, labels, multi_label=True)
            
            # Process results into structured predictions
            predictions = []
            intervention_keys = list(self.intervention_categories.keys())
            
            for i, (label, score) in enumerate(zip(result['labels'], result['scores'])):
                intervention_key = intervention_keys[i]
                intervention_info = self.intervention_categories[intervention_key]
                
                # Determine prediction status using intervention-specific thresholds
                prediction_threshold = self.confidence_thresholds['prediction'][intervention_key]
                is_predicted = score >= prediction_threshold
                is_primary = score >= self.confidence_thresholds['primary']
                
                prediction = InterventionPrediction(
                    intervention=intervention_key,
                    label=intervention_info['label'],
                    confidence=float(score),
                    is_predicted=is_predicted,
                    is_primary=is_primary
                )
                predictions.append(prediction)
            
            # Sort by confidence (descending)
            predictions.sort(key=lambda x: x.confidence, reverse=True)
            
            self.logger.info(f"Generated {len([p for p in predictions if p.is_predicted])} intervention predictions")
            
            return predictions
            
        except Exception as e:
            self.logger.error(f"Intervention classification failed: {e}")
            return []

    def synthesize_therapeutic_context(self, 
                                     query: str,
                                     search_results: List[SemanticSearchResult],
                                     intervention_predictions: List[InterventionPrediction],
                                     processing_time_ms: float) -> TherapeuticContext:
        """
        Synthesize unified therapeutic context from search and classification results.
        
        Args:
            query: Original user query
            search_results: Semantic search results
            intervention_predictions: Intervention classification results
            processing_time_ms: Total processing time
            
        Returns:
            Unified therapeutic context
        """
        # Filter primary interventions (high confidence)
        primary_interventions = [p for p in intervention_predictions if p.is_primary]
        
        # Ensure Validation & Empathy is always included (100% prevalence from validation)
        validation_empathy = next(
            (p for p in intervention_predictions if p.intervention == 'validation_empathy'), 
            None
        )
        if validation_empathy and not validation_empathy.is_primary:
            # Force include validation & empathy even if below primary threshold
            validation_empathy.is_primary = True
            primary_interventions.append(validation_empathy)
        
        # Generate response patterns based on search results and interventions
        response_patterns = self._generate_response_patterns(search_results, primary_interventions)
        
        # Calculate confidence summary
        confidence_summary = {
            'mean_confidence': np.mean([p.confidence for p in intervention_predictions]),
            'max_confidence': max(p.confidence for p in intervention_predictions) if intervention_predictions else 0.0,
            'primary_count': len(primary_interventions),
            'predicted_count': len([p for p in intervention_predictions if p.is_predicted])
        }
        
        return TherapeuticContext(
            query=query,
            similar_examples=search_results,
            intervention_predictions=intervention_predictions,
            primary_interventions=primary_interventions,
            recommended_response_patterns=response_patterns,
            confidence_summary=confidence_summary,
            processing_time_ms=processing_time_ms
        )

    def _generate_response_patterns(self, 
                                  search_results: List[SemanticSearchResult],
                                  primary_interventions: List[InterventionPrediction]) -> List[str]:
        """Generate therapeutic response patterns based on context."""
        patterns = []
        
        # Pattern from similar examples
        if search_results:
            patterns.append(f"Similar situations have been addressed with responses like: '{search_results[0].counselor_response[:100]}...'")
        
        # Patterns from primary interventions
        for intervention in primary_interventions:
            if intervention.intervention == 'validation_empathy':
                patterns.append("Acknowledge and validate the person's feelings with empathetic language")
            elif intervention.intervention == 'cognitive_restructuring':
                patterns.append("Help explore and challenge any unhelpful thought patterns")
            elif intervention.intervention == 'behavioral_activation':
                patterns.append("Encourage specific actions or behavioral changes")
            elif intervention.intervention == 'mindfulness_grounding':
                patterns.append("Suggest mindfulness or grounding techniques for present-moment awareness")
            elif intervention.intervention == 'problem_solving':
                patterns.append("Guide through structured problem-solving approaches")
            elif intervention.intervention == 'psychoeducation':
                patterns.append("Provide relevant information or normalize the experience")
        
        return patterns

    async def get_therapeutic_response(self, query: str) -> TherapeuticContext:
        """
        Main inference method - combines semantic search and intervention classification.
        
        Args:
            query: User query for therapeutic guidance
            
        Returns:
            Unified therapeutic context with recommendations
        """
        start_time = time.time()
        
        try:
            self.logger.info(f"Processing therapeutic query: '{query[:50]}...'")
            
            # Parallel execution of semantic search and intervention classification
            search_results, intervention_predictions = await asyncio.gather(
                self.semantic_search(query, top_k=3),
                self.classify_interventions(query)
            )
            
            # Calculate processing time
            processing_time_ms = (time.time() - start_time) * 1000
            
            # Synthesize unified therapeutic context
            context = self.synthesize_therapeutic_context(
                query=query,
                search_results=search_results,
                intervention_predictions=intervention_predictions,
                processing_time_ms=processing_time_ms
            )
            
            self.logger.info(f"Therapeutic inference completed in {processing_time_ms:.1f}ms")
            
            return context
            
        except Exception as e:
            self.logger.error(f"Therapeutic inference failed: {e}")
            # Return empty context with error information
            processing_time_ms = (time.time() - start_time) * 1000
            return TherapeuticContext(
                query=query,
                similar_examples=[],
                intervention_predictions=[],
                primary_interventions=[],
                recommended_response_patterns=[f"Error processing query: {str(e)}"],
                confidence_summary={'error': str(e)},
                processing_time_ms=processing_time_ms
            )

    def print_therapeutic_context(self, context: TherapeuticContext):
        """Print formatted therapeutic context results."""
        print("\n" + "="*80)
        print("THERAPEUTIC INFERENCE RESULTS")
        print("="*80)
        
        print(f"\nQuery: {context.query}")
        print(f"Processing Time: {context.processing_time_ms:.1f}ms")
        
        # Similar examples
        print(f"\nSIMILAR THERAPEUTIC EXAMPLES ({len(context.similar_examples)} found):")
        for i, example in enumerate(context.similar_examples, 1):
            print(f"   {i}. Similarity: {example.similarity_score:.3f}")
            print(f"      Patient: {example.patient_question[:100]}...")
            print(f"      Counselor: {example.counselor_response[:100]}...")
            print()
        
        # Primary interventions
        print(f"PRIMARY INTERVENTIONS ({len(context.primary_interventions)} recommended):")
        for intervention in context.primary_interventions:
            print(f"   • {intervention.label}: {intervention.confidence:.3f} confidence")
        
        # All predictions
        print(f"\nALL INTERVENTION PREDICTIONS:")
        for prediction in context.intervention_predictions:
            status = "✓ PRIMARY" if prediction.is_primary else ("✓ predicted" if prediction.is_predicted else "✗ below threshold")
            print(f"   {prediction.label:25} {prediction.confidence:.3f} ({status})")
        
        # Response patterns
        print(f"\nRECOMMENDED RESPONSE PATTERNS:")
        for i, pattern in enumerate(context.recommended_response_patterns, 1):
            print(f"   {i}. {pattern}")
        
        # Confidence summary
        print(f"\nCONFIDENCE SUMMARY:")
        for key, value in context.confidence_summary.items():
            if isinstance(value, float):
                print(f"   {key.replace('_', ' ').title()}: {value:.3f}")
            else:
                print(f"   {key.replace('_', ' ').title()}: {value}")
        
        print("\n" + "="*80)


async def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description="Therapeutic Inference Service - Semantic Search + Zero-Shot Classification")
    parser.add_argument('--query', type=str, required=True, help='Query for therapeutic guidance')
    parser.add_argument('--save-results', action='store_true', help='Save results to JSON file')
    args = parser.parse_args()
    
    # Initialize service
    service = TherapeuticInferenceService()
    
    # Get therapeutic response
    context = await service.get_therapeutic_response(args.query)
    
    # Print results
    service.print_therapeutic_context(context)
    
    # Save results if requested
    if args.save_results:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = f"data/processed/therapeutic_inference_{timestamp}.json"
        
        # Convert to serializable format
        results_data = {
            'query': context.query,
            'processing_time_ms': context.processing_time_ms,
            'timestamp': datetime.now().isoformat(),
            'similar_examples': [
                {
                    'conversation_id': ex.conversation_id,
                    'patient_question': ex.patient_question,
                    'counselor_response': ex.counselor_response,
                    'similarity_score': ex.similarity_score
                }
                for ex in context.similar_examples
            ],
            'intervention_predictions': [
                {
                    'intervention': pred.intervention,
                    'label': pred.label,
                    'confidence': pred.confidence,
                    'is_predicted': pred.is_predicted,
                    'is_primary': pred.is_primary
                }
                for pred in context.intervention_predictions
            ],
            'primary_interventions': [
                {
                    'intervention': pred.intervention,
                    'label': pred.label,
                    'confidence': pred.confidence
                }
                for pred in context.primary_interventions
            ],
            'recommended_response_patterns': context.recommended_response_patterns,
            'confidence_summary': context.confidence_summary
        }
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(results_data, f, indent=2, ensure_ascii=False)
        
        print(f"\nResults saved to: {output_path}")


if __name__ == "__main__":
    asyncio.run(main())