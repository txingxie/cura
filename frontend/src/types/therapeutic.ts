// TypeScript types for therapeutic AI API responses

export interface SimilarExample {
  conversation_id: string;
  patient_question: string;
  counselor_response: string;
  similarity_score: number;
}

export interface InterventionPrediction {
  intervention: string;
  label: string;
  confidence: number;
  is_predicted: boolean;
  is_primary: boolean;
}

export interface LLMAdvice {
  advice_text: string;
  therapeutic_techniques: string[];
  considerations: string[];
  next_steps: string[];
  confidence_score: number;
  reasoning: string;
  model_used: string;
}

export interface TherapeuticResponse {
  success: boolean;
  data: {
    similar_examples: SimilarExample[];
    intervention_predictions: InterventionPrediction[];
    primary_interventions: InterventionPrediction[];
    llm_advice: LLMAdvice;
  };
  processing_time_ms: number;
}

export interface APIError {
  error: string;
  message: string;
  details?: any;
}

export interface PatientScenario {
  query: string;
}

export interface LoadingState {
  isLoading: boolean;
  stage: 'semantic' | 'classification' | 'llm' | 'complete';
  progress: number;
} 