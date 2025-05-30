import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Edit3 } from 'lucide-react';
import { useCollaborationStore } from '../../store/collaborationStore';

export interface FileTreeNodeData {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: 'html' | 'css' | 'js' | 'md' | 'txt' | 'other';
  children?: FileTreeNodeData[];
  path: string;
  content?: string;
}

interface FileTreeNodeProps {
  node: FileTreeNodeData;
  level: number;
  onFileSelect?: (node: FileTreeNodeData) => void;
}

interface FileTreeProps {
  nodes: FileTreeNodeData[];
  onFileSelect?: (node: FileTreeNodeData) => void;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({ node, level, onFileSelect }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  
  const { updateFile, deleteFile, addFile } = useCollaborationStore();

  const paddingLeft = level * 16;
  const isFolder = node.type === 'folder';
  const hasChildren = isFolder && node.children && node.children.length > 0;

  const handleToggle = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    if (!isFolder && onFileSelect) {
      onFileSelect(node);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editName !== node.name) {
      updateFile(node.id, { name: editName.trim() });
    }
    setIsEditing(false);
    setEditName(node.name);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(node.name);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete ${node.name}?`)) {
      deleteFile(node.id);
    }
  };

  const handleAddFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const newFile: FileTreeNodeData = {
        id: `${node.id}-${Date.now()}`,
        name: fileName,
        type: 'file',
        path: `${node.path}/${fileName}`,
        content: ''
      };
      addFile(newFile);
    }
  };

  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const newFolder: FileTreeNodeData = {
        id: `${node.id}-${Date.now()}`,
        name: folderName,
        type: 'folder',
        path: `${node.path}/${folderName}`,
        children: []
      };
      addFile(newFolder);
    }
  };

  const getFileIcon = () => {
    if (isFolder) {
      return isExpanded ? (
        <FolderOpen size={16} className="text-blue-400" />
      ) : (
        <Folder size={16} className="text-blue-400" />
      );
    }

    const fileTypeIcons = {
      html: '🌐',
      css: '🎨',
      js: '⚡',
      md: '📝',
      txt: '📄',
      other: '📄'
    };

    const icon = fileTypeIcons[node.fileType || 'other'];
    return <span className="text-sm">{icon}</span>;
  };

  return (
    <div>
      <div
        className={`flex items-center py-1 px-2 hover:bg-zinc-700 cursor-pointer group transition-colors ${
          !isFolder ? 'hover:bg-zinc-600' : ''
        }`}
        style={{ paddingLeft: `${paddingLeft + 8}px` }}
        onClick={isFolder ? handleToggle : handleSelect}
        role="treeitem"
        aria-expanded={isFolder ? isExpanded : undefined}
        tabIndex={0}
      >
        {/* Expand/Collapse Icon */}
        <div className="w-4 h-4 flex items-center justify-center mr-1">
          {isFolder && hasChildren ? (
            isExpanded ? (
              <ChevronDown size={12} className="text-zinc-400" />
            ) : (
              <ChevronRight size={12} className="text-zinc-400" />
            )
          ) : null}
        </div>

        {/* File/Folder Icon */}
        <div className="mr-2">{getFileIcon()}</div>

        {/* Name (editable) */}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            className="flex-grow bg-zinc-800 text-white text-sm px-1 py-0 border border-zinc-500 rounded"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="flex-grow text-sm text-zinc-200 truncate"
            title={node.name}
          >
            {node.name}
          </span>
        )}

        {/* Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-2 transition-opacity">
          {isFolder && (
            <>
              <button
                onClick={handleAddFile}
                className="p-1 hover:bg-zinc-600 rounded"
                title="Add File"
              >
                <Plus size={12} className="text-zinc-400" />
              </button>
              <button
                onClick={handleAddFolder}
                className="p-1 hover:bg-zinc-600 rounded"
                title="Add Folder"
              >
                <Folder size={12} className="text-zinc-400" />
              </button>
            </>
          )}
          <button
            onClick={handleEdit}
            className="p-1 hover:bg-zinc-600 rounded"
            title="Rename"
          >
            <Edit3 size={12} className="text-zinc-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-600 rounded"
            title="Delete"
          >
            <Trash2 size={12} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* Children */}
      {isFolder && isExpanded && hasChildren && (
        <div role="group">
          {node.children!.map((child) => (
            <FileTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const FileTree: React.FC<FileTreeProps> = ({ nodes, onFileSelect }) => {
  const { addFile } = useCollaborationStore();

  const handleCreateNew = (type: 'file' | 'folder') => {
    const name = prompt(`Enter ${type} name:`);
    if (name) {
      const newItem: FileTreeNodeData = {
        id: `new-${Date.now()}`,
        name,
        type,
        path: `/${name}`,
        content: type === 'file' ? '' : undefined,
        children: type === 'folder' ? [] : undefined
      };
      addFile(newItem);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* File Tree Header */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-600">
        <span className="text-sm font-medium text-zinc-200">Project Files</span>
        <div className="flex gap-1">
          <button
            onClick={() => handleCreateNew('file')}
            className="btn btn-xs btn-ghost p-1 tooltip tooltip-bottom"
            data-tip="New File"
          >
            <Plus size={12} />
          </button>
          <button
            onClick={() => handleCreateNew('folder')}
            className="btn btn-xs btn-ghost p-1 tooltip tooltip-bottom"
            data-tip="New Folder"
          >
            <Folder size={12} />
          </button>
        </div>
      </div>

      {/* File Tree Content */}
      <div className="flex-grow overflow-y-auto" role="tree">
        {nodes.length === 0 ? (
          <div className="p-4 text-center text-zinc-400 text-sm">
            <File size={32} className="mx-auto mb-2 opacity-50" />
            <p>No files yet</p>
            <p className="text-xs">Create your first file or folder</p>
          </div>
        ) : (
          nodes.map((node) => (
            <FileTreeNode
              key={node.id}
              node={node}
              level={0}
              onFileSelect={onFileSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FileTree;