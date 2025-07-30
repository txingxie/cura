// API service for therapeutic AI backend communication

import { TherapeuticResponse, PatientScenario, APIError } from '../types/therapeutic';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class TherapeuticAPIService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData: APIError = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  async getTherapeuticInference(scenario: PatientScenario): Promise<TherapeuticResponse> {
    return this.makeRequest<TherapeuticResponse>('/api/v1/therapeutic-inference', {
      method: 'POST',
      body: JSON.stringify(scenario),
    });
  }

  async getSemanticSearch(query: string): Promise<TherapeuticResponse> {
    return this.makeRequest<TherapeuticResponse>('/api/v1/semantic-search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async classifyInterventions(text: string): Promise<TherapeuticResponse> {
    return this.makeRequest<TherapeuticResponse>('/api/v1/classify-interventions', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async generateLLMAdvice(
    patientQuery: string,
    similarExamples: any[] = [],
    interventionPredictions: any[] = [],
    primaryInterventions: any[] = []
  ): Promise<TherapeuticResponse> {
    return this.makeRequest<TherapeuticResponse>('/api/v1/generate-llm-advice', {
      method: 'POST',
      body: JSON.stringify({
        patient_query: patientQuery,
        similar_examples: similarExamples,
        intervention_predictions: interventionPredictions,
        primary_interventions: primaryInterventions,
      }),
    });
  }

  async checkHealth(): Promise<{ status: string }> {
    return this.makeRequest<{ status: string }>('/health');
  }
}

export const therapeuticAPI = new TherapeuticAPIService(); 