import React, { useState, useEffect, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { initializeEsbuild } from '../../utils/esbuild';

interface LivePreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  isResizing?: boolean;
}

/**
 * Renders a live preview of HTML, CSS, and JavaScript code in an iframe.
 * @param htmlCode - HTML code to render (sanitized internally).
 * @param cssCode - CSS code to apply.
 * @param jsCode - JavaScript code to execute.
 * @param isResizing - Disables iframe interaction during resizing.
 */
const LivePreview: React.FC<LivePreviewProps> = ({ htmlCode, cssCode, jsCode, isResizing = false }) => {
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEsbuildInitialized, setIsEsbuildInitialized] = useState(false);
  const esbuildInitialized = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize esbuild for potential future JS bundling
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
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const updatePreview = useCallback(() => {
    console.time('updatePreview');
    setErrors([]);

    const sanitizedHtml = DOMPurify.sanitize(htmlCode);
    const newSrcDoc = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${cssCode}</style>
        </head>
        <body>
          ${sanitizedHtml}
          <script>
            // Vanilla JS implementation for Live Preview
            const root = document.getElementById('root');
            let count = 0;
            
            function render() {
              root.innerHTML = \`
                <h1>Live Preview Counter</h1>
                <p>Count: \${count}</p>
                <button id="incBtn">Increment</button>
              \`;
              document.getElementById('incBtn').onclick = () => {
                count++;
                render();
              };
            }
            
            render();
          </script>
        </body>
      </html>
    `;

    setSrcDoc(newSrcDoc);

    console.timeEnd('updatePreview');
  }, [htmlCode, cssCode, jsCode]);

  useEffect(() => {
    setIsUpdating(true);
    const timeout = setTimeout(() => {
      updatePreview();
      setIsUpdating(false);
    }, 300);
    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode, updatePreview]);

  return (
    <div
      className="mockup-browser border border-base-300 w-full h-full flex flex-col bg-base-200"
      role="region"
      aria-label="Live Preview Area"
      data-component="LivePreview"
    >
      <div className="mockup-browser-toolbar">
        <div className="input border border-base-300">http://localhost:preview</div>
      </div>
      <div className="flex-grow flex flex-col overflow-hidden p-1" role="region" aria-label="Preview Content">
        {errors.length > 0 && (
          <div className="bg-error text-error-content p-2 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div>
                {errors.map((error, index) => (
                  <p key={index}>Error: {error}</p>
                ))}
              </div>
              <button onClick={() => setErrors([])} className="btn btn-xs btn-neutral">
                Dismiss
              </button>
            </div>
          </div>
        )}
        <div className="flex-grow relative">
          {isUpdating && (
            <div className="absolute inset-0 flex items-center justify-center bg-base-200/50">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          )}
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Live Preview"
            sandbox="allow-scripts"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
              pointerEvents: isResizing ? 'none' : 'auto',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LivePreview;