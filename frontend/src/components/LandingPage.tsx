import React from 'react';
import BrainAscii from './BrainAscii';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/analyze');
  };

  return (
    <div>
      {/* Header */}
      <header className="relative bg-[#ebe8e6]/80 backdrop-blur-sm border-b border-slate-200/40 sticky top-0 z-50">
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
              onClick={handleGetStarted}
              className="px-6 py-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-lg font-semibold text-sm transition-all duration-300 hover:from-slate-800 hover:to-slate-600 hover:shadow-lg"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-80 bg-gradient-to-br from-slate-200/10 to-slate-300/10 rounded-full blur-3xl animate-slow-pulse"></div>
          </div>

          <div className="relative">
            <h2 className="text-6xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-tight" style={{ fontFamily: 'Butler, serif' }}>
              <span className="inline-block animate-sophisticated-fade-in bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent" style={{ animationDelay: '0.2s' }}>
                Cura,
              </span>
              <br />
              <span className="inline-block animate-sophisticated-fade-in text-slate-800" style={{ animationDelay: '0.6s' }}>
                Therapeutic Intelligence
              </span>
            </h2>

            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal animate-sophisticated-fade-in mb-12" style={{ animationDelay: '1s' }}>
              Advanced AI-powered insights to support clinical decision-making and enhance therapeutic outcomes.
            </p>

            <BrainAscii />            

            <button
              onClick={handleGetStarted}
              className="mb-12 mt-12 px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:from-slate-800 hover:to-slate-600 hover:shadow-xl hover:scale-105 animate-sophisticated-fade-in"
              style={{ animationDelay: '1.4s' }}
            >
              Start Analysis
            </button>

            <div className="flex justify-center space-x-8 text-sm animate-sophisticated-fade-in mb-8" style={{ animationDelay: '1.2s' }}>
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

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/40 animate-sophisticated-fade-in" style={{ animationDelay: '1.6s' }}>
            <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">AI-Powered Analysis</h3>
            <p className="text-slate-600 text-sm">Advanced machine learning algorithms analyze therapeutic patterns and provide evidence-based recommendations.</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/40 animate-sophisticated-fade-in" style={{ animationDelay: '1.8s' }}>
            <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Evidence-Based Insights</h3>
            <p className="text-slate-600 text-sm">Access to comprehensive therapeutic databases and clinical research for informed decision-making.</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-slate-200/40 animate-sophisticated-fade-in" style={{ animationDelay: '2s' }}>
            <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Personalized Guidance</h3>
            <p className="text-slate-600 text-sm">Tailored therapeutic recommendations based on individual patient characteristics and clinical context.</p>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-slate-200/40 mb-20 animate-sophisticated-fade-in" style={{ animationDelay: '2.2s' }}>
          <h3 className="text-2xl font-semibold text-slate-900 mb-8 text-center">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Input Query</h4>
              <p className="text-slate-600 text-sm">Describe the patient's situation or therapeutic challenge</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">AI Analysis</h4>
              <p className="text-slate-600 text-sm">Advanced algorithms analyze similar cases and patterns</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Generate Insights</h4>
              <p className="text-slate-600 text-sm">Evidence-based therapeutic recommendations</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">4</span>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Apply & Learn</h4>
              <p className="text-slate-600 text-sm">Implement strategies and track outcomes</p>
            </div>
          </div>
        </div>

        {/* Intervention Categories Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 border border-slate-200/40 mb-20 animate-sophisticated-fade-in" style={{ animationDelay: '2.4s' }}>
          <h3 className="text-2xl font-semibold text-slate-900 mb-8 text-center">Therapeutic Intervention Categories</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg hover:bg-white/50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Validation & Empathy</h4>
              <p className="text-slate-600 text-sm">Techniques to acknowledge and validate the patient's feelings and experiences.</p>
            </div>
            <div className="p-6 rounded-lg hover:bg-white/50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Cognitive Restructuring</h4>
              <p className="text-slate-600 text-sm">Methods to identify and challenge negative thought patterns.</p>
            </div>
            <div className="p-6 rounded-lg hover:bg-white/50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Psychoeducation</h4>
              <p className="text-slate-600 text-sm">Providing information and education about mental health conditions and coping strategies.</p>
            </div>
            <div className="p-6 rounded-lg hover:bg-white/50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Goal Setting & Action Planning</h4>
              <p className="text-slate-600 text-sm">Collaboratively setting realistic goals and developing actionable plans to achieve them.</p>
            </div>
            <div className="p-6 rounded-lg hover:bg-white/50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.874 4.874A8.966 8.966 0 002 12c0 4.97 4.03 9 9 9s9-4.03 9-9-4.03-9-9-9c-2.485 0-4.735 1.008-6.364 2.636m12.728 0A8.966 8.966 0 0122 12" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Emotional Regulation</h4>
              <p className="text-slate-600 text-sm">Strategies to manage and cope with overwhelming emotions.</p>
            </div>
            <div className="p-6 rounded-lg hover:bg-white/50 transition-colors duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-2">Mindfulness & Relaxation</h4>
              <p className="text-slate-600 text-sm">Techniques to promote present-moment awareness and reduce stress.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-sophisticated-fade-in" style={{ animationDelay: '2.4s' }}>
          <h3 className="text-3xl font-semibold text-slate-900 mb-4">Ready to Enhance Your Therapeutic Practice?</h3>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Join the future of evidence-based therapeutic decision-making. Start your first analysis now.
          </p>
          <button
            onClick={handleGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:from-slate-800 hover:to-slate-600 hover:shadow-xl hover:scale-105"
          >
            Begin Analysis
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-[#f5f3f2]/80 backdrop-blur-sm border-t border-slate-200/40 mt-20">
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

export default LandingPage; 