import React, { useEffect, useRef, useState } from 'react';
import { useCollaborationStore } from '../../store/collaborationStore';
import { BarChart3, TrendingUp, Activity, Users, Zap, Brain } from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'user' | 'ai-worker-1' | 'ai-worker-2' | 'system' | 'decision' | 'result';
  label: string;
  timestamp: string;
  content: string;
  position: { x: number; y: number };
  connections: string[];
}

interface CollaborationMetrics {
  totalMessages: number;
  averageResponseTime: number;
  collaborationEfficiency: number;
  topicSwitches: number;
  decisionsCount: number;
  workerContributions: {
    worker1: number;
    worker2: number;
    user: number;
  };
}

const CollaborationFlowChart: React.FC = () => {
  const messages = useCollaborationStore((state) => state.messages);
  const control = useCollaborationStore((state) => state.control);
  const aiWorkers = useCollaborationStore((state) => state.aiWorkers);
  
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [metrics, setMetrics] = useState<CollaborationMetrics>({
    totalMessages: 0,
    averageResponseTime: 2.3,
    collaborationEfficiency: 87,
    topicSwitches: 3,
    decisionsCount: 8,
    workerContributions: { worker1: 45, worker2: 42, user: 13 }
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState<'all' | '1h' | '24h' | 'session'>('session');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate flow nodes from messages
  useEffect(() => {
    const nodes: FlowNode[] = messages.map((msg, index) => {
      const nodeType = msg.senderName === 'User' ? 'user' : 
                      msg.senderName === aiWorkers.worker1.name ? 'ai-worker-1' :
                      msg.senderName === aiWorkers.worker2.name ? 'ai-worker-2' : 'system';
      
      return {
        id: msg.id,
        type: nodeType,
        label: msg.senderName,
        timestamp: msg.createdAt,
        content: msg.message.substring(0, 100),
        position: { 
          x: 50 + (index % 5) * 120,
          y: 50 + Math.floor(index / 5) * 80
        },
        connections: index > 0 ? [messages[index - 1].id] : []
      };
    });
    
    setFlowNodes(nodes);
    
    // Update metrics
    setMetrics(prev => ({
      ...prev,
      totalMessages: messages.length,
      workerContributions: {
        worker1: messages.filter(m => m.senderName === aiWorkers.worker1.name).length,
        worker2: messages.filter(m => m.senderName === aiWorkers.worker2.name).length,
        user: messages.filter(m => m.senderName === 'User').length
      }
    }));
  }, [messages, aiWorkers]);

  // Draw flow chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 400;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    flowNodes.forEach(node => {
      node.connections.forEach(connectionId => {
        const connectedNode = flowNodes.find(n => n.id === connectionId);
        if (connectedNode) {
          ctx.beginPath();
          ctx.moveTo(connectedNode.position.x + 50, connectedNode.position.y + 25);
          ctx.lineTo(node.position.x + 50, node.position.y + 25);
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    flowNodes.forEach(node => {
      const { x, y } = node.position;
      
      // Node background
      ctx.fillStyle = getNodeColor(node.type);
      ctx.fillRect(x, y, 100, 50);
      
      // Node border
      ctx.strokeStyle = getNodeBorderColor(node.type);
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 100, 50);
      
      // Node text
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(node.label, x + 50, y + 20);
      ctx.font = '10px sans-serif';
      ctx.fillText(new Date(node.timestamp).toLocaleTimeString(), x + 50, y + 35);
    });
  }, [flowNodes]);

  const getNodeColor = (type: string): string => {
    switch (type) {
      case 'user': return '#3b82f6';
      case 'ai-worker-1': return '#10b981';
      case 'ai-worker-2': return '#f59e0b';
      case 'system': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const getNodeBorderColor = (type: string): string => {
    switch (type) {
      case 'user': return '#1d4ed8';
      case 'ai-worker-1': return '#047857';
      case 'ai-worker-2': return '#d97706';
      case 'system': return '#4338ca';
      default: return '#374151';
    }
  };

  const getEfficiencyColor = (efficiency: number): string => {
    if (efficiency >= 80) return 'text-success';
    if (efficiency >= 60) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            📊 Collaboration Analytics
          </h3>
          
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="select select-sm"
          >
            <option value="session">Current Session</option>
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="all">All Time</option>
          </select>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="stat bg-base-100 rounded p-3">
            <div className="stat-figure text-primary">
              <Activity size={20} />
            </div>
            <div className="stat-title text-xs">Messages</div>
            <div className="stat-value text-lg">{metrics.totalMessages}</div>
          </div>
          
          <div className="stat bg-base-100 rounded p-3">
            <div className="stat-figure text-secondary">
              <Zap size={20} />
            </div>
            <div className="stat-title text-xs">Avg Response</div>
            <div className="stat-value text-lg">{metrics.averageResponseTime}s</div>
          </div>
          
          <div className="stat bg-base-100 rounded p-3">
            <div className="stat-figure text-accent">
              <TrendingUp size={20} />
            </div>
            <div className="stat-title text-xs">Efficiency</div>
            <div className={`stat-value text-lg ${getEfficiencyColor(metrics.collaborationEfficiency)}`}>
              {metrics.collaborationEfficiency}%
            </div>
          </div>
          
          <div className="stat bg-base-100 rounded p-3">
            <div className="stat-figure text-info">
              <Brain size={20} />
            </div>
            <div className="stat-title text-xs">Decisions</div>
            <div className="stat-value text-lg">{metrics.decisionsCount}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {/* Flow Visualization */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Activity size={16} />
              🔄 Collaboration Flow
            </h4>
            
            <div className="bg-base-200 rounded p-3 overflow-x-auto">
              <canvas
                ref={canvasRef}
                className="border border-base-300 rounded bg-white"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
            
            {/* Flow Legend */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>User</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>{aiWorkers.worker1.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>{aiWorkers.worker2.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span>System</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Users size={16} />
                👥 Participation Distribution
              </h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{aiWorkers.worker1.name}</span>
                    <span>{metrics.workerContributions.worker1} messages</span>
                  </div>
                  <progress 
                    className="progress progress-primary w-full" 
                    value={metrics.workerContributions.worker1} 
                    max={metrics.totalMessages}
                  ></progress>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{aiWorkers.worker2.name}</span>
                    <span>{metrics.workerContributions.worker2} messages</span>
                  </div>
                  <progress 
                    className="progress progress-secondary w-full" 
                    value={metrics.workerContributions.worker2} 
                    max={metrics.totalMessages}
                  ></progress>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>User</span>
                    <span>{metrics.workerContributions.user} messages</span>
                  </div>
                  <progress 
                    className="progress progress-accent w-full" 
                    value={metrics.workerContributions.user} 
                    max={metrics.totalMessages}
                  ></progress>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp size={16} />
                📈 Performance Insights
              </h4>
              
              <div className="space-y-3">
                <div className="bg-base-200 p-3 rounded">
                  <div className="text-sm font-medium mb-1">💡 Collaboration Quality</div>
                  <div className="text-xs text-base-content/70">
                    High engagement with {metrics.decisionsCount} key decisions made. 
                    Workers showing good balance in contributions.
                  </div>
                </div>
                
                <div className="bg-base-200 p-3 rounded">
                  <div className="text-sm font-medium mb-1">⚡ Response Patterns</div>
                  <div className="text-xs text-base-content/70">
                    Average response time of {metrics.averageResponseTime}s indicates 
                    efficient processing. {metrics.topicSwitches} topic transitions detected.
                  </div>
                </div>
                
                <div className="bg-base-200 p-3 rounded">
                  <div className="text-sm font-medium mb-1">🎯 Optimization Suggestions</div>
                  <div className="text-xs text-base-content/70">
                    Consider increasing turn limit for complex topics. 
                    Worker specializations are well-aligned.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collaboration Timeline */}
        <div className="card bg-base-100 shadow-sm">
          <div className="card-body p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Activity size={16} />
              ⏱️ Session Timeline
            </h4>
            
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-2" style={{ minWidth: '600px' }}>
                {flowNodes.slice(-10).map((node, idx) => (
                  <div key={node.id} className="flex flex-col items-center">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getNodeColor(node.type) }}
                    ></div>
                    <div className="w-px bg-base-300 h-8"></div>
                    <div className="text-xs text-center max-w-20">
                      <div className="font-medium">{node.label}</div>
                      <div className="text-base-content/50">
                        {new Date(node.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Session Status */}
        <div className="card bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="card-body p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-1">🚀 Session Status</h4>
                <p className="text-sm text-base-content/70">
                  {control.isCollaborating 
                    ? `Active collaboration - Turn ${control.currentTurn}/${control.totalTurns}`
                    : 'Ready for new collaboration session'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {control.isCollaborating ? '🟢' : '⚪'}
                </div>
                <div className="text-xs text-base-content/50">
                  {control.isPaused ? 'Paused' : control.isCollaborating ? 'Active' : 'Idle'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationFlowChart;