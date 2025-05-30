import React, { useState, useRef, useEffect } from 'react';
import DrawerHeader from './DrawerHeaders.tsx';
import { Eye, Code, FileImage, Brain, BarChart3 } from 'lucide-react';
import LivePreview from './LivePreview';
import CodeSubTabs from './CodeSubTabs';
import WebBrowserPanel from '../Advanced/WebBrowserPanel';
import AdvancedMemoryManager from '../Advanced/AdvancedMemoryManager';
import CollaborationFlowChart from '../Advanced/CollaborationFlowChart';
import { useCollaborationStore } from '../../store/collaborationStore';

interface ResizableDrawerProps {
  id: string;
  mainContent?: React.ReactNode;
  triggerContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
}

const MAIN_TABS = [
  {
    id: 'preview',
    title: 'Live Preview',
    icon: <Eye size={16} strokeWidth="0.75" />,
  },
  {
    id: 'code',
    title: 'Code Editor',
    icon: <Code size={16} strokeWidth="0.75" />,
  },
  {
    id: 'files',
    title: 'Media Files',
    icon: <FileImage size={16} strokeWidth="0.75" />,
  },
  {
    id: 'memory',
    title: 'AI Memory',
    icon: <Brain size={16} strokeWidth="0.75" />,
  },
  {
    id: 'analytics',
    title: 'Collaboration Analytics',
    icon: <BarChart3 size={16} strokeWidth="0.75" />,
  },
];

const ResizableDrawer: React.FC<ResizableDrawerProps> = ({
  id = "ResizableDrawer",
  mainContent,
  className,
  style,
  zIndex = 100,
}) => {
  const [activeTab, setActiveTab] = useState('preview');
  const [drawerWidth, setDrawerWidth] = useState(60); // percentage
  const [isResizing, setIsResizing] = useState(false);
  const resizerRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Get store data
  const uploadedFiles = useCollaborationStore((state) => state.uploadedFiles);
  const contextMemory = useCollaborationStore((state) => state.contextMemory);
  const messages = useCollaborationStore((state) => state.messages);
  const addUploadedFile = useCollaborationStore((state) => state.addUploadedFile);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !drawerRef.current) return;

      const rect = drawerRef.current.getBoundingClientRect();
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      setDrawerWidth(Math.max(20, Math.min(80, newWidth)));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => addUploadedFile(file));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preview':
        return <LivePreview isResizing={isResizing} />;
        
      case 'code':
        return <CodeSubTabs />;
        
      case 'files':
        return (
          <div className="p-4 h-full bg-base-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">📁 Uploaded Files</h3>
              <label className="btn btn-primary btn-sm">
                📤 Upload Files
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt,.md"
                />
              </label>
            </div>
            
            <div className="grid gap-2">
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8 text-base-content/60">
                  <FileImage size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No files uploaded yet</p>
                  <p className="text-sm">Upload images, documents, or other files to share with AI workers</p>
                </div>
              ) : (
                uploadedFiles.map((file, index) => (
                  <div key={index} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-3">
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                            <FileImage size={16} />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-sm">{file.name}</h4>
                          <p className="text-xs text-base-content/60">
                            {(file.size / 1024).toFixed(1)} KB • {file.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
        
      case 'memory':
        return (
          <div className="p-4 h-full bg-base-200 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">🧠 AI Collaboration Memory</h3>
            
            <div className="space-y-4">
              <div className="card bg-base-100">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2">📊 Session Stats</h4>
                  <div className="stats stats-vertical lg:stats-horizontal">
                    <div className="stat p-2">
                      <div className="stat-title text-xs">Messages</div>
                      <div className="stat-value text-lg">{messages.length}</div>
                    </div>
                    <div className="stat p-2">
                      <div className="stat-title text-xs">Short Term</div>
                      <div className="stat-value text-lg">{contextMemory.shortTerm.length}</div>
                    </div>
                    <div className="stat p-2">
                      <div className="stat-title text-xs">Summaries</div>
                      <div className="stat-value text-lg">{contextMemory.summaries.length}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2">🧵 Recent Context</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {contextMemory.shortTerm.slice(-5).map((msg, idx) => (
                      <div key={idx} className="text-sm p-2 bg-base-200 rounded">
                        <span className="font-medium">{msg.senderName}:</span>
                        <span className="ml-2">{msg.message.substring(0, 100)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2">📝 Summaries</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {contextMemory.summaries.length === 0 ? (
                      <p className="text-sm text-base-content/60">No summaries generated yet</p>
                    ) : (
                      contextMemory.summaries.map((summary, idx) => (
                        <div key={idx} className="text-sm p-2 bg-base-200 rounded">
                          {summary.substring(0, 200)}...
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="p-4 h-full bg-base-200">
            <h3 className="text-lg font-semibold mb-4">📈 Collaboration Analytics</h3>
            
            <div className="grid gap-4">
              <div className="card bg-base-100">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2">🎯 Collaboration Flow</h4>
                  <div className="bg-base-200 h-32 rounded flex items-center justify-center">
                    <p className="text-sm text-base-content/60">
                      Collaboration flow visualization coming soon...
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2">⚡ Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Response Time</span>
                      <span className="font-mono">~2.3s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Collaboration Efficiency</span>
                      <span className="font-mono">87%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Context Retention</span>
                      <span className="font-mono">94%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-100">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2">🤖 AI Worker Performance</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Worker 1 Accuracy</span>
                        <span>92%</span>
                      </div>
                      <progress className="progress progress-primary w-full" value={92} max={100}></progress>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Worker 2 Accuracy</span>
                        <span>89%</span>
                      </div>
                      <progress className="progress progress-secondary w-full" value={89} max={100}></progress>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      default:
        return <div className="p-4">Select a tab to view content</div>;
    }
  };

  return (
    <aside
      className={`drawer drawer-end${className ? ' ' + className : ''}`}
      style={style}
      aria-label="Preview and Tools Drawer"
      role="complementary"
      data-component="ResizableDrawer"
    >
      <input id={id} type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">{mainContent}</div>
      <nav
        ref={drawerRef}
        className="drawer-side"
        style={{ 
          zIndex,
          width: `${drawerWidth}%`,
          transition: isResizing ? 'none' : 'width 0.3s ease'
        }}
        aria-label="Preview and Tools Sidebar"
        role="region"
        data-element="drawer-side"
      >
        <label
          htmlFor={id}
          aria-label="Close Preview and Tools Sidebar"
          className="drawer-overlay"
        />
        
        {/* Resize Handle */}
        <div
          ref={resizerRef}
          className="absolute left-0 top-0 bottom-0 w-1 bg-base-300 hover:bg-primary cursor-col-resize z-10"
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        />
        
        <section
          className="bg-zinc-800 text-base-content min-h-full flex flex-col ml-1"
          aria-label="Preview and Tools Content"
          role="region"
          data-element="sidebar-content"
        >
          <DrawerHeader
            icon={<Eye size={16} color="white" strokeWidth="0.75" />}
            title="Preview & Tools"
          />

          {/* Main Tabs Navigation */}
          <nav className="flex-shrink-0 border-b border-zinc-600">
            <div role="tablist" className="flex overflow-x-auto">
              {MAIN_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${
                      isActive
                        ? 'border-primary text-primary bg-zinc-700'
                        : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.icon}
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Tab Content */}
          <div className="flex-grow overflow-hidden">
            {renderTabContent()}
          </div>
        </section>
      </nav>
    </aside>
  );
};

export default ResizableDrawer;