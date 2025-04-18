import React, { useState, useEffect } from 'react';
import * as esbuild from 'esbuild-wasm';
import { initializeEsbuild } from '../../utils/esbuild';

interface LivePreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
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
                const message = error && (error.stack || error.message) ? (error.stack || error.message) : String(msg);
                parent.postMessage({ type: 'error', message }, '*');
                return true;
              };
              try {
                ${compiledJS}
              } catch (error) {
                parent.postMessage({ type: 'error', message: error && (error.stack || error.message) ? (error.stack || error.message) : String(error) }, '*');
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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {errors.length > 0 && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px', fontSize: '14px' }}>
          {errors.map((error, index) => (
            <p key={index}>Error: {error}</p>
          ))}
        </div>
      )}
      <iframe
        srcDoc={srcDoc}
        title="Live Preview"
        sandbox="allow-scripts allow-modals"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  );
};

export default LivePreview;