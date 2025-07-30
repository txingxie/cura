import React, { useState, useEffect } from 'react';
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
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (query: string) => {
    setError(null);
    setTherapeuticResponse(null);
    setShowResults(false);
    setLoadingState({
      isLoading: true,
      stage: 'semantic',
      progress: 0
    });

    try {
      // Simulate detailed progress updates for better UX
      const progressStages = [
        { stage: 'semantic', duration: 2000, progress: 30 },
        { stage: 'classification', duration: 1500, progress: 60 },
        { stage: 'llm', duration: 3000, progress: 90 }
      ];

      let currentStageIndex = 0;
      const progressInterval = setInterval(() => {
        if (currentStageIndex < progressStages.length) {
          const stage = progressStages[currentStageIndex];
          setLoadingState(prev => ({
            ...prev,
            stage: stage.stage as LoadingState['stage'],
            progress: stage.progress
          }));
          currentStageIndex++;
        }
      }, 1000);

      const response = await therapeuticAPI.getTherapeuticInference({ query });
      
      clearInterval(progressInterval);
      
      setTherapeuticResponse(response);
      setLoadingState({
        isLoading: false,
        stage: 'complete',
        progress: 100
      });

      // Animate results appearance
      setTimeout(() => setShowResults(true), 500);

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
      case 'semantic': return 'Searching therapeutic database...';
      case 'classification': return 'Analyzing intervention patterns...';
      case 'llm': return 'Generating personalized guidance...';
      case 'complete': return 'Analysis complete!';
      default: return 'Processing...';
    }
  };

  const getStageIcon = (stage: LoadingState['stage']) => {
    switch (stage) {
      case 'semantic': return '🔍';
      case 'classification': return '🧠';
      case 'llm': return '💡';
      case 'complete': return '✅';
      default: return '⚡';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Cura AI
                </h1>
                <p className="text-xs text-slate-500 font-medium">Therapeutic Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>AI System Online</span>
              </div>
              <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700">
                v1.0.0
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4">
            AI-Powered Therapeutic Guidance
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Leverage advanced AI to enhance your clinical decision-making with evidence-based insights, 
            similar case analysis, and personalized therapeutic recommendations.
          </p>
        </div>

        {/* Loading Overlay */}
        {loadingState.isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-slate-200">
              <div className="text-center">
                {/* Animated Logo */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                
                {/* Stage Display */}
                <div className="flex items-center justify-center mb-4">
                  <span className="text-2xl mr-3">{getStageIcon(loadingState.stage)}</span>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {getStageText(loadingState.stage)}
                  </h3>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 mb-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${loadingState.progress}%` }}
                  ></div>
                </div>
                
                {/* Progress Text */}
                <p className="text-sm text-slate-500 mb-4">
                  {loadingState.progress}% complete
                </p>
                
                {/* Processing Steps */}
                <div className="space-y-2 text-left">
                  <div className={`flex items-center text-sm ${loadingState.stage === 'semantic' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full mr-3 ${loadingState.stage === 'semantic' ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`}></div>
                    Semantic search in therapeutic database
                  </div>
                  <div className={`flex items-center text-sm ${loadingState.stage === 'classification' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full mr-3 ${loadingState.stage === 'classification' ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`}></div>
                    ML intervention classification
                  </div>
                  <div className={`flex items-center text-sm ${loadingState.stage === 'llm' ? 'text-blue-600' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full mr-3 ${loadingState.stage === 'llm' ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`}></div>
                    AI therapeutic guidance generation
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800">Processing Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Patient Input Form */}
        <div className={`transition-all duration-700 ${showResults ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
          <PatientInputForm 
            onSubmit={handleSubmit} 
            isLoading={loadingState.isLoading} 
          />
        </div>

        {/* Results Section */}
        {therapeuticResponse && (
          <div className={`space-y-8 transition-all duration-700 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Performance Metrics */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {therapeuticResponse.processing_time_ms.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-slate-600">Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {therapeuticResponse.data.similar_examples.length}
                  </div>
                  <div className="text-sm text-slate-600">Similar Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {therapeuticResponse.data.primary_interventions.length}
                  </div>
                  <div className="text-sm text-slate-600">Primary Interventions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {therapeuticResponse.data.llm_advice ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-slate-600">AI Guidance</div>
                </div>
              </div>
            </div>

            {/* Three-Layer Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200/50">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  Three-Layer AI Analysis Complete
                </h3>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                  This comprehensive analysis combines semantic search, machine learning classification, and AI-generated therapeutic guidance 
                  to provide evidence-based support for clinical decision-making.
                </p>
                <div className="flex justify-center space-x-8 text-sm">
                  <div className="flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Semantic Search
                  </div>
                  <div className="flex items-center text-purple-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    ML Classification
                  </div>
                  <div className="flex items-center text-orange-600">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    AI Guidance
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-slate-900">Cura AI</span>
            </div>
            <p className="text-slate-600 mb-2">AI-Powered Therapeutic Intelligence Platform</p>
            <p className="text-sm text-slate-500">
              For educational and research purposes only. Always consult qualified mental health professionals for clinical decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
