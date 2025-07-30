import React from 'react';
import { SimilarExample } from '../types/therapeutic';

interface SimilarCasesComponentProps {
  similarExamples: SimilarExample[];
  isLoading?: boolean;
}

const SimilarCasesComponent: React.FC<SimilarCasesComponentProps> = ({ 
  similarExamples, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Similar Cases</h3>
            <p className="text-sm text-slate-500">Searching therapeutic database...</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!similarExamples || similarExamples.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Similar Cases</h3>
            <p className="text-sm text-slate-500">No similar cases found</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-slate-500">No similar therapeutic cases found in the database</p>
        </div>
      </div>
    );
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'from-green-500 to-emerald-500';
    if (score >= 0.6) return 'from-blue-500 to-indigo-500';
    if (score >= 0.4) return 'from-yellow-500 to-orange-500';
    return 'from-slate-400 to-slate-500';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Moderate Match';
    return 'Low Match';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Similar Cases</h3>
            <p className="text-sm text-slate-500">
              {similarExamples.length} case{similarExamples.length !== 1 ? 's' : ''} found via semantic search
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
          AI-Powered
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {similarExamples.map((example, index) => (
          <div key={example.conversation_id} className="group relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:shadow-md">
            {/* Case Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  #{index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Case {index + 1}</h4>
                  <p className="text-xs text-slate-500">ID: {example.conversation_id.slice(-8)}</p>
                </div>
              </div>
              
              {/* Similarity Score */}
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getSimilarityColor(example.similarity_score)} text-white shadow-sm`}>
                  {(example.similarity_score * 100).toFixed(0)}%
                </div>
                <p className="text-xs text-slate-500 mt-1">{getSimilarityLabel(example.similarity_score)}</p>
              </div>
            </div>

            {/* Patient Question */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">Patient Question</span>
              </div>
              <div className="bg-white rounded-lg p-3 border-l-4 border-red-500 shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed">
                  "{example.patient_question.length > 150 
                    ? `${example.patient_question.substring(0, 150)}...` 
                    : example.patient_question}"
                </p>
              </div>
            </div>

            {/* Counselor Response */}
            <div>
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-2">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">Counselor Response</span>
              </div>
              <div className="bg-white rounded-lg p-3 border-l-4 border-green-500 shadow-sm">
                <p className="text-sm text-slate-700 leading-relaxed">
                  "{example.counselor_response.length > 200 
                    ? `${example.counselor_response.substring(0, 200)}...` 
                    : example.counselor_response}"
                </p>
              </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h5 className="font-semibold text-blue-900 mb-1">Semantic Search Results</h5>
            <p className="text-sm text-blue-700 leading-relaxed">
              These cases are retrieved using advanced vector similarity search from our database of therapeutic conversations. 
              They provide context for understanding how similar situations have been approached therapeutically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimilarCasesComponent; 