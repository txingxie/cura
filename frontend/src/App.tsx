import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import PatientInputForm from './components/PatientInputForm';
import SimilarCasesComponent from './components/SimilarCasesComponent';
import MLInsightsComponent from './components/MLInsightsComponent';
import LLMAdviceComponent from './components/LLMAdviceComponent';
import { therapeuticAPI } from './services/api';
import { TherapeuticResponse, LoadingState } from './types/therapeutic';

// Sophisticated Particle System
const SophisticatedParticle: React.FC<{ delay: number; duration: number; x: number; y: number; size: number }> = ({ delay, duration, x, y, size }) => {
  return (
    <div
      className="absolute bg-gradient-to-br from-slate-200/20 to-slate-300/20 rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        animationName: 'sophisticated-float',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
      }}
    />
  );
};

// Floating Geometric Shapes
const FloatingShape: React.FC<{ delay: number; x: number; y: number; size: number; type: 'circle' | 'square' | 'triangle' }> = ({ delay, x, y, size, type }) => {
  const getShape = () => {
    switch (type) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return 'rounded-lg';
      case 'triangle':
        return 'transform rotate-45';
      default:
        return 'rounded-full';
    }
  };

  return (
    <div
      className={`absolute bg-gradient-to-br from-slate-300/10 to-slate-400/10 ${getShape()} animate-floating-shapes`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

// Animated Background Orbs
const BackgroundOrb: React.FC<{ delay: number; x: number; y: number; size: number }> = ({ delay, x, y, size }) => {
  return (
    <div
      className="absolute bg-gradient-to-br from-slate-200/5 to-slate-300/5 rounded-full blur-xl animate-subtle-breathe"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `${delay}s`,
      }}
    />
  );
};

// Refined Neural Network
const RefinedNeuralNetwork: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const nodes = Array.from({ length: 8 }, (_, i) => i);
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7],
    [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7]
  ];

  return (
    <div className="absolute inset-0 pointer-events-none opacity-30">
      <svg className="absolute inset-0 w-full h-full">
        {connections.map(([from, to], index) => (
          <line
            key={index}
            x1={`${15 + (from % 2) * 70}%`}
            y1={`${20 + Math.floor(from / 2) * 30}%`}
            x2={`${15 + (to % 2) * 70}%`}
            y2={`${20 + Math.floor(to / 2) * 30}%`}
            stroke="rgba(148, 163, 184, 0.15)"
            strokeWidth="0.5"
            className={isActive ? 'animate-connection-pulse' : ''}
          />
        ))}
      </svg>
      
      {nodes.map((node, index) => (
        <div
          key={index}
          className={`absolute w-1 h-1 bg-slate-400/40 rounded-full transform -translate-x-0.5 -translate-y-0.5 ${
            isActive ? 'animate-node-glow' : ''
          }`}
          style={{
            left: `${15 + (index % 2) * 70}%`,
            top: `${20 + Math.floor(index / 2) * 30}%`,
            animationDelay: `${index * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
};

function App() {
  const [therapeuticResponse, setTherapeuticResponse] = useState<TherapeuticResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    stage: 'semantic',
    progress: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Refined mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      case 'semantic': return 'Searching therapeutic database';
      case 'classification': return 'Analyzing intervention patterns';
      case 'llm': return 'Generating personalized guidance';
      case 'complete': return 'Analysis complete';
      default: return 'Processing';
    }
  };

  // Generate sophisticated particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    delay: Math.random() * 8,
    duration: 12 + Math.random() * 8,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3
  }));

  // Generate floating shapes
  const shapes = Array.from({ length: 8 }, (_, i) => ({
    delay: Math.random() * 6,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 40,
    type: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)] as 'circle' | 'square' | 'triangle'
  }));

  // Generate background orbs
  const orbs = Array.from({ length: 6 }, (_, i) => ({
    delay: Math.random() * 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 100 + Math.random() * 200
  }));

  return (
    <div 
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 animate-gradient-flow"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Background Orbs */}
        {orbs.map((orb, index) => (
          <BackgroundOrb key={index} {...orb} />
        ))}
        
        {/* Sophisticated Particles */}
        {particles.map((particle, index) => (
          <SophisticatedParticle key={index} {...particle} />
        ))}
        
        {/* Floating Geometric Shapes */}
        {shapes.map((shape, index) => (
          <FloatingShape key={index} {...shape} />
        ))}
        
        {/* Subtle Dynamic Gradient */}
        <div 
          className="absolute inset-0 opacity-20 transition-all duration-3000"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(148, 163, 184, 0.05) 0%, transparent 70%)`,
          }}
        />
        
        {/* Refined Neural Network */}
        <RefinedNeuralNetwork isActive={loadingState.isLoading} />
        
        {/* Subtle Texture */}
        <div className="absolute inset-0 opacity-3">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px)`,
            backgroundSize: '100px 100px'
          }} />
        </div>
      </div>

      {/* Refined Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b border-slate-200/40 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-5xl mx-auto px-6 lg:px-8 py-16">
        {/* Sophisticated Hero Section */}
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 bg-gradient-to-br from-slate-200/10 to-slate-300/10 rounded-full blur-3xl animate-slow-pulse"></div>
          </div>
          
          <div className="relative">
            <h2 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-tight">
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
            
            {/* Value Propositions */}
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

        {/* Refined Loading Overlay */}
        {loadingState.isLoading && (
          <div className="fixed inset-0 bg-black/5 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="relative bg-white/95 backdrop-blur-md rounded-2xl p-10 max-w-md w-full mx-4 shadow-2xl border border-slate-200/60">
              {/* Refined Background */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100"></div>
                <div className="absolute inset-0 opacity-20">
                  <RefinedNeuralNetwork isActive={true} />
                </div>
              </div>
              
              <div className="relative text-center">
                {/* Refined Logo */}
                <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                
                {/* Stage Display */}
                <h3 className="text-lg font-semibold text-slate-900 mb-6 tracking-wide">
                  {getStageText(loadingState.stage)}
                </h3>
                
                {/* Refined Progress Bar */}
                <div className="w-full bg-slate-200/60 rounded-full h-1 mb-8 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-slate-900 to-slate-700 h-1 rounded-full transition-all duration-700 ease-out relative"
                    style={{ width: `${loadingState.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-sophisticated-shimmer"></div>
                  </div>
                </div>
                
                {/* Progress Text */}
                <p className="text-sm text-slate-500 mb-8 tracking-wide">
                  {loadingState.progress}% complete
                </p>
                
                {/* Processing Steps */}
                <div className="space-y-4 text-left">
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
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl p-6 animate-sophisticated-fade-in">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100/80 rounded-lg flex items-center justify-center mr-4">
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
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/40 animate-sophisticated-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {therapeuticResponse.processing_time_ms.toFixed(0)}ms
                  </div>
                  <div className="text-sm text-slate-600 tracking-wide">Processing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {therapeuticResponse.data.similar_examples.length}
                  </div>
                  <div className="text-sm text-slate-600 tracking-wide">Similar Cases</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {therapeuticResponse.data.primary_interventions.length}
                  </div>
                  <div className="text-sm text-slate-600 tracking-wide">Primary Interventions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 mb-2">
                    {therapeuticResponse.data.llm_advice ? '✓' : '✗'}
                  </div>
                  <div className="text-sm text-slate-600 tracking-wide">AI Guidance</div>
                </div>
              </div>
            </div>

            {/* Three-Layer Results */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Layer 1: Similar Cases */}
              <div className="lg:col-span-1 animate-sophisticated-fade-in" style={{ animationDelay: '0.1s' }}>
                <SimilarCasesComponent 
                  similarExamples={therapeuticResponse.data.similar_examples}
                  isLoading={loadingState.isLoading}
                />
              </div>

              {/* Layer 2: ML Insights */}
              <div className="lg:col-span-1 animate-sophisticated-fade-in" style={{ animationDelay: '0.2s' }}>
                <MLInsightsComponent 
                  interventionPredictions={therapeuticResponse.data.intervention_predictions}
                  primaryInterventions={therapeuticResponse.data.primary_interventions}
                  isLoading={loadingState.isLoading}
                />
              </div>

              {/* Layer 3: LLM Advice */}
              <div className="lg:col-span-1 animate-sophisticated-fade-in" style={{ animationDelay: '0.3s' }}>
                <LLMAdviceComponent 
                  llmAdvice={therapeuticResponse.data.llm_advice}
                  isLoading={loadingState.isLoading}
                />
              </div>
            </div>

            {/* Summary Footer */}
            <div className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/40 animate-sophisticated-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-wide">
                  Analysis Complete
                </h3>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed font-normal">
                  This comprehensive analysis combines semantic search, machine learning classification, and AI-generated therapeutic guidance 
                  to provide evidence-based support for clinical decision-making.
                </p>
                <div className="flex justify-center space-x-8 text-sm">
                  <div className="flex items-center text-slate-700">
                    <div className="w-1 h-1 bg-slate-700 rounded-full mr-2"></div>
                    Semantic Search
                  </div>
                  <div className="flex items-center text-slate-700">
                    <div className="w-1 h-1 bg-slate-700 rounded-full mr-2"></div>
                    ML Classification
                  </div>
                  <div className="flex items-center text-slate-700">
                    <div className="w-1 h-1 bg-slate-700 rounded-full mr-2"></div>
                    AI Guidance
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative bg-white/80 backdrop-blur-sm border-t border-slate-200/40 mt-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
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
}

export default App;
