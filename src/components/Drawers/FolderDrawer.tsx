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
