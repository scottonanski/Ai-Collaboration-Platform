import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, Maximize2, Download, Share, Lightbulb, Target, Zap } from 'lucide-react';
import { useCollaborationStore } from '../../store/collaborationStore';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  type: 'central' | 'main' | 'sub' | 'detail';
  color: string;
  connections: string[];
  createdAt: string;
}

interface Connection {
  from: string;
  to: string;
  type: 'solid' | 'dashed' | 'dotted';
  color: string;
}

const MindMapVisualizer: React.FC = () => {
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [newNodeText, setNewNodeText] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const addMessage = useCollaborationStore((state) => state.addMessage);
  const messages = useCollaborationStore((state) => state.messages);

  const nodeColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
  ];

  const nodeTypes = [
    { type: 'central', label: '🎯 Central', size: 60 },
    { type: 'main', label: '📍 Main', size: 45 },
    { type: 'sub', label: '📝 Sub', size: 35 },
    { type: 'detail', label: '💡 Detail', size: 25 }
  ];

  // Initialize with sample data
  useEffect(() => {
    if (nodes.length === 0) {
      const centralNode: MindMapNode = {
        id: 'central-1',
        text: 'AI Collaboration Project',
        x: 400,
        y: 300,
        type: 'central',
        color: '#3b82f6',
        connections: [],
        createdAt: new Date().toISOString()
      };

      const sampleNodes: MindMapNode[] = [
        centralNode,
        {
          id: 'main-1',
          text: 'Core Features',
          x: 250,
          y: 200,
          type: 'main',
          color: '#10b981',
          connections: ['central-1'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'main-2',
          text: 'Advanced Tools',
          x: 550,
          y: 200,
          type: 'main',
          color: '#f59e0b',
          connections: ['central-1'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub-1',
          text: 'Chat Interface',
          x: 150,
          y: 120,
          type: 'sub',
          color: '#10b981',
          connections: ['main-1'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub-2',
          text: 'Live Preview',
          x: 150,
          y: 280,
          type: 'sub',
          color: '#10b981',
          connections: ['main-1'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub-3',
          text: 'Web Research',
          x: 650,
          y: 120,
          type: 'sub',
          color: '#f59e0b',
          connections: ['main-2'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'sub-4',
          text: 'Code Execution',
          x: 650,
          y: 280,
          type: 'sub',
          color: '#f59e0b',
          connections: ['main-2'],
          createdAt: new Date().toISOString()
        }
      ];

      setNodes(sampleNodes);
    }
  }, [nodes.length]);

  // Update canvas size
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw mind map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x, pan.y);

    // Draw connections first
    nodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = nodes.find(n => n.id === connectionId);
        if (connectedNode) {
          drawConnection(ctx, node, connectedNode);
        }
      });
    });

    // Draw nodes
    nodes.forEach(node => {
      drawNode(ctx, node, node.id === selectedNode);
    });

    ctx.restore();
  }, [nodes, selectedNode, canvasSize, zoom, pan]);

  const drawConnection = (ctx: CanvasRenderingContext2D, from: MindMapNode, to: MindMapNode) => {
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(from.x, from.y);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawNode = (ctx: CanvasRenderingContext2D, node: MindMapNode, isSelected: boolean) => {
    const typeConfig = nodeTypes.find(t => t.type === node.type);
    const size = typeConfig?.size || 40;

    // Draw node background
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, size / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw border if selected
    if (isSelected) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(10, size / 4)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap text if too long
    const maxWidth = size - 10;
    const words = node.text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine + ' ' + word;
      const testWidth = ctx.measureText(testLine).width;
      
      if (testWidth > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Draw text lines
    const lineHeight = Math.max(12, size / 3);
    const startY = node.y - (lines.length - 1) * lineHeight / 2;
    
    lines.forEach((line, index) => {
      ctx.fillText(line, node.x, startY + index * lineHeight);
    });
  };

  const getNodeAtPosition = (x: number, y: number): MindMapNode | null => {
    // Adjust for zoom and pan
    const adjustedX = (x - pan.x) / zoom;
    const adjustedY = (y - pan.y) / zoom;

    for (const node of nodes) {
      const typeConfig = nodeTypes.find(t => t.type === node.type);
      const size = typeConfig?.size || 40;
      const distance = Math.sqrt((adjustedX - node.x) ** 2 + (adjustedY - node.y) ** 2);
      
      if (distance <= size / 2) {
        return node;
      }
    }
    return null;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const clickedNode = getNodeAtPosition(x, y);
    
    if (clickedNode) {
      setSelectedNode(clickedNode.id);
    } else if (isCreating) {
      createNode(x, y);
      setIsCreating(false);
    } else {
      setSelectedNode(null);
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const clickedNode = getNodeAtPosition(x, y);
    
    if (clickedNode) {
      setIsDragging(true);
      setDragNode(clickedNode.id);
      setDragOffset({
        x: (x - pan.x) / zoom - clickedNode.x,
        y: (y - pan.y) / zoom - clickedNode.y
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !dragNode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const newX = (x - pan.x) / zoom - dragOffset.x;
    const newY = (y - pan.y) / zoom - dragOffset.y;

    setNodes(prev => prev.map(node =>
      node.id === dragNode
        ? { ...node, x: newX, y: newY }
        : node
    ));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
  };

  const createNode = (x: number, y: number) => {
    if (!newNodeText.trim()) return;

    const adjustedX = (x - pan.x) / zoom;
    const adjustedY = (y - pan.y) / zoom;

    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      text: newNodeText,
      x: adjustedX,
      y: adjustedY,
      type: 'sub',
      color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
      connections: selectedNode ? [selectedNode] : [],
      createdAt: new Date().toISOString()
    };

    setNodes(prev => [...prev, newNode]);
    setNewNodeText('');
    
    // Add to collaboration context
    addMessage({
      id: `mindmap-${Date.now()}`,
      senderName: 'Mind Map',
      role: 'system',
      message: `🧠 New mind map node created: "${newNode.text}" (${newNode.type})`,
      createdAt: new Date().toISOString(),
      type: 'system'
    });
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;

    setNodes(prev => {
      // Remove connections to this node
      const filtered = prev.filter(node => node.id !== selectedNode);
      return filtered.map(node => ({
        ...node,
        connections: node.connections.filter(conn => conn !== selectedNode)
      }));
    });
    
    setSelectedNode(null);
  };

  const connectNodes = (nodeId1: string, nodeId2: string) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId1 && !node.connections.includes(nodeId2)) {
        return { ...node, connections: [...node.connections, nodeId2] };
      }
      return node;
    }));
  };

  const generateInsights = () => {
    const insights = [
      `🧠 Mind map contains ${nodes.length} nodes with ${nodes.reduce((acc, node) => acc + node.connections.length, 0)} connections`,
      `🎯 Central themes: ${nodes.filter(n => n.type === 'central' || n.type === 'main').map(n => n.text).join(', ')}`,
      `💡 Most connected concept: "${nodes.reduce((max, node) => node.connections.length > max.connections.length ? node : max).text}"`,
      `🔍 Areas for expansion: ${nodes.filter(n => n.connections.length === 0).length} unconnected nodes`,
      `📊 Node distribution: ${nodeTypes.map(type => `${type.label} (${nodes.filter(n => n.type === type.type).length})`).join(', ')}`
    ];

    insights.forEach(insight => {
      addMessage({
        id: `insight-${Date.now()}-${Math.random()}`,
        senderName: 'Mind Map Analyzer',
        role: 'system',
        message: insight,
        createdAt: new Date().toISOString(),
        type: 'system'
      });
    });
  };

  const exportMindMap = () => {
    const data = {
      nodes,
      metadata: {
        created: new Date().toISOString(),
        nodeCount: nodes.length,
        connectionCount: nodes.reduce((acc, node) => acc + node.connections.length, 0)
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null;

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Lightbulb size={20} className="text-primary" />
            🧠 Interactive Mind Map
          </h3>
          
          <div className="flex gap-2">
            <button
              onClick={generateInsights}
              className="btn btn-sm btn-secondary tooltip tooltip-bottom"
              data-tip="Generate Insights"
            >
              <Target size={14} />
            </button>
            <button
              onClick={exportMindMap}
              className="btn btn-sm btn-ghost tooltip tooltip-bottom"
              data-tip="Export Mind Map"
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 items-center mb-3">
          <input
            type="text"
            value={newNodeText}
            onChange={(e) => setNewNodeText(e.target.value)}
            placeholder="Enter node text..."
            className="input input-sm flex-grow"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newNodeText.trim()) {
                setIsCreating(true);
              }
            }}
          />
          
          <button
            onClick={() => setIsCreating(true)}
            disabled={!newNodeText.trim()}
            className={`btn btn-sm btn-primary ${isCreating ? 'btn-active' : ''}`}
          >
            <Plus size={14} />
            {isCreating ? 'Click to Place' : 'Add Node'}
          </button>
          
          {selectedNode && (
            <button
              onClick={deleteSelectedNode}
              className="btn btn-sm btn-error"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        {/* Zoom and Pan Controls */}
        <div className="flex gap-2 items-center">
          <span className="text-sm">Zoom:</span>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="range range-sm w-20"
          />
          <span className="text-xs w-8">{Math.round(zoom * 100)}%</span>
          
          <button
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
            className="btn btn-xs btn-ghost"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-grow flex">
        {/* Canvas */}
        <div ref={containerRef} className="flex-grow relative overflow-hidden bg-gray-50">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 cursor-crosshair"
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
          
          {isCreating && (
            <div className="absolute top-4 left-4 bg-primary text-primary-content px-3 py-1 rounded">
              Click anywhere to place: "{newNodeText}"
            </div>
          )}
        </div>

        {/* Node Details Panel */}
        {selectedNodeData && (
          <div className="w-64 bg-base-100 border-l border-base-300 p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Edit3 size={16} />
              Node Details
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="label">
                  <span className="label-text">Text</span>
                </label>
                <input
                  type="text"
                  value={selectedNodeData.text}
                  onChange={(e) => {
                    setNodes(prev => prev.map(node =>
                      node.id === selectedNode
                        ? { ...node, text: e.target.value }
                        : node
                    ));
                  }}
                  className="input input-sm w-full"
                />
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Type</span>
                </label>
                <select
                  value={selectedNodeData.type}
                  onChange={(e) => {
                    setNodes(prev => prev.map(node =>
                      node.id === selectedNode
                        ? { ...node, type: e.target.value as any }
                        : node
                    ));
                  }}
                  className="select select-sm w-full"
                >
                  {nodeTypes.map(type => (
                    <option key={type.type} value={type.type}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Color</span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {nodeColors.map(color => (
                    <button
                      key={color}
                      onClick={() => {
                        setNodes(prev => prev.map(node =>
                          node.id === selectedNode
                            ? { ...node, color }
                            : node
                        ));
                      }}
                      className={`w-6 h-6 rounded border-2 ${
                        selectedNodeData.color === color ? 'border-black' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="label">
                  <span className="label-text">Connections ({selectedNodeData.connections.length})</span>
                </label>
                <div className="space-y-1">
                  {selectedNodeData.connections.map(connId => {
                    const connectedNode = nodes.find(n => n.id === connId);
                    return connectedNode ? (
                      <div key={connId} className="text-xs bg-base-200 p-1 rounded">
                        {connectedNode.text}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              
              <div className="text-xs text-base-content/60">
                Created: {new Date(selectedNodeData.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="border-t border-base-300 p-2 bg-base-100 text-sm flex items-center justify-between">
        <div>
          {nodes.length} nodes • {nodes.reduce((acc, node) => acc + node.connections.length, 0)} connections
        </div>
        <div className="flex items-center gap-4">
          {selectedNode && (
            <span className="text-primary">
              Selected: {selectedNodeData?.text}
            </span>
          )}
          {isCreating && (
            <span className="text-secondary">
              Creating mode: Click to place node
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindMapVisualizer;