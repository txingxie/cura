import React, { useState } from 'react';
import './App.css';
import PatientInputForm from './components/PatientInputForm';
import SimilarCasesComponent from './components/SimilarCasesComponent';
import MLInsightsComponent from './components/MLInsightsComponent';
import LLMAdviceComponent from './components/LLMAdviceComponent';
import { therapeuticAPI } from './services/api';
import { TherapeuticResponse, LoadingState } from './types/therapeutic';

function App() {
  const [therapeuticResponse, setTherapeuticResponse] = useState<TherapeuticResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    stage: 'semantic',
    progress: 0
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (query: string) => {
    setError(null);
    setTherapeuticResponse(null);
    setLoadingState({
      isLoading: true,
      stage: 'semantic',
      progress: 0
    });

    try {
      // Simulate progress updates for better UX
      const progressInterval = setInterval(() => {
        setLoadingState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }));
      }, 500);

      const response = await therapeuticAPI.getTherapeuticInference({ query });
      
      clearInterval(progressInterval);
      
      setTherapeuticResponse(response);
      setLoadingState({
        isLoading: false,
        stage: 'complete',
        progress: 100
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setLoadingState({
        isLoading: false,
        stage: 'semantic',
        progress: 0
      });
    }
  };

  const getStageText = (stage: LoadingState['stage']) => {
    switch (stage) {
      case 'semantic': return 'Finding similar cases...';
      case 'classification': return 'Analyzing interventions...';
      case 'llm': return 'Generating therapeutic advice...';
      case 'complete': return 'Analysis complete!';
      default: return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Cura - Therapeutic AI Assistant</h1>
            </div>
            <div className="text-sm text-gray-500">
              Powered by AI & Evidence-Based Therapy
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Overlay */}
        {loadingState.isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {getStageText(loadingState.stage)}
                </h3>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${loadingState.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500">
                  Processing your request through our three-layer AI system...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Patient Input Form */}
        <PatientInputForm 
          onSubmit={handleSubmit} 
          isLoading={loadingState.isLoading} 
        />

        {/* Results Section */}
        {therapeuticResponse && (
          <div className="space-y-6">
            {/* Processing Time */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Processing completed in</span>
                <span className="text-lg font-semibold text-blue-600">
                  {therapeuticResponse.processing_time_ms.toFixed(0)}ms
                </span>
              </div>
            </div>

            {/* Three-Layer Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Layer 1: Similar Cases */}
              <div className="lg:col-span-1">
                <SimilarCasesComponent 
                  similarExamples={therapeuticResponse.data.similar_examples}
                  isLoading={loadingState.isLoading}
                />
              </div>

              {/* Layer 2: ML Insights */}
              <div className="lg:col-span-1">
                <MLInsightsComponent 
                  interventionPredictions={therapeuticResponse.data.intervention_predictions}
                  primaryInterventions={therapeuticResponse.data.primary_interventions}
                  isLoading={loadingState.isLoading}
                />
              </div>

              {/* Layer 3: LLM Advice */}
              <div className="lg:col-span-1">
                <LLMAdviceComponent 
                  llmAdvice={therapeuticResponse.data.llm_advice}
                  isLoading={loadingState.isLoading}
                />
              </div>
            </div>

            {/* Summary Footer */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Three-Layer AI Analysis Complete
                </h3>
                <p className="text-gray-600 mb-4">
                  This analysis combines semantic search, machine learning classification, and AI-generated therapeutic guidance 
                  to provide comprehensive support for clinical decision-making.
                </p>
                <div className="flex justify-center space-x-4 text-sm text-gray-500">
                  <span>✓ Semantic Search</span>
                  <span>✓ ML Classification</span>
                  <span>✓ AI Guidance</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Cura Therapeutic AI Assistant - For Educational and Research Purposes Only</p>
            <p className="mt-1">Always consult qualified mental health professionals for clinical decisions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
