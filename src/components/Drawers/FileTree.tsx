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
