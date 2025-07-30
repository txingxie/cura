"""
Database Models and Schema for Cura Backend
Defines table structures for conversations, embeddings, and metadata
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

class InterventionCategory(str, Enum):
    """6 evidence-based therapeutic intervention categories"""
    VALIDATION_EMPATHY = "Validation & Empathy"
    COGNITIVE_RESTRUCTURING = "Cognitive Restructuring" 
    BEHAVIORAL_ACTIVATION = "Behavioral Activation"
    MINDFULNESS_GROUNDING = "Mindfulness/Grounding"
    PROBLEM_SOLVING = "Problem-Solving"
    PSYCHOEDUCATION = "Psychoeducation"

class ConversationModel(BaseModel):
    """Model for counseling conversation records"""
    id: Optional[int] = Field(None, description="Unique identifier")
    conversation_id: str = Field(..., description="Original conversation ID from dataset")
    patient_question: str = Field(..., description="Patient's question or concern")
    counselor_response: str = Field(..., description="Counselor's response")
    
    # Metadata fields
    topic_tags: Optional[List[str]] = Field(default=[], description="Topic tags for categorization")
    estimated_age_group: Optional[str] = Field(None, description="Estimated patient age group")
    presenting_concerns: Optional[List[str]] = Field(default=[], description="Identified concerns")
    response_length: Optional[int] = Field(None, description="Character length of response")
    
    # Timestamps
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    # Quality metrics
    quality_score: Optional[float] = Field(None, description="Quality assessment score 0-1")
    is_validated: bool = Field(default=False, description="Manual validation status")

class ConversationEmbeddingModel(BaseModel):
    """Model for conversation vector embeddings"""
    id: Optional[int] = Field(None, description="Unique identifier")
    conversation_id: str = Field(..., description="Reference to conversation")
    
    # Embedding data
    patient_embedding: List[float] = Field(..., description="Patient question embedding")
    counselor_embedding: List[float] = Field(..., description="Counselor response embedding")
    combined_embedding: List[float] = Field(..., description="Combined conversation embedding")
    
    # Embedding metadata
    embedding_model: str = Field(..., description="Model used for embeddings")
    embedding_dimension: int = Field(..., description="Embedding vector dimension")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class ConversationClassificationModel(BaseModel):
    """Model for ML classification labels and predictions"""
    id: Optional[int] = Field(None, description="Unique identifier")
    conversation_id: str = Field(..., description="Reference to conversation")
    
    # Manual labels (for training)
    manual_category: Optional[InterventionCategory] = Field(None, description="Manual intervention category")
    manual_confidence: Optional[float] = Field(None, description="Manual labeling confidence")
    labeler_id: Optional[str] = Field(None, description="Who provided the label")
    
    # ML predictions
    predicted_category: Optional[InterventionCategory] = Field(None, description="ML predicted category")
    prediction_confidence: Optional[float] = Field(None, description="ML confidence score")
    category_probabilities: Optional[Dict[str, float]] = Field(None, description="All category probabilities")
    
    # Model metadata
    model_version: Optional[str] = Field(None, description="ML model version used")
    prediction_timestamp: Optional[datetime] = Field(None, description="When prediction was made")
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

# Database schema SQL for Supabase
DATABASE_SCHEMA = {
    "conversations": """
        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY,
            conversation_id VARCHAR(255) UNIQUE NOT NULL,
            patient_question TEXT NOT NULL,
            counselor_response TEXT NOT NULL,
            topic_tags TEXT[] DEFAULT '{}',
            estimated_age_group VARCHAR(50),
            presenting_concerns TEXT[] DEFAULT '{}',
            response_length INTEGER,
            quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
            is_validated BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_conversations_id ON conversations(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_quality ON conversations(quality_score);
        CREATE INDEX IF NOT EXISTS idx_conversations_validated ON conversations(is_validated);
    """,
    
    "conversation_embeddings": """
        CREATE TABLE IF NOT EXISTS conversation_embeddings (
            id SERIAL PRIMARY KEY,
            conversation_id VARCHAR(255) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
            patient_embedding vector(384),
            counselor_embedding vector(384), 
            combined_embedding vector(384),
            embedding_model VARCHAR(255) NOT NULL,
            embedding_dimension INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_embeddings_conversation ON conversation_embeddings(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_embeddings_combined ON conversation_embeddings 
        USING ivfflat (combined_embedding vector_cosine_ops);
    """,
    
    "conversation_classifications": """
        CREATE TABLE IF NOT EXISTS conversation_classifications (
            id SERIAL PRIMARY KEY,
            conversation_id VARCHAR(255) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
            manual_category VARCHAR(255),
            manual_confidence FLOAT CHECK (manual_confidence >= 0 AND manual_confidence <= 1),
            labeler_id VARCHAR(255),
            predicted_category VARCHAR(255),
            prediction_confidence FLOAT CHECK (prediction_confidence >= 0 AND prediction_confidence <= 1),
            category_probabilities JSONB,
            model_version VARCHAR(255),
            prediction_timestamp TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_classifications_conversation ON conversation_classifications(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_classifications_manual ON conversation_classifications(manual_category);
        CREATE INDEX IF NOT EXISTS idx_classifications_predicted ON conversation_classifications(predicted_category);
    """
}

# Helper functions for database operations
def get_conversation_schema() -> str:
    """Get the complete database schema SQL"""
    return "\n".join(DATABASE_SCHEMA.values())

def validate_intervention_category(category: str) -> bool:
    """Validate if category is a valid intervention type"""
    try:
        InterventionCategory(category)
        return True
    except ValueError:
        return False 