import React, { useState, useEffect } from 'react';
import { Brain, Database, Trash2, Download, Upload, Search, Tag, Star } from 'lucide-react';
import { useCollaborationStore } from '../../store/collaborationStore';

interface MemoryChunk {
  id: string;
  content: string;
  type: 'conversation' | 'decision' | 'code' | 'insight' | 'reference';
  importance: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  timestamp: string;
  source: string;
  summary?: string;
  relatedChunks: string[];
}

interface MemorySearchResult {
  chunk: MemoryChunk;
  relevance: number;
  highlights: string[];
}

const AdvancedMemoryManager: React.FC = () => {
  const messages = useCollaborationStore((state) => state.messages);
  const contextMemory = useCollaborationStore((state) => state.contextMemory);
  const addToMemory = useCollaborationStore((state) => state.addToMemory);
  
  const [memoryChunks, setMemoryChunks] = useState<MemoryChunk[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemorySearchResult[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'search' | 'insights'>('browse');

  // Initialize memory chunks from messages
  useEffect(() => {
    const chunks: MemoryChunk[] = messages.map((msg, index) => {
      const type = msg.type === 'system' ? 'reference' : 
                  msg.message.includes('```') ? 'code' :
                  msg.message.includes('decision') || msg.message.includes('choose') ? 'decision' :
                  msg.message.includes('insight') || msg.message.includes('analysis') ? 'insight' : 'conversation';

      const importance = msg.senderName === 'User' ? 'high' :
                        type === 'decision' || type === 'insight' ? 'high' :
                        type === 'code' ? 'medium' : 'low';

      const tags = extractTags(msg.message);

      return {
        id: `chunk-${msg.id}`,
        content: msg.message,
        type,
        importance,
        tags,
        timestamp: msg.createdAt,
        source: msg.senderName,
        summary: generateSummary(msg.message),
        relatedChunks: []
      };
    });

    // Find related chunks
    chunks.forEach(chunk => {
      chunk.relatedChunks = findRelatedChunks(chunk, chunks);
    });

    setMemoryChunks(chunks);
  }, [messages]);

  const extractTags = (content: string): string[] => {
    const tags: string[] = [];
    
    // Programming languages
    if (content.includes('javascript') || content.includes('js')) tags.push('javascript');
    if (content.includes('typescript') || content.includes('ts')) tags.push('typescript');
    if (content.includes('react')) tags.push('react');
    if (content.includes('python')) tags.push('python');
    if (content.includes('css')) tags.push('css');
    if (content.includes('html')) tags.push('html');
    
    // Topics
    if (content.includes('api')) tags.push('api');
    if (content.includes('database')) tags.push('database');
    if (content.includes('performance')) tags.push('performance');
    if (content.includes('security')) tags.push('security');
    if (content.includes('testing')) tags.push('testing');
    if (content.includes('deployment')) tags.push('deployment');
    
    // Actions
    if (content.includes('bug') || content.includes('error')) tags.push('debugging');
    if (content.includes('optimize')) tags.push('optimization');
    if (content.includes('refactor')) tags.push('refactoring');
    
    return tags.slice(0, 5); // Limit to 5 tags
  };

  const generateSummary = (content: string): string => {
    // Simple extractive summary - take first sentence and keep it under 100 chars
    const firstSentence = content.split(/[.!?]/)[0];
    return firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
  };

  const findRelatedChunks = (chunk: MemoryChunk, allChunks: MemoryChunk[]): string[] => {
    return allChunks
      .filter(otherChunk => otherChunk.id !== chunk.id)
      .filter(otherChunk => {
        // Check for common tags
        const commonTags = chunk.tags.filter(tag => otherChunk.tags.includes(tag));
        return commonTags.length > 0;
      })
      .slice(0, 3)
      .map(chunk => chunk.id);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: MemorySearchResult[] = memoryChunks
      .map(chunk => {
        const contentMatch = chunk.content.toLowerCase().includes(query);
        const tagMatch = chunk.tags.some(tag => tag.toLowerCase().includes(query));
        const summaryMatch = chunk.summary?.toLowerCase().includes(query);
        
        let relevance = 0;
        const highlights: string[] = [];
        
        if (contentMatch) {
          relevance += 3;
          highlights.push('content');
        }
        if (tagMatch) {
          relevance += 2;
          highlights.push('tags');
        }
        if (summaryMatch) {
          relevance += 1;
          highlights.push('summary');
        }
        
        return { chunk, relevance, highlights };
      })
      .filter(result => result.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20);

    setSearchResults(results);
  };

  const getFilteredChunks = () => {
    let filtered = memoryChunks;
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(chunk => chunk.type === selectedType);
    }
    
    if (selectedImportance !== 'all') {
      filtered = filtered.filter(chunk => chunk.importance === selectedImportance);
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getImportanceColor = (importance: string): string => {
    switch (importance) {
      case 'critical': return 'badge-error';
      case 'high': return 'badge-warning';
      case 'medium': return 'badge-info';
      default: return 'badge-ghost';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'decision': return '🎯';
      case 'code': return '💻';
      case 'insight': return '💡';
      case 'reference': return '📚';
      default: return '💬';
    }
  };

  const handleExportMemory = () => {
    const data = JSON.stringify(memoryChunks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collaboration-memory-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateInsights = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      // Simulate insight generation
      const insights = [
        "📈 Code-related discussions increased 40% in the last session",
        "🎯 Most decisions were made collaboratively between both AI workers",
        "💡 Performance optimization emerged as a recurring theme",
        "🔍 JavaScript and React are the most frequently discussed technologies",
        "⚡ Average decision time improved by 25% compared to previous sessions"
      ];
      
      insights.forEach(insight => {
        addToMemory('summaries', insight);
      });
      
      setIsProcessing(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Brain size={20} className="text-primary" />
          🧠 Advanced Memory Manager
        </h3>
        
        {/* Tabs */}
        <div className="tabs tabs-boxed mb-3">
          <button 
            className={`tab ${activeTab === 'browse' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            📁 Browse
          </button>
          <button 
            className={`tab ${activeTab === 'search' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            🔍 Search
          </button>
          <button 
            className={`tab ${activeTab === 'insights' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            💡 Insights
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-2 items-center">
          {activeTab === 'search' ? (
            <div className="flex gap-2 flex-grow">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search memory..."
                className="input input-sm flex-grow"
              />
              <button onClick={handleSearch} className="btn btn-sm btn-primary">
                <Search size={14} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2 flex-grow">
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="select select-sm"
              >
                <option value="all">All Types</option>
                <option value="conversation">💬 Conversations</option>
                <option value="decision">🎯 Decisions</option>
                <option value="code">💻 Code</option>
                <option value="insight">💡 Insights</option>
                <option value="reference">📚 References</option>
              </select>
              
              <select 
                value={selectedImportance} 
                onChange={(e) => setSelectedImportance(e.target.value)}
                className="select select-sm"
              >
                <option value="all">All Importance</option>
                <option value="critical">🔴 Critical</option>
                <option value="high">🟡 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
          )}
          
          <button 
            onClick={handleExportMemory}
            className="btn btn-sm btn-ghost tooltip tooltip-bottom"
            data-tip="Export Memory"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-4">
        {activeTab === 'browse' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-base-content/70">
                {getFilteredChunks().length} memory chunks
              </span>
              <div className="stats stats-horizontal bg-base-100 shadow-sm">
                <div className="stat py-2 px-3">
                  <div className="stat-title text-xs">Total</div>
                  <div className="stat-value text-sm">{memoryChunks.length}</div>
                </div>
              </div>
            </div>

            {getFilteredChunks().map((chunk) => (
              <div key={chunk.id} className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(chunk.type)}</span>
                      <span className={`badge badge-sm ${getImportanceColor(chunk.importance)}`}>
                        {chunk.importance}
                      </span>
                      <span className="text-sm text-base-content/70">{chunk.source}</span>
                    </div>
                    <span className="text-xs text-base-content/50">
                      {new Date(chunk.timestamp).toLocaleString()}
                    </span>
                  </div>

                  {chunk.summary && (
                    <p className="text-sm font-medium mb-2">{chunk.summary}</p>
                  )}

                  <p className="text-sm text-base-content/80 mb-3 line-clamp-3">
                    {chunk.content.substring(0, 200)}...
                  </p>

                  {chunk.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {chunk.tags.map((tag) => (
                        <span key={tag} className="badge badge-outline badge-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {chunk.relatedChunks.length > 0 && (
                    <div className="text-xs text-base-content/60">
                      🔗 {chunk.relatedChunks.length} related memories
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-3">
            {searchResults.length > 0 ? (
              <>
                <div className="text-sm text-base-content/70 mb-3">
                  Found {searchResults.length} results for "{searchQuery}"
                </div>
                {searchResults.map((result) => (
                  <div key={result.chunk.id} className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getTypeIcon(result.chunk.type)}</span>
                          <span className={`badge badge-sm ${getImportanceColor(result.chunk.importance)}`}>
                            {result.chunk.importance}
                          </span>
                          <span className="badge badge-primary badge-sm">
                            {(result.relevance * 20).toFixed(0)}% match
                          </span>
                        </div>
                        <span className="text-xs text-base-content/50">
                          {new Date(result.chunk.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-sm text-base-content/80 mb-3">
                        {result.chunk.content.substring(0, 300)}...
                      </p>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-base-content/60">Matched in:</span>
                        {result.highlights.map((highlight) => (
                          <span key={highlight} className="badge badge-outline badge-xs">
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : searchQuery ? (
              <div className="text-center py-8 text-base-content/60">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p>No results found for "{searchQuery}"</p>
                <p className="text-sm">Try different keywords or broader terms</p>
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/60">
                <Search size={48} className="mx-auto mb-4 opacity-50" />
                <p>Enter a search query to find relevant memories</p>
                <p className="text-sm">Search by content, tags, or key concepts</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">🧠 AI-Generated Insights</h4>
                  <button 
                    onClick={generateInsights}
                    disabled={isProcessing}
                    className={`btn btn-sm btn-primary ${isProcessing ? 'loading' : ''}`}
                  >
                    {isProcessing ? '' : 'Generate Insights'}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {contextMemory.summaries.map((insight, idx) => (
                    <div key={idx} className="bg-base-200 p-3 rounded">
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                  
                  {contextMemory.summaries.length === 0 && !isProcessing && (
                    <div className="text-center py-6 text-base-content/60">
                      <Brain size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No insights generated yet</p>
                      <p className="text-xs">Click "Generate Insights" to analyze your collaboration patterns</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2">📊 Memory Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Chunks:</span>
                      <span className="font-mono">{memoryChunks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversations:</span>
                      <span className="font-mono">
                        {memoryChunks.filter(c => c.type === 'conversation').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Decisions:</span>
                      <span className="font-mono">
                        {memoryChunks.filter(c => c.type === 'decision').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Code Snippets:</span>
                      <span className="font-mono">
                        {memoryChunks.filter(c => c.type === 'code').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm">
                <div className="card-body p-4">
                  <h4 className="font-medium mb-2">🏷️ Top Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(
                      memoryChunks
                        .flatMap(chunk => chunk.tags)
                        .reduce((acc, tag) => {
                          acc.set(tag, (acc.get(tag) || 0) + 1);
                          return acc;
                        }, new Map())
                    )
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 10)
                      .map(([tag, count]) => (
                        <span key={tag} className="badge badge-outline badge-sm">
                          {tag} ({count})
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedMemoryManager;