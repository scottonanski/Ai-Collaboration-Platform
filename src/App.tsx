// src/App.tsx
import "./App.css";
import React from "react";

function App() {
  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="hero bg-base-100 rounded-box shadow-xl">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">🚀 AI Collaboration Platform</h1>
              <p className="py-6">
                The ultimate platform for AI-human-AI collaboration with advanced features like live preview, 
                code execution, web research, mind mapping, and analytics.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="stat bg-primary text-primary-content rounded-box">
                  <div className="stat-title text-primary-content/70">Features</div>
                  <div className="stat-value text-2xl">12+</div>
                  <div className="stat-desc text-primary-content/70">Advanced Tools</div>
                </div>
                <div className="stat bg-secondary text-secondary-content rounded-box">
                  <div className="stat-title text-secondary-content/70">Status</div>
                  <div className="stat-value text-2xl">✅</div>
                  <div className="stat-desc text-secondary-content/70">Ready</div>
                </div>
              </div>
              <div className="mt-6">
                <button className="btn btn-primary btn-lg">
                  🎯 Start Collaboration
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">💬 AI Chat Interface</h2>
              <p>Advanced turn-based collaboration between AI workers with streaming responses.</p>
              <div className="card-actions justify-end">
                <div className="badge badge-primary">Core</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">💻 Live Code Editor</h2>
              <p>Real-time HTML, CSS, JavaScript editing with live preview and execution environment.</p>
              <div className="card-actions justify-end">
                <div className="badge badge-secondary">Advanced</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">🌐 Web Research</h2>
              <p>Integrated web browsing, API calls, and external tool integration.</p>
              <div className="card-actions justify-end">
                <div className="badge badge-accent">Pro</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">🧠 Mind Mapping</h2>
              <p>Interactive visual collaboration with draggable nodes and connections.</p>
              <div className="card-actions justify-end">
                <div className="badge badge-info">Visual</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">🧠 AI Memory</h2>
              <p>Advanced memory management with intelligent context compression.</p>
              <div className="card-actions justify-end">
                <div className="badge badge-warning">Smart</div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">📊 Analytics</h2>
              <p>Real-time collaboration flow visualization and performance metrics.</p>
              <div className="card-actions justify-end">
                <div className="badge badge-error">Insights</div>
              </div>
            </div>
          </div>
        </div>

        <div className="alert alert-info mt-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div>
            <h3 className="font-bold">🎉 Platform Status: Ready!</h3>
            <div className="text-xs">The AI collaboration platform is successfully loaded and ready for advanced interactions.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
