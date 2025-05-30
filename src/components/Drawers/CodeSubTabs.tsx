import React, { useState, useEffect } from 'react';
import { FileCode2, FileStack, ScrollText, Play, Save, Upload, Download, Terminal, X } from 'lucide-react';
import MockupCode from './MockupCode';
import CodeExecutionEnvironment from '../Advanced/CodeExecutionEnvironment';
import { useCollaborationStore } from '../../store/collaborationStore';

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
  {
    id: 'execute',
    title: 'Execute',
    icon: <Terminal size={14} strokeWidth={'0.75'}/>,
  },
];

// Helper function to get language from file extension
const getLanguageFromExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'html':
    case 'htm':
      return 'html';
    case 'css':
      return 'css';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    default:
      return 'plaintext';
  }
};

const CodeSubTabs: React.FC = () => {
  // Store state
  const openFiles = useCollaborationStore((state) => state.openFiles);
  const activeFileId = useCollaborationStore((state) => state.activeFileId);
  const getFileById = useCollaborationStore((state) => state.getFileById);
  const closeFile = useCollaborationStore((state) => state.closeFile);
  const setActiveFile = useCollaborationStore((state) => state.setActiveFile);
  const updateFile = useCollaborationStore((state) => state.updateFile);
  const setCodeContent = useCollaborationStore((state) => state.setCodeContent);

  const [activeTab, setActiveTab] = useState('html');
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Collaboration Demo</title>
</head>
<body>
    <div id="root">
        <h1>🤖 AI Collaboration Workspace</h1>
        <p>This is a live preview of your collaborative work!</p>
        <div class="demo-section">
            <h2>Interactive Demo</h2>
            <button id="clickMe" class="demo-btn">Click me!</button>
            <p id="output">Ready for collaboration...</p>
        </div>
    </div>
</body>
</html>`);

  const [cssCode, setCssCode] = useState(`body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    min-height: 100vh;
}

#root {
    max-width: 800px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.1);
    padding: 30px;
    border-radius: 15px;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

h1 {
    text-align: center;
    font-size: 2.5em;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.demo-section {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 10px;
    margin-top: 20px;
}

.demo-btn {
    background: #ff6b6b;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.demo-btn:hover {
    background: #ff5252;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

#output {
    margin-top: 15px;
    padding: 10px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    font-weight: bold;
}`);

  const [jsCode, setJsCode] = useState(`// AI Collaboration Demo JavaScript
let clickCount = 0;
const responses = [
    "🎯 Great collaboration!",
    "🚀 AI-Human teamwork!",
    "💡 Ideas flowing!",
    "🔥 Building amazing things!",
    "⚡ Innovation in action!",
    "🎨 Creative collaboration!",
    "🛠️ Making it happen!"
];

document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('clickMe');
    const output = document.getElementById('output');
    
    if (button && output) {
        button.addEventListener('click', function() {
            clickCount++;
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            output.textContent = \`\${randomResponse} (Click #\${clickCount})\`;
            
            // Add some visual flair
            output.style.transform = 'scale(1.05)';
            setTimeout(() => {
                output.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    // Auto-update timestamp
    setInterval(() => {
        const now = new Date().toLocaleTimeString();
        const timeDisplay = document.getElementById('timeDisplay');
        if (!timeDisplay) {
            const time = document.createElement('div');
            time.id = 'timeDisplay';
            time.style.cssText = 'position: fixed; top: 10px; right: 10px; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 5px; font-size: 12px;';
            document.body.appendChild(time);
        }
        document.getElementById('timeDisplay').textContent = \`Live: \${now}\`;
    }, 1000);
});`);

  // Store codes in collaboration store for preview component
  const setCodeContent = useCollaborationStore((state) => state.setCodeContent);
  
  useEffect(() => {
    if (setCodeContent) {
      setCodeContent({ html: htmlCode, css: cssCode, js: jsCode });
    }
  }, [htmlCode, cssCode, jsCode, setCodeContent]);

  const getCurrentCode = () => {
    // If there's an active file, get its content
    if (activeFileId) {
      const file = getFileById(activeFileId);
      return file?.content || '';
    }
    
    // Otherwise, use the default code tabs
    switch (activeTab) {
      case 'html':
        return htmlCode;
      case 'css':
        return cssCode;
      case 'js':
        return jsCode;
      default:
        return '';
    }
  };

  const handleCodeChange = (value: string) => {
    // If there's an active file, update its content
    if (activeFileId) {
      updateFile(activeFileId, { content: value });
    } else {
      // Otherwise, update the default code tabs
      switch (activeTab) {
        case 'html':
          setHtmlCode(value);
          break;
        case 'css':
          setCssCode(value);
          break;
        case 'js':
          setJsCode(value);
          break;
      }
    }
  };

  const getCurrentLanguage = () => {
    if (activeFileId) {
      const file = getFileById(activeFileId);
      return file ? getLanguageFromExtension(file.name) : 'plaintext';
    }
    
    switch (activeTab) {
      case 'css':
        return 'css';
      case 'js':
        return 'javascript';
      case 'html':
      default:
        return 'html';
    }
  };

  const downloadCode = () => {
    const content = getCurrentCode();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${activeTab}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uploadFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        handleCodeChange(content);
      };
      reader.readAsText(file);
    }
  };

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

      {/* Code Actions Toolbar */}
      <div className="flex-shrink-0 bg-zinc-900 border-b border-zinc-600 p-2 flex items-center gap-2">
        <button
          onClick={downloadCode}
          className="btn btn-xs btn-ghost tooltip tooltip-bottom"
          data-tip="Download current file"
        >
          <Download size={12} />
        </button>
        <label className="btn btn-xs btn-ghost tooltip tooltip-bottom cursor-pointer" data-tip="Upload file">
          <Upload size={12} />
          <input
            type="file"
            className="hidden"
            onChange={uploadFile}
            accept={`.${activeTab}`}
          />
        </label>
        <div className="flex-grow"></div>
        <span className="text-xs text-zinc-400">
          {getCurrentCode().split('\n').length} lines
        </span>
      </div>

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
            {tab.id === 'execute' ? (
              <CodeExecutionEnvironment />
            ) : (
              <div className="h-full w-full">
                <MockupCode
                  code={getCurrentCode()}
                  language={tab.id === 'css' ? 'css' : tab.id === 'js' ? 'javascript' : 'html'}
                  onChange={handleCodeChange}
                  readOnly={false}
                  height="100%"
                  width="100%"
                  options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    lineNumbersMinChars: 3,
                    renderLineHighlight: 'all',
                    scrollbar: {
                      vertical: 'auto',
                      horizontal: 'auto',
                    },
                  }}
                />
              </div>
            )}
          </section>
        ))}
      </div>
    </section>
  );
};

export default CodeSubTabs;