import React, { useState, useRef, useEffect } from 'react';
import DrawerHeader from './DrawerHeaders.tsx';
import { Eye, Code, FileImage, Brain, BarChart3 } from 'lucide-react';
import LivePreview from './LivePreview';
import CodeSubTabs from './CodeSubTabs';
import WebBrowserPanel from '../Advanced/WebBrowserPanel';
import AdvancedMemoryManager from '../Advanced/AdvancedMemoryManager';
import CollaborationFlowChart from '../Advanced/CollaborationFlowChart';
import MindMapVisualizer from '../Advanced/MindMapVisualizer';
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
    id: 'web',
    title: 'Web Research',
    icon: <FileImage size={16} strokeWidth="0.75" />,
  },
  {
    id: 'mindmap',
    title: 'Mind Map',
    icon: <Brain size={16} strokeWidth="0.75" />,
  },
  {
    id: 'memory',
    title: 'AI Memory',
    icon: <Brain size={16} strokeWidth="0.75" />,
  },
  {
    id: 'analytics',
    title: 'Analytics',
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
        
      case 'web':
        return <WebBrowserPanel />;
        
      case 'mindmap':
        return <MindMapVisualizer />;
        
      case 'memory':
        return <AdvancedMemoryManager />;
        
      case 'analytics':
        return <CollaborationFlowChart />;
        
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