
### src/collaborationTypes.ts

```ts
// collaborationTypes.ts

export interface ChatMessage {
  id: string; // Changed from number to string
  senderName: string;
  role: "user" | "assistant" | "system";
  message: string;
  createdAt: string;
  type: "message";
}

export interface MemoryChunk {
  timestamp: string;
  summary: string;
}

export interface MemorySystemState {
  workingMemory: ChatMessage[];
  strategicMemory: MemoryChunk[];
}

export interface CollaborationControlState {
  currentTurn: number;
  totalTurns: number;
  currentModel: string;
  otherModel: string;
  isCollaborating: boolean;
  isPaused: boolean;
  currentPhase: "idle" | "processing" | "awaitingInput";
}

export interface CollaborationState {
  memory: MemorySystemState;
  control: CollaborationControlState;
}

export interface CollaborationTask {
  turns: number;
  worker1Model: string;
  worker2Model: string;
  worker1Name: string;
  worker2Name: string;
}```

### src/utils/esbuild.ts

```ts
import * as esbuild from 'esbuild-wasm';

let initialized = false;
let initializing: Promise<void> | null = null;

export const initializeEsbuild = async () => {
  if (initialized) return;
  if (initializing) return initializing;
  initializing = esbuild.initialize({
    wasmURL: '/esbuild.wasm',
    worker: true,
  }).then(() => {
    initialized = true;
    initializing = null;
    console.log('esbuild-wasm initialized successfully with version 0.25.2');
  }).catch((err) => {
    console.error('Failed to initialize esbuild:', err);
    initialized = false;
    initializing = null;
    throw err;
  });
  return initializing;
};```

### src/utils/CollaborationStateManager.ts

```ts
import { CollaborationState } from "../services/CollaborationService";

export const CollaborationStateManager = {
  save(state: CollaborationState): void {
    try {
      localStorage.setItem("collaborationState", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save collaboration state to localStorage:", error);
    }
  },

  load(): CollaborationState | null {
    try {
      const savedState = localStorage.getItem("collaborationState");
      return savedState ? JSON.parse(savedState) : null;
    } catch (error) {
      console.error("Failed to load collaboration state from localStorage:", error);
      return null;
    }
  },

  clear(): void {
    try {
      localStorage.removeItem("collaborationState");
    } catch (error) {
      console.error("Failed to clear collaboration state from localStorage:", error);
    }
  },
};```

### src/vite-env.d.ts

```ts
/// <reference types="vite/client" />
```

### src/index.css

```css
@import "tailwindcss";
@plugin "daisyui" {

  /* Litte Hack to Fix Element from creating scroll gutters */
  exclude: rootscrollgutter;
}

@plugin "daisyui/theme" {
  name: "system-default-theme";
  default: true;
  prefersdark: true;
  color-scheme: "dark";
  --color-base-100: oklch(26% 0.007 34.298);
  --color-base-200: oklch(20% 0 0);
  --color-base-300: oklch(26% 0 0);
  --color-base-content: oklch(97% 0 0);
  --color-primary:oklch(0.45 0.1 266.29);
  --color-primary-content: oklch(97% 0.014 308.299);
  --color-secondary: oklch(0.8 0.1 266.29);
  --color-secondary-content: oklch(96% 0.018 272.314);
  --color-accent: oklch(66% 0.179 58.318);
  --color-accent-content: oklch(100% 0 0);
  --color-neutral: oklch(20% 0 0);
  --color-neutral-content: oklch(98% 0 0);
  --color-info: oklch(0.4 0.1 266.29);
  --color-info-content: oklch(98% 0.019 200.873);
  --color-success: oklch(0.39 0.119 151.328);
  --color-success-content: oklch(98% 0.018 155.826);
  --color-warning: oklch(0.63 0.1559 70.08);
  --color-warning-content: oklch(98% 0.016 73.684);
  --color-error: oklch(50% 0.213 27.518);
  --color-error-content: oklch(97% 0.013 17.38);
  --radius-selector: 0.25rem;
  --radius-field: 0.25rem;
  --radius-box: 0.25rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 0.5px;
  --depth: 0;
  --noise: 0;
  --bubble-User: oklch(0.35 0.1 266.29);
}
.mockup-code pre span:nth-child(1) {
  margin-left: -1.112rem!important;
  padding-left: 0 !important;
}```

### src/components/ApiKeyForm/ApiKeyForm.tsx

```tsx
import React, { memo } from 'react';
import { Key } from 'lucide-react';

interface ApiKeyFormProps {
  apiProvider: string;
  setApiProvider: React.Dispatch<React.SetStateAction<string>>;
  apiKey: string;
  setApiKey: React.Dispatch<React.SetStateAction<string>>;
  apiProviders: string[];
  label: string;
  ariaLabel: string;
  extraClass?: string;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = memo(
  ({ apiProvider, setApiProvider, apiKey, setApiKey, apiProviders, label, ariaLabel, extraClass }) => {
    return (
      <div className={`form-control w-full ${extraClass || ''}`}>
        <label className="label">
          <span className="text-sm label-text mb-5">{label}</span>
        </label>
        <div className="flex gap-4 mb-4">
          {apiProviders.map((provider) => (
            <label
              key={provider}
              className="flex items-center gap-2 cursor-pointer text-sm text-zinc-500 hover:text-zinc-300 peer-checked:text-zinc-100"
            >
              <input
                type="radio"
                name={`api-provider-${label.replace(/\s+/g, '-')}`}
                checked={apiProvider === provider}
                onChange={() => setApiProvider(provider)}
                className="radio radio-sm peer"
                aria-label={`${provider} provider for ${ariaLabel}`}
              />
              <span>{provider}</span>
            </label>
          ))}
        </div>
        <label className="input input-bordered input-sm flex items-center gap-2 w-full">
          <Key size={16} className="opacity-70" />
          <input
            type="password"
            className="grow w-full"
            placeholder={label}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            aria-label={ariaLabel}
          />
        </label>
      </div>
    );
  }
);

export default ApiKeyForm;```

### src/components/LLMStatusIndicator/LLMStatusIndicator.tsx

```tsx
import React from "react";

export type LLMStatus = "disconnected" | "connected" | "error";

interface LLMStatusIndicatorProps {
  status: LLMStatus;
}

const statusConfig: Record<
  LLMStatus,
  { color: string; text: string; ariaLabel: string; textColor: string }
> = {
  disconnected: {
    color: "bg-gray-500",
    text: "Models not connected...",
    ariaLabel: "Models are not connected",
    textColor: "text-gray-500",
  },
  connected: {
    color: "bg-green-500",
    text: "Models are connected! Ready!",
    ariaLabel: "Models are connected and ready",
    textColor: "text-green-500",
  },
  error: {
    color: "bg-red-500",
    text: "Models failed to connect!",
    ariaLabel: "Models failed to connect",
    textColor: "text-red-500",
  },
};

const LLMStatusIndicator: React.FC<LLMStatusIndicatorProps> = ({ status }) => {
    const { color, text, ariaLabel, textColor } = statusConfig[status];
  
    return (
      <section
        aria-label="LLM Connection Status"
        role="status"
        className="flex items-center gap-2"
        data-component="LLMStatusIndicator"
      >
        <span
          className={`inline-block w-2 h-2 rounded-full ${color}`}
          aria-hidden="true"
          data-element="status-dot"
        />
        <span className={`text-sm ${textColor}`} aria-live="polite" aria-label={ariaLabel}>
          {text}
        </span>
      </section>
    );
  };
  
  export default LLMStatusIndicator;```

### src/components/Button/Button.tsx

```tsx
import React from "react";

// Define the Button Component Colors;
type ButtonColor =
  | "primary"
  | "secondary"
  | "warning"
  | "error"
  | "ghost"
  | "default";

// Define the possible shapes
type ButtonShape = "circle" | "square";

// Set the interface for the button Components;
interface ButtonProperties {
  children?: React.ReactNode;
  color?: ButtonColor;
  shape?: ButtonShape;
  block?: boolean;
  wide?: boolean;
  soft?: boolean;
  // Allows any other properties (like onClick, type, etc.)
  [key: string]: any;
}

// Create the Button Component;
const Button: React.FC<ButtonProperties> = ({
  children,
  color,
  shape,
  block,
  wide,
  soft,
  ...otherProps
}) => {
  // Define the button size class.
  const baseClass = "btn btn-sm";

  // Determine the button color class based on the 'color' property.
  let colorClass = "";
  let isGhost = false;
  if (color === "primary") {
    colorClass = "btn-primary";
  } else if (color === "secondary") {
    colorClass = "btn-secondary";
  } else if (color === "warning") {
    colorClass = "btn-warning";
  } else if (color === "error") {
    colorClass = "btn-error";
  } else if (color === "ghost") {
    colorClass = "btn-ghost";
    isGhost = true;
  }

  // Determine the shape class based on the 'shape' property
  let shapeClass = "";
  if (shape === "circle") {
    shapeClass = "btn-circle";
  } else if (shape === "square") {
    shapeClass = "btn-square";
  }

  // Determine the width class ('wide' checked first based on previous state)
  let widthClass = "";
  if (wide) {
    widthClass = "btn-wide";
  } else if (block) {
    widthClass = "btn-block";
  }

  // Determine the soft class, only if 'soft' is true AND it's not a ghost button
  const softClass = soft && !isGhost ? "btn-soft" : "";

  // Combine the classes;
  const combinedClasses =
    `${baseClass} ${colorClass} ${shapeClass} ${widthClass} ${softClass}`.trim();

  // The function will return the button component;
  return (
    <section
      role="button"
      aria-label={otherProps["aria-label"] || "Button"}
      className="inline-block"
      data-component="Button"
    >
      <button
        className={combinedClasses}
        disabled={otherProps.disabled}
        {...otherProps}
      >
        {children || (shape ? null : "Default")}
      </button>
    </section>
  );
};

export default Button;```

### src/components/ChatTextArea/ChatTextarea.tsx

```tsx
import React, { useRef, useState } from "react";

const PreviewDrawer: React.FC<{ onPreviewDrawerChange: (isOpen: boolean) => void }> = ({ onPreviewDrawerChange }) => {
  const [drawerWidth] = useState<number>(384);
  const drawerContentRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="tooltip tooltip-top"
      data-tip="Preview"
      aria-label="Preview Drawer Tooltip"
      role="region"
      data-component="PreviewDrawer"
    >
      <aside className="drawer drawer-end" aria-label="Preview Drawer" role="complementary">
        <input
          id="preview-drawer"
          type="checkbox"
          className="drawer-toggle"
          onChange={(e) => onPreviewDrawerChange(e.target.checked)}
          aria-label="Toggle Preview Drawer"
        />
        <nav
          className="drawer-side z-100"
          aria-label="Preview Drawer Side"
          role="region"
        >
          <label htmlFor="preview-drawer" className="drawer-overlay" aria-label="Close Preview Drawer" />
          <section
            ref={drawerContentRef}
            className="menu bg-base-200 min-h-full p-4 relative"
            style={{ width: `${drawerWidth}px`, minWidth: "25%" }}
            aria-label="Preview Drawer Content"
            role="region"
          >
            {/* Drawer content goes here */}
          </section>
        </nav>
      </aside>
    </section>
  );
};

export default PreviewDrawer;```

### src/components/WorkerForm/WorkerForm.tsx

```tsx
import React, { memo, useRef, useEffect } from 'react';

interface WorkerFormProps {
  workerName: string;
  setWorkerName: React.Dispatch<React.SetStateAction<string>>;
  workerModel: string;
  setWorkerModel: React.Dispatch<React.SetStateAction<string>>;
  availableModels: string[];
  isLoadingModels: boolean;
  workerId: string;
  workerLabel: string;
}

const WorkerForm: React.FC<WorkerFormProps> = memo(
  ({
    workerName,
    setWorkerName,
    workerModel,
    setWorkerModel,
    availableModels,
    isLoadingModels,
    workerId,
    workerLabel,
  }) => {
    const isNameEmpty = workerName.trim() === '';
    const detailsRef = useRef<HTMLDetailsElement>(null);

    useEffect(() => {
      const handleOutsideClick = (event: MouseEvent) => {
        if (!detailsRef.current || !detailsRef.current.open) return;

        const target = event.target as Node;
        const isClickInside = detailsRef.current.contains(target);

        if (!isClickInside) {
          detailsRef.current.open = false;
        }
      };

      const handleSummaryClick = (event: MouseEvent) => {
        event.stopPropagation();
      };

      document.addEventListener('mousedown', handleOutsideClick);
      const summary = detailsRef.current?.querySelector('summary');
      if (summary) {
        summary.addEventListener('click', handleSummaryClick);
      }

      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
        if (summary) {
          summary.removeEventListener('click', handleSummaryClick);
        }
      };
    }, []);

    return (
      <section
        role="region"
        aria-labelledby={`${workerId}-config-heading`}
        className="flex flex-col gap-6"
      >
        <h3 id={`${workerId}-config-heading`} className="sr-only">
          {workerLabel} Configuration
        </h3>
        <div className={`${workerId} form-control flex flex-col gap-6 md:flex-row md:gap-8`}>
          <div className="flex-1">
            <label className="label">
              <span className="text-sm label-text">{workerLabel} Name</span>
              {isNameEmpty && (
                <span className="text-sm text-error ml-2">Required</span>
              )}
            </label>
            <input
              type="text"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              className={`input input-sm w-full ${isNameEmpty ? 'input-error' : ''}`}
              aria-label={`${workerLabel} Name`}
              aria-invalid={isNameEmpty}
              aria-describedby={isNameEmpty ? `${workerId}-name-error` : undefined}
            />
          </div>
          <div className="flex-1">
            <label className="label">
              <span className="text-sm label-text">{workerLabel} Model</span>
            </label>
            <details className="dropdown w-full" ref={detailsRef}>
              <summary
                className={`btn btn-sm text-left w-full ${
                  isLoadingModels || availableModels.length === 0 ? 'btn-disabled' : ''
                }`}
                aria-label={`Select ${workerLabel} Model, current selection: ${workerModel || 'None'}`}
              >
                {isLoadingModels ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : workerModel || (availableModels.length === 0 ? 'No models available' : 'Select Model')}
              </summary>
              {!isLoadingModels && availableModels.length > 0 ? (
                <ul
                  className="flex flex-col dropdown-content bg-zinc-900 z-20 w-full shadow-lg mt-1 overflow-y-auto overflow-x-hidden max-h-[200px]"
                  role="menu"
                  aria-label={`${workerLabel} Model Options`}
                >
                  {availableModels.map((model) => (
                    <li key={`${workerId}-${model}`} role="menuitem" className="w-full">
                      <a
                        href="#"
                        className="block text-ellipsis text-sm overflow-hidden whitespace-nowrap my-1 p-1 pl-3 hover:bg-amber-800 transition-colors duration-200 ease-in-out"
                        onClick={(e) => {
                          e.preventDefault();
                          setWorkerModel(model);
                          const details = e.currentTarget.closest('details');
                          if (details) details.open = false;
                        }}
                      >
                        {model}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </details>
            {!workerModel && !isLoadingModels && availableModels.length > 0 && (
              <span className="text-xs text-gray-500 mt-2">
                Select a model to proceed
              </span>
            )}
          </div>
        </div>
      </section>
    );
  }
);

export default WorkerForm;```

### src/components/Drawers/FileTreeNode.tsx

```tsx
// /home/scott/Documents/Projects/Business-Development/Web-Dev/collaboration/src/components/Drawers/FileTreeNode.tsx
import React, { useState } from 'react';
// 1. Import Lucide icons
import { Folder, FolderOpen, File, FileCode2, Palette } from 'lucide-react';
// Import the type from FileTree.tsx or define it here if preferred
import { FileTreeNodeData } from './FileTree.tsx';

interface FileTreeNodeProps {
  node: FileTreeNodeData;
  level?: number;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, level = 0 }) => {
  // State to control the open/closed status, default to closed
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    setIsOpen(e.currentTarget.open);
  };

  const isFolder = node.type === 'folder';
  // Use rem for padding consistent with FileTree.tsx
  const indentStyle = { paddingLeft: `${level * 1}rem` };

  // 2. Determine the correct Lucide icon component
  let IconComponent;
  if (isFolder) {
    IconComponent = isOpen ? FolderOpen : Folder; // Dynamic icon based on state
  } else {
    switch (node.fileType) {
      case 'js':
      case 'html':
        IconComponent = FileCode2;
        break;
      case 'css':
        IconComponent = Palette;
        break;
      default:
        IconComponent = File; // Generic file icon
    }
  }

  // 3. Define common icon props (size, strokeWidth, className)
  const iconProps = {
    size: 16,
    strokeWidth: 0.75,
    // Using zinc-300 for better visibility on dark bg based on previous context
    className: "mr-1 flex-shrink-0 stroke-zinc-300"
  };


  if (isFolder) {
    return (
      <li role="treeitem" aria-expanded={isOpen}>
        <details open={isOpen} onToggle={handleToggle}>
          <summary
            style={{ ...indentStyle, cursor: 'pointer', display: 'flex', alignItems: 'center' }} // Combine styles
            aria-label={`Folder: ${node.name}, ${isOpen ? 'expanded' : 'collapsed'}`}
          >
            {/* 4. Render the chosen Lucide icon */}
            <IconComponent {...iconProps} />
            {node.name}
          </summary>
          {node.children && node.children.length > 0 && (
            <ul role="group">
              {node.children.map((childNode) => (
                <FileTreeNode key={childNode.id} node={childNode} level={level + 1} />
              ))}
            </ul>
          )}
        </details>
      </li>
    );
  } else {
    // File node
    return (
      <li role="treeitem" aria-label={`File: ${node.name}`}>
        {/* Use a div for file item, apply indent */}
        <div style={{ ...indentStyle, display: 'flex', alignItems: 'center', cursor: 'pointer' /* Add cursor if clickable */ }}>
          {/* 4. Render the chosen Lucide icon */}
          <IconComponent {...iconProps} />
          {node.name}
        </div>
      </li>
    );
  }
};

export default FileTreeNode;
```

### src/components/Drawers/LivePreview.tsx

```tsx
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
```

### src/components/Drawers/DrawerHeaders.tsx

```tsx
import React from 'react';

interface DrawerHeaderProps {
  icon: React.ReactNode; // Expecting an icon component like <Folder /> or <EyeIcon />
  title: string;
  className?: string; // Optional additional classes
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ icon, title, className = '' }) => {
  return (
    <header
      className={`flex items-center gap-2 p-2 border-b border-base-content/20 mb-4 ${className}`}
      aria-label="Drawer Header"
      role="banner"
      data-component="DrawerHeader"
    >
      <span className="text-base-content/80" aria-hidden="true">{icon}</span>
      <h2 className="text-lg font-semibold text-base-content">{title}</h2>
    </header>
  );
};

export default DrawerHeader;```

### src/components/Drawers/FileTree.tsx

```tsx
import React from 'react';
// 1. Import FileTreeNode from the separate file
import FileTreeNode from './FileTreeNode.tsx';
// 2. Keep the type export if needed elsewhere, or remove if only used here/in FileTreeNode
export interface FileTreeNodeData {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'js' | 'css' | 'html' | 'other';
  children?: FileTreeNodeData[];
}

// 3. Remove the internal definition of FileTreeNode that was here

interface FileTreeProps {
  nodes: FileTreeNodeData[];
  ariaLabel?: string;
}

// This component now uses the imported FileTreeNode
const FileTree: React.FC<FileTreeProps> = ({ nodes, ariaLabel = "Project Files" }) => {
  return (
    <ul
      // Adjusted menu size and added padding
      className="menu menu-sm w-full p-2"
      role="tree"
      aria-label={ariaLabel}
      data-component="FileTree"
    >
      {nodes.map((node) => (
        // This will now render the component imported from FileTreeNode.tsx
        <FileTreeNode key={node.id} node={node} />
      ))}
    </ul>
  );
};

export default FileTree;
```

### src/components/Drawers/ResizableDrawer.tsx

```tsx
import React, { useRef, useState, useCallback } from "react";
import DrawerHeader from "./DrawerHeaders.tsx";
import { EyeIcon } from "lucide-react";
import TabbedGroup, { TabItem } from "./TabbedGroup.tsx";
import {
  CodeTabIcon,
  LivePreviewTabIcon,
  MarkdownTabIcon,
} from "./TabIcons.tsx";
import CodeSubTabs from "./CodeSubTabs.tsx";
import LivePreview from "./LivePreview.tsx";
import MarkdownRenderer from "./MarkdownRenderer.tsx";
import { MemoryChunk } from "../../collaborationTypes.ts";

interface DrawerProps {
  id: string;
  mainContent?: React.ReactNode;
  triggerContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
  strategicMemory?: MemoryChunk[]; // New prop for Strategic Memory
}

const MIN_WIDTH = 200;
const DEFAULT_WIDTH = 800;

const sampleMarkdown = `
# Project Preview

This tab displays a rendered preview of Markdown content.

## Features

*   Supports **GitHub Flavored Markdown**.
*   Uses \`react-markdown\`.

\`\`\`javascript
// Example code block
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

> Blockquote example.

---

Find out more at Example Link.
`;

const ResizableDrawer: React.FC<DrawerProps> = ({
  id = "ResizableDrawer",
  mainContent,
  className,
  style,
  zIndex = 100,
  strategicMemory = [], // Default to empty array
}) => {
  const [htmlCode] = useState('<div id="root"></div>');
  const [cssCode] = useState(
    "body { background-color: #f0f0f0; } h1 { color: purple; }"
  );
  const [jsCode] = useState(`
    // Example React code for Live Preview
    const App = () => {
      const [count, setCount] = React.useState(0);
      return (
        <div>
          <h1>Live Preview Counter</h1>
          <p>Count: {count}</p>
          <button onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>
      );
    };

    // Ensure React and ReactDOM are available in the iframe scope
    if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined') {
       const root = ReactDOM.createRoot(document.getElementById("root"));
       root.render(<App />);
    } else {
       console.error('React or ReactDOM not loaded in iframe');
       document.getElementById('root').innerHTML = 'Error: React/ReactDOM not found.';
    }
  `);

  const [drawerWidth, setDrawerWidth] = useState<number>(DEFAULT_WIDTH);
  const drawerContentRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(DEFAULT_WIDTH);

  const onMouseMove = useCallback((moveEvent: MouseEvent) => {
    const newWidth =
      startWidthRef.current - (moveEvent.clientX - startXRef.current);
    setDrawerWidth(Math.max(newWidth, MIN_WIDTH));
  }, []);

  const onMouseUp = useCallback(() => {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }, [onMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      startXRef.current = e.clientX;
      startWidthRef.current = drawerWidth;
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    },
    [drawerWidth, onMouseMove, onMouseUp]
  );

  // Convert Strategic Memory chunks to Markdown
  const strategicMemoryMarkdown = strategicMemory.length
    ? `# Strategic Memory\n\n${strategicMemory
        .map(
          (chunk) =>
            `**${chunk.timestamp}:** Summary: ${chunk.summary.replace(/\n/g, "\n\n")}`
        )
        .join("\n\n---\n\n")}`
    : `# Strategic Memory\n\nNo strategic memory yet.`;

  const previewTabs: TabItem[] = [
    {
      id: "preview-code",
      title: "Code",
      icon: <CodeTabIcon size={14} />,
      content: <CodeSubTabs />,
    },
    {
      id: "preview-live",
      title: "Live Preview",
      icon: <LivePreviewTabIcon size={14} />,
      content: (
        <LivePreview htmlCode={htmlCode} cssCode={cssCode} jsCode={jsCode} />
      ),
    },
    {
      id: "preview-markdown",
      title: "Markdown",
      icon: <MarkdownTabIcon size={14} />,
      content: (
        <div className="p-4 overflow-y-auto h-full bg-base-100 rounded-md">
          <MarkdownRenderer
            markdownContent={strategicMemoryMarkdown}
            ariaLabel="Strategic Memory Markdown Preview"
          />
        </div>
      ),
    },
  ];

  return (
    <aside
      className={`drawer drawer-end${className ? " " + className : ""}`}
      style={style}
      data-component="ResizableDrawer"
      aria-label="Preview Drawer"
      role="complementary"
    >
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">{mainContent}</div>

      <nav
        className="drawer-side"
        style={{ zIndex }}
        aria-label="Preview Drawer Side"
        role="navigation"
        data-element="drawer-side"
      >
        <label
          htmlFor={id}
          aria-label="Close Preview Drawer"
          className="drawer-overlay"
        />
        <section
          ref={drawerContentRef}
          className="bg-zinc-800 text-base-content min-h-full h-full p-4 relative flex flex-col"
          style={{ width: `${drawerWidth}px`, minWidth: `${MIN_WIDTH}px` }}
          aria-label="Preview Drawer Content"
          role="region"
          data-element="drawer-content"
        >
          {/* Resize Handle */}
          <div
            className="absolute top-0 left-0 w-2 h-full bg-base-content/30 hover:bg-primary cursor-ew-resize z-10"
            onMouseDown={handleMouseDown}
            title="Resize Drawer"
            aria-label="Resize Drawer Handle"
            role="separator"
            aria-orientation="vertical"
            aria-valuenow={drawerWidth}
            aria-valuemin={MIN_WIDTH}
          />

          <header
            className="pl-2 flex-shrink-0 mb-2"
            aria-label="Drawer Header"
            role="banner"
          >
            <DrawerHeader
              icon={<EyeIcon size={20} />}
              title="Preview Project"
            />
          </header>

          <section
            className="pl-2 flex-grow overflow-hidden flex flex-col"
            aria-label="Preview Tabs Container"
            role="region"
            data-element="tabbed-group-container"
          >
            <TabbedGroup
              tabs={previewTabs}
              groupName="preview-project-tabs"
              defaultTabId="preview-code"
              id="project-preview-tab-group"
              data-testid="project-preview-tab-group"
              className="flex flex-col flex-grow"
            />
          </section>
        </section>
      </nav>
    </aside>
  );
};

export default ResizableDrawer;```

### src/components/Drawers/MarkdownRenderer.tsx

```tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface MarkdownRendererProps {
  markdownContent: string;
  ariaLabel?: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  markdownContent,
  ariaLabel = "Rendered Markdown Content",
  className = "",
}) => {
  if (!markdownContent?.trim()) {
    return null;
  }

  return (
    <article
      className={`prose prose-sm max-w-none prose-invert ${className}`.trim()}
      aria-label={ariaLabel}
      data-component="MarkdownRenderer"
      // Add the inline style here
      style={{ fontSize: "0.90rem" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {markdownContent}
      </ReactMarkdown>
    </article>
  );
};

export default MarkdownRenderer;
```

### src/components/Drawers/MockupCode.tsx

```tsx
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MockupCodeProps {
  code: string;
  language: string;
  className?: string;
}

const MockupCode: React.FC<MockupCodeProps> = ({ code, language, className = "" }) => (
  <div className={`mockup-code w-full h-full bg-zinc-900 rounded-md shadow-inner ${className}`}>
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      showLineNumbers
      customStyle={{
        height: "100%",
        width: "100%",
        margin: 0,
        background: "transparent",
        fontSize: "0.85rem",
        fontFamily: "Fira Mono, Menlo, monospace",
        padding: "0.85rem",
        textAlign: "left", // Force left alignment
        boxSizing: "border-box",
      }}
      codeTagProps={{
        style: { fontFamily: "inherit", textAlign: "left" }
      }}
      lineNumberStyle={{ minWidth: "2.5em", textAlign: "right", paddingRight: "1.5em" }}
    >
      {code}
    </SyntaxHighlighter>
  </div>
);

export default MockupCode;```

### src/components/Drawers/TabbedGroup.tsx

```tsx
import React, { useState, useEffect } from "react";


// Define the structure for a single tab item
export interface TabItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

// Props for the TabbedGroup component
interface TabbedGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: TabItem[];
  groupName: string;
  defaultTabId?: string;
  tabListClassName?: string;
  tabContentClassName?: string;
  onTabChange?: (tabId: string) => void;
}

const TabbedGroup: React.FC<TabbedGroupProps> = ({
  tabs,
  groupName,
  defaultTabId,
  className = "",
  tabListClassName = "",
  tabContentClassName = "p-4",
  onTabChange,
  ...rest
}) => {
  const getInitialTabId = () => {
    if (defaultTabId && tabs.some((tab) => tab.id === defaultTabId)) {
      return defaultTabId;
    }
    return tabs[0]?.id;
  };

  const [activeTabId, setActiveTabId] = useState<string | undefined>(
    getInitialTabId()
  );

  useEffect(() => {
    setActiveTabId(getInitialTabId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTabId, tabs]);

  const handleTabClick = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    if (tabId !== activeTabId) {
      setActiveTabId(tabId);
      if (onTabChange) {
        onTabChange(tabId);
      }
    }
  };

  const renderTabs = tabs;

  return (
    <section
      className={`flex flex-col h-full bg-zinc-800 ${className}`}
      data-component="TabbedGroup"
      data-group={groupName}
      aria-label={groupName}
      role="region"
      {...rest}
    >
      {/* Tab List Area */}
      <nav
        role="navigation"
        aria-label={`${groupName} Tabs Navigation`}
        className={`tabs tabs-lifted bg-zinc-800 ${tabListClassName}`}
        data-element="tab-list"
      >
        <div
          role="tablist"
          aria-label={`${groupName} Tabs`}
          className="flex w-full overflow-x-auto flex-nowrap scrollbar-thin scrollbar-thumb-base-content/30"
        >
          {renderTabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const baseTabStyles =
              "tab h-auto py-2 px-4 flex items-center gap-1.5 transition-colors duration-150 ease-in-out bg-zinc-800";
            const activeTabStyles = isActive
              ? "tab-active bg-zinc-800 [--tab-border-color:theme(colors.base-300)] border-b-0 rounded-t-lg"
              : "";
            const inactiveTabStyles = !isActive
              ? "text-base-content/60 border-b [--tab-border-color:theme(colors.base-300)]"
              : "";

            return (
              <a
                key={tab.id}
                id={`tab-label-${groupName}-${tab.id}`}
                role="tab"
                href="#"
                className={`${baseTabStyles} ${activeTabStyles} ${inactiveTabStyles}`}
                aria-selected={isActive}
                aria-controls={`tab-content-${groupName}-${tab.id}`}
                onClick={(e) => handleTabClick(e, tab.id)}
                data-element="tab"
                data-tab-id={tab.id}
              >
                {tab.icon && (
                  <span className="inline-flex items-center">{tab.icon}</span>
                )}
                <span>{tab.title}</span>
              </a>
            );
          })}
          {/* Dummy tab element for the bottom border line */}
          <a
            className="tab grow border-b [--tab-border-color:theme(colors.base-300)] bg-zinc-800"
            data-element="tab-border"
            tabIndex={-1}
            aria-hidden="true"
          ></a>
        </div>
      </nav>

      {/* Content Area Container */}
      <main
        className="relative flex-grow overflow-hidden bg-zinc-800"
        data-element="tab-content-container"
        aria-label={`${groupName} Tab Content`}
        role="main"
      >
        {renderTabs.map((tab) => (
          <section
  key={tab.id}
  id={`tab-content-${groupName}-${tab.id}`}
  role="tabpanel"
  className={`tab-content flex flex-col h-full w-full
    ${
      activeTabId === tab.id
        ? "opacity-100 transition-opacity duration-150 ease-in-out"
        : "opacity-0 pointer-events-none"
    }
    ${tabContentClassName} overflow-auto bg-zinc-800`}
  aria-labelledby={`tab-label-${groupName}-${tab.id}`}
  hidden={activeTabId !== tab.id}
  data-element="tab-panel"
  data-tab-id={tab.id}
>
  {tab.content}
</section>
        ))}
      </main>
    </section>
  );
};

export default TabbedGroup;```

### src/components/Drawers/SettingsDrawer.tsx

```tsx
import React, { ReactNode, useState } from 'react';
import { X } from 'lucide-react';

interface SettingsDrawerProps {
  trigger: ReactNode;
  children: ReactNode;
  style?: React.CSSProperties;
  worker1Name: string;
  worker1Model: string;
  worker2Name: string;
  worker2Model: string;
  turns: number;
  onAcceptSettings: () => void;
}

const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  trigger,
  children,
  style,
  worker1Name,
  worker1Model,
  worker2Name,
  worker2Model,
  turns,
  onAcceptSettings,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false); // Local state for visual feedback

  const zIndex = 1050;

  const overlayStyle: React.CSSProperties = {
    zIndex: zIndex,
  };

  const containerStyle: React.CSSProperties = {
    zIndex: zIndex + 1,
  };

  const panelStyle: React.CSSProperties = {
    ...style,
  };

  const handleAccept = () => {
    setIsAccepted(true);
    onAcceptSettings();
    console.log('Settings accepted, drawer closed');

    // Close the drawer and reset feedback after 1500ms
    setTimeout(() => {
      setIsOpen(false);
      setIsAccepted(false);
    }, 1500);
  };

  const handleCancel = () => {
    setIsOpen(false);
    console.log('Settings cancelled, drawer closed');
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} style={{ display: 'inline-block' }}>{trigger}</div>

      <div
        className={`
          fixed inset-0 bg-black/60
          transition-opacity duration-500 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={overlayStyle}
        onClick={() => setIsOpen(false)}
        aria-hidden={!isOpen}
      />

      <div
        className={`
          fixed inset-0 flex items-center justify-center p-4
          transition-opacity duration-700 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        style={containerStyle}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
        aria-hidden={!isOpen}
      >
        <div
          className={`
            transform transition-all duration-800 ease-in-out
            bg-zinc-800 rounded-lg shadow-xl max-h-[80vh] w-full max-w-md
            overflow-y-auto p-4 flex flex-col
            ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          `}
          style={panelStyle}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          hidden={!isOpen}
        >
          <header className="flex items-center justify-between mb-2 border-b border-base-content/20 pb-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => setIsOpen(false)}
              aria-label="Close Settings"
            >
              <X size={15} />
            </button>
          </header>
          <div className="py-4 flex-grow">{children}</div>
          <div className="flex justify-end gap-2 mt-auto pt-6 border-t border-base-content/10">
            <button
              className="btn btn-sm btn-ghost"
              onClick={handleCancel}
              aria-label="Cancel Settings"
            >
              Cancel
            </button>
            <button
              className={`btn btn-sm ${isAccepted ? 'btn-success' : 'btn-primary'} w-24`}
              onClick={handleAccept}
              disabled={
                !worker1Name ||
                !worker1Model ||
                !worker2Name ||
                !worker2Model ||
                turns < 1
              }
              aria-label={isAccepted ? 'Applying Settings' : 'Accept Settings'}
            >
              {isAccepted ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                'Accept'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsDrawer;```

### src/components/Drawers/CollaborationSettings.tsx

```tsx
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import WorkerForm from '../WorkerForm/WorkerForm';
import ApiKeyForm from '../ApiKeyForm/ApiKeyForm';


interface CollaborationSettingsProps {
  worker1Name: string;
  setWorker1Name: Dispatch<SetStateAction<string>>;
  worker1Model: string;
  setWorker1Model: Dispatch<SetStateAction<string>>;
  worker2Name: string;
  setWorker2Name: Dispatch<SetStateAction<string>>;
  worker2Model: string;
  setWorker2Model: Dispatch<SetStateAction<string>>;
  availableModels: string[];
  api1Provider: string;
  setApi1Provider: Dispatch<SetStateAction<string>>;
  api2Provider: string;
  setApi2Provider: Dispatch<SetStateAction<string>>;
  turns: number;
  setTurns: Dispatch<SetStateAction<number>>;
  requestSummary: boolean;
  setRequestSummary: Dispatch<SetStateAction<boolean>>;
  apiKey1: string;
  setApiKey1: Dispatch<SetStateAction<string>>;
  apiKey2: string;
  setApiKey2: Dispatch<SetStateAction<string>>;
  isLoadingModels: boolean;
  resumeOnInterjection: boolean;
  setResumeOnInterjection: Dispatch<SetStateAction<boolean>>;
  summaryModel: string;
  setSummaryModel: Dispatch<SetStateAction<string>>;
}

const CollaborationSettings: React.FC<CollaborationSettingsProps> = ({
  worker1Name,
  setWorker1Name,
  worker1Model,
  setWorker1Model,
  worker2Name,
  setWorker2Name,
  worker2Model,
  setWorker2Model,
  availableModels,
  api1Provider,
  setApi1Provider,
  api2Provider,
  setApi2Provider,
  turns,
  setTurns,
  requestSummary,
  setRequestSummary,
  apiKey1,
  setApiKey1,
apiKey2,
  setApiKey2,
  isLoadingModels,
  resumeOnInterjection,
  setResumeOnInterjection,
  summaryModel,
  setSummaryModel,
}) => {
  useEffect(() => {
    console.log("CollaborationSettings Props:", {
      isLoadingModels,
      availableModels,
      worker1Model,
      worker2Model,
    });
  }, [isLoadingModels, availableModels, worker1Model, worker2Model]);

  return (
    <div className="collaboration-settings flex flex-col gap-4">
      <WorkerForm
        workerId="worker1"
        workerLabel="Worker 1"
        workerName={worker1Name}
        setWorkerName={setWorker1Name}
        workerModel={worker1Model}
        setWorkerModel={setWorker1Model}
        availableModels={availableModels}
        isLoadingModels={isLoadingModels}
      />

      <ApiKeyForm
        apiProvider={api1Provider}
        setApiProvider={setApi1Provider}
        apiKey={apiKey1}
        setApiKey={setApiKey1}
        apiProviders={["ollama", "openai"]}
        label="Worker 1 API Key"
        ariaLabel="Worker 1 API Key"
      />

      <WorkerForm
        workerId="worker2"
        workerLabel="Worker 2"
        workerName={worker2Name}
        setWorkerName={setWorker2Name}
        workerModel={worker2Model}
        setWorkerModel={setWorker2Model}
        availableModels={availableModels}
        isLoadingModels={isLoadingModels}
      />

      <ApiKeyForm
        apiProvider={api2Provider}
        setApiProvider={setApi2Provider}
        apiKey={apiKey2}
        setApiKey={setApiKey2}
        apiProviders={["ollama", "openai"]}
        label="Worker 2 API Key"
        ariaLabel="Worker 2 API Key"
      />

      <div className="form-control">
        <label className="label">
          <span className="label-text">Number of Turns</span>
        </label>
        <input
          type="number"
          min="1"
          value={turns}
          onChange={(e) => setTurns(Math.max(1, parseInt(e.target.value) || 1))}
          className="input input-bordered w-full"
          aria-label="Number of Turns"
        />
      </div>

      <div className="form-control">
        <label className="cursor-pointer label">
          <span className="label-text">Request Summary</span>
          <input
            type="checkbox"
            checked={requestSummary}
            onChange={(e) => setRequestSummary(e.target.checked)}
            className="checkbox"
            aria-label="Request Summary"
          />
        </label>
      </div>

      {requestSummary && (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Summary Model</span>
          </label>
          {isLoadingModels ? (
            <div className="flex items-center gap-2">
              <span className="loading loading-spinner loading-sm"></span>
              <span>Loading models...</span>
            </div>
          ) : availableModels.length > 0 ? (
            <select
              value={summaryModel}
              onChange={(e) => setSummaryModel(e.target.value)}
              className="select select-bordered w-full text-base-content"
              aria-label="Summary Model"
            >
              <option value="" disabled>
                Select a model
              </option>
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-error">No models available. Please check your connection.</p>
          )}
        </div>
      )}

      <div className="form-control">
        <label className="cursor-pointer label">
          <span className="label-text">Resume on Interjection</span>
          <input
            type="checkbox"
            checked={resumeOnInterjection}
            onChange={(e) => setResumeOnInterjection(e.target.checked)}
            className="checkbox"
            aria-label="Resume on Interjection"
          />
        </label>
      </div>
    </div>
  );
};

export default CollaborationSettings;```

### src/components/Drawers/FolderDrawer.tsx

```tsx
import React from 'react';
import DrawerHeader from './DrawerHeaders.tsx';
import { Folder } from 'lucide-react';
import FileTree, { FileTreeNodeData } from './FileTree.tsx'; // Assuming FileTree is in the same directory

interface FolderDrawerProps {
  id: string;
  // Removed sidebarItems as FileTree handles the structure
  mainContent?: React.ReactNode;
  triggerContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
}

// Corrected placeholder data with unique IDs
const placeholderTreeData: FileTreeNodeData[] = [
  { id: 'folder-htdocs', name: 'htdocs', type: 'folder', children: [
    { id: 'folder-html', name: 'html', type: 'folder', children: [
      { id: 'file-index-html', name: 'index.html', type: 'file', fileType: 'html' },
    ]},
    { id: 'folder-css', name: 'css', type: 'folder', children: [
      { id: 'file-style-css', name: 'style.css', type: 'file', fileType: 'css' },
    ]},
    { id: 'folder-scripts', name: 'scripts', type: 'folder', children: [
      { id: 'file-app-js', name: 'app.js', type: 'file', fileType: 'js' },
    ]},
  ]},
  // Example of another root item if needed
  // { id: 'file-readme', name: 'README.md', type: 'file', fileType: 'other' },
];

const FolderDrawer: React.FC<FolderDrawerProps> = ({
  id = "FolderDrawer",
  mainContent,
  className,
  style,
  zIndex = 100,
}) => {
  return (
    <aside
      className={`drawer drawer-start${className ? ' ' + className : ''}`}
      style={style}
      aria-label="Project Files Drawer"
      role="complementary"
      data-component="FolderDrawer"
    >
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        {mainContent}
      </div>
      <nav
        className="drawer-side"
        style={{ zIndex }}
        aria-label="Project Files Sidebar"
        role="region" // Using region is okay here for the overall sidebar content area
        data-element="drawer-side"
      >
        <label
          htmlFor={id}
          aria-label="Close Project Files Sidebar"
          className="drawer-overlay"
        />
        {/* Changed section classes slightly for better fit */}
        <section
          className="bg-zinc-800 text-base-content min-h-full w-80 p-4 pt-8 flex flex-col" // Use flex-col
          aria-label="Project Files List"
          role="region"
          data-element="sidebar-content"
        >
          {/* Header remains */}
          <DrawerHeader icon={<Folder size={16} color='white' strokeWidth="0.75"/>} title="Project Files"/>

          {/* Render the FileTree component here */}
          <div className="mt-4 flex-grow overflow-y-auto"> {/* Add margin-top, allow growth and scrolling */}
            <FileTree nodes={placeholderTreeData} /> {/* Use updated data */}
          </div>

        </section>
      </nav>
    </aside>
  );
};

export default FolderDrawer;
```

### src/components/Drawers/TabIcons.tsx

```tsx
import React from 'react';
import { FileCode2, ScanEye, BookOpenCheck, LucideProps } from 'lucide-react';

interface TabIconProps extends LucideProps {}

export const CodeTabIcon: React.FC<TabIconProps> = (props) => (
  <span role="img" aria-label="HTML Tab Icon" data-component="HtmlTabIcon">
    <FileCode2 {...props} />
  </span>
);

export const LivePreviewTabIcon: React.FC<TabIconProps> = (props) => (
  <span role="img" aria-label="CSS Tab Icon" data-component="CssTabIcon">
    <ScanEye {...props} />
  </span>
);

export const MarkdownTabIcon: React.FC<TabIconProps> = (props) => (
  <span role="img" aria-label="JavaScript Tab Icon" data-component="JsTabIcon">
    <BookOpenCheck {...props} />
  </span>
);
```

### src/components/Drawers/CodeSubTabs.tsx

```tsx
import React, { useState } from 'react';
import { FileCode2, FileStack, ScrollText } from 'lucide-react';
import MockupCode from './MockupCode';

const SUB_TABS = [
  {
    id: 'html',
    title: 'HTML',
    icon: <FileCode2 size={14} strokeWidth={'0.75'}/>,
  },
  {
    id: 'css',
    title: 'CSS',
    icon: <FileStack size={14} strokeWidth={'0.75'}/>,
  },
  {
    id: 'js',
    title: 'JavaScript',
    icon: <ScrollText size={14} strokeWidth={'0.75'}/>,
  },
];

const CodeSubTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('html');

  return (
    <section
      className="flex flex-col h-full"
      aria-label="Code Sub Tabs"
      role="region"
      data-component="CodeSubTabs"
    >
      <nav
        role="navigation"
        aria-label="Code Sub Tabs Navigation"
        className="flex-shrink-0 flex tabs"
        data-element="sub-tab-list"
      >
        <div
          role="tablist"
          aria-label="Code file types"
          className="flex w-full"
        >
          {SUB_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const baseTabStyles = "tab h-auto py-2 px-4 flex items-center gap-1.5 transition-colors duration-150 ease-in-out";
            const activeTabStyles = isActive
              ? "tab-active bg-zinc-800 [--tab-border-color:theme(colors.base-300)] border-b-0 rounded-t-lg"
              : "";
            const inactiveTabStyles = !isActive
              ? "text-base-content/60 border-b [--tab-border-color:theme(colors.base-300)]"
              : "";

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`subtab-content-${tab.id}`}
                id={`subtab-label-${tab.id}`}
                className={`${baseTabStyles} ${activeTabStyles} ${inactiveTabStyles}`}
                onClick={() => setActiveTab(tab.id)}
                data-element="sub-tab"
                data-tab-id={tab.id}
              >
                <span className="inline-flex items-center" aria-hidden="true">{tab.icon}</span>
                <span className="text-sm">{tab.title}</span>
              </button>
            );
          })}
          <div
            className="tab grow border-b [--tab-border-color:theme(colors.base-300)]"
            data-element="tab-border"
            aria-hidden="true"
          ></div>
        </div>
      </nav>

      <div
        className="relative flex-grow overflow-hidden bg-zinc-800"
        aria-label="Code Sub Tab Content"
        data-element="sub-tab-content-container"
      >
        {SUB_TABS.map((tab) => (
          <section
            key={tab.id}
            id={`subtab-content-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`subtab-label-${tab.id}`}
            hidden={activeTab !== tab.id}
            className={`absolute inset-0 h-full w-full flex flex-col
              ${activeTab === tab.id ? 'opacity-100 transition-opacity duration-150 ease-in-out' : 'pointer-events-none opacity-0'}
              bg-zinc-800 overflow-auto`}
            data-element="sub-tab-panel"
            data-tab-id={tab.id}
          >
            <div className="p-4 h-full w-full items-center">
              {tab.id === 'html' && (
                <MockupCode
                code={`<!-- No HTML here yet...-->`}
                language="html"
              />
              )}
              {tab.id === 'css' && (
                <MockupCode
                code={`/* No CSS here yet... */`}
                language="css"
              />
              )}
              {tab.id === 'js' && (
              <MockupCode
              code={`// No JavaScript here yet...`}
              language="javascript"
            />
              )}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
};

export default CodeSubTabs;```

### src/components/ChatInterface/ChatInterface.tsx

```tsx
import React, { useEffect, useState } from 'react';
import { CollaborationService, CollaborationState } from '../../services/CollaborationService';
import ChatMessage from './ChatMessage';
import StrategicMemoryChunkComponent from './StrategicMemoryChunk';
import { checkOllamaConnection, fetchOllamaModels } from '../../services/ollamaServices';
import SettingsDrawer from '../Drawers/SettingsDrawer';
import CollaborationSettings from '../Drawers/CollaborationSettings';
import { CollaborationStateManager } from '../../utils/CollaborationStateManager';
import ResizableDrawer from '../Drawers/ResizableDrawer';
import { Settings, FolderCode, ScanEye } from 'lucide-react';

interface ChatInterfaceProps {
  folderDrawerId: string;
  previewDrawerId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ folderDrawerId, previewDrawerId }) => {
  const [collabService, setCollabService] = useState<CollaborationService | null>(null);
  const [collabState, setCollabState] = useState<CollaborationState | null>(null);
  const [message, setMessage] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [isGenerating, setIsGenerating] = useState(false); // New state for loading

  // Settings state
  const [worker1Name, setWorker1Name] = useState('Worker 1');
  const [worker1Model, setWorker1Model] = useState('');
  const [worker2Name, setWorker2Name] = useState('Worker 2');
  const [worker2Model, setWorker2Model] = useState('');
  const [turns, setTurns] = useState(1);
  const [requestSummary, setRequestSummary] = useState(false);
  const [api1Provider, setApi1Provider] = useState('ollama');
  const [api2Provider, setApi2Provider] = useState('ollama');
  const [apiKey1, setApiKey1] = useState('');
  const [apiKey2, setApiKey2] = useState('');
  const [resumeOnInterjection, setResumeOnInterjection] = useState(true);
  const [summaryModel, setSummaryModel] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  const handleStateUpdate = (newState: CollaborationState) => {
    setCollabState(newState);
  };

  useEffect(() => {
    const service = new CollaborationService(handleStateUpdate, requestSummary);
    setCollabService(service);

    // Load saved state on mount
    const savedState = CollaborationStateManager.load();
    if (savedState) {
      setCollabState(savedState);
      service.startCollaboration('', {
        turns: savedState.control.totalTurns / 2,
        worker1Model: savedState.control.currentModel,
        worker2Model: savedState.control.otherModel,
        worker1Name:
          savedState.memory.workingMemory.find((msg) => msg.role === 'assistant' && msg.senderName.includes('Worker 1'))
            ?.senderName || 'Worker 1',
        worker2Name:
          savedState.memory.workingMemory.find((msg) => msg.role === 'assistant' && msg.senderName.includes('Worker 2'))
            ?.senderName || 'Worker 2',
      });
    }

    const checkConnection = async () => {
      const status = await checkOllamaConnection();
      console.log('Ollama connection status:', status);
      setOllamaStatus(status);

      if (status === 'connected') {
        const fetchedModels = await fetchOllamaModels();
        console.log('Fetched models in ChatInterface:', fetchedModels);
        setModels(fetchedModels);
        if (fetchedModels.length > 0 && !savedState) {
          setWorker1Model(fetchedModels[0]);
          setWorker2Model(fetchedModels.length > 1 ? fetchedModels[1] : fetchedModels[0]);
          setSummaryModel(fetchedModels[0]);
        }
      }
      setIsLoadingModels(false);
    };

    checkConnection();

    const interval = setInterval(checkConnection, 30000);

    return () => {
      console.log('CollaborationService instance cleanup (if necessary)');
      clearInterval(interval);
    };
  }, [requestSummary]);

  useEffect(() => {
    const service = new CollaborationService(handleStateUpdate, requestSummary);
    setCollabService(service);

    const checkConnection = async () => {
      const status = await checkOllamaConnection();
      console.log('Ollama connection status:', status);
      setOllamaStatus(status);

      if (status === 'connected') {
        const fetchedModels = await fetchOllamaModels();
        console.log('Fetched models in ChatInterface:', fetchedModels);
        setModels(fetchedModels);
        if (fetchedModels.length > 0) {
          // Load saved state but don't start collaboration
          const savedState = CollaborationStateManager.load();
          if (savedState) {
            setCollabState(savedState);
            // Update settings to reflect the restored state
            setWorker1Model(savedState.control.currentModel);
            setWorker2Model(savedState.control.otherModel);
            setWorker1Name(
              savedState.memory.workingMemory.find(
                (msg) => msg.role === 'assistant' && msg.senderName.includes('Worker 1')
              )?.senderName || 'Worker 1'
            );
            setWorker2Name(
              savedState.memory.workingMemory.find(
                (msg) => msg.role === 'assistant' && msg.senderName.includes('Worker 2')
              )?.senderName || 'Worker 2'
            );
            setTurns(savedState.control.totalTurns / 2);
          } else {
            // Set default models only if no saved state
            setWorker1Model(fetchedModels[0]);
            setWorker2Model(fetchedModels.length > 1 ? fetchedModels[1] : fetchedModels[0]);
            setSummaryModel(fetchedModels[0]);
          }
        }
      }
      setIsLoadingModels(false);
    };

    checkConnection();

    const interval = setInterval(checkConnection, 30000);

    return () => {
      console.log('CollaborationService instance cleanup (if necessary)');
      clearInterval(interval);
    };
  }, [requestSummary]);

  const messagesToDisplay = collabState?.memory.workingMemory ?? [];

  const canPause = collabState?.control.isCollaborating && !collabState?.control.isPaused;
  const canResume = collabState?.control.isCollaborating && collabState?.control.isPaused;
  const canSubmit =
    (!collabState?.control.isCollaborating || collabState?.control.isPaused) &&
    message.trim().length > 0 &&
    ollamaStatus === 'connected' && // Prevent submission if Ollama is disconnected
    !isGenerating; // Prevent submission during generation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collabService || !canSubmit) return;

    if (collabState?.control.isPaused) {
      console.log('UI: Injecting message during pause.');
      collabService.injectMessage(message);
      if (resumeOnInterjection) {
        collabService.resumeCollaboration();
      }
      setMessage('');
    } else {
      console.log('UI: Starting new collaboration.');
      setIsGenerating(true); // Set loading state
      await collabService.startCollaboration(message, {
        turns,
        worker1Model,
        worker2Model,
        worker1Name,
        worker2Name,
      });
      setIsGenerating(false); // Clear loading state
      setMessage('');
    }
  };

  let placeholderText = 'Type your message...';
  let ariaLabel = 'Type your message...';
  if (collabState?.control.isPaused) {
    placeholderText = 'Collaboration Paused: Please interject...';
    ariaLabel = 'Collaboration Paused: Please interject...';
  } else if (collabState?.control.isCollaborating || isGenerating) {
    placeholderText = 'Collaboration in progress...';
    ariaLabel = 'Collaboration in progress...';
  }
  if (collabState?.control.isPaused && message.trim().length > 0) {
    placeholderText = 'Interjection submitted to the collaboration';
    ariaLabel = 'Interjection submitted to the collaboration';
  }
  if (ollamaStatus === 'disconnected') {
    placeholderText = 'Ollama disconnected. Please check your server.';
    ariaLabel = 'Ollama disconnected. Please check your server.';
  }

  let statusMessage = '';
  if (collabState?.control.currentPhase === 'idle' && !isGenerating) {
    statusMessage = 'Ready to start collaboration.';
  } else if (collabState?.control.currentPhase === 'processing' || isGenerating) {
    statusMessage = 'Collaborating...';
  } else if (collabState?.control.currentPhase === 'awaitingInput') {
    statusMessage = 'Paused: Awaiting your input...';
  }

  return (
    <main
      className="flex flex-col items-center gap-4 m-auto justify-between w-full h-full p-1 bg-base-200"
      role="main"
      aria-label="Chat Interface"
      data-component="ChatInterface"
    >
      <div
        className="flex flex-col gap-4 w-full max-w-4xl p-4 border border-dashed border-base-content/30 rounded mb-4 overflow-y-auto flex-grow"
        role="log"
        aria-label="Chat HistoryDEB"
        aria-live="polite"
      >
        {messagesToDisplay.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center w-full max-w-4xl m-auto justify-center bg-zinc-800 rounded-sm p-4 z-10 flex-none"
        role="region"
        aria-label="Chat Input Area"
        id="ChatInputContainer"
      >
        <div
          className="flex flex-row w-full mb-2"
          role="group"
          id="ChatTextAreaInputContainer"
          aria-label="Chat Text Input"
        >
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholderText}
            aria-label={ariaLabel}
            aria-controls="chat-send-button"
            disabled={
              isGenerating ||
              (collabState?.control.isCollaborating && !collabState?.control.isPaused) ||
              ollamaStatus === 'disconnected'
            }
            className="textarea textarea-bordered flex-1 w-full outline-none focus:outline-none border-none bg-zinc-800 text-base-content placeholder:text-base-content/50 resize-none"
          />
        </div>
        {(collabState?.control.isCollaborating || isGenerating) && !collabState?.control.isPaused && (
          <div className="flex items-center gap-2 mt-2">
            <span className="loading loading-spinner loading-sm"></span>
          </div>
        )}
        <nav
          className="flex flex-row items-center justify-between w-full"
          role="navigation"
          id="ChatTextInputButtonContainer"
          aria-label="Chat Controls"
        >
          <div className="flex flex-row gap-2" id="chat-settings-buttons">
            <label
              htmlFor={folderDrawerId}
              className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top"
              data-tip="Files"
              aria-label="Open Folder Drawer"
            >
              <FolderCode />
            </label>
            <SettingsDrawer
              trigger={
                <button
                  className="btn btn-sm btn-ghost tooltip tooltip-top"
                  data-tip="Settings"
                  aria-label="Open Settings Drawer"
                >
                  <Settings size={16} />
                </button>
              }
              worker1Name={worker1Name}
              worker1Model={worker1Model}
              worker2Name={worker2Name}
              worker2Model={worker2Model}
              turns={turns}
              onAcceptSettings={() => {
                console.log('Settings accepted:', {
                  worker1Name,
                  worker1Model,
                  worker2Name,
                  worker2Model,
                  turns,
                });
              }}
            >
              <CollaborationSettings
                worker1Name={worker1Name}
                setWorker1Name={setWorker1Name}
                worker1Model={worker1Model}
                setWorker1Model={setWorker1Model}
                worker2Name={worker2Name}
                setWorker2Name={setWorker2Name}
                worker2Model={worker2Model}
                setWorker2Model={setWorker2Model}
                availableModels={models}
                api1Provider={api1Provider}
                setApi1Provider={setApi1Provider}
                api2Provider={api2Provider}
                setApi2Provider={setApi2Provider}
                turns={turns}
                setTurns={setTurns}
                requestSummary={requestSummary}
                setRequestSummary={setRequestSummary}
                apiKey1={apiKey1}
                setApiKey1={setApiKey1}
                apiKey2={apiKey2}
                setApiKey2={setApiKey2}
                isLoadingModels={isLoadingModels}
                resumeOnInterjection={resumeOnInterjection}
                setResumeOnInterjection={setResumeOnInterjection}
                summaryModel={summaryModel}
                setSummaryModel={setSummaryModel}
              />
            </SettingsDrawer>

            <ResizableDrawer
              id="chat-preview-drawer"
              mainContent={
                <label
                  htmlFor="chat-preview-drawer"
                  className="btn btn-sm btn-ghost drawer-button tooltip tooltip-top"
                  data-tip="Preview"
                  aria-label="Open Preview Drawer"
                >
                  <ScanEye size={16} />
                </label>
              }
              strategicMemory={collabState?.memory.strategicMemory || []}
            />
            
          </div>
          <div className="flex flex-row gap-2" id="chat-control-buttons">
            <div style={{ display: 'inline-block' }}>
              <button
                type="button"
                disabled={!canPause}
                onClick={() => collabService?.pauseCollaboration()}
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Pause Chat"
                aria-label="Pause"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pause"
                >
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                </svg>
              </button>
            </div>
            <div style={{ display: 'inline-block' }}>
              <button
                type="button"
                disabled={!canResume}
                onClick={() => collabService?.resumeCollaboration()}
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Resume Chat"
                aria-label="Resume"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-play"
                >
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              </button>
            </div>
            <div style={{ display: 'inline-block' }}>
              <button
                type="submit"
                disabled={!canSubmit}
                id="chat-send-button"
                className="btn btn-sm btn-ghost tooltip tooltip-top"
                data-tip="Send Message"
                aria-label="Send Message"
              >
                <svg
                  xmlns="http://www3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-send"
                >
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </button>
            </div>
            <div style={{ display: 'inline-block' }}>
              <span
                className="text-base-content/50 text-sm tooltip tooltip-top"
                data-tip="LLM Model Status"
                aria-label="LLM Model Status"
              >
                {ollamaStatus}
              </span>
            </div>
          </div>
        </nav>
        <span className="text-base-content/50 text-sm mt-2">{statusMessage}</span>
      </form>
    </main>
  );
};

export default ChatInterface;
```

### src/components/ChatInterface/StrategicMemoryChunk.tsx

```tsx
import React from 'react';
import { StrategicMemoryChunk } from '../../services/CollaborationService';

interface StrategicMemoryChunkProps {
  chunk: StrategicMemoryChunk;
}

const StrategicMemoryChunkComponent: React.FC<StrategicMemoryChunkProps> = ({ chunk }) => {
  return (
    <div className="strategic-memory-chunk p-2 border border-base-content/20 rounded">
      <p className="text-sm text-base-content/70">
        {new Date(chunk.timestamp).toLocaleString()}: {chunk.summary}
      </p>
    </div>
  );
};

export default StrategicMemoryChunkComponent;```

### src/components/ChatInterface/ChatMessage.tsx

```tsx
import React from "react";
import { ChatMessage as ChatMessageType } from "../../collaborationTypes";

import DOMPurify from "dompurify";

const sanitize = (html: string) => {
  return DOMPurify.sanitize(html);
};

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const sanitize = (html: string) => {
    return html.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Basic sanitization
  };

  return (
    <div
      className={`chat ${message.role === "user" ? "chat-end" : message.role === "system" ? "chat-start" : "chat-middle"}`}
      role="article"
      aria-label={`${message.senderName} message`}
    >
      <div className="chat-header">
        {message.senderName} at {new Date(message.createdAt).toLocaleString()}
      </div>
      <div
        className="chat-bubble"
        dangerouslySetInnerHTML={{ __html: sanitize(message.message) }}
      />
    </div>
  );
};

export default ChatMessage;```

### src/components/ChatBubbles/ChatBubbles.tsx

```tsx
import React from "react";

interface ChatBubbleProps {
  fontSize: string;
  senderName: string;
  time: string;
  message: string;
  avatarIcon: React.ReactNode;
  footerText?: string;
  isSender: boolean;
  bubbleColor: string;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  type: "message" | "summary";
  turn?: number;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  fontSize,
  senderName,
  time,
  message,
  avatarIcon,
  footerText,
  isSender,
  bubbleColor,
  isFirstInGroup,
  isLastInGroup,
  type,
  turn,
}) => {
  const isSummary = type === "summary";
  return (
    <div
      className={`chat ${isSender ? 'chat-end' : 'chat-start'} ${isSummary ? 'mt-4' : 'mt-1'}`}
      style={{ fontSize }}
    >
      {isFirstInGroup && (
        <div className="chat-header flex items-center gap-1">
          {avatarIcon}
          <span>{senderName}</span>
          {turn !== undefined && <span className="text-xs opacity-50">(Turn {turn})</span>}
          <time className="text-xs opacity-50">{time}</time>
        </div>
      )}
      <div
        className={`chat-bubble chat-bubble-${bubbleColor} ${isFirstInGroup ? 'rounded-t-lg' : ''} ${
          isLastInGroup ? 'rounded-b-lg' : ''
        } ${isSummary ? 'italic' : ''}`}
      >
        {message}
      </div>
      {isLastInGroup && footerText && (
        <div className="chat-footer opacity-50">{footerText}</div>
      )}
    </div>
  );
};

export default ChatBubble;```

### src/components/ChatTextAreaInput/ChatTextAreaInput.tsx

```tsx
import React, { ChangeEvent, KeyboardEvent } from 'react';

interface ChatTextAreaInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  isPaused?: boolean;
  tempPlaceholder?: string; // Add tempPlaceholder prop
  ariaControls?: string;
}

const ChatTextAreaInput: React.FC<ChatTextAreaInputProps> = ({
  value,
  onChange,
  onKeyDown,
  placeholder = "Type your message...",
  rows = 2,
  disabled = false,
  isPaused = false,
  tempPlaceholder, // Destructure tempPlaceholder
  ariaControls,
}) => {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  // Determine the placeholder: tempPlaceholder takes priority, then isPaused logic
  const currentPlaceholder = tempPlaceholder
    ? tempPlaceholder
    : isPaused
    ? "Collaboration Paused: Please interject..."
    : placeholder;

  return (
    <textarea
      className="textarea textarea-bordered flex-1 w-full outline-none focus:outline-none border-none bg-zinc-800 text-base-content placeholder:text-base-content/50 resize-none"
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      placeholder={currentPlaceholder}
      rows={rows}
      disabled={disabled}
      aria-controls={ariaControls}
      aria-label={currentPlaceholder}
    />
  );
};

export default ChatTextAreaInput;```

### src/main.tsx

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### src/App.tsx

```tsx
// src/App.tsx
import "./App.css";
import ResizableDrawer from "./components/Drawers/ResizableDrawer.tsx";
import FolderDrawer from "./components/Drawers/FolderDrawer.tsx";
import ChatInterface from "./components/ChatInterface/ChatInterface.tsx";

function App() {
  const folderDrawerId = "FolderDrawer";
  const previewDrawerId = "PreviewDrawer";

  const folderSidebar = ["Folder 1", "File A", "File B"];

  return (
    <>
      <FolderDrawer
        id={folderDrawerId}
        sidebarItems={folderSidebar}
        triggerContent={null}
      />
      <div className="h-screen">
        <ChatInterface
          folderDrawerId={folderDrawerId}
          previewDrawerId={previewDrawerId}
        />
      </div>
      <ResizableDrawer id={previewDrawerId} triggerContent={null} />

    </>
  );
}

export default App;
```

### src/App.css

```css
```

### src/services/MemoryController.ts

```ts
import { CollaborationState, ChatMessage, MemoryChunk } from "../collaborationTypes";

export class MemoryController {
  static getContext(state: CollaborationState, header: string): string {
    const strategic = state.memory.strategicMemory
      .map((c) => `## Summary\n${c.summary}`)
      .join("\n\n");
    const working = state.memory.workingMemory
      .slice(-5)
      .map((m) => `${m.senderName}: ${m.message}`)
      .join("\n");
    return [header, strategic, working ? `### Recent Conversation\n${working}` : ""]
      .filter((s) => s.length > 0)
      .join("\n\n");
  }

  static compress(workingMemory: ChatMessage[]): {
    compressed: MemoryChunk;
    remaining: ChatMessage[];
  } {
    if (workingMemory.length < 5) {
      return {
        compressed: { summary: "", timestamp: Date.now() },
        remaining: workingMemory,
      };
    }

    const summaryContent = workingMemory
      .slice(0, workingMemory.length - 2)
      .map((m) => m.message)
      .join(" ");
    return {
      compressed: {
        summary: `Summarized: ${summaryContent.substring(0, 50)}...`,
        timestamp: Date.now(),
      },
      remaining: workingMemory.slice(-2),
    };
  }
}```

### src/services/ollamaServices.tsx

```tsx
// ollamaServices.ts

// Existing functions
export const checkOllamaConnection = async (): Promise<"connected" | "disconnected"> => {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    return response.ok ? "connected" : "disconnected";
  } catch {
    return "disconnected";
  }
};

export const fetchOllamaModels = async (): Promise<string[]> => {
  try {
    const response = await fetch("http://localhost:11434/api/tags");
    const data = await response.json();
    return data.models.map((model: { name: string }) => model.name);
  } catch {
    return [];
  }
};

// New function for fetching Ollama responses
export const fetchOllamaResponse = async (
  model: string,
  context: string[], // Full conversation history
  retries = 3
): Promise<{ response: string; error: null | string }> => {
  try {
    const prompt = `${context.join("\n")}\nContinue the collaboration:`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    return { response: data.response, error: null };
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchOllamaResponse(model, context, retries - 1);
    }
    return { response: "", error: error instanceof Error ? error.message : "API failure" };
  }
};```

### src/services/CollaborationStateManager.ts

```ts
import { CollaborationState } from "../collaborationTypes";

export class CollaborationStateManager {
  private static STORAGE_KEY = "collaborationState";

  static save(state: CollaborationState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save collaboration state:", error);
    }
  }

  static load(): CollaborationState | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error("Failed to load collaboration state:", error);
      return null;
    }
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}```

### src/services/CollaborationService.tsx

```tsx
import { nanoid } from "nanoid"; // Import nanoid for unique message IDs
import { ChatMessage, MemoryChunk, CollaborationControlState, CollaborationState, CollaborationTask } from "../collaborationTypes";
import { fetchOllamaResponse } from "../services/ollamaServices"; // Import the new function

export class CollaborationService {
  private state: CollaborationState;
  private updateCallback: (state: CollaborationState) => void;
  private shouldPause: boolean = false;
  private shouldResume: boolean = false;
  private requestSummary: boolean;

  constructor(updateCallback: (state: CollaborationState) => void, requestSummary: boolean) {
    console.log("Initializing new collaboration state.");
    this.state = {
      memory: {
        workingMemory: [],
        strategicMemory: [],
      },
      control: {
        currentTurn: 0,
        totalTurns: 0,
        currentModel: "",
        otherModel: "",
        isCollaborating: false,
        isPaused: false,
        currentPhase: "idle",
      },
    };
    this.updateCallback = updateCallback;
    this.requestSummary = requestSummary;
    this.notifyUpdate();
  }

  private notifyUpdate() {
    this.updateCallback({ ...this.state, memory: { ...this.state.memory }, control: { ...this.state.control } });
  }

  private async compressMemory() {
    console.log("Service Loop: Compressing memory...");
    console.log("Total messages in workingMemory:", this.state.memory.workingMemory.length);
    if (this.state.memory.workingMemory.length < 5) {
      console.log("Not enough messages to compress (less than 5).");
      return;
    }

    const messagesToSummarize = this.state.memory.workingMemory.slice(0, -2);
    console.log("Messages to summarize:", messagesToSummarize.map(msg => `${msg.senderName}: ${msg.message}`));
    const summary = messagesToSummarize
      .map((msg) => `${msg.senderName}: ${msg.message}`)
      .join("; ");
    const newChunk: MemoryChunk = {
      timestamp: new Date().toISOString(),
      summary: `Summary: ${summary}`,
    };
    const remainingMessages = this.state.memory.workingMemory.slice(-2);
    console.log("Remaining messages in workingMemory:", remainingMessages.map(msg => `${msg.senderName}: ${msg.message}`));
    this.state = {
      ...this.state,
      memory: {
        ...this.state.memory,
        strategicMemory: [...this.state.memory.strategicMemory, newChunk],
        workingMemory: remainingMessages,
      },
    };
    this.notifyUpdate();
  }

  private checkMemoryLimit() {
    if (this.state.memory.workingMemory.length > 10) {
      this.compressMemory();
    }
  }

  getState(): CollaborationState {
    return { ...this.state, memory: { ...this.state.memory }, control: { ...this.state.control } };
  }

  async startCollaboration(message: string, task: CollaborationTask) {
    console.log("Service: Starting collaboration... Task:", task);
    const newControl: CollaborationControlState = {
      currentTurn: 0,
      totalTurns: task.turns * 2,
      currentModel: task.worker1Model,
      otherModel: task.worker2Model,
      isCollaborating: true,
      isPaused: false,
      currentPhase: "processing",
    };
    const newMessage: ChatMessage = {
      id: nanoid(), // Now type-compatible (string)
      senderName: "User",
      role: "user",
      message,
      createdAt: new Date().toISOString(),
      type: "message",
    };
    this.state = {
      ...this.state,
      memory: {
        ...this.state.memory,
        workingMemory: [...this.state.memory.workingMemory, newMessage],
      },
      control: newControl,
    };
    this.notifyUpdate();
    await this.runCollaborationLoop(task.worker1Name, task.worker2Name);
  }

  pauseCollaboration() {
    console.log("Service: Signaling pause.");
    this.shouldPause = true;
    this.state = {
      ...this.state,
      control: {
        ...this.state.control,
        isPaused: true,
        currentPhase: "awaitingInput",
      },
    };
    this.notifyUpdate();
  }

  resumeCollaboration() {
    console.log("Service: Signaling resume.");
    this.shouldResume = true;
    this.state = {
      ...this.state,
      control: {
        ...this.state.control,
        isPaused: false,
        currentPhase: "processing",
      },
    };
    this.notifyUpdate();
  }

  injectMessage(message: string) {
    console.log("Service: Injecting message:", message);
    const newMessage: ChatMessage = {
      id: nanoid(), // Now type-compatible (string)
      senderName: "User (Injection)",
      role: "user",
      message,
      createdAt: new Date().toISOString(),
      type: "message",
    };
    this.state = {
      ...this.state,
      memory: {
        ...this.state.memory,
        workingMemory: [...this.state.memory.workingMemory, newMessage],
      },
    };
    this.notifyUpdate();
  }

  private async runCollaborationLoop(worker1Name: string, worker2Name: string) {
    for (let turn = 1; turn <= this.state.control.totalTurns; turn++) {
      this.state = {
        ...this.state,
        control: {
          ...this.state.control,
          currentTurn: turn,
        },
      };
      console.log(`Service Loop: Starting Turn ${turn}/${this.state.control.totalTurns}`);

      if (this.shouldPause) {
        this.shouldPause = false;
        while (!this.shouldResume) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        this.shouldResume = false;
        this.state = {
          ...this.state,
          control: {
            ...this.state.control,
            isPaused: false,
          },
        };
        this.notifyUpdate();
      }

      const isWorker1 = turn % 2 !== 0;
      const senderName = isWorker1 ? worker1Name : worker2Name;
      const currentModel = isWorker1 ? this.state.control.currentModel : this.state.control.otherModel;

      try {
        const context = this.state.memory.workingMemory.map(msg => `${msg.senderName}: ${msg.message}`);
        const { response, error } = await fetchOllamaResponse(currentModel, context);

        if (error) {
          const errorMessage: ChatMessage = {
            id: nanoid(), // Now type-compatible (string)
            senderName: "System",
            role: "system",
            message: `Error in ${senderName}: ${error}`,
            createdAt: new Date().toISOString(),
            type: "message",
          };
          this.state = {
            ...this.state,
            memory: {
              ...this.state.memory,
              workingMemory: [...this.state.memory.workingMemory, errorMessage],
            },
          };
        } else {
          const newMessage: ChatMessage = {
            id: nanoid(), // Now type-compatible (string)
            senderName,
            role: "assistant",
            message: response,
            createdAt: new Date().toISOString(),
            type: "message",
          };
          this.state = {
            ...this.state,
            memory: {
              ...this.state.memory,
              workingMemory: [...this.state.memory.workingMemory, newMessage],
            },
          };
        }
        this.checkMemoryLimit();
        this.notifyUpdate();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error during turn ${turn}:`, errorMessage);
        const errorMsg: ChatMessage = {
          id: nanoid(), // Now type-compatible (string)
          senderName: "System",
          role: "system",
          message: `Error: ${senderName} failed - ${errorMessage}`,
          createdAt: new Date().toISOString(),
          type: "message",
        };
        this.state = {
          ...this.state,
          memory: {
            ...this.state.memory,
            workingMemory: [...this.state.memory.workingMemory, errorMsg],
          },
        };
        this.notifyUpdate();
        throw new Error(`Collaboration failed: ${errorMessage}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (this.requestSummary && this.state.memory.workingMemory.length >= 5) {
      await this.compressMemory();
    }

    this.state = {
      ...this.state,
      control: {
        ...this.state.control,
        isCollaborating: false,
        currentPhase: "idle",
      },
    };
    console.log("Service: Collaboration loop finished.");
    this.notifyUpdate();
  }
}

export type { CollaborationState };```
