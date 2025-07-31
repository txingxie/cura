import React, { useState } from 'react';

interface PatientInputFormProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
}

const PatientInputForm: React.FC<PatientInputFormProps> = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query.trim());
    }
  };

  return (
    <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8 overflow-hidden max-w-3xl mx-auto">
      {/* Refined Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-slate-200/10 to-transparent rounded-full blur-xl animate-slow-pulse"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-slate-300/10 to-transparent rounded-full blur-xl animate-slow-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <div className="relative text-center mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>
          Patient Analysis
        </h2>
        <p className="text-slate-600 text-base max-w-2xl mx-auto font-normal tracking-wide">
          Describe the patient's situation to receive AI-powered therapeutic guidance and evidence-based insights.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative space-y-8">
        {/* Patient Input */}
        <div>
          <div className="flex items-center mb-6">
            <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>Patient Description</h3>
          </div>
          
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Describe the patient's presenting concerns, symptoms, background, and current situation. Include relevant context such as age, presenting issues, recent events, and any specific therapeutic goals or challenges..."
              className={`w-full px-6 py-5 border-2 rounded-xl resize-none transition-all duration-500 text-slate-900 placeholder-slate-400 font-normal tracking-wide leading-relaxed ${
                isFocused 
                  ? 'border-slate-500 ring-4 ring-slate-500/10 shadow-lg' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              rows={6}
              disabled={isLoading}
              required
            />
            
            {/* Focus Effect */}
            {isFocused && (
              <div className="absolute inset-0 border-2 border-slate-500 rounded-xl animate-slow-pulse opacity-20 pointer-events-none"></div>
            )}
            
            <div className="absolute bottom-4 right-4 text-xs text-slate-400 transition-all duration-300">
              {query.length}/1000
            </div>
            
            {/* Character Count Indicator */}
            <div className="absolute bottom-4 left-4">
              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                query.length > 800 ? 'bg-red-400' : query.length > 600 ? 'bg-yellow-400' : 'bg-green-400'
              }`}></div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-slate-500 font-normal tracking-wide">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Provide comprehensive context for more accurate therapeutic recommendations
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={!query.trim() || isLoading}
            className={`group relative px-10 py-4 rounded-xl font-semibold text-base transition-all duration-500 transform focus:outline-none focus:ring-4 focus:ring-slate-500/10 tracking-wide ${
              !query.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg hover:shadow-xl hover:from-slate-800 hover:to-slate-600'
            }`}
          >
            {/* Button Background Animation */}
            <div className={`absolute inset-0 rounded-xl transition-all duration-500 ${
              !query.trim() || isLoading 
                ? 'bg-transparent' 
                : 'bg-gradient-to-r from-slate-800 to-slate-600 opacity-0 group-hover:opacity-100'
            }`} />
            
            <div className="relative flex items-center">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="animate-pulse">Analyzing Patient Scenario</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Generate Therapeutic Analysis
                </>
              )}
            </div>
          </button>
        </div>
      </form>

      {/* Features Preview */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z', title: 'Semantic Search', desc: 'Find similar therapeutic cases' },
            { icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', title: 'ML Classification', desc: 'Identify evidence-based interventions' },
            { icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', title: 'AI Guidance', desc: 'Generate personalized recommendations' }
          ].map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-105">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1 tracking-wide" style={{ fontFamily: 'Butler, serif' }}>{feature.title}</h4>
              <p className="text-sm text-slate-600 font-normal tracking-wide">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientInputForm; 