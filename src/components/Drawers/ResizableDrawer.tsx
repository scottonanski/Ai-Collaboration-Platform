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

export default ResizableDrawer;