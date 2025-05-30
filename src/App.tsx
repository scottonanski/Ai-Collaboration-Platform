// src/App.tsx
import "./App.css";
import React, { useState } from "react";
import ChatInterface from "./components/ChatInterface/ChatInterface.tsx";
import ResizableDrawer from "./components/Drawers/ResizableDrawer.tsx";

function App() {
  const [showFullApp, setShowFullApp] = useState(false);
  const previewDrawerId = "PreviewDrawer";

  if (showFullApp) {
    return (
      <div className="min-h-screen bg-base-200">
        {/* Main Content with Chat Interface */}
        <div className="h-screen">
          <ChatInterface
            previewDrawerId={previewDrawerId}
          />
        </div>

        {/* Right Drawer - Preview & Tools (now includes File Tree) */}
        <ResizableDrawer 
          id={previewDrawerId} 
          mainContent={<div></div>}
        />
      </div>
    );
  }

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
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowFullApp(true)}
                >
                  🎯 Launch Full Collaboration Platform
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">💬 AI Chat Interface</h2>
              <p>Advanced turn-based collaboration between AI workers with streaming responses and enhanced controls.</p>
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
              <p>Advanced memory management with intelligent context compression and search.</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content">
            <div className="card-body">
              <h2 className="card-title">🎮 Interactive Features</h2>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Real-time code execution with multiple languages</li>
                <li>Drag-and-drop file system management</li>
                <li>Resizable panels and responsive design</li>
                <li>Multi-modal file uploads and processing</li>
                <li>Smart AI worker specialization</li>
              </ul>
            </div>
          </div>

          <div className="card bg-gradient-to-r from-accent to-warning text-accent-content">
            <div className="card-body">
              <h2 className="card-title">⚡ Advanced Capabilities</h2>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Web research with simulated API calls</li>
                <li>Context-aware memory management</li>
                <li>Collaboration flow analytics</li>
                <li>Interactive mind mapping canvas</li>
                <li>Live preview with responsive testing</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="alert alert-success mt-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold">🎉 Platform Ready!</h3>
            <div className="text-xs">All systems operational. Click "Launch Full Collaboration Platform" to begin.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
