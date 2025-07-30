import React, { useState } from 'react';

interface PatientInputFormProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

const PatientInputForm: React.FC<PatientInputFormProps> = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');

  const predefinedScenarios = [
    {
      id: 'anxiety',
      label: 'Anxiety & Stress',
      description: 'I feel anxious about my job performance and keep doubting myself',
      icon: '😰',
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'depression',
      label: 'Depression & Low Mood',
      description: 'I\'ve been feeling down and unmotivated for weeks',
      icon: '😔',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'relationships',
      label: 'Relationship Issues',
      description: 'I\'m having trouble communicating with my partner',
      icon: '💔',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'trauma',
      label: 'Trauma & PTSD',
      description: 'I\'m struggling with memories from a past traumatic event',
      icon: '😨',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      id: 'grief',
      label: 'Grief & Loss',
      description: 'I\'m having difficulty coping with the loss of a loved one',
      icon: '😢',
      color: 'from-gray-500 to-slate-500'
    },
    {
      id: 'substance',
      label: 'Substance Use',
      description: 'I\'m concerned about my relationship with alcohol/drugs',
      icon: '🚬',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  const handleScenarioSelect = (scenario: string) => {
    setSelectedScenario(scenario);
    setQuery(scenario);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
          Patient Scenario Analysis
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Describe the patient's situation or select a predefined scenario to receive AI-powered therapeutic guidance
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Predefined Scenarios */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Common Scenarios</h3>
            <span className="ml-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">Quick Start</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedScenarios.map((scenario) => (
              <button
                key={scenario.id}
                type="button"
                onClick={() => handleScenarioSelect(scenario.description)}
                className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                  selectedScenario === scenario.description
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${scenario.color} flex items-center justify-center text-2xl shadow-md`}>
                    {scenario.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className={`font-semibold mb-1 ${
                      selectedScenario === scenario.description ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {scenario.label}
                    </h4>
                    <p className={`text-sm leading-relaxed ${
                      selectedScenario === scenario.description ? 'text-blue-700' : 'text-slate-600'
                    }`}>
                      {scenario.description}
                    </p>
                  </div>
                </div>
                
                {selectedScenario === scenario.description && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900">Custom Scenario</h3>
            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Detailed</span>
          </div>
          
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the patient's situation, symptoms, or concerns in detail..."
              className="w-full px-6 py-4 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-300 text-slate-900 placeholder-slate-400"
              rows={4}
              disabled={isLoading}
              required
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-400">
              {query.length}/500
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-slate-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Provide as much context as possible for more accurate therapeutic recommendations
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`group relative px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
              !query.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Patient Scenario...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Get AI Therapeutic Guidance
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Features Preview */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">Semantic Search</h4>
            <p className="text-sm text-slate-600">Find similar therapeutic cases</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">ML Classification</h4>
            <p className="text-sm text-slate-600">Identify evidence-based interventions</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-slate-900 mb-1">AI Guidance</h4>
            <p className="text-sm text-slate-600">Generate personalized recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInputForm; 