#!/usr/bin/env python3
"""
Zero-shot classification for therapeutic intervention categories.

This script implements multi-label classification of counselor responses using
pre-trained transformers, eliminating the need for manual data labeling.

Uses facebook/bart-large-mnli for zero-shot classification across 6 therapeutic
intervention categories based on evidence-based therapeutic frameworks.

Usage:
    python scripts/zero_shot_classification.py [--sample-size N] [--save-results] [--evaluate]
"""

import argparse
import logging
import sys
import os
import json
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
import statistics

import pandas as pd
import numpy as np
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, multilabel_confusion_matrix
from tqdm import tqdm

# Add backend to path for imports
sys.path.append('backend')

from config import settings
from supabase import create_client, Client


@dataclass
class InterventionPrediction:
    """Structured prediction result for therapeutic interventions."""
    intervention: str
    confidence: float
    is_predicted: bool


@dataclass
class ClassificationResult:
    """Complete classification result for a counselor response."""
    conversation_id: str
    counselor_response: str
    predictions: List[InterventionPrediction]
    total_interventions: int
    max_confidence: float
    avg_confidence: float


class ZeroShotTherapeuticClassifier:
    """Zero-shot multi-label classifier for therapeutic interventions."""

    def __init__(self, model_name: str = "facebook/bart-large-mnli", sample_size: Optional[int] = None):
        """Initialize the zero-shot classifier."""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

        self.sample_size = sample_size
        self.model_name = model_name
        
        # Initialize the classification pipeline
        self.logger.info(f"Loading zero-shot classification model: {model_name}")
        self.classifier = pipeline(
            "zero-shot-classification",
            model=model_name,
            device=0 if torch.cuda.is_available() else -1
        )
        self.logger.info(f"Model loaded successfully. CUDA available: {torch.cuda.is_available()}")

        # Initialize Supabase client
        self.client = self._init_supabase_client()

        # Define intervention categories with descriptions for better classification
        self.intervention_categories = {
            'validation_empathy': {
                'label': 'Validation and Empathy',
                'description': 'expressing understanding, validation of feelings, emotional support, empathetic responses',
                'keywords': ['understand', 'feel', 'valid', 'normal', 'sense', 'okay', 'imagine', 'hear', 'see', 'struggle', 'alone']
            },
            'cognitive_restructuring': {
                'label': 'Cognitive Restructuring', 
                'description': 'challenging thoughts, examining thinking patterns, reframing perspectives, addressing cognitive distortions',
                'keywords': ['thought', 'think', 'perspective', 'challenge', 'belief', 'reframe', 'mindset', 'pattern']
            },
            'behavioral_activation': {
                'label': 'Behavioral Activation',
                'description': 'encouraging action, activity planning, behavioral change, goal setting, taking steps',
                'keywords': ['do', 'action', 'try', 'plan', 'step', 'activity', 'engage', 'start', 'practice']
            },
            'mindfulness_grounding': {
                'label': 'Mindfulness and Grounding',
                'description': 'present moment awareness, breathing exercises, mindfulness techniques, grounding exercises',
                'keywords': ['breathe', 'present', 'moment', 'ground', 'body', 'senses', 'awareness', 'meditate']
            },
            'problem_solving': {
                'label': 'Problem Solving',
                'description': 'solution finding, strategic thinking, resource identification, practical problem solving',
                'keywords': ['solution', 'solve', 'approach', 'strategy', 'option', 'resource', 'overcome', 'difficulty']
            },
            'psychoeducation': {
                'label': 'Psychoeducation',
                'description': 'providing information, explaining concepts, normalizing experiences, educational content',
                'keywords': ['learn', 'understand', 'information', 'research', 'fact', 'explain', 'educate', 'common', 'normal']
            }
        }

        # Confidence thresholds calibrated based on prevalence analysis from Task 3.1
        self.confidence_thresholds = {
            'behavioral_activation': 0.30,     # 91% prevalence
            'validation_empathy': 0.30,       # 85% prevalence  
            'mindfulness_grounding': 0.35,    # 84% prevalence
            'psychoeducation': 0.40,          # 76% prevalence
            'problem_solving': 0.40,          # 75% prevalence
            'cognitive_restructuring': 0.45   # 66% prevalence (higher threshold for less common)
        }

        self.classification_results = []

    def _init_supabase_client(self) -> Client:
        """Initialize Supabase client."""
        try:
            if not settings.supabase_url or not settings.supabase_key:
                self.logger.error("Missing Supabase configuration")
                self.logger.error("Create backend/.env with SUPABASE_URL and SUPABASE_KEY")
                raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in configuration")
            
            client = create_client(settings.supabase_url, settings.supabase_key)
            
            # Test connection
            test_response = client.table('conversations').select('id').limit(1).execute()
            self.logger.info(f"Successfully connected to Supabase: {settings.supabase_url}")
            
            return client
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Supabase client: {e}")
            raise

    def load_conversation_data(self) -> pd.DataFrame:
        """Load conversation data from Supabase."""
        try:
            self.logger.info("Loading conversation data from Supabase...")
            
            query = self.client.table('conversations').select(
                'id, counselor_response, data_split'
            ).eq('data_split', 'train')  # Focus on training data for initial classification
            
            if self.sample_size:
                query = query.limit(self.sample_size)
            
            response = query.execute()
            
            if not response.data:
                raise ValueError("No conversation data found")
            
            df = pd.DataFrame(response.data)
            
            # Filter out responses that are too short or too long
            df = df[
                (df['counselor_response'].str.len() >= 20) &  # Minimum response length
                (df['counselor_response'].str.len() <= 2000)  # Maximum response length
            ].copy()
            
            self.logger.info(f"Loaded {len(df)} counselor responses for classification")
            return df
            
        except Exception as e:
            self.logger.error(f"Failed to load conversation data: {e}")
            raise

    def classify_response(self, response_text: str, conversation_id: str) -> ClassificationResult:
        """Classify a single counselor response using zero-shot classification."""
        try:
            # Prepare labels for classification
            labels = [details['description'] for details in self.intervention_categories.values()]
            
            # Run zero-shot classification
            result = self.classifier(response_text, labels, multi_label=True)
            
            # Process results into structured predictions
            predictions = []
            intervention_keys = list(self.intervention_categories.keys())
            
            for i, (label, score) in enumerate(zip(result['labels'], result['scores'])):
                intervention_key = intervention_keys[i]
                threshold = self.confidence_thresholds[intervention_key]
                
                prediction = InterventionPrediction(
                    intervention=intervention_key,
                    confidence=float(score),
                    is_predicted=(score >= threshold)
                )
                predictions.append(prediction)
            
            # Sort predictions by confidence (descending)
            predictions.sort(key=lambda x: x.confidence, reverse=True)
            
            # Calculate summary statistics
            predicted_interventions = [p for p in predictions if p.is_predicted]
            total_interventions = len(predicted_interventions)
            max_confidence = max(p.confidence for p in predictions) if predictions else 0.0
            avg_confidence = statistics.mean(p.confidence for p in predictions) if predictions else 0.0
            
            return ClassificationResult(
                conversation_id=conversation_id,
                counselor_response=response_text,
                predictions=predictions,
                total_interventions=total_interventions,
                max_confidence=max_confidence,
                avg_confidence=avg_confidence
            )
            
        except Exception as e:
            self.logger.error(f"Failed to classify response for conversation {conversation_id}: {e}")
            raise

    def classify_dataset(self, df: pd.DataFrame) -> List[ClassificationResult]:
        """Classify all responses in the dataset."""
        self.logger.info(f"Starting zero-shot classification of {len(df)} responses...")
        
        results = []
        
        # Process responses with progress tracking
        for idx, row in tqdm(df.iterrows(), total=len(df), desc="Classifying responses"):
            try:
                result = self.classify_response(
                    response_text=row['counselor_response'],
                    conversation_id=row['id']
                )
                results.append(result)
                
                # Log progress every 100 responses
                if len(results) % 100 == 0:
                    self.logger.info(f"Completed {len(results)}/{len(df)} classifications")
                    
            except Exception as e:
                self.logger.warning(f"Skipping response {row['id']} due to error: {e}")
                continue
        
        self.classification_results = results
        self.logger.info(f"Completed classification of {len(results)} responses")
        
        return results

    def analyze_classification_performance(self, results: List[ClassificationResult]) -> Dict[str, Any]:
        """Analyze the performance and distribution of classifications."""
        if not results:
            return {}
        
        self.logger.info("Analyzing classification performance...")
        
        # Overall statistics
        total_responses = len(results)
        responses_with_predictions = sum(1 for r in results if r.total_interventions > 0)
        coverage_rate = responses_with_predictions / total_responses if total_responses > 0 else 0
        
        # Intervention frequency analysis
        intervention_counts = {key: 0 for key in self.intervention_categories.keys()}
        intervention_confidences = {key: [] for key in self.intervention_categories.keys()}
        
        for result in results:
            for prediction in result.predictions:
                if prediction.is_predicted:
                    intervention_counts[prediction.intervention] += 1
                intervention_confidences[prediction.intervention].append(prediction.confidence)
        
        # Calculate prevalence rates
        intervention_prevalence = {
            key: (count / total_responses) * 100 
            for key, count in intervention_counts.items()
        }
        
        # Calculate average confidences
        avg_confidences = {
            key: statistics.mean(confidences) if confidences else 0.0
            for key, confidences in intervention_confidences.items()
        }
        
        # Multi-label statistics
        intervention_per_response = [r.total_interventions for r in results]
        avg_interventions_per_response = statistics.mean(intervention_per_response)
        
        # Confidence distribution
        all_confidences = []
        for result in results:
            all_confidences.extend([p.confidence for p in result.predictions])
        
        analysis = {
            'overall_stats': {
                'total_responses': total_responses,
                'responses_with_predictions': responses_with_predictions,
                'coverage_rate': coverage_rate,
                'avg_interventions_per_response': avg_interventions_per_response
            },
            'intervention_analysis': {
                'prevalence_rates': intervention_prevalence,
                'prediction_counts': intervention_counts,
                'average_confidences': avg_confidences,
                'confidence_thresholds': self.confidence_thresholds
            },
            'confidence_distribution': {
                'mean': statistics.mean(all_confidences) if all_confidences else 0,
                'median': statistics.median(all_confidences) if all_confidences else 0,
                'std': statistics.stdev(all_confidences) if len(all_confidences) > 1 else 0,
                'min': min(all_confidences) if all_confidences else 0,
                'max': max(all_confidences) if all_confidences else 0
            }
        }
        
        return analysis

    def save_classification_results(self, results: List[ClassificationResult], analysis: Dict[str, Any], output_path: str = None) -> str:
        """Save classification results and analysis to JSON file."""
        if output_path is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_path = f"data/processed/zero_shot_classification_results_{timestamp}.json"
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Convert results to serializable format
        serializable_results = []
        for result in results:
            serializable_results.append({
                'conversation_id': result.conversation_id,
                'counselor_response': result.counselor_response,
                'predictions': [
                    {
                        'intervention': p.intervention,
                        'confidence': p.confidence,
                        'is_predicted': p.is_predicted
                    }
                    for p in result.predictions
                ],
                'total_interventions': result.total_interventions,
                'max_confidence': result.max_confidence,
                'avg_confidence': result.avg_confidence
            })
        
        # Prepare complete output
        output_data = {
            'metadata': {
                'timestamp': datetime.now().isoformat(),
                'model_name': self.model_name,
                'total_responses_classified': len(results),
                'sample_size': self.sample_size,
                'intervention_categories': self.intervention_categories,
                'confidence_thresholds': self.confidence_thresholds
            },
            'classification_results': serializable_results,
            'performance_analysis': analysis
        }
        
        # Save to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Classification results saved to: {output_path}")
        return output_path

    def print_summary_report(self, analysis: Dict[str, Any]):
        """Print a summary of classification results."""
        print("\n" + "="*80)
        print("ZERO-SHOT THERAPEUTIC INTERVENTION CLASSIFICATION RESULTS")
        print("="*80)
        
        # Overall statistics
        overall = analysis.get('overall_stats', {})
        print(f"\nOVERALL PERFORMANCE:")
        print(f"   Total Responses Classified: {overall.get('total_responses', 0):,}")
        print(f"   Responses with Predictions: {overall.get('responses_with_predictions', 0):,}")
        print(f"   Coverage Rate: {overall.get('coverage_rate', 0):.1%}")
        print(f"   Avg Interventions per Response: {overall.get('avg_interventions_per_response', 0):.1f}")
        
        # Intervention analysis
        intervention_analysis = analysis.get('intervention_analysis', {})
        prevalence_rates = intervention_analysis.get('prevalence_rates', {})
        avg_confidences = intervention_analysis.get('average_confidences', {})
        
        print(f"\nINTERVENTION PREVALENCE:")
        for intervention, rate in sorted(prevalence_rates.items(), key=lambda x: x[1], reverse=True):
            label = self.intervention_categories[intervention]['label']
            confidence = avg_confidences.get(intervention, 0)
            threshold = self.confidence_thresholds.get(intervention, 0)
            print(f"   {label:25} {rate:5.1f}% (avg conf: {confidence:.3f}, threshold: {threshold:.2f})")
        
        # Confidence distribution
        conf_dist = analysis.get('confidence_distribution', {})
        print(f"\nCONFIDENCE DISTRIBUTION:")
        print(f"   Mean: {conf_dist.get('mean', 0):.3f}")
        print(f"   Median: {conf_dist.get('median', 0):.3f}")
        print(f"   Std Dev: {conf_dist.get('std', 0):.3f}")
        print(f"   Range: {conf_dist.get('min', 0):.3f} - {conf_dist.get('max', 0):.3f}")
        
        print("\n" + "="*80)

    def run_complete_classification(self) -> Dict[str, Any]:
        """Run the complete zero-shot classification pipeline."""
        try:
            # Load data
            df = self.load_conversation_data()
            
            # Run classification
            results = self.classify_dataset(df)
            
            # Analyze performance
            analysis = self.analyze_classification_performance(results)
            
            return {
                'results': results,
                'analysis': analysis,
                'success': True
            }
            
        except Exception as e:
            self.logger.error(f"Classification pipeline failed: {e}")
            return {
                'error': str(e),
                'success': False
            }


def main():
    """Main execution function."""
    parser = argparse.ArgumentParser(description="Zero-shot therapeutic intervention classification")
    parser.add_argument('--sample-size', type=int, help='Number of responses to classify (default: all)')
    parser.add_argument('--save-results', action='store_true', help='Save results to JSON file')
    parser.add_argument('--model', default='facebook/bart-large-mnli', help='Model to use for classification')
    args = parser.parse_args()
    
    # Initialize classifier
    classifier = ZeroShotTherapeuticClassifier(
        model_name=args.model,
        sample_size=args.sample_size
    )
    
    # Run classification
    pipeline_result = classifier.run_complete_classification()
    
    if not pipeline_result['success']:
        print(f"Classification failed: {pipeline_result['error']}")
        sys.exit(1)
    
    # Print summary
    classifier.print_summary_report(pipeline_result['analysis'])
    
    # Save results if requested
    if args.save_results:
        output_path = classifier.save_classification_results(
            pipeline_result['results'],
            pipeline_result['analysis']
        )
        print(f"\nResults saved to: {output_path}")
    
    print("\nZero-shot classification completed successfully!")


if __name__ == "__main__":
    main()