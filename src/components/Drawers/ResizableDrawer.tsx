import React, { useState, useRef, useEffect } from 'react';
import DrawerHeader from './DrawerHeaders.tsx';
import { Eye, Code, FileImage, Brain, BarChart3, Folder } from 'lucide-react';
import LivePreview from './LivePreview';
import CodeSubTabs from './CodeSubTabs';
import WebBrowserPanel from '../Advanced/WebBrowserPanel';
import AdvancedMemoryManager from '../Advanced/AdvancedMemoryManager';
import CollaborationFlowChart from '../Advanced/CollaborationFlowChart';
import MindMapVisualizer from '../Advanced/MindMapVisualizer';
import FileTree, { FileTreeNodeData } from './FileTree.tsx';
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
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Toggle drawer when the checkbox changes
  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOpen(e.target.checked);
  };
  
  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const drawer = document.getElementById(id) as HTMLInputElement;
      const drawerElement = drawerRef.current;
      
      if (drawer && drawerElement && 
          !drawerElement.contains(e.target as Node) && 
          !(e.target as HTMLElement).closest(`label[for="${id}"]`)) {
        drawer.checked = false;
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [id]);
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
  const fileSystem = useCollaborationStore((state) => state.fileSystem);

  const handleFileSelect = (node: FileTreeNodeData) => {
    console.log('File selected:', node);
    // Here you could open the file in the code editor
    // or trigger other actions based on the file type
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !drawerRef.current) return;

      // Calculate new width based on mouse position from the right edge of the screen
      const newWidth = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      // Constrain between 20% and 80% of viewport width
      setDrawerWidth(Math.max(20, Math.min(80, newWidth)));
      
      // Prevent text selection while resizing
      e.preventDefault();
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while resizing
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
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
    <div className="relative h-full">
      <aside
        className={`fixed top-0 right-0 h-full flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${className || ''}`}
        style={{
          ...style,
          width: `${drawerWidth}%`,
          zIndex: zIndex,
          transition: isResizing ? 'none' : 'transform 0.3s ease, width 0.3s ease',
        }}
        aria-label="Preview and Tools Drawer"
        role="complementary"
        data-component="ResizableDrawer"
      >
        <input 
          id={id} 
          type="checkbox" 
          className="drawer-toggle hidden" 
          checked={isOpen}
          onChange={handleToggle}
        />
        <div className="drawer-content">{mainContent}</div>
        <nav
          ref={drawerRef}
          className="h-full flex flex-col bg-base-200 shadow-lg w-full"
          aria-label="Preview and Tools Sidebar"
          role="region"
          data-element="drawer-side"
          style={{
            backgroundColor: 'hsl(var(--b2))',
            zIndex: zIndex + 1
          }}
        >
          <label
            htmlFor={id}
            aria-label="Close Preview and Tools Sidebar"
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            style={{ display: isOpen ? 'block' : 'none' }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Resize Handle - Positioned on the left side */}
          <div
            ref={resizerRef}
            className="absolute left-0 top-0 bottom-0 w-2 bg-base-300 hover:bg-primary cursor-col-resize z-50"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsResizing(true);
            }}
            style={{
              marginLeft: '-4px', // Makes it slightly overlap with the content
              transition: 'background-color 0.2s',
              zIndex: zIndex + 2
            }}
            onMouseEnter={() => {
              if (resizerRef.current) {
                resizerRef.current.style.backgroundColor = 'hsl(var(--p))';
              }
            }}
            onMouseLeave={() => {
              if (resizerRef.current && !isResizing) {
                resizerRef.current.style.backgroundColor = 'hsl(var(--bc) / 0.2)';
              }
            }}
            title="Drag to resize"
          />
        
          <section
            className="bg-base-200 text-base-content h-full flex flex-col overflow-hidden"
            style={{
              width: '100%',
              height: '100vh',
              position: 'relative',
              top: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'hsl(var(--b2))',
              zIndex: zIndex + 1
            }}
            aria-label="Preview and Tools Content"
            role="region"
            data-element="sidebar-content"
          >
            <DrawerHeader
              icon={<Eye size={16} color="white" strokeWidth="0.75" />}
              title="Preview & Tools"
            />

            {/* Split Layout: File Tree + Tabs */}
            <div className="flex flex-row flex-grow overflow-hidden">
              {/* File Tree Column */}
              <div className="w-80 flex-shrink-0 border-r border-zinc-600 bg-zinc-800">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Folder size={16} color='white' strokeWidth="0.75"/>
                    <h3 className="text-sm font-medium text-zinc-200">Project Files</h3>
                  </div>
                </div>
                <div className="flex-grow overflow-y-auto h-full">
                  <FileTree nodes={fileSystem} onFileSelect={handleFileSelect} />
                </div>
              </div>

              {/* Main Content Column */}
              <div className="flex-grow flex flex-col overflow-hidden">
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
              </div>
            </div>
          </section>
        </nav>
      </aside>
    </div>
  );
};

export default ResizableDrawer;