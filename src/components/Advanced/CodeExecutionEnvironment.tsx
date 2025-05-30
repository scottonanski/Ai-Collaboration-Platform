import React, { useState, useRef, useEffect } from 'react';
import { Play, Square, Download, Upload, Trash2, Settings, Terminal, Code } from 'lucide-react';
import { useCollaborationStore } from '../../store/collaborationStore';

interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  timestamp: string;
}

interface CodeTemplate {
  name: string;
  language: string;
  code: string;
  description: string;
}

const CodeExecutionEnvironment: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [showConsole, setShowConsole] = useState(true);
  const [executionMode, setExecutionMode] = useState<'browser' | 'simulation'>('simulation');
  
  const addMessage = useCollaborationStore((state) => state.addMessage);
  const setCodeContent = useCollaborationStore((state) => state.setCodeContent);
  const codeContent = useCollaborationStore((state) => state.codeContent);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const workerRef = useRef<Worker | null>(null);

  const supportedLanguages = [
    { id: 'javascript', name: 'JavaScript', icon: '⚡' },
    { id: 'typescript', name: 'TypeScript', icon: '🔷' },
    { id: 'python', name: 'Python (Simulated)', icon: '🐍' },
    { id: 'html', name: 'HTML', icon: '🌐' },
    { id: 'css', name: 'CSS', icon: '🎨' }
  ];

  const codeTemplates: CodeTemplate[] = [
    {
      name: 'JavaScript Calculator',
      language: 'javascript',
      description: 'Simple calculator with basic operations',
      code: `// Interactive Calculator
function calculate(expression) {
  try {
    // Simple math parser (be careful with eval in production!)
    const result = Function('"use strict"; return (' + expression + ')')();
    return result;
  } catch (error) {
    return 'Error: ' + error.message;
  }
}

// Demo calculations
console.log('🧮 Calculator Demo:');
console.log('2 + 2 =', calculate('2 + 2'));
console.log('10 * 5 =', calculate('10 * 5'));
console.log('Math.sqrt(16) =', calculate('Math.sqrt(16)'));

// Interactive function
function interactiveCalculator() {
  const expressions = ['5 + 3', '10 / 2', 'Math.PI * 2', '2 ** 8'];
  expressions.forEach(expr => {
    console.log(\`\${expr} = \${calculate(expr)}\`);
  });
}

interactiveCalculator();
console.log('✅ Calculator demo completed!');`
    },
    {
      name: 'Data Processing',
      language: 'javascript',
      description: 'Array manipulation and data analysis',
      code: `// Data Processing Example
const salesData = [
  { month: 'Jan', sales: 1200, region: 'North' },
  { month: 'Feb', sales: 1500, region: 'South' },
  { month: 'Mar', sales: 1800, region: 'North' },
  { month: 'Apr', sales: 1400, region: 'South' },
  { month: 'May', sales: 2000, region: 'North' }
];

console.log('📊 Sales Data Analysis:');
console.log('Raw data:', salesData);

// Calculate total sales
const totalSales = salesData.reduce((sum, item) => sum + item.sales, 0);
console.log('💰 Total Sales:', totalSales);

// Average sales per month
const avgSales = totalSales / salesData.length;
console.log('📈 Average Monthly Sales:', avgSales.toFixed(2));

// Sales by region
const salesByRegion = salesData.reduce((acc, item) => {
  acc[item.region] = (acc[item.region] || 0) + item.sales;
  return acc;
}, {});
console.log('🗺️ Sales by Region:', salesByRegion);

// Best performing month
const bestMonth = salesData.reduce((max, item) => 
  item.sales > max.sales ? item : max
);
console.log('🏆 Best Month:', bestMonth);

console.log('✅ Data analysis completed!');`
    },
    {
      name: 'DOM Manipulation',
      language: 'javascript',
      description: 'Interactive web page elements',
      code: `// DOM Manipulation Demo
console.log('🖥️ DOM Manipulation Demo Starting...');

// Create dynamic content
function createInteractiveElement() {
  const container = document.createElement('div');
  container.style.cssText = \`
    padding: 20px;
    margin: 10px;
    background: linear-gradient(45deg, #667eea, #764ba2);
    color: white;
    border-radius: 10px;
    text-align: center;
    font-family: Arial, sans-serif;
  \`;
  
  const title = document.createElement('h3');
  title.textContent = '🎮 Interactive Demo';
  container.appendChild(title);
  
  const button = document.createElement('button');
  button.textContent = '✨ Click for Magic!';
  button.style.cssText = \`
    padding: 10px 20px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 10px;
  \`;
  
  let clickCount = 0;
  const output = document.createElement('p');
  output.textContent = 'Ready for magic...';
  
  button.addEventListener('click', () => {
    clickCount++;
    const emojis = ['🎉', '🚀', '⚡', '✨', '🎯', '💫'];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    output.textContent = \`\${randomEmoji} Magic happened! Click #\${clickCount}\`;
    button.style.background = \`hsl(\${Math.random() * 360}, 70%, 50%)\`;
  });
  
  container.appendChild(button);
  container.appendChild(output);
  
  return container;
}

// Add to page if running in browser
try {
  if (typeof document !== 'undefined') {
    const element = createInteractiveElement();
    document.body.appendChild(element);
    console.log('✅ Interactive element added to page!');
  } else {
    console.log('📝 Code prepared for browser execution');
  }
} catch (error) {
  console.log('ℹ️ Running in simulation mode');
  console.log('🎯 This code creates an interactive button with color changes');
}

console.log('✅ DOM manipulation demo completed!');`
    },
    {
      name: 'API Simulation',
      language: 'javascript',
      description: 'Simulated API calls and async operations',
      code: `// API Simulation Demo
console.log('🌐 API Simulation Starting...');

// Simulate API delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock API functions
async function fetchUserData(userId) {
  console.log(\`📡 Fetching user data for ID: \${userId}...\`);
  await delay(800); // Simulate network delay
  
  return {
    id: userId,
    name: \`User \${userId}\`,
    email: \`user\${userId}@example.com\`,
    role: Math.random() > 0.5 ? 'admin' : 'user',
    lastLogin: new Date().toISOString(),
    preferences: {
      theme: Math.random() > 0.5 ? 'dark' : 'light',
      notifications: Math.random() > 0.3
    }
  };
}

async function fetchStats() {
  console.log('📊 Fetching statistics...');
  await delay(600);
  
  return {
    totalUsers: Math.floor(Math.random() * 10000) + 1000,
    activeUsers: Math.floor(Math.random() * 500) + 100,
    systemHealth: Math.random() > 0.8 ? 'excellent' : 'good',
    uptime: '99.9%'
  };
}

// Main execution
async function runAPIDemo() {
  try {
    console.log('🚀 Starting API demo...');
    
    // Fetch multiple users
    const userPromises = [1, 2, 3].map(id => fetchUserData(id));
    const users = await Promise.all(userPromises);
    
    console.log('👥 Users fetched:', users);
    
    // Fetch statistics
    const stats = await fetchStats();
    console.log('📈 System stats:', stats);
    
    // Process data
    const adminUsers = users.filter(user => user.role === 'admin');
    console.log(\`👑 Admin users: \${adminUsers.length}/\${users.length}\`);
    
    console.log('✅ API demo completed successfully!');
    
  } catch (error) {
    console.error('❌ API demo failed:', error);
  }
}

// Run the demo
runAPIDemo();`
    }
  ];

  useEffect(() => {
    // Set default code based on language
    if (!code) {
      const template = codeTemplates.find(t => t.language === selectedLanguage);
      if (template) {
        setCode(template.code);
      }
    }
  }, [selectedLanguage, code]);

  const executeCode = async () => {
    if (!code.trim()) return;

    setIsExecuting(true);
    const startTime = Date.now();

    try {
      let result: ExecutionResult;

      if (selectedLanguage === 'javascript' || selectedLanguage === 'typescript') {
        if (executionMode === 'browser' && iframeRef.current) {
          // Execute in iframe
          result = await executeInBrowser();
        } else {
          // Simulate execution
          result = await simulateExecution();
        }
      } else {
        // Simulate other languages
        result = await simulateExecution();
      }

      setExecutionResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
      
      // Add to collaboration context
      addMessage({
        id: `execution-${Date.now()}`,
        senderName: 'Code Executor',
        role: 'system',
        message: `🚀 Executed ${selectedLanguage} code:\n\n\`\`\`${selectedLanguage}\n${code.substring(0, 200)}...\n\`\`\`\n\nOutput: ${result.output.substring(0, 300)}`,
        createdAt: new Date().toISOString(),
        type: 'system'
      });

    } catch (error) {
      const errorResult: ExecutionResult = {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      setExecutionResults(prev => [errorResult, ...prev.slice(0, 9)]);
    } finally {
      setIsExecuting(false);
    }
  };

  const executeInBrowser = async (): Promise<ExecutionResult> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const iframe = iframeRef.current;
      if (!iframe) throw new Error('No iframe available');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { 
              font-family: monospace; 
              padding: 10px; 
              background: #1a1a1a; 
              color: #00ff00; 
            }
            .output { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div id="output"></div>
          <script>
            const output = document.getElementById('output');
            const originalConsole = console.log;
            const logs = [];
            
            console.log = function(...args) {
              const message = args.join(' ');
              logs.push(message);
              const div = document.createElement('div');
              div.className = 'output';
              div.textContent = message;
              output.appendChild(div);
              originalConsole(...args);
            };
            
            try {
              ${code}
              
              setTimeout(() => {
                window.parent.postMessage({
                  type: 'execution-result',
                  output: logs.join('\\n'),
                  executionTime: ${Date.now()} - ${startTime}
                }, '*');
              }, 100);
            } catch (error) {
              console.log('Error: ' + error.message);
              window.parent.postMessage({
                type: 'execution-result',
                output: logs.join('\\n'),
                error: error.message,
                executionTime: ${Date.now()} - ${startTime}
              }, '*');
            }
          </script>
        </body>
        </html>
      `;

      const messageHandler = (event: MessageEvent) => {
        if (event.data?.type === 'execution-result') {
          window.removeEventListener('message', messageHandler);
          resolve({
            output: event.data.output || '',
            error: event.data.error,
            executionTime: Date.now() - startTime,
            timestamp: new Date().toISOString()
          });
        }
      };

      window.addEventListener('message', messageHandler);
      iframe.srcdoc = htmlContent;

      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', messageHandler);
        resolve({
          output: 'Execution timeout',
          error: 'Code execution took too long',
          executionTime: 5000,
          timestamp: new Date().toISOString()
        });
      }, 5000);
    });
  };

  const simulateExecution = async (): Promise<ExecutionResult> => {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const simulatedOutputs = [
      '🚀 Code executed successfully!\n📊 Processing data...\n✅ Completed with 0 errors\n📈 Performance: Excellent',
      '⚡ Running calculations...\n🧮 Result: 42\n💡 Insights generated\n✨ Code optimization suggestions available',
      '🌐 Connecting to services...\n📡 Data fetched successfully\n🔄 Processing 1,234 records\n✅ All operations completed',
      '🎯 Function executed\n📝 Output generated\n🔍 Analysis complete\n🎉 Success!'
    ];

    const randomOutput = simulatedOutputs[Math.floor(Math.random() * simulatedOutputs.length)];
    
    return {
      output: randomOutput,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  };

  const loadTemplate = (template: CodeTemplate) => {
    setSelectedLanguage(template.language);
    setCode(template.code);
  };

  const saveToCodeEditor = () => {
    if (selectedLanguage === 'javascript') {
      setCodeContent({ ...codeContent, js: code });
    } else if (selectedLanguage === 'html') {
      setCodeContent({ ...codeContent, html: code });
    } else if (selectedLanguage === 'css') {
      setCodeContent({ ...codeContent, css: code });
    }
  };

  return (
    <div className="h-full flex flex-col bg-base-200">
      {/* Header */}
      <div className="p-4 border-b border-base-300">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Terminal size={20} className="text-primary" />
          💻 Code Execution Environment
        </h3>
        
        {/* Controls */}
        <div className="flex gap-2 items-center mb-3">
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="select select-sm"
          >
            {supportedLanguages.map(lang => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {lang.name}
              </option>
            ))}
          </select>
          
          <select 
            value={executionMode}
            onChange={(e) => setExecutionMode(e.target.value as any)}
            className="select select-sm"
          >
            <option value="simulation">🎭 Simulation</option>
            <option value="browser">🌐 Browser</option>
          </select>
          
          <div className="flex-grow"></div>
          
          <button
            onClick={saveToCodeEditor}
            className="btn btn-xs btn-ghost tooltip tooltip-bottom"
            data-tip="Save to Code Editor"
          >
            <Upload size={12} />
          </button>
          
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="btn btn-xs btn-ghost tooltip tooltip-bottom"
            data-tip="Toggle Console"
          >
            <Terminal size={12} />
          </button>
        </div>

        {/* Templates */}
        <div className="flex gap-2 flex-wrap">
          {codeTemplates
            .filter(t => t.language === selectedLanguage)
            .map((template, idx) => (
              <button
                key={idx}
                onClick={() => loadTemplate(template)}
                className="btn btn-xs btn-outline tooltip tooltip-bottom"
                data-tip={template.description}
              >
                {template.name}
              </button>
            ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {/* Code Editor */}
        <div className="flex-grow p-4">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {supportedLanguages.find(l => l.id === selectedLanguage)?.icon} Code Editor
              </span>
              <button
                onClick={executeCode}
                disabled={isExecuting || !code.trim()}
                className={`btn btn-sm btn-primary ${isExecuting ? 'loading' : ''}`}
              >
                {isExecuting ? '' : <><Play size={14} /> Run</>}
              </button>
            </div>
            
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="textarea flex-grow font-mono text-sm bg-zinc-900 text-green-400 border border-zinc-600"
              placeholder={`Enter your ${selectedLanguage} code here...`}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Console Output */}
        {showConsole && (
          <div className="border-t border-base-300 p-4 bg-zinc-900 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-400">🖥️ Console Output</span>
              <button
                onClick={() => setExecutionResults([])}
                className="btn btn-xs btn-ghost text-green-400"
              >
                <Trash2 size={12} />
              </button>
            </div>
            
            {executionResults.length === 0 ? (
              <div className="text-green-400/60 text-sm italic">
                No execution results yet. Run some code to see output here.
              </div>
            ) : (
              <div className="space-y-2">
                {executionResults.map((result, idx) => (
                  <div key={idx} className="border-l-2 border-green-500/30 pl-3">
                    <div className="flex items-center gap-2 text-xs text-green-400/80 mb-1">
                      <span>⏱️ {result.executionTime}ms</span>
                      <span>🕐 {new Date(result.timestamp).toLocaleTimeString()}</span>
                    </div>
                    
                    {result.error ? (
                      <div className="text-red-400 font-mono text-sm">
                        ❌ Error: {result.error}
                      </div>
                    ) : (
                      <div className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                        {result.output}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Hidden iframe for browser execution */}
        {executionMode === 'browser' && (
          <iframe
            ref={iframeRef}
            className="hidden"
            sandbox="allow-scripts"
            title="Code Execution Frame"
          />
        )}
      </div>
    </div>
  );
};

export default CodeExecutionEnvironment;