import React from 'react';
import { TherapeuticResponse } from '../types/therapeutic';

interface EnhancedResultsComponentProps {
  therapeuticResponse: TherapeuticResponse;
  isLoading: boolean;
}

const EnhancedResultsComponent: React.FC<EnhancedResultsComponentProps> = ({ therapeuticResponse, isLoading }) => {
  const { similar_examples, primary_interventions, llm_advice } = therapeuticResponse.data;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'from-emerald-600 to-emerald-700';
    if (confidence >= 0.6) return 'from-blue-600 to-blue-700';
    if (confidence >= 0.4) return 'from-yellow-600 to-yellow-700';
    return 'from-red-600 to-red-700';
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.6) return 'from-emerald-600 to-emerald-700';
    if (similarity >= 0.4) return 'from-blue-600 to-blue-700';
    if (similarity >= 0.2) return 'from-yellow-600 to-yellow-700';
    return 'from-red-600 to-red-700';
  };

  if (isLoading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/40">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-3 text-slate-600 font-normal">Analyzing results...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
              {similar_examples.length}
            </div>
            <div className="text-sm text-slate-600 tracking-wide">Similar Cases</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {primary_interventions.length}
            </div>
            <div className="text-sm text-slate-600 tracking-wide">Primary Interventions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900 mb-2">
              {llm_advice ? '✓' : '✗'}
            </div>
            <div className="text-sm text-slate-600 tracking-wide">AI Guidance</div>
          </div>
        </div>
      </div>

      {/* Similar Cases Section */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/40 animate-sophisticated-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Similar Cases</h3>
            <p className="text-sm text-slate-600 font-normal">{similar_examples.length} cases found via semantic search</p>
          </div>
        </div>

        <div className="space-y-4">
          {similar_examples.map((example, index) => (
            <div key={index} className="bg-slate-50/60 rounded-xl p-6 border border-slate-200/40">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500 font-normal">Case ID: {example.conversation_id}</span>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getSimilarityColor(example.similarity_score)}`}>
                  {(example.similarity_score * 100).toFixed(0)}% Match
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Patient Question:</h4>
                  <p className="text-sm text-slate-700 font-normal leading-relaxed">{example.patient_question}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Counselor Response:</h4>
                  <p className="text-sm text-slate-700 font-normal leading-relaxed">{example.counselor_response}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Combined ML Insights & AI Guidance */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-slate-200/40 animate-sophisticated-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Therapeutic Analysis & Guidance</h3>
            <p className="text-sm text-slate-600 font-normal">ML-powered insights with AI-generated recommendations</p>
          </div>
        </div>

        {llm_advice && (
          <div className="space-y-8">
            {/* Primary Therapeutic Advice */}
            <div className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 rounded-xl p-6 border border-slate-200/40">
              <h4 className="text-lg font-bold text-slate-900 mb-4 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Primary Therapeutic Guidance</h4>
              <p className="text-slate-700 font-normal leading-relaxed mb-6">{llm_advice.advice_text}</p>
              
              {/* Connected ML Insights */}
              <div className="mb-6">
                <h5 className="text-md font-semibold text-slate-900 mb-3 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Evidence-Based Interventions Identified:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {primary_interventions.map((intervention, index) => (
                    <div key={index} className="bg-white/60 rounded-lg p-4 border border-slate-200/40">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900">{intervention.intervention}</span>
                        <div className={`px-2 py-1 rounded text-xs font-semibold text-white bg-gradient-to-r ${getConfidenceColor(intervention.confidence)}`}>
                          {(intervention.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getConfidenceColor(intervention.confidence)}`}
                          style={{ width: `${intervention.confidence * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Therapeutic Techniques */}
            {llm_advice.therapeutic_techniques && llm_advice.therapeutic_techniques.length > 0 && (
              <div className="bg-white/60 rounded-xl p-6 border border-slate-200/40">
                <h4 className="text-lg font-bold text-slate-900 mb-4 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Recommended Therapeutic Techniques</h4>
                <div className="space-y-4">
                  {llm_advice.therapeutic_techniques.map((technique, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-6 h-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 font-normal leading-relaxed">{technique}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Clinical Considerations */}
            {llm_advice.considerations && llm_advice.considerations.length > 0 && (
              <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-xl p-6 border border-amber-200/40">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Clinical Considerations</h4>
                </div>
                <div className="space-y-3">
                  {llm_advice.considerations.map((consideration, index) => (
                    <p key={index} className="text-slate-700 font-normal leading-relaxed">{consideration}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {llm_advice.next_steps && llm_advice.next_steps.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 rounded-xl p-6 border border-emerald-200/40">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Recommended Next Steps</h4>
                </div>
                <div className="space-y-3">
                  {llm_advice.next_steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-600 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-slate-700 font-normal leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            {llm_advice.reasoning && (
              <div className="bg-slate-50/60 rounded-xl p-6 border border-slate-200/40">
                <h4 className="text-lg font-bold text-slate-900 mb-4 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Analysis Reasoning</h4>
                <p className="text-slate-700 font-normal leading-relaxed">{llm_advice.reasoning}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-gradient-to-r from-slate-50/80 to-slate-100/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/40 animate-sophisticated-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>
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
  );
};

export default EnhancedResultsComponent; 