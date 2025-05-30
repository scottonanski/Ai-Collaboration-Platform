import React, { useState, useEffect, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { initializeEsbuild } from '../../utils/esbuild';
import { useCollaborationStore } from '../../store/collaborationStore';
import { RefreshCw, Maximize2, Smartphone, Tablet, Monitor } from 'lucide-react';

interface LivePreviewProps {
  isResizing?: boolean;
}

/**
 * Enhanced Live Preview with real-time code execution and responsive design testing
 */
const LivePreview: React.FC<LivePreviewProps> = ({ isResizing = false }) => {
  const codeContent = useCollaborationStore((state) => state.codeContent);
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEsbuildInitialized, setIsEsbuildInitialized] = useState(false);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const esbuildInitialized = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize esbuild for JS bundling
  useEffect(() => {
    if (!esbuildInitialized.current) {
      esbuildInitialized.current = true;
      initializeEsbuild()
        .then(() => {
          setIsEsbuildInitialized(true);
        })
        .catch((err) => {
          console.error('esbuild initialization failed:', err);
          setErrors((prev) => [...prev, `esbuild initialization failed: ${(err as Error).message}`]);
          esbuildInitialized.current = false;
        });
    }
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return;
      
      if (event.data?.type === 'error') {
        setErrors((prevErrors) => {
          const newError = String(event.data.message || 'Unknown iframe error');
          return prevErrors.includes(newError) ? prevErrors : [...prevErrors, newError];
        });
      } else if (event.data?.type === 'console') {
        console.log('[Preview Console]:', event.data.message);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const updatePreview = useCallback(() => {
    console.time('updatePreview');
    setErrors([]);

    const sanitizedHtml = DOMPurify.sanitize(codeContent.html || `
      <div id="root">
        <h1>🚀 AI Collaboration Live Preview</h1>
        <p>Start coding in the Code tabs to see your work come to life!</p>
        <div class="feature-showcase">
          <h2>✨ Enhanced Features</h2>
          <ul>
            <li>🔄 Real-time code execution</li>
            <li>📱 Responsive design testing</li>
            <li>🎨 Live CSS preview</li>
            <li>⚡ JavaScript interaction</li>
            <li>🤖 AI-powered collaboration</li>
          </ul>
        </div>
      </div>
    `);

    const enhancedCSS = `
      /* Base responsive styles */
      * { box-sizing: border-box; }
      body { 
        margin: 0; 
        padding: 20px; 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
      }
      
      /* Enhanced default styles */
      .feature-showcase {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
      }
      
      .feature-showcase ul {
        list-style: none;
        padding: 0;
      }
      
      .feature-showcase li {
        padding: 8px 0;
        border-bottom: 1px solid rgba(255,255,255,0.2);
      }
      
      .feature-showcase li:last-child {
        border-bottom: none;
      }
      
      /* Responsive breakpoints */
      @media (max-width: 768px) {
        body { padding: 10px; }
        h1 { font-size: 1.5em; }
      }
      
      /* User custom CSS */
      ${codeContent.css || ''}
    `;

    const enhancedJS = `
      // Enhanced console logging for preview
      const originalConsole = console;
      console.log = function(...args) {
        originalConsole.log(...args);
        window.parent.postMessage({
          type: 'console',
          message: args.join(' ')
        }, '*');
      };
      
      // Error handling
      window.onerror = function(message, source, lineno, colno, error) {
        window.parent.postMessage({
          type: 'error',
          message: message,
          source: source,
          line: lineno
        }, '*');
        return true;
      };
      
      // User custom JavaScript
      try {
        ${codeContent.js || `
          // Default interactive demo
          document.addEventListener('DOMContentLoaded', function() {
            console.log('🚀 AI Collaboration Preview Loaded!');
            
            // Add some interactive elements if they don't exist
            if (!document.querySelector('.interactive-demo')) {
              const demo = document.createElement('div');
              demo.className = 'interactive-demo';
              demo.innerHTML = \`
                <h3>🎮 Interactive Demo</h3>
                <button id="magicBtn" style="background: #ff6b6b; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px 0;">
                  ✨ Click for Magic!
                </button>
                <div id="magicOutput" style="margin-top: 10px; padding: 10px; background: #f0f0f0; border-radius: 5px; min-height: 40px;"></div>
              \`;
              
              document.body.appendChild(demo);
              
              // Add interactivity
              const btn = document.getElementById('magicBtn');
              const output = document.getElementById('magicOutput');
              let clickCount = 0;
              
              btn.addEventListener('click', function() {
                clickCount++;
                const emojis = ['🎉', '🚀', '✨', '🎯', '💫', '🔥', '⚡', '🌟'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                output.innerHTML = \`\${randomEmoji} Magic happened! Click #\${clickCount}\`;
                output.style.background = \`hsl(\${Math.random() * 360}, 70%, 90%)\`;
              });
            }
          });
        `}
      } catch (error) {
        console.error('JavaScript execution error:', error);
        window.parent.postMessage({
          type: 'error',
          message: 'JavaScript Error: ' + error.message
        }, '*');
      }
    `;

    const newSrcDoc = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AI Collaboration Preview</title>
          <style>${enhancedCSS}</style>
        </head>
        <body>
          ${sanitizedHtml}
          <script>${enhancedJS}</script>
        </body>
      </html>
    `;

    setSrcDoc(newSrcDoc);
    console.timeEnd('updatePreview');
  }, [codeContent.html, codeContent.css, codeContent.js]);

  useEffect(() => {
    setIsUpdating(true);
    const timeout = setTimeout(() => {
      updatePreview();
      setIsUpdating(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [codeContent.html, codeContent.css, codeContent.js, updatePreview]);

  const getViewportDimensions = () => {
    switch (viewportMode) {
      case 'mobile': return { width: '375px', height: '667px' };
      case 'tablet': return { width: '768px', height: '1024px' };
      default: return { width: '100%', height: '100%' };
    }
  };

  const refreshPreview = () => {
    updatePreview();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`mockup-browser border border-base-300 w-full h-full flex flex-col bg-base-200 ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
      role="region"
      aria-label="Live Preview Area"
      data-component="LivePreview"
    >
      <div className="mockup-browser-toolbar flex items-center justify-between">
        <div className="input border border-base-300 flex-grow">
          http://localhost:preview
        </div>
        
        {/* Viewport Controls */}
        <div className="flex items-center gap-2 px-2">
          <button
            onClick={() => setViewportMode('desktop')}
            className={`btn btn-xs ${viewportMode === 'desktop' ? 'btn-primary' : 'btn-ghost'}`}
            title="Desktop View"
          >
            <Monitor size={12} />
          </button>
          <button
            onClick={() => setViewportMode('tablet')}
            className={`btn btn-xs ${viewportMode === 'tablet' ? 'btn-primary' : 'btn-ghost'}`}
            title="Tablet View"
          >
            <Tablet size={12} />
          </button>
          <button
            onClick={() => setViewportMode('mobile')}
            className={`btn btn-xs ${viewportMode === 'mobile' ? 'btn-primary' : 'btn-ghost'}`}
            title="Mobile View"
          >
            <Smartphone size={12} />
          </button>
          
          <div className="divider divider-horizontal"></div>
          
          <button
            onClick={refreshPreview}
            className="btn btn-xs btn-ghost"
            title="Refresh Preview"
          >
            <RefreshCw size={12} />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="btn btn-xs btn-ghost"
            title="Toggle Fullscreen"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col overflow-hidden p-1" role="region" aria-label="Preview Content">
        {errors.length > 0 && (
          <div className="bg-error text-error-content p-2 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                {errors.map((error, index) => (
                  <p key={index}>❌ {error}</p>
                ))}
              </div>
              <button onClick={() => setErrors([])} className="btn btn-xs btn-neutral">
                Dismiss
              </button>
            </div>
          </div>
        )}
        
        <div className="flex-grow relative flex items-center justify-center">
          {isUpdating && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-200/50 z-10">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          )}
          
          <div 
            className="relative border border-base-300 bg-white"
            style={{
              ...getViewportDimensions(),
              maxWidth: '100%',
              maxHeight: '100%',
              transition: 'all 0.3s ease'
            }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={srcDoc}
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                pointerEvents: isResizing ? 'none' : 'auto',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;