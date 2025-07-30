"""
Therapeutic Inference Service for FastAPI Integration

Provides async interface to the therapeutic inference pipeline for REST API usage.
Integrates semantic search, zero-shot classification, and context synthesis.
"""

import asyncio
import logging
import sys
import os
from typing import Dict, List, Any, Optional
from datetime import datetime

# Add root and scripts to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..', 'scripts'))

from therapeutic_inference_service import (
    TherapeuticInferenceService,
    TherapeuticContext,
    SemanticSearchResult,
    InterventionPrediction
)
from .openai_service import openai_service, TherapeuticAdvice

# Configure logging
logger = logging.getLogger(__name__)

class TherapeuticServiceAPI:
    """
    API wrapper for the therapeutic inference service.
    
    Provides singleton access to the therapeutic inference service
    with proper lifecycle management for FastAPI.
    """
    
    _instance = None
    _service = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def get_service(self) -> TherapeuticInferenceService:
        """Get or initialize the therapeutic inference service."""
        if self._service is None:
            logger.info("Initializing therapeutic inference service...")
            self._service = TherapeuticInferenceService()
            logger.info("Therapeutic inference service initialized successfully")
        return self._service
    
    async def get_therapeutic_response(self, query: str) -> Dict[str, Any]:
        """
        Get complete therapeutic response with context synthesis and LLM advice.
        
        Args:
            query: User query for therapeutic guidance
            
        Returns:
            Dictionary with therapeutic context, recommendations, and LLM advice
        """
        try:
            service = await self.get_service()
            context = await service.get_therapeutic_response(query)
            
            # Convert dataclass objects to dictionaries for OpenAI service
            similar_examples_dict = [
                {
                    'conversation_id': ex.conversation_id,
                    'patient_question': ex.patient_question,
                    'counselor_response': ex.counselor_response,
                    'similarity_score': ex.similarity_score
                }
                for ex in context.similar_examples
            ]
            
            intervention_predictions_dict = [
                {
                    'intervention': pred.intervention,
                    'label': pred.label,
                    'confidence': pred.confidence,
                    'is_predicted': pred.is_predicted,
                    'is_primary': pred.is_primary
                }
                for pred in context.intervention_predictions
            ]
            
            primary_interventions_dict = [
                {
                    'intervention': pred.intervention,
                    'label': pred.label,
                    'confidence': pred.confidence
                }
                for pred in context.primary_interventions
            ]
            
            # Generate LLM therapeutic advice
            llm_advice = await openai_service.generate_therapeutic_advice(
                patient_query=query,
                similar_examples=similar_examples_dict,
                intervention_predictions=intervention_predictions_dict,
                primary_interventions=primary_interventions_dict
            )
            
            # Convert to API-friendly format with LLM advice
            response = self._format_therapeutic_response(context)
            response['llm_advice'] = {
                'advice_text': llm_advice.advice_text,
                'therapeutic_techniques': llm_advice.therapeutic_techniques,
                'considerations': llm_advice.considerations,
                'next_steps': llm_advice.next_steps,
                'confidence_score': llm_advice.confidence_score,
                'reasoning': llm_advice.reasoning
            }
            
            return response
            
        except Exception as e:
            logger.error(f"Therapeutic response generation failed: {e}")
            raise
    
    async def semantic_search(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Perform semantic search for similar therapeutic conversations.
        
        Args:
            query: Search query
            top_k: Number of results to return
            
        Returns:
            List of similar conversation results
        """
        try:
            service = await self.get_service()
            results = await service.semantic_search(query, top_k=top_k)
            
            return [
                {
                    "conversation_id": result.conversation_id,
                    "patient_question": result.patient_question,
                    "counselor_response": result.counselor_response,
                    "similarity_score": result.similarity_score
                }
                for result in results
            ]
            
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            raise
    
    async def classify_interventions(self, query: str) -> Dict[str, Any]:
        """
        Classify therapeutic interventions using zero-shot classification.
        
        Args:
            query: Text to classify
            
        Returns:
            Classification results with interventions and confidence scores
        """
        try:
            service = await self.get_service()
            predictions = await service.classify_interventions(query)
            
            return {
                "predictions": [
                    {
                        "intervention": pred.intervention,
                        "label": pred.label,
                        "confidence": pred.confidence,
                        "is_predicted": pred.is_predicted,
                        "is_primary": pred.is_primary
                    }
                    for pred in predictions
                ],
                "primary_interventions": [
                    {
                        "intervention": pred.intervention,
                        "label": pred.label,
                        "confidence": pred.confidence
                    }
                    for pred in predictions if pred.is_primary
                ],
                "summary": {
                    "total_predictions": len(predictions),
                    "primary_count": len([p for p in predictions if p.is_primary]),
                    "predicted_count": len([p for p in predictions if p.is_predicted]),
                    "max_confidence": max(p.confidence for p in predictions) if predictions else 0.0
                }
            }
            
        except Exception as e:
            logger.error(f"Intervention classification failed: {e}")
            raise
    
    def _format_therapeutic_response(self, context: TherapeuticContext) -> Dict[str, Any]:
        """Format therapeutic context for API response."""
        return {
            "query": context.query,
            "processing_time_ms": context.processing_time_ms,
            "similar_examples": [
                {
                    "conversation_id": ex.conversation_id,
                    "patient_question": ex.patient_question,
                    "counselor_response": ex.counselor_response,
                    "similarity_score": ex.similarity_score
                }
                for ex in context.similar_examples
            ],
            "intervention_predictions": [
                {
                    "intervention": pred.intervention,
                    "label": pred.label,
                    "confidence": pred.confidence,
                    "is_predicted": pred.is_predicted,
                    "is_primary": pred.is_primary
                }
                for pred in context.intervention_predictions
            ],
            "primary_interventions": [
                {
                    "intervention": pred.intervention,
                    "label": pred.label,
                    "confidence": pred.confidence
                }
                for pred in context.primary_interventions
            ],
            "recommended_response_patterns": context.recommended_response_patterns,
            "confidence_summary": context.confidence_summary,
            "timestamp": datetime.now().isoformat()
        }

# Global singleton instance
therapeutic_service = TherapeuticServiceAPI()