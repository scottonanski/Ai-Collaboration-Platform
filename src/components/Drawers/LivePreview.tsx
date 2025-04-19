// /home/scott/Documents/Projects/Business-Development/Web-Dev/collaboration/src/components/Drawers/LivePreview.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
// Removed esbuild imports as they are no longer needed for this example
// import * as esbuild from 'esbuild-wasm';
import { initializeEsbuild } from '../../utils/esbuild'; // Keep if needed for other potential uses, or remove

interface LivePreviewProps {
  htmlCode: string; // Keep props for potential future use, though not used in this specific srcDoc
  cssCode: string;
  jsCode: string;
  isResizing?: boolean;
}

const LivePreview: React.FC<LivePreviewProps> = ({
  // Props are destructured but might not be used directly in srcDoc generation below
  htmlCode,
  cssCode,
  jsCode,
  isResizing = false
}) => {
  const [srcDoc, setSrcDoc] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  // Keep esbuild state/refs in case you switch back to needing compilation
  const [isEsbuildInitialized, setIsEsbuildInitialized] = useState(false);
  const esbuildInitialized = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Initialize esbuild-wasm (can be kept or removed if esbuild is fully unused)
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
    setErrors([]); // Clear previous errors

    // --- Define the new HTML, CSS, JS directly ---
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
      .canvas { width: 100%; height: 100%; z-index: 1; display: block; /* Ensure canvas takes space */ }
      #fps-container { position: fixed; bottom: 10px; right: 10px; z-index: 1000; background-color: black; color: white; font-family: 'Poppins', sans-serif; font-weight: 700; border-radius: 10px; padding: 10px; text-align: center; pointer-events: none; }
      #fps-value { font-size: 32px; pointer-events: none; }
    `;

    const newJs = `
      try { // Wrap entire script in try...catch for safety
        const canvas = document.querySelector(".canvas");
        const context = canvas.getContext("2d");
        const fpsContainer = document.getElementById("fps-value");

        if (!canvas || !context || !fpsContainer) {
          throw new Error("Required elements not found");
        }

        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let mouseSize = 80;
        let lastMouseX = mouseX;
        let lastMouseY = mouseY;
        let mouseVelocityX = 0;
        let mouseVelocityY = 0;
        let trailStart = 0;
        let trailEnd = 0;
        const trailMax = 40;
        let lastTime = 0;
        let frameCount = 0;

        const particleColors = ["#F46036", "#2E294E", "#1B998B", "#E71D36", "#C5D86D"];
        const liquidTrail = new Array(trailMax).fill(null);

        function updateMousePosition(mouseEvent) {
          lastMouseX = mouseX;
          lastMouseY = mouseY;
          mouseX = mouseEvent.clientX;
          mouseY = mouseEvent.clientY;
          mouseVelocityX = mouseX - lastMouseX;
          mouseVelocityY = mouseY - lastMouseY;

          liquidTrail[trailEnd] = { x: mouseX, y: mouseY, size: mouseSize, opacity: 1 };
          trailEnd = (trailEnd + 1) % trailMax;
          if (trailEnd === trailStart) {
            trailStart = (trailStart + 1) % trailMax;
          }
        }

        class Particle {
          constructor(x, y, size, speedX, speedY, directionX, directionY, color) {
            this.x = x; this.y = y; this.size = size; this.speedX = speedX; this.speedY = speedY;
            this.directionX = directionX; this.directionY = directionY; this.friction = 0.98;
            this.minSpeed = 0.48; this.color = color;
          }
          draw() {
            context.fillStyle = this.color; context.beginPath();
            context.arc(this.x, this.y, this.size, 0, Math.PI * 2); context.fill();
          }
          update() {
            if (this.x <= this.size || this.x >= canvas.width - this.size) {
              this.directionX *= -1; this.speedX *= this.friction;
              this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
            }
            if (this.y <= this.size || this.y >= canvas.height - this.size) {
              this.directionY *= -1; this.speedY *= this.friction;
              this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
            }
            this.x += this.speedX * this.directionX; this.y += this.speedY * this.directionY;

            const dx = this.x - mouseX; const dy = this.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.size + mouseSize) {
              const forceX = (dx / (distance || 1)) * (mouseVelocityX * 0.1);
              const forceY = (dy / (distance || 1)) * (mouseVelocityY * 0.1);
              this.speedX += forceX; this.speedY += forceY;
              if (distance < mouseSize + this.size) {
                const overlap = mouseSize + this.size - distance;
                this.x += (dx / (distance || 1)) * overlap; this.y += (dy / (distance || 1)) * overlap;
              }
            }
            this.speedX *= this.friction; this.speedY *= this.friction;
            const speed = Math.sqrt(this.speedX * this.speedX + this.speedY * this.speedY);
            if (speed < this.minSpeed && speed > 0) {
              const ratio = this.minSpeed / speed; this.speedX *= ratio; this.speedY *= ratio;
            }
            this.draw();
          }
          checkCollision(otherParticle) {
            const dx = this.x - otherParticle.x; const dy = this.y - otherParticle.y;
            const distance = Math.sqrt(dx * dx + dy * dy); const sizeSum = this.size + otherParticle.size;
            if (distance < sizeSum && distance > 0) {
              const angle = Math.atan2(dy, dx); const sinAngle = Math.sin(angle); const cosAngle = Math.cos(angle);
              const v1X = this.speedX * cosAngle + this.speedY * sinAngle; const v1Y = this.speedY * cosAngle - this.speedX * sinAngle;
              const v2X = otherParticle.speedX * cosAngle + otherParticle.speedY * sinAngle; const v2Y = otherParticle.speedY * cosAngle - otherParticle.speedX * sinAngle;
              const finalV1X = ((this.size - otherParticle.size) * v1X + otherParticle.size * 2 * v2X) / (this.size + otherParticle.size);
              const finalV2X = (this.size * 2 * v1X + (otherParticle.size - this.size) * v2X) / (this.size + otherParticle.size);
              this.speedX = finalV1X * cosAngle - v1Y * sinAngle; this.speedY = v1Y * cosAngle + finalV1X * sinAngle;
              otherParticle.speedX = finalV2X * cosAngle - v2Y * sinAngle; otherParticle.speedY = v2Y * cosAngle + finalV2X * sinAngle;
              const overlap = sizeSum - distance + 1;
              this.x += (dx / distance) * overlap * 0.5; this.y += (dy / distance) * overlap * 0.5;
              otherParticle.x -= (dx / distance) * overlap * 0.5; otherParticle.y -= (dy / distance) * overlap * 0.5;
            }
          }
        }

        const particles = [];
        function initializeParticles() {
          particles.length = 0; // Clear existing particles
          for (let i = 0; i < 600; i++) {
            const x = Math.random() * canvas.width; const y = Math.random() * canvas.height;
            const size = Math.random() * (25 - 1) + 1; const speedX = (Math.random() * 2 - 1) * 1.0;
            const speedY = (Math.random() * 2 - 1) * 1.0; const directionX = Math.random() > 0.5 ? 1 : -1;
            const directionY = Math.random() > 0.5 ? 1 : -1;
            const color = particleColors[Math.floor(Math.random() * particleColors.length)];
            particles.push(new Particle(x, y, size, speedX, speedY, directionX, directionY, color));
          }
        }

        function animate() {
          const now = performance.now(); const delta = now - lastTime; frameCount++;
          if (delta >= 1000) { fpsContainer.innerHTML = frameCount; frameCount = 0; lastTime = now; }
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.globalAlpha = 1;
          let index = trailStart;
          while (index !== trailEnd) {
            const trail = liquidTrail[index];
            if (trail) {
              trail.size *= 0.99; context.fillStyle = \`rgba(247, 203, 21, \${trail.opacity})\`;
              context.beginPath(); context.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2); context.fill();
              trail.opacity *= 0.98;
              if (trail.opacity <= 0.005) { liquidTrail[index] = null; }
            }
            index = (index + 1) % trailMax;
          }
          for (let i = 0; i < particles.length; i++) { particles[i].update(); }
          checkCollisions();
          context.fillStyle = "#F7CB15"; context.beginPath();
          context.arc(mouseX, mouseY, mouseSize, 0, Math.PI * 2); context.fill();
          requestAnimationFrame(animate);
        }

        function checkCollisions() {
          for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
              particles[i].checkCollision(particles[j]);
            }
          }
        }

        function scatterParticles(event) {
          console.log("Canvas clicked!");
          const clickX = event.clientX; const clickY = event.clientY;
          for (const particle of particles) {
            const dx = particle.x - clickX; const dy = particle.y - clickY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            console.log("Distance from clicked point: ", distance);
            if (distance < 120) {
              const angle = Math.random() * Math.PI * 2; const force = 25;
              particle.speedX = Math.cos(angle) * force; particle.speedY = Math.sin(angle) * force;
            }
          }
        }

        function canvasResize() {
          console.log("Canvas resized to: ", window.innerWidth, "x", window.innerHeight);
          canvas.width = window.innerWidth; canvas.height = window.innerHeight;
          canvas.style.backgroundColor = "#05171D";
          initializeParticles(); // Reinitialize particles on resize
        }

        window.addEventListener("mousemove", updateMousePosition);
        window.addEventListener("resize", canvasResize);
        canvas.addEventListener("click", scatterParticles);

        canvasResize(); // Initial size set
        // initializeParticles(); // Already called in canvasResize
        animate(); // Start animation

      } catch (error) {
        console.error("Error executing script:", error);
        // Optionally send error back to parent
        parent.postMessage({ type: 'error', message: 'Script execution error: ' + (error.message || String(error)) }, '*');
      }
    `;
    // --- End of new code definitions ---

    // --- Construct the srcDoc ---
    const newSrcDoc = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          {/* Removed CSP for simplicity, add back if needed */}
          <style>${newCss}</style>
          {/* Removed reactScript injection */}
        </head>
        <body>
          ${newHtml}
          {/* Use type="module" if the script uses imports, otherwise standard script tag */}
          <script>
            // Basic error handling wrapper
            window.onerror = (msg, url, line, col, error) => {
              console.error('onerror:', { msg, url, line, col, error });
              const message = error ? error.stack || error.message : String(msg);
              parent.postMessage({ type: 'error', message: \`[onerror] \${message}\` }, '*');
              return true; // Prevent default browser error handling
            };
            window.addEventListener('unhandledrejection', event => {
              console.error('unhandledrejection:', event.reason);
              parent.postMessage({ type: 'error', message: \`[unhandledrejection] \${event.reason?.message || String(event.reason)}\` }, '*');
              event.preventDefault();
            });

            // Inject the new JS code
            ${newJs}
          </script>
        </body>
      </html>
    `;
    // --- End of srcDoc construction ---

    setSrcDoc(newSrcDoc);
    console.timeEnd('updatePreview');

  }, [/* Keep dependencies empty or minimal if code is static */]); // Dependencies for useCallback

  // Debounce updates
  useEffect(() => {
    const timeout = setTimeout(() => {
      updatePreview();
    }, 500); // Debounce time
    return () => clearTimeout(timeout);
  }, [updatePreview]); // Depend on the memoized function

  // --- JSX remains the same ---
  return (
    <div className="mockup-browser border border-base-300 w-full h-full flex flex-col bg-base-200">
      <div className="mockup-browser-toolbar">
        <div className="input border border-base-300">http://localhost:preview</div>
      </div>
      <div className="flex-grow flex flex-col overflow-hidden p-1">
        {errors.length > 0 && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '8px', fontSize: '14px', flexShrink: 0 }}>
            {errors.map((error, index) => (
              <p key={index}>Error: {error}</p>
            ))}
          </div>
        )}
        <div className="flex-grow relative">
          <iframe
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Live Preview"
            sandbox="allow-scripts allow-same-origin" // allow-same-origin might be needed for canvas/resize
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%',
              height: '100%', border: 'none',
              pointerEvents: isResizing ? 'none' : 'auto'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
