import React, { useState, useEffect } from 'react';
import * as esbuild from 'esbuild-wasm';
import { initializeEsbuild } from '../../utils/esbuild';

interface LivePreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  isResizing?: boolean;
}

const LivePreview: React.FC<LivePreviewProps> = ({ htmlCode, cssCode, jsCode }) => {
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize esbuild-wasm
  useEffect(() => {
    initializeEsbuild().catch((err) => {
      setErrors([`esbuild initialization failed: ${(err as Error).message}`]);
    });
  }, []);

  // Handle runtime errors from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'error') {
        setErrors([event.data.message]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Compile and render code
  useEffect(() => {
    const compileAndRender = async () => {
      console.time('compileAndRender');
      try {
        // Minimal preprocessing: only remove React imports
        const processedJS = jsCode
          .replace(/import\s+React\s+from\s+['"]react['"]\s*;/g, '')
          .replace(/import\s+.*?\s+from\s+['"]react-dom['"]\s*;/g, '');

        // Compile JSX to JavaScript
        const result = await esbuild.transform(processedJS, {
          loader: 'jsx',
          target: 'es2020',
        });

        const compiledJS = result.code;

        // Inject React and ReactDOM scripts from public/lib
        const reactScript = `
          <script src="/lib/react.development.js"></script>
          <script src="/lib/react-dom.development.js"></script>
        `;
// Build iframe content
const newSrcDoc = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline';">
      <style>${cssCode}</style>
      ${reactScript}
    </head>
    <body>
      ${htmlCode}
      <script>
        window.onerror = (msg, url, line, col, error) => {
          console.log('onerror:', { msg, url, line, col, error });
          if (msg === 'Script error.') return true; // Ignore generic Script error
          const message = error ? error.stack || error.message : String(msg);
          parent.postMessage({ type: 'error', message: message }, '*');
          return true;
        };
        try {
          // Wrap the render in a function to catch React errors
          const renderApp = () => {
            try {
              ${compiledJS}
            } catch (error) {
              console.log('catch:', error);
              parent.postMessage({ type: 'error', message: error.message || String(error) }, '*');
            }
          };
          renderApp();
        } catch (error) {
          console.log('catch:', error);
          parent.postMessage({ type: 'error', message: error.message || String(error) }, '*');
        }
      </script>
    </body>
  </html>
`;
        setSrcDoc(newSrcDoc);
        setErrors([]);
      } catch (err) {
        setErrors([`Compilation error: ${(err as Error).message}`]);
      }
      console.timeEnd('compileAndRender');
    };

    // Debounce updates for performance
    const timeout = setTimeout(compileAndRender, 500);
    return () => clearTimeout(timeout);
  }, [htmlCode, cssCode, jsCode]);

  return (
    // Apply mockup-browser classes and structure HERE
    <div className="mockup-browser border border-base-300 w-full h-full flex flex-col bg-base-200">
      {/* Add the toolbar */}
      <div className="mockup-browser-toolbar">
        <div className="input border border-base-300">http://localhost:preview</div>
      </div>

      {/* Wrap the ORIGINAL content below in a new div for the mockup's content area */}
      <div className="flex-grow flex flex-col overflow-hidden p-1">

        {/* --- Start of your original content --- */}
        {errors.length > 0 && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px', fontSize: '14px', flexShrink: 0 /* Prevent error div from shrinking */ }}>
            {errors.map((error, index) => (
              <p key={index}>Error: {error}</p>
            ))}
          </div>
        )}
        {/* Wrap iframe in a div that grows and provides positioning context */}
        <div className="flex-grow relative">
          <iframe
            srcDoc={srcDoc}
            title="Live Preview"
            sandbox="allow-scripts allow-modals"
            // Adjust style for absolute positioning within the new container
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
              // Add pointerEvents fix if needed:
              // pointerEvents: isResizing ? 'none' : 'auto'
            }}
          />
        </div>
        {/* --- End of your original content --- */}

      </div>
    </div>
  );

};

export default LivePreview;