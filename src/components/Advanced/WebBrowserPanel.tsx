import React, { useState, useRef } from 'react';
import { Search, Globe, ExternalLink, BookOpen, Download, Sparkles, Database } from 'lucide-react';
import { webSearchService } from '../../services/WebSearchService';
import { useCollaborationStore } from '../../store/collaborationStore';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

interface WebPageContent {
  title: string;
  content: string;
  url: string;
  timestamp: string;
}

const WebBrowserPanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [browsedContent, setBrowsedContent] = useState<WebPageContent | null>(null);
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState('');
  const [apiResults, setApiResults] = useState<any>(null);
  const [isCallingAPI, setIsCallingAPI] = useState(false);

  const addMessage = useCollaborationStore((state) => state.addMessage);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableIntegrations = webSearchService.getAvailableIntegrations();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await webSearchService.searchWeb(searchQuery, 8);
      setSearchResults(results);
      setSearchHistory(prev => [searchQuery, ...prev.slice(0, 9)]);
      
      // Add search to collaboration context
      addMessage({
        id: `search-${Date.now()}`,
        senderName: 'Web Search',
        role: 'system',
        message: `🔍 Searched for: "${searchQuery}" - Found ${results.length} results`,
        createdAt: new Date().toISOString(),
        type: 'system'
      });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBrowsePage = async (url: string) => {
    setIsBrowsing(true);
    try {
      const content = await webSearchService.browsePage(url);
      if (content) {
        setBrowsedContent(content);
        
        // Add browsed content to collaboration context
        addMessage({
          id: `browse-${Date.now()}`,
          senderName: 'Web Browser',
          role: 'system',
          message: `🌐 Browsed: ${content.title}\n\nContent Summary: ${content.content.substring(0, 300)}...`,
          createdAt: new Date().toISOString(),
          type: 'system'
        });
      }
    } catch (error) {
      console.error('Browsing failed:', error);
    } finally {
      setIsBrowsing(false);
    }
  };

  const handleAPICall = async () => {
    if (!selectedIntegration) return;

    setIsCallingAPI(true);
    try {
      const results = await webSearchService.callAPI(selectedIntegration, { q: searchQuery });
      setApiResults(results);
      
      // Add API results to collaboration context
      addMessage({
        id: `api-${Date.now()}`,
        senderName: 'API Integration',
        role: 'system',
        message: `🔌 API Call to ${selectedIntegration}:\n\nResults: ${JSON.stringify(results, null, 2).substring(0, 500)}...`,
        createdAt: new Date().toISOString(),
        type: 'system'
      });
    } catch (error) {
      console.error('API call failed:', error);
    } finally {
      setIsCallingAPI(false);
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    inputRef.current?.focus();
  };

  const searchSuggestions = webSearchService.generateSearchSuggestions(searchQuery || 'web development');

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Globe size={20} className="text-primary" />
          🌐 Web Research & Integration
        </h3>
        
        {/* Search Bar */}
        <div className="flex gap-2 mb-3">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search the web for information..."
            className="input input-sm flex-grow"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className={`btn btn-sm btn-primary ${isSearching ? 'loading' : ''}`}
          >
            {isSearching ? '' : <Search size={14} />}
          </button>
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap gap-1 mb-3">
          {searchSuggestions.slice(0, 4).map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickSearch(suggestion)}
              className="btn btn-xs btn-ghost border border-dashed"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* API Integration Selector */}
        <div className="flex gap-2">
          <select
            value={selectedIntegration}
            onChange={(e) => setSelectedIntegration(e.target.value)}
            className="select select-sm flex-grow"
          >
            <option value="">Select API Integration...</option>
            {availableIntegrations.map((integration) => (
              <option key={integration.name} value={integration.name}>
                {integration.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAPICall}
            disabled={isCallingAPI || !selectedIntegration || !searchQuery.trim()}
            className={`btn btn-sm btn-secondary ${isCallingAPI ? 'loading' : ''}`}
          >
            {isCallingAPI ? '' : <Database size={14} />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3">
              <h4 className="font-medium text-sm mb-2">📚 Recent Searches</h4>
              <div className="flex flex-wrap gap-1">
                {searchHistory.slice(0, 5).map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickSearch(query)}
                    className="btn btn-xs btn-ghost"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3">
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Search size={14} />
                Search Results ({searchResults.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <div key={idx} className="border-l-2 border-primary/30 pl-3 py-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h5 className="font-medium text-sm text-primary">
                          {result.title}
                        </h5>
                        <p className="text-xs text-base-content/70 mt-1">
                          {result.snippet}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="badge badge-xs">{result.source}</span>
                          <span className="text-xs text-base-content/50">{result.url}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleBrowsePage(result.url)}
                        className="btn btn-xs btn-ghost p-1 ml-2"
                        title="Browse this page"
                      >
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Browsed Content */}
        {browsedContent && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <BookOpen size={14} />
                📖 Browsed Content
              </h4>
              <div className="bg-base-200 p-3 rounded">
                <h5 className="font-medium text-sm mb-2">{browsedContent.title}</h5>
                <p className="text-xs text-base-content/80 mb-2">
                  {browsedContent.content.substring(0, 400)}...
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-base-content/50">
                    {new Date(browsedContent.timestamp).toLocaleString()}
                  </span>
                  <button
                    onClick={() => window.open(browsedContent.url, '_blank')}
                    className="btn btn-xs btn-ghost"
                  >
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Results */}
        {apiResults && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Database size={14} />
                🔌 API Results
              </h4>
              <div className="bg-zinc-900 text-green-400 p-3 rounded font-mono text-xs max-h-48 overflow-y-auto">
                <pre>{JSON.stringify(apiResults, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Loading States */}
        {(isSearching || isBrowsing || isCallingAPI) && (
          <div className="card bg-base-100 shadow-sm">
            <div className="card-body p-3 text-center">
              <div className="loading loading-spinner loading-md mx-auto mb-2"></div>
              <p className="text-sm">
                {isSearching && '🔍 Searching the web...'}
                {isBrowsing && '🌐 Browsing page content...'}
                {isCallingAPI && '🔌 Calling API integration...'}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !browsedContent && !apiResults && !isSearching && !isBrowsing && !isCallingAPI && (
          <div className="text-center py-8 text-base-content/60">
            <Globe size={48} className="mx-auto mb-4 opacity-50" />
            <h4 className="font-semibold mb-2">🌐 Web Research Assistant</h4>
            <p className="text-sm mb-4">
              Search the web, browse pages, and integrate with external APIs to enhance AI collaboration.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-medium">💡 Try searching for:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['React best practices', 'AI collaboration', 'API design patterns'].map((example) => (
                  <button
                    key={example}
                    onClick={() => handleQuickSearch(example)}
                    className="btn btn-xs btn-outline"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebBrowserPanel;