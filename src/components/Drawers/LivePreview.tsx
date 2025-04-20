// /home/scott/Documents/Projects/Business-Development/Web-Dev/collaboration/src/components/Drawers/LivePreview.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { initializeEsbuild } from '../../utils/esbuild';

interface LivePreviewProps {
  htmlCode: string;
  cssCode: string;
  jsCode: string;
  isResizing?: boolean;
}

const LivePreview: React.FC<LivePreviewProps> = ({ htmlCode, cssCode, jsCode, isResizing = false }) => {
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isEsbuildInitialized, setIsEsbuildInitialized] = useState(false);
  const esbuildInitialized = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize esbuild-wasm
  useEffect(() => {
    if (!esbuildInitialized.current) {
      esbuildInitialized.current = true;
      initializeEsbuild()
        .then(() => {
          console.log('esbuild initialized successfully (though may not be used).');
          setIsEsbuildInitialized(true);
        })
        .catch((err) => {
          console.error('esbuild initialization failed:', err);
          setErrors((prev) => [...prev, `esbuild initialization failed: ${(err as Error).message}`]);
          esbuildInitialized.current = false;
        });
    }
  }, []);

  // Handle runtime errors from iframe
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

  // Update srcDoc when code changes
  const updatePreview = useCallback(() => {
    console.time('updatePreview');
    setErrors([]);

    const newHtml = `
      <div id="fps-container">
        <p>FPS</p>
        <span id="fps-value"></span>
      </div>
      <canvas class="canvas"></canvas>
    `;

    const newCss = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { height: 100%; overflow: hidden; }
      .canvas { width: 100%; height: 100%; z-index: 1; display: block; }
      #fps-container { position: fixed; bottom: 10px; right: 10px; z-index: 1000; background-color: black; color: white; font-family: 'Poppins', sans-serif; font-weight: 700; border-radius: 10px; padding: 10px; text-align: center; pointer-events: none; }
      #fps-value { font-size: 32px; pointer-events: none; }
    `;

    const newJs = `
      try {
        const canvas = document.querySelector(".canvas");
        const context = canvas.getContext("2d");
        const fpsContainer = document.getElementById("fps-value");
        if (!canvas || !context || !fpsContainer) throw new Error("Required elements not found");
        let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2, mouseSize = 80;
        let lastMouseX = mouseX, lastMouseY = mouseY, mouseVelocityX = 0, mouseVelocityY = 0;
        let trailStart = 0, trailEnd = 0; const trailMax = 40; let lastTime = 0, frameCount = 0;
        const particleColors = ["#F46036", "#2E294E", "#1B998B", "#E71D36", "#C5D86D"];
        const liquidTrail = new Array(trailMax).fill(null);
        function updateMousePosition(e) { lastMouseX = mouseX; lastMouseY = mouseY; mouseX = e.clientX; mouseY = e.clientY; mouseVelocityX = mouseX - lastMouseX; mouseVelocityY = mouseY - lastMouseY; liquidTrail[trailEnd] = { x: mouseX, y: mouseY, size: mouseSize, opacity: 1 }; trailEnd = (trailEnd + 1) % trailMax; if (trailEnd === trailStart) trailStart = (trailStart + 1) % trailMax; }
        class Particle { constructor(x, y, size, sx, sy, dx, dy, c) { this.x = x; this.y = y; this.size = size; this.speedX = sx; this.speedY = sy; this.directionX = dx; this.directionY = dy; this.friction = 0.98; this.minSpeed = 0.48; this.color = c; } draw() { context.fillStyle = this.color; context.beginPath(); context.arc(this.x, this.y, this.size, 0, Math.PI * 2); context.fill(); } update() { if (this.x <= this.size || this.x >= canvas.width - this.size) { this.directionX *= -1; this.speedX *= this.friction; this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x)); } if (this.y <= this.size || this.y >= canvas.height - this.size) { this.directionY *= -1; this.speedY *= this.friction; this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y)); } this.x += this.speedX * this.directionX; this.y += this.speedY * this.directionY; const dx = this.x - mouseX, dy = this.y - mouseY, dist = Math.sqrt(dx * dx + dy * dy); if (dist < this.size + mouseSize) { const fx = (dx / (dist || 1)) * (mouseVelocityX * 0.1), fy = (dy / (dist || 1)) * (mouseVelocityY * 0.1); this.speedX += fx; this.speedY += fy; if (dist < mouseSize + this.size) { const ov = mouseSize + this.size - dist; this.x += (dx / (dist || 1)) * ov; this.y += (dy / (dist || 1)) * ov; } } this.speedX *= this.friction; this.speedY *= this.friction; const sp = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY); if (sp < this.minSpeed && sp > 0) { const r = this.minSpeed / sp; this.speedX *= r; this.speedY *= r; } this.draw(); } checkCollision(o) { const dx = this.x - o.x, dy = this.y - o.y, dist = Math.sqrt(dx * dx + dy * dy), sizeSum = this.size + o.size; if (dist < sizeSum && dist > 0) { const ang = Math.atan2(dy, dx), sinA = Math.sin(ang), cosA = Math.cos(ang); const v1X = this.speedX * cosA + this.speedY * sinA, v1Y = this.speedY * cosA - this.speedX * sinA; const v2X = o.speedX * cosA + o.speedY * sinA, v2Y = o.speedY * cosA - o.speedX * sinA; const finalV1X = ((this.size - o.size) * v1X + o.size * 2 * v2X) / (this.size + o.size); const finalV2X = (this.size * 2 * v1X + (o.size - this.size) * v2X) / (this.size + o.size); this.speedX = finalV1X * cosA - v1Y * sinA; this.speedY = v1Y * cosA + finalV1X * sinA; o.speedX = finalV2X * cosA - v2Y * sinA; o.speedY = v2Y * cosA + finalV2X * sinA; const ov = sizeSum - dist + 1; this.x += (dx / dist) * ov * 0.5; this.y += (dy / dist) * ov * 0.5; o.x -= (dx / dist) * ov * 0.5; o.y -= (dy / dist) * ov * 0.5; } } }
        const particles = []; function initializeParticles() { particles.length = 0; for (let i = 0; i < 600; i++) { const x = Math.random() * canvas.width, y = Math.random() * canvas.height, size = Math.random() * (25 - 1) + 1, sx = (Math.random() * 2 - 1) * 1.0, sy = (Math.random() * 2 - 1) * 1.0, dx = Math.random() > 0.5 ? 1 : -1, dy = Math.random() > 0.5 ? 1 : -1, c = particleColors[Math.floor(Math.random() * particleColors.length)]; particles.push(new Particle(x, y, size, sx, sy, dx, dy, c)); } }
        function animate() { const now = performance.now(), delta = now - lastTime; frameCount++; if (delta >= 1000) { fpsContainer.innerHTML = frameCount; frameCount = 0; lastTime = now; } context.clearRect(0, 0, canvas.width, canvas.height); context.globalAlpha = 1; let idx = trailStart; while (idx !== trailEnd) { const t = liquidTrail[idx]; if (t) { t.size *= 0.99; context.fillStyle = \`rgba(247, 203, 21, \${t.opacity})\`; context.beginPath(); context.arc(t.x, t.y, t.size, 0, Math.PI * 2); context.fill(); t.opacity *= 0.98; if (t.opacity <= 0.005) liquidTrail[idx] = null; } idx = (idx + 1) % trailMax; } for (let i = 0; i < particles.length; i++) particles[i].update(); checkCollisions(); context.fillStyle = "#F7CB15"; context.beginPath(); context.arc(mouseX, mouseY, mouseSize, 0, Math.PI * 2); context.fill(); requestAnimationFrame(animate); }
        function checkCollisions() { for (let i = 0; i < particles.length; i++) for (let j = i + 1; j < particles.length; j++) particles[i].checkCollision(particles[j]); }
        function scatterParticles(e) { console.log("Canvas clicked!"); const cX = e.clientX, cY = e.clientY; for (const p of particles) { const dx = p.x - cX, dy = p.y - cY, dist = Math.sqrt(dx * dx + dy * dy); console.log("Distance:", dist); if (dist < 120) { const ang = Math.random() * Math.PI * 2, f = 25; p.speedX = Math.cos(ang) * f; p.speedY = Math.sin(ang) * f; } } }
        function canvasResize() { console.log("Resize:", window.innerWidth, "x", window.innerHeight); canvas.width = window.innerWidth; canvas.height = window.innerHeight; canvas.style.backgroundColor = "#05171D"; initializeParticles(); }
        window.addEventListener("mousemove", updateMousePosition); window.addEventListener("resize", canvasResize); canvas.addEventListener("click", scatterParticles);
        canvasResize(); animate();
      } catch (error) { console.error("Script Error:", error); parent.postMessage({ type: 'error', message: 'Script error: ' + (error.message || String(error)) }, '*'); }
    `;

    const newSrcDoc = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${newCss}</style>
        </head>
        <body>
          ${newHtml}
          <script>
            window.onerror = (msg, url, line, col, error) => { console.error('onerror:', { msg, url, line, col, error }); const message = error ? error.stack || error.message : String(msg); parent.postMessage({ type: 'error', message: \`[onerror] \${message}\` }, '*'); return true; };
            window.addEventListener('unhandledrejection', event => { console.error('unhandledrejection:', event.reason); parent.postMessage({ type: 'error', message: \`[unhandledrejection] \${event.reason?.message || String(event.reason)}\` }, '*'); event.preventDefault(); });
            ${newJs}
          </script>
        </body>
      </html>
    `;

    setSrcDoc(newSrcDoc);
    console.timeEnd('updatePreview');
  }, []); // Keep dependencies empty as code is static

  // Debounce updates
  useEffect(() => {
    const timeout = setTimeout(() => {
      updatePreview();
    }, 500);
    return () => clearTimeout(timeout);
  }, [updatePreview]);

  return (
    // Add role="region" and aria-label to the main container
    <div
      className="mockup-browser border border-base-300 w-full h-full flex flex-col bg-base-200"
      role="region"
      aria-label="Live Preview Area"
      data-component="LivePreview"
    >
      <div className="mockup-browser-toolbar">
        <div className="input border border-base-300">http://localhost:preview</div>
      </div>
      {/* Add role="region" and aria-label to the content container */}
      <div className="flex-grow flex flex-col overflow-hidden p-1" role="region" aria-label="Preview Content">
        {errors.length > 0 && (
          // Optional: Add role="alert" if errors appear dynamically and need immediate attention
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '8px',
              fontSize: '14px',
              flexShrink: 0,
            }} /* role="alert" */
          >
            {errors.map((error, index) => (
              <p key={index}>Error: {error}</p>
            ))}
          </div>
        )}
        <div className="flex-grow relative">
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Live Preview" // Keep the title attribute
            sandbox="allow-scripts allow-same-origin"
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
