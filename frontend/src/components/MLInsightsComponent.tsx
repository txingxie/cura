import React from 'react';
import { InterventionPrediction } from '../types/therapeutic';

interface MLInsightsComponentProps {
  interventionPredictions: InterventionPrediction[];
  primaryInterventions: InterventionPrediction[];
  isLoading?: boolean;
}

const MLInsightsComponent: React.FC<MLInsightsComponentProps> = ({ 
  interventionPredictions, 
  primaryInterventions, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">ML Analysis</h3>
            <p className="text-sm text-slate-500">Analyzing intervention patterns</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-slate-100 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-16"></div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'from-slate-700 to-slate-800';
    if (confidence >= 0.6) return 'from-slate-600 to-slate-700';
    if (confidence >= 0.4) return 'from-slate-500 to-slate-600';
    return 'from-slate-400 to-slate-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Moderate Confidence';
    if (confidence >= 0.4) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  const sortedPredictions = [...interventionPredictions].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center mr-4 shadow-sm">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">ML Intervention Analysis</h3>
            <p className="text-sm text-slate-500">
              {primaryInterventions.length} primary intervention{primaryInterventions.length !== 1 ? 's' : ''} identified
            </p>
          </div>
        </div>
        <div className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
          Zero-Shot AI
        </div>
      </div>

      {/* Primary Interventions */}
      {primaryInterventions.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold text-slate-900">Primary Recommendations</h4>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {primaryInterventions.map((intervention, index) => (
              <div key={intervention.intervention} className="relative bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-xl p-5 shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <h5 className="font-semibold text-slate-900 text-lg">{intervention.label}</h5>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold bg-gradient-to-r ${getConfidenceColor(intervention.confidence)} text-white shadow-sm`}>
                      {(intervention.confidence * 100).toFixed(0)}%
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{getConfidenceLabel(intervention.confidence)}</p>
                  </div>
                </div>
                
                <div className="w-full bg-slate-300 rounded-full h-3 mb-3">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${getConfidenceColor(intervention.confidence)} transition-all duration-500`}
                    style={{ width: `${intervention.confidence * 100}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-slate-700 leading-relaxed">
                  High-confidence recommendation for this evidence-based therapeutic approach.
                </p>
                
                {/* Priority Badge */}
                <div className="absolute top-3 right-3">
                  <div className="px-2 py-1 bg-slate-700 text-white text-xs font-bold rounded-md">
                    PRIORITY
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Intervention Categories */}
      <div>
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center mr-3">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h4 className="text-lg font-semibold text-slate-900">All Intervention Categories</h4>
        </div>
        
        <div className="space-y-3">
          {sortedPredictions.map((prediction) => (
            <div key={prediction.intervention} className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <h5 className="font-semibold text-slate-900">{prediction.label}</h5>
                  {prediction.is_primary && (
                    <div className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                      Primary
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-gradient-to-r ${getConfidenceColor(prediction.confidence)} text-white`}>
                    {(prediction.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 bg-gradient-to-r ${getConfidenceColor(prediction.confidence)}`}
                  style={{ width: `${prediction.confidence * 100}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className={`flex items-center ${prediction.is_predicted ? 'text-slate-700' : 'text-slate-400'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${prediction.is_predicted ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                  {prediction.is_predicted ? 'Predicted' : 'Not predicted'}
                </span>
                <span>Confidence: {prediction.confidence.toFixed(3)}</span>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-slate-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200/50">
        <div className="flex items-start">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h5 className="font-semibold text-slate-900 mb-1">Zero-Shot Classification</h5>
            <p className="text-sm text-slate-700 leading-relaxed">
              This analysis uses advanced zero-shot classification to identify evidence-based therapeutic interventions. 
              Primary interventions (highlighted) are high-confidence recommendations based on the patient's situation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MLInsightsComponent; 