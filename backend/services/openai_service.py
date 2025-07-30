"""
OpenAI Service for Therapeutic Advice Generation

Provides LLM-powered therapeutic advice generation as the third layer
of the therapeutic AI system (semantic search + ML classification + LLM generation).
"""

import asyncio
import logging
import os
import sys
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import json

# Add root to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

try:
    import openai
    from openai import AsyncOpenAI
except ImportError:
    logging.warning("OpenAI package not installed. Install with: pip install openai")
    openai = None

logger = logging.getLogger(__name__)

@dataclass
class TherapeuticAdvice:
    """Structured therapeutic advice from LLM"""
    advice_text: str
    therapeutic_techniques: List[str]
    considerations: List[str]
    next_steps: List[str]
    confidence_score: float
    reasoning: str

class OpenAIService:
    """
    OpenAI service for generating therapeutic advice.
    
    Integrates semantic search results and ML classification predictions
    to generate contextual, evidence-based therapeutic recommendations.
    """
    
    def __init__(self):
        """Initialize OpenAI service with configuration."""
        self.api_key = os.getenv('OPENAI_API_KEY')
        self.model = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
        self.temperature = float(os.getenv('OPENAI_TEMPERATURE', '0.7'))
        self.max_tokens = int(os.getenv('OPENAI_MAX_TOKENS', '1000'))
        
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not found in environment variables")
            self.client = None
        else:
            try:
                self.client = AsyncOpenAI(api_key=self.api_key)
                logger.info(f"OpenAI service initialized with model: {self.model}")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}")
                self.client = None
    
    async def generate_therapeutic_advice(
        self,
        patient_query: str,
        similar_examples: List[Dict[str, Any]],
        intervention_predictions: List[Dict[str, Any]],
        primary_interventions: List[Dict[str, Any]]
    ) -> TherapeuticAdvice:
        """
        Generate therapeutic advice using OpenAI based on context.
        
        Args:
            patient_query: Patient's original query/scenario
            similar_examples: Similar therapeutic conversations from semantic search
            intervention_predictions: All ML classification predictions
            primary_interventions: High-confidence intervention recommendations
            
        Returns:
            Structured therapeutic advice with techniques and next steps
        """
        if not self.client:
            return self._generate_fallback_advice(patient_query, primary_interventions)
        
        try:
            # Build context for LLM
            context = self._build_therapeutic_context(
                patient_query, similar_examples, intervention_predictions, primary_interventions
            )
            
            # Generate therapeutic advice
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": self._get_system_prompt()
                    },
                    {
                        "role": "user", 
                        "content": context
                    }
                ],
                temperature=self.temperature,
                max_tokens=self.max_tokens
            )
            
            # Parse and structure the response
            advice_text = response.choices[0].message.content
            structured_advice = self._parse_therapeutic_response(advice_text, primary_interventions)
            
            logger.info(f"Generated therapeutic advice using {self.model}")
            return structured_advice
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            return self._generate_fallback_advice(patient_query, primary_interventions)
    
    def _build_therapeutic_context(
        self,
        patient_query: str,
        similar_examples: List[Dict[str, Any]],
        intervention_predictions: List[Dict[str, Any]],
        primary_interventions: List[Dict[str, Any]]
    ) -> str:
        """Build comprehensive context for LLM therapeutic advice generation."""
        
        # Format similar examples
        examples_text = ""
        if similar_examples:
            examples_text = "\n\nSIMILAR THERAPEUTIC EXAMPLES:\n"
            for i, example in enumerate(similar_examples[:2], 1):  # Top 2 examples
                examples_text += f"\nExample {i}:\n"
                examples_text += f"Patient: {example['patient_question'][:200]}...\n"
                examples_text += f"Counselor: {example['counselor_response'][:300]}...\n"
                examples_text += f"Similarity: {example['similarity_score']:.3f}\n"
        
        # Format intervention predictions
        interventions_text = "\n\nRECOMMENDED INTERVENTIONS:\n"
        for intervention in primary_interventions:
            interventions_text += f"• {intervention['label']} (confidence: {intervention['confidence']:.3f})\n"
        
        # Build full context
        context = f"""
PATIENT QUERY:
{patient_query}

{examples_text}

{interventions_text}

Please provide therapeutic advice based on the patient's situation, similar examples, and recommended interventions. Focus on evidence-based therapeutic techniques and provide actionable next steps.
"""
        return context.strip()
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for therapeutic advice generation."""
        return """You are an expert clinical psychologist and counselor with extensive experience in evidence-based therapeutic interventions. Your role is to provide professional, empathetic, and clinically sound therapeutic advice.

IMPORTANT GUIDELINES:
1. Base your advice on evidence-based therapeutic techniques (CBT, DBT, ACT, etc.)
2. Consider the patient's specific situation and recommended interventions
3. Provide practical, actionable therapeutic techniques
4. Include safety considerations and when to refer to professional help
5. Maintain professional boundaries and therapeutic ethics
6. Use warm, empathetic, and validating language
7. Focus on building therapeutic alliance and hope

RESPONSE STRUCTURE:
- Provide clear, compassionate therapeutic advice
- Suggest 2-3 specific therapeutic techniques
- Include important clinical considerations
- Recommend 2-3 concrete next steps
- Explain your reasoning based on therapeutic best practices

Remember: You are providing guidance to counselors, not direct therapy to patients. Focus on helping counselors understand how to approach this situation therapeutically."""
    
    def _parse_therapeutic_response(self, advice_text: str, primary_interventions: List[Dict[str, Any]]) -> TherapeuticAdvice:
        """Parse LLM response into structured therapeutic advice."""
        
        # Extract therapeutic techniques (simple keyword-based extraction)
        techniques = self._extract_therapeutic_techniques(advice_text)
        
        # Extract considerations and next steps
        considerations = self._extract_considerations(advice_text)
        next_steps = self._extract_next_steps(advice_text)
        
        # Calculate confidence based on primary interventions
        confidence = self._calculate_advice_confidence(primary_interventions)
        
        # Generate reasoning
        reasoning = self._generate_reasoning(primary_interventions, techniques)
        
        return TherapeuticAdvice(
            advice_text=advice_text,
            therapeutic_techniques=techniques,
            considerations=considerations,
            next_steps=next_steps,
            confidence_score=confidence,
            reasoning=reasoning
        )
    
    def _extract_therapeutic_techniques(self, text: str) -> List[str]:
        """Extract therapeutic techniques from LLM response."""
        techniques = []
        
        # Common therapeutic technique keywords
        technique_keywords = [
            "cognitive behavioral therapy", "cbt", "cognitive restructuring",
            "mindfulness", "meditation", "breathing exercises", "grounding",
            "behavioral activation", "exposure therapy", "systematic desensitization",
            "validation", "empathy", "active listening", "reflective listening",
            "problem-solving", "goal-setting", "coping strategies", "stress management",
            "relaxation techniques", "progressive muscle relaxation", "guided imagery"
        ]
        
        text_lower = text.lower()
        for technique in technique_keywords:
            if technique in text_lower:
                # Capitalize and format technique name
                formatted_technique = technique.replace("_", " ").title()
                if formatted_technique not in techniques:
                    techniques.append(formatted_technique)
        
        # Default techniques if none found
        if not techniques:
            techniques = ["Active Listening", "Validation", "Empathetic Responding"]
        
        return techniques[:3]  # Return top 3 techniques
    
    def _extract_considerations(self, text: str) -> List[str]:
        """Extract clinical considerations from LLM response."""
        considerations = []
        
        # Look for consideration indicators
        consideration_indicators = [
            "consider", "important to note", "keep in mind", "be aware",
            "safety", "risk", "crisis", "emergency", "referral", "professional help"
        ]
        
        sentences = text.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for indicator in consideration_indicators:
                if indicator in sentence_lower and len(sentence.strip()) > 20:
                    consideration = sentence.strip()
                    if consideration not in considerations:
                        considerations.append(consideration)
                    break
        
        # Default considerations if none found
        if not considerations:
            considerations = [
                "Monitor patient's emotional state and safety",
                "Maintain therapeutic boundaries and professional ethics",
                "Consider referral to specialized mental health services if needed"
            ]
        
        return considerations[:3]  # Return top 3 considerations
    
    def _extract_next_steps(self, text: str) -> List[str]:
        """Extract next steps from LLM response."""
        next_steps = []
        
        # Look for action-oriented phrases
        action_indicators = [
            "next step", "follow up", "continue", "begin", "start",
            "practice", "implement", "try", "explore", "develop"
        ]
        
        sentences = text.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower()
            for indicator in action_indicators:
                if indicator in sentence_lower and len(sentence.strip()) > 20:
                    step = sentence.strip()
                    if step not in next_steps:
                        next_steps.append(step)
                    break
        
        # Default next steps if none found
        if not next_steps:
            next_steps = [
                "Validate patient's feelings and experiences",
                "Explore coping strategies and resources",
                "Schedule follow-up to monitor progress"
            ]
        
        return next_steps[:3]  # Return top 3 next steps
    
    def _calculate_advice_confidence(self, primary_interventions: List[Dict[str, Any]]) -> float:
        """Calculate confidence score for therapeutic advice."""
        if not primary_interventions:
            return 0.3
        
        # Average confidence of primary interventions
        avg_confidence = sum(p['confidence'] for p in primary_interventions) / len(primary_interventions)
        
        # Boost confidence if multiple high-confidence interventions
        if len(primary_interventions) >= 2:
            avg_confidence = min(0.95, avg_confidence * 1.1)
        
        return round(avg_confidence, 3)
    
    def _generate_reasoning(self, primary_interventions: List[Dict[str, Any]], techniques: List[str]) -> str:
        """Generate reasoning for therapeutic advice."""
        if not primary_interventions:
            return "Based on general therapeutic best practices and evidence-based approaches."
        
        intervention_names = [p['label'] for p in primary_interventions]
        confidence_scores = [p['confidence'] for p in primary_interventions]
        
        reasoning = f"Based on {', '.join(intervention_names)} interventions "
        reasoning += f"(confidence scores: {', '.join(f'{c:.3f}' for c in confidence_scores)}), "
        reasoning += f"recommended techniques include {', '.join(techniques)}. "
        reasoning += "This approach aligns with evidence-based therapeutic practices."
        
        return reasoning
    
    def _generate_fallback_advice(self, patient_query: str, primary_interventions: List[Dict[str, Any]]) -> TherapeuticAdvice:
        """Generate fallback therapeutic advice when OpenAI is unavailable."""
        
        # Default therapeutic techniques
        techniques = ["Active Listening", "Validation", "Empathetic Responding"]
        
        # Generate basic advice based on primary interventions
        if primary_interventions:
            top_intervention = primary_interventions[0]
            advice_text = f"Based on the analysis, {top_intervention['label']} appears to be the most appropriate intervention for this situation. Focus on validating the patient's feelings and providing a supportive therapeutic environment."
        else:
            advice_text = "Focus on building therapeutic alliance through active listening and validation. Create a safe space for the patient to explore their concerns."
        
        considerations = [
            "Monitor patient's emotional state and safety",
            "Maintain therapeutic boundaries and professional ethics",
            "Consider referral to specialized mental health services if needed"
        ]
        
        next_steps = [
            "Validate patient's feelings and experiences",
            "Explore coping strategies and resources", 
            "Schedule follow-up to monitor progress"
        ]
        
        confidence = self._calculate_advice_confidence(primary_interventions)
        reasoning = self._generate_reasoning(primary_interventions, techniques)
        
        return TherapeuticAdvice(
            advice_text=advice_text,
            therapeutic_techniques=techniques,
            considerations=considerations,
            next_steps=next_steps,
            confidence_score=confidence,
            reasoning=reasoning
        )

# Global singleton instance
openai_service = OpenAIService() 