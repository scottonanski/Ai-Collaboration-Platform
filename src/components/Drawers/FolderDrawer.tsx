import React from 'react';
import DrawerHeader from './DrawerHeaders.tsx';
import { Folder } from 'lucide-react';
import FileTree, { FileTreeNodeData } from './FileTree.tsx';
import { useCollaborationStore } from '../../store/collaborationStore';

interface FolderDrawerProps {
  id: string;
  mainContent?: React.ReactNode;
  triggerContent?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  zIndex?: number;
}

const FolderDrawer: React.FC<FolderDrawerProps> = ({
  id = "FolderDrawer",
  mainContent,
  className,
  style,
  zIndex = 100,
}) => {
  const fileSystem = useCollaborationStore((state) => state.fileSystem);
  
  const handleFileSelect = (node: FileTreeNodeData) => {
    console.log('File selected:', node);
    // Here you could open the file in the code editor
    // or trigger other actions based on the file type
  };

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
        role="region"
        data-element="drawer-side"
      >
        <label
          htmlFor={id}
          aria-label="Close Project Files Sidebar"
          className="drawer-overlay"
        />
        <section
          className="bg-zinc-800 text-base-content min-h-full w-80 flex flex-col"
          aria-label="Project Files List"
          role="region"
          data-element="sidebar-content"
        >
          <div className="p-4 pt-8">
            <DrawerHeader icon={<Folder size={16} color='white' strokeWidth="0.75"/>} title="Project Files"/>
          </div>

          <div className="flex-grow overflow-y-auto">
            <FileTree nodes={fileSystem} onFileSelect={handleFileSelect} />
          </div>
        </section>
      </nav>
    </aside>
  );
};

export default FolderDrawer;
