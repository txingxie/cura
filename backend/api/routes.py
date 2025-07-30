"""
API Routes for Cura Backend
Handles three-layer AI response system endpoints

Endpoints:
- /therapeutic-inference: Complete therapeutic inference pipeline
- /semantic-search: Find similar therapeutic conversations
- /classify-interventions: Classify therapeutic interventions
- /analyze: Unified three-layer response (future LLM integration)
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
import time

from services.therapeutic_service import therapeutic_service
from services.openai_service import openai_service

# Configure logging
logger = logging.getLogger(__name__)

# Create API router
router = APIRouter()

# Request/Response Models
class TherapeuticInferenceRequest(BaseModel):
    """Request model for therapeutic inference"""
    query: str = Field(..., description="Patient query or scenario for therapeutic guidance")
    context: Optional[str] = Field(None, description="Additional context about the situation")
    patient_age: Optional[int] = Field(None, description="Patient age (if relevant)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "I'm feeling overwhelmed with work stress and can't seem to focus on anything",
                "context": "Patient is a working professional experiencing burnout symptoms",
                "patient_age": 28
            }
        }

class SemanticSearchRequest(BaseModel):
    """Request model for semantic search"""
    query: str = Field(..., description="Search query for similar therapeutic conversations")
    top_k: int = Field(3, description="Number of similar conversations to return", ge=1, le=10)
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "anxiety about work performance",
                "top_k": 5
            }
        }

class InterventionClassificationRequest(BaseModel):
    """Request model for intervention classification"""
    text: str = Field(..., description="Text to classify for therapeutic interventions")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "I understand that you're feeling stressed. Let's work together to find some strategies to help you cope."
            }
        }

class LLMAdviceRequest(BaseModel):
    """Request model for LLM therapeutic advice generation"""
    patient_query: str = Field(..., description="Patient query or scenario for therapeutic guidance")
    similar_examples: Optional[List[Dict[str, Any]]] = Field(None, description="Similar therapeutic conversations from semantic search")
    intervention_predictions: Optional[List[Dict[str, Any]]] = Field(None, description="ML classification predictions")
    primary_interventions: Optional[List[Dict[str, Any]]] = Field(None, description="High-confidence intervention recommendations")
    
    class Config:
        json_schema_extra = {
            "example": {
                "patient_query": "I'm feeling overwhelmed with work stress and can't seem to focus on anything",
                "similar_examples": [
                    {
                        "patient_question": "I'm stressed about my job...",
                        "counselor_response": "I understand that work stress can be overwhelming...",
                        "similarity_score": 0.75
                    }
                ],
                "primary_interventions": [
                    {
                        "intervention": "validation_empathy",
                        "label": "Validation and Empathy",
                        "confidence": 0.85
                    }
                ]
            }
        }

class PatientScenarioRequest(BaseModel):
    """Request model for patient scenario input (legacy compatibility)"""
    scenario_text: str = Field(..., description="Patient scenario description")
    patient_age: Optional[int] = Field(None, description="Patient age")
    session_context: Optional[str] = Field(None, description="Session context")
    presenting_concerns: Optional[List[str]] = Field(None, description="List of presenting concerns")

class SimilarCase(BaseModel):
    """Model for similar counseling case"""
    case_id: str
    similarity_score: float
    excerpt: str
    context: str

class MLInsight(BaseModel):
    """Model for ML classification result"""
    predicted_category: str
    confidence_score: float
    alternative_categories: List[dict]
    reasoning: str

class LLMAdvice(BaseModel):
    """Model for LLM-generated therapeutic advice"""
    advice_text: str
    therapeutic_techniques: List[str]
    considerations: List[str]
    next_steps: List[str]

class ThreeLayerResponse(BaseModel):
    """Complete three-layer AI response"""
    similar_cases: List[SimilarCase]
    ml_insight: MLInsight
    llm_advice: LLMAdvice
    processing_time_ms: int

# API Endpoints

@router.post("/therapeutic-inference")
async def get_therapeutic_inference(request: TherapeuticInferenceRequest):
    """
    **Main therapeutic inference endpoint**
    
    Provides complete therapeutic context analysis combining:
    1. Semantic search for similar therapeutic conversations
    2. Zero-shot classification for intervention recommendations
    3. Context synthesis with response patterns
    
    Returns comprehensive therapeutic guidance for counselors.
    """
    try:
        start_time = time.time()
        logger.info(f"Processing therapeutic inference request: '{request.query[:50]}...'")
        
        # Get complete therapeutic response
        response = await therapeutic_service.get_therapeutic_response(request.query)
        
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"Therapeutic inference completed in {processing_time:.1f}ms")
        
        return {
            "success": True,
            "data": response,
            "processing_time_ms": processing_time
        }
        
    except Exception as e:
        logger.error(f"Therapeutic inference failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Therapeutic inference failed",
                "message": str(e),
                "query": request.query[:100] + "..." if len(request.query) > 100 else request.query
            }
        )

@router.post("/semantic-search")
async def semantic_search(request: SemanticSearchRequest):
    """
    **Semantic search for similar therapeutic conversations**
    
    Uses vector similarity to find conversations similar to the input query.
    Helpful for finding relevant therapeutic examples and context.
    """
    try:
        start_time = time.time()
        logger.info(f"Processing semantic search: '{request.query[:50]}...'")
        
        results = await therapeutic_service.semantic_search(
            query=request.query,
            top_k=request.top_k
        )
        
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"Semantic search completed in {processing_time:.1f}ms, found {len(results)} results")
        
        return {
            "success": True,
            "data": {
                "query": request.query,
                "results": results,
                "total_found": len(results)
            },
            "processing_time_ms": processing_time
        }
        
    except Exception as e:
        logger.error(f"Semantic search failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Semantic search failed",
                "message": str(e),
                "query": request.query
            }
        )

@router.post("/classify-interventions")
async def classify_interventions(request: InterventionClassificationRequest):
    """
    **Zero-shot therapeutic intervention classification**
    
    Classifies text for therapeutic interventions using pre-trained models.
    Returns confidence scores for 6 intervention categories:
    - Validation & Empathy
    - Cognitive Restructuring  
    - Behavioral Activation
    - Mindfulness & Grounding
    - Problem Solving
    - Psychoeducation
    """
    try:
        start_time = time.time()
        logger.info(f"Processing intervention classification: '{request.text[:50]}...'")
        
        results = await therapeutic_service.classify_interventions(request.text)
        
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"Intervention classification completed in {processing_time:.1f}ms")
        
        return {
            "success": True,
            "data": results,
            "processing_time_ms": processing_time
        }
        
    except Exception as e:
        logger.error(f"Intervention classification failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Intervention classification failed",
                "message": str(e),
                "text": request.text[:100] + "..." if len(request.text) > 100 else request.text
            }
        )

@router.post("/generate-llm-advice")
async def generate_llm_advice(request: LLMAdviceRequest):
    """
    **OpenAI-powered therapeutic advice generation**
    
    Generates contextual therapeutic advice using OpenAI GPT models.
    Integrates semantic search results and ML classification predictions
    to provide evidence-based therapeutic recommendations.
    
    Features:
    - Evidence-based therapeutic techniques
    - Clinical considerations and safety guidelines
    - Actionable next steps for counselors
    - Confidence scoring based on intervention predictions
    """
    try:
        start_time = time.time()
        logger.info(f"Generating LLM advice for: '{request.patient_query[:50]}...'")
        
        # Generate therapeutic advice using OpenAI
        llm_advice = await openai_service.generate_therapeutic_advice(
            patient_query=request.patient_query,
            similar_examples=request.similar_examples or [],
            intervention_predictions=request.intervention_predictions or [],
            primary_interventions=request.primary_interventions or []
        )
        
        processing_time = (time.time() - start_time) * 1000
        logger.info(f"LLM advice generation completed in {processing_time:.1f}ms")
        
        return {
            "success": True,
            "data": {
                "advice_text": llm_advice.advice_text,
                "therapeutic_techniques": llm_advice.therapeutic_techniques,
                "considerations": llm_advice.considerations,
                "next_steps": llm_advice.next_steps,
                "confidence_score": llm_advice.confidence_score,
                "reasoning": llm_advice.reasoning,
                "model_used": openai_service.model if openai_service.client else "fallback"
            },
            "processing_time_ms": processing_time
        }
        
    except Exception as e:
        logger.error(f"LLM advice generation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "LLM advice generation failed",
                "message": str(e),
                "patient_query": request.patient_query[:100] + "..." if len(request.patient_query) > 100 else request.patient_query
            }
        )

@router.post("/analyze", response_model=ThreeLayerResponse)
async def analyze_patient_scenario(request: PatientScenarioRequest):
    """
    **Legacy unified analysis endpoint (placeholder for LLM integration)**
    
    Future endpoint for complete three-layer AI analysis:
    1. Semantic Search → Similar therapeutic cases
    2. ML Classification → Intervention recommendations  
    3. LLM Generation → Personalized therapeutic advice
    
    Currently returns structured placeholder response.
    """
    try:
        # For now, use therapeutic inference and format as legacy response
        inference_response = await therapeutic_service.get_therapeutic_response(request.scenario_text)
        
        # Convert to legacy format
        similar_cases = [
            SimilarCase(
                case_id=ex["conversation_id"],
                similarity_score=ex["similarity_score"],
                excerpt=ex["counselor_response"][:200] + "...",
                context=ex["patient_question"][:100] + "..."
            )
            for ex in inference_response.get("similar_examples", [])[:3]
        ]
        
        primary_interventions = inference_response.get("primary_interventions", [])
        if primary_interventions:
            primary = primary_interventions[0]
            ml_insight = MLInsight(
                predicted_category=primary["label"],
                confidence_score=primary["confidence"],
                alternative_categories=[
                    {"category": pred["label"], "confidence": pred["confidence"]}
                    for pred in inference_response.get("intervention_predictions", [])
                    if not pred["is_primary"]
                ][:3],
                reasoning=f"Zero-shot classification identified {primary['label']} as the primary intervention with {primary['confidence']:.1%} confidence."
            )
        else:
            ml_insight = MLInsight(
                predicted_category="Validation & Empathy",
                confidence_score=0.3,
                alternative_categories=[],
                reasoning="No high-confidence interventions detected. Defaulting to validation approach."
            )
        
        llm_advice = LLMAdvice(
            advice_text="Based on similar therapeutic contexts and intervention analysis, consider approaching this situation with empathy and validation while exploring specific coping strategies.",
            therapeutic_techniques=["Active Listening", "Validation", "Empathetic Responding"],
            considerations=["Patient emotional state", "Therapeutic alliance", "Intervention appropriateness"],
            next_steps=["Validate patient feelings", "Explore coping strategies", "Monitor therapeutic progress"]
        )
        
        return ThreeLayerResponse(
            similar_cases=similar_cases,
            ml_insight=ml_insight,
            llm_advice=llm_advice,
            processing_time_ms=int(inference_response.get("processing_time_ms", 0))
        )
        
    except Exception as e:
        logger.error(f"Patient scenario analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Patient scenario analysis failed", 
                "message": str(e)
            }
        )

# Convenience endpoints for GET requests
@router.get("/semantic-search")
async def semantic_search_get(
    query: str = Query(..., description="Search query for similar conversations"),
    top_k: int = Query(3, description="Number of results to return", ge=1, le=10)
):
    """GET endpoint for semantic search (convenience method)"""
    request = SemanticSearchRequest(query=query, top_k=top_k)
    return await semantic_search(request)

@router.get("/health")
async def api_health():
    """API health check endpoint"""
    return {"status": "healthy", "message": "Cura API is running"} 