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
