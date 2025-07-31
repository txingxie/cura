import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import PatientInputForm from './components/PatientInputForm';
import EnhancedResultsComponent from './components/EnhancedResultsComponent';

import { therapeuticAPI } from './services/api';
import { TherapeuticResponse, LoadingState } from './types/therapeutic';

// Main Application Component
const MainApp: React.FC = () => {
  const [therapeuticResponse, setTherapeuticResponse] = useState<TherapeuticResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    stage: 'semantic',
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const getStageText = (stage: LoadingState['stage']) => {
    switch (stage) {
      case 'semantic':
        return 'Searching Similar Cases';
      case 'classification':
        return 'Analyzing Interventions';
      case 'llm':
        return 'Generating Guidance';
      case 'complete':
        return 'Analysis Complete';
      default:
        return 'Processing...';
    }
  };

  const handleSubmit = async (query: string) => {
    setError(null);
    setTherapeuticResponse(null);
    setShowResults(false);
    setLoadingState({
      isLoading: true,
      stage: 'semantic',
      progress: 0,
    });

    let progressInterval: NodeJS.Timeout | undefined;

    try {
      // Simulate progress updates
      progressInterval = setInterval(() => {
        setLoadingState((prev) => {
          if (prev.progress >= 100) {
            if (progressInterval) {
              clearInterval(progressInterval);
            }
            return prev;
          }
          const newProgress = prev.progress + 2;
          let newStage = prev.stage;
          
          if (newProgress >= 30 && prev.stage === 'semantic') {
            newStage = 'classification';
          } else if (newProgress >= 70 && prev.stage === 'classification') {
            newStage = 'llm';
          } else if (newProgress >= 95 && prev.stage === 'llm') {
            newStage = 'complete';
          }
          
          return {
            ...prev,
            progress: newProgress,
            stage: newStage,
          };
        });
      }, 100);

      const response = await therapeuticAPI.getTherapeuticInference({ query });
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      
      setTherapeuticResponse(response);
      setLoadingState({
        isLoading: false,
        stage: 'complete',
        progress: 100,
      });
      
      // Show results with animation
      setTimeout(() => setShowResults(true), 500);
    } catch (err) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
      setLoadingState({
        isLoading: false,
        stage: 'semantic',
        progress: 0,
      });
    }
  };

  return (
    <div className="min-h-screen bg-papyrus-subtle">
      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-slate-200/40 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900 tracking-wide">Cura</h1>
                <p className="text-xs text-slate-500 font-medium tracking-wide">Therapeutic Intelligence</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors duration-300"
            >
              About
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-4xl mx-auto px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 bg-gradient-to-br from-slate-200/10 to-slate-300/10 rounded-full blur-3xl animate-slow-pulse"></div>
          </div>

          <div className="relative">
            <h2 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-tight" style={{ fontFamily: 'Butler, serif' }}>
              <span className="inline-block animate-sophisticated-fade-in bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent" style={{ animationDelay: '0.2s' }}>
                Cura
              </span>
              <br />
              <span className="inline-block animate-sophisticated-fade-in text-slate-800" style={{ animationDelay: '0.6s' }}>
                Therapeutic Intelligence
              </span>
            </h2>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal animate-sophisticated-fade-in mb-12" style={{ animationDelay: '1s' }}>
              Advanced AI-powered insights to support clinical decision-making and enhance therapeutic outcomes.
            </p>

            <div className="flex justify-center space-x-8 text-sm animate-sophisticated-fade-in" style={{ animationDelay: '1.2s' }}>
              <div className="px-4 py-2 bg-slate-100/60 backdrop-blur-sm rounded-lg text-slate-700 border border-slate-200/40">
                <span className="font-semibold">Evidence-Based</span> Insights
              </div>
              <div className="px-4 py-2 bg-slate-100/60 backdrop-blur-sm rounded-lg text-slate-700 border border-slate-200/40">
                <span className="font-semibold">Clinical</span> Decision Support
              </div>
              <div className="px-4 py-2 bg-slate-100/60 backdrop-blur-sm rounded-lg text-slate-700 border border-slate-200/40">
                <span className="font-semibold">Personalized</span> Guidance
              </div>
            </div>
          </div>
        </div>

        {/* Patient Input Form */}
        <PatientInputForm onSubmit={handleSubmit} isLoading={loadingState.isLoading} />

        {/* Loading Overlay */}
        {loadingState.isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-lg z-40 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-8">
                {/* Refined Neural Network Background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute bg-slate-200/50 rounded-full animate-subtle-breathe"
                      style={{
                        width: `${20 + i * 5}px`,
                        height: `${20 + i * 5}px`,
                        animationDelay: `${i * 0.2}s`,
                        opacity: 0.1 + i * 0.05,
                        filter: `blur(${i * 0.5}px)`,
                      }}
                    />
                  ))}
                </div>
                {/* Animated Logo */}
                <div className="relative w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center mx-auto animate-gentle-float">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>

              {/* Stage Display */}
              <h3 className="text-lg font-semibold text-slate-900 mb-6 tracking-wide">
                {getStageText(loadingState.stage)}
              </h3>

              {/* Progress Bar with Shimmer */}
              <div className="w-full max-w-md mx-auto bg-slate-200 rounded-full h-2.5 mb-8 overflow-hidden relative">
                <div
                  className="bg-gradient-to-r from-slate-500 to-slate-700 h-2.5 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${loadingState.progress}%` }}
                >
                  <div className="absolute inset-0 shimmer-animation"></div>
                </div>
              </div>

              {/* Detailed Steps */}
              <div className="space-y-4 max-w-sm mx-auto">
                <div className={`flex items-center text-sm transition-all duration-500 ${loadingState.stage === 'semantic' ? 'text-slate-900' : 'text-slate-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-4 transition-all duration-500 ${loadingState.stage === 'semantic' ? 'bg-slate-900' : 'bg-slate-300'}`}></div>
                  <span className={loadingState.stage === 'semantic' ? 'font-semibold' : 'font-normal'}>Semantic search in therapeutic database</span>
                </div>
                <div className={`flex items-center text-sm transition-all duration-500 ${loadingState.stage === 'classification' ? 'text-slate-900' : 'text-slate-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-4 transition-all duration-500 ${loadingState.stage === 'classification' ? 'bg-slate-900' : 'bg-slate-300'}`}></div>
                  <span className={loadingState.stage === 'classification' ? 'font-semibold' : 'font-normal'}>ML intervention classification</span>
                </div>
                <div className={`flex items-center text-sm transition-all duration-500 ${loadingState.stage === 'llm' ? 'text-slate-900' : 'text-slate-400'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-4 transition-all duration-500 ${loadingState.stage === 'llm' ? 'bg-slate-900' : 'bg-slate-300'}`}></div>
                  <span className={loadingState.stage === 'llm' ? 'font-semibold' : 'font-normal'}>AI therapeutic guidance generation</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8 animate-sophisticated-fade-in">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-800">Processing Error</h3>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors duration-300"
            >
              Clear Error
            </button>
          </div>
        )}

        {/* Enhanced Results Section */}
        {therapeuticResponse && (
          <div className={`transition-all duration-700 ${showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <EnhancedResultsComponent
              therapeuticResponse={therapeuticResponse}
              isLoading={loadingState.isLoading}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative bg-white/80 backdrop-blur-sm border-t border-slate-200/40 mt-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-slate-900 tracking-wide">Cura</span>
            </div>
            <p className="text-slate-600 mb-2 font-normal tracking-wide">AI-Powered Therapeutic Intelligence Platform</p>
            <p className="text-sm text-slate-500 font-normal tracking-wide">
              For educational and research purposes only. Always consult qualified mental health professionals for clinical decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Main App Component with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyze" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
