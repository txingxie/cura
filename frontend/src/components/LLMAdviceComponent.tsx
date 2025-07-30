import React from 'react';
import { LLMAdvice } from '../types/therapeutic';

interface LLMAdviceComponentProps {
  llmAdvice: LLMAdvice;
  isLoading?: boolean;
}

const LLMAdviceComponent: React.FC<LLMAdviceComponentProps> = ({ 
  llmAdvice, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">AI Guidance</h3>
            <p className="text-sm text-slate-500">Generating personalized recommendations...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
            <div className="h-3 bg-slate-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'from-green-500 to-emerald-500';
    if (confidence >= 0.6) return 'from-blue-500 to-indigo-500';
    if (confidence >= 0.4) return 'from-yellow-500 to-orange-500';
    return 'from-slate-400 to-slate-500';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">AI Therapeutic Guidance</h3>
            <p className="text-sm text-slate-500">Personalized recommendations generated</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getConfidenceColor(llmAdvice.confidence_score)} text-white shadow-sm`}>
            {(llmAdvice.confidence_score * 100).toFixed(0)}% confidence
          </div>
          <div className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
            {llmAdvice.model_used}
          </div>
        </div>
      </div>

      {/* Main Advice */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-slate-900">Therapeutic Recommendations</h4>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 border border-orange-200 rounded-xl p-6 shadow-sm">
          <div className="prose prose-sm max-w-none">
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap text-base">
              {llmAdvice.advice_text}
            </p>
          </div>
        </div>
      </div>

      {/* Therapeutic Techniques */}
      {llmAdvice.therapeutic_techniques.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Recommended Techniques</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {llmAdvice.therapeutic_techniques.map((technique, index) => (
              <div key={index} className="group bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:border-blue-300 transition-all duration-300 hover:shadow-md">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-blue-900">{technique}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Considerations */}
      {llmAdvice.considerations.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Clinical Considerations</h4>
          </div>
          
          <div className="space-y-3">
            {llmAdvice.considerations.map((consideration, index) => (
              <div key={index} className="flex items-start bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
                <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 shadow-sm">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{consideration}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {llmAdvice.next_steps.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Recommended Next Steps</h4>
          </div>
          
          <div className="space-y-3">
            {llmAdvice.next_steps.map((step, index) => (
              <div key={index} className="flex items-start bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 shadow-sm">
                  <span className="text-green-600 text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Reasoning */}
      <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-600 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h5 className="font-semibold text-slate-900 mb-1">AI Reasoning</h5>
            <p className="text-sm text-slate-600 leading-relaxed">{llmAdvice.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h5 className="font-semibold text-red-900 mb-1">Important Disclaimer</h5>
            <p className="text-sm text-red-700 leading-relaxed">
              This AI-generated advice is for educational purposes only and should not replace professional clinical judgment. 
              Always consult with qualified mental health professionals for patient care decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLMAdviceComponent; 