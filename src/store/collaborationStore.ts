import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatMessage, CollaborationState } from '../collaborationTypes';
import { OPENAI_MODELS, DEFAULT_SETTINGS } from '../services/openaiService';

interface CodeContent {
  html: string;
  css: string;
  js: string;
}

interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileSystemNode[];
  path: string;
}

interface CollaborationStore extends CollaborationState {
  // Actions
  addMessage: (message: ChatMessage) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setControl: (control: Partial<CollaborationState['control']>) => void;
  setConnectionStatus: (status: 'connected' | 'disconnected' | 'connecting') => void;
  setSettings: (settings: Partial<CollaborationState['settings']>) => void;
  
  // Enhanced features
  codeContent: CodeContent;
  setCodeContent: (content: CodeContent) => void;
  
  // File system
  fileSystem: FileSystemNode[];
  openFiles: string[]; // Track open file IDs
  activeFileId: string | null; // Currently active file
  setFileSystem: (files: FileSystemNode[]) => void;
  addFile: (file: FileSystemNode) => void;
  updateFile: (id: string, updates: Partial<FileSystemNode>) => void;
  deleteFile: (id: string) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  getFileById: (fileId: string) => FileSystemNode | undefined;
  
  // Multi-modal content
  uploadedFiles: File[];
  addUploadedFile: (file: File) => void;
  removeUploadedFile: (fileName: string) => void;
  clearUploadedFiles: () => void;
  
  // Advanced memory
  contextMemory: {
    shortTerm: ChatMessage[];
    longTerm: string[];
    summaries: string[];
  };
  addToMemory: (type: 'shortTerm' | 'longTerm' | 'summaries', content: any) => void;
  
  // Visualization data
  collaborationFlow: {
    nodes: any[];
    edges: any[];
  };
  updateCollaborationFlow: (flow: { nodes: any[]; edges: any[] }) => void;
  
  // Advanced settings
  aiWorkers: {
    worker1: {
      name: string;
      model: string;
      role: string;
      specialization: string;
      customInstructions: string;
    };
    worker2: {
      name: string;
      model: string;
      role: string;
      specialization: string;
      customInstructions: string;
    };
  };
  updateAiWorker: (workerId: 'worker1' | 'worker2', updates: any) => void;
}

export const useCollaborationStore = create<CollaborationStore>()(
  persist(
    (set, get) => ({
      // Base state
      messages: [],
      memory: {
        workingMemory: []
      },
      control: {
        isCollaborating: false,
        isPaused: false,
        currentTurn: 0,
        totalTurns: 1,
        currentPhase: 'idle',
      },
      connectionStatus: 'disconnected',
      settings: DEFAULT_SETTINGS, // Use OpenAI default settings
      
      // Enhanced features
      codeContent: {
        html: '',
        css: '',
        js: ''
      },
      
      fileSystem: [
        {
          id: 'root',
          name: 'Project',
          type: 'folder',
          path: '/',
          children: [
            {
              id: 'src',
              name: 'src',
              type: 'folder',
              path: '/src',
              children: [
                { id: 'index-html', name: 'index.html', type: 'file', path: '/src/index.html', content: '<!DOCTYPE html>...' },
                { id: 'style-css', name: 'style.css', type: 'file', path: '/src/style.css', content: '/* Styles */' },
                { id: 'app-js', name: 'app.js', type: 'file', path: '/src/app.js', content: '// JavaScript' }
              ]
            },
            {
              id: 'docs',
              name: 'docs',
              type: 'folder',
              path: '/docs',
              children: [
                { id: 'readme', name: 'README.md', type: 'file', path: '/docs/README.md', content: '# Project Documentation' }
              ]
            }
          ]
        }
      ],
      openFiles: [],
      activeFileId: null,
      
      uploadedFiles: [],
      
      contextMemory: {
        shortTerm: [],
        longTerm: [],
        summaries: []
      },
      
      collaborationFlow: {
        nodes: [],
        edges: []
      },
      
      aiWorkers: {
        worker1: {
          name: 'Alice',
          model: DEFAULT_SETTINGS.worker1Model, // Use default OpenAI model
          role: 'Developer',
          specialization: 'Frontend Development',
          customInstructions: 'Focus on user experience and clean, maintainable code.'
        },
        worker2: {
          name: 'Bob',
          model: DEFAULT_SETTINGS.worker2Model, // Use default OpenAI model
          role: 'Analyst',
          specialization: 'Code Review & Optimization',
          customInstructions: 'Analyze code quality, performance, and suggest improvements.'
        }
      },
      
      // Base actions
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
          contextMemory: {
            ...state.contextMemory,
            shortTerm: [...state.contextMemory.shortTerm.slice(-20), message]
          }
        })),
        
      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          ),
        })),
        
      setMessages: (messages) => {
        set({ messages });
      },
      
      setControl: (control) =>
        set((state) => ({
          control: { ...state.control, ...control },
        })),
        
      setConnectionStatus: (connectionStatus) => {
        set({ connectionStatus });
      },
      
      setSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),
      
      // Enhanced actions
      setCodeContent: (content) => set({ codeContent: content }),
      
      setFileSystem: (files) => set({ fileSystem: files }),
      
      addFile: (file) =>
        set((state) => {
          const updateFileSystem = (nodes: FileSystemNode[]): FileSystemNode[] => {
            return nodes.map(node => {
              if (node.type === 'folder' && file.path.startsWith(node.path)) {
                return {
                  ...node,
                  children: node.children ? [...node.children, file] : [file]
                };
              }
              return node;
            });
          };
          return { fileSystem: updateFileSystem(state.fileSystem) };
        }),
      
      updateFile: (id, updates) =>
        set((state) => {
          const updateFileSystem = (nodes: FileSystemNode[]): FileSystemNode[] => {
            return nodes.map(node => {
              if (node.id === id) {
                return { ...node, ...updates };
              }
              if (node.children) {
                return { ...node, children: updateFileSystem(node.children) };
              }
              return node;
            });
          };
          return { fileSystem: updateFileSystem(state.fileSystem) };
        }),
      
      deleteFile: (id) =>
        set((state) => {
          const deleteFromFileSystem = (nodes: FileSystemNode[]): FileSystemNode[] => {
            return nodes.filter(node => {
              if (node.id === id) return false;
              if (node.children) {
                node.children = deleteFromFileSystem(node.children);
              }
              return true;
            });
          };
          return { fileSystem: deleteFromFileSystem(state.fileSystem) };
        }),

      // New file management methods
      openFile: (fileId: string) => set((state) => ({
        openFiles: state.openFiles.includes(fileId) 
          ? state.openFiles 
          : [...state.openFiles, fileId],
        activeFileId: fileId
      })),

      closeFile: (fileId: string) => set((state) => ({
        openFiles: state.openFiles.filter(id => id !== fileId),
        activeFileId: state.activeFileId === fileId 
          ? (state.openFiles.length > 1 ? state.openFiles.find(id => id !== fileId) || null : null)
          : state.activeFileId
      })),

      setActiveFile: (fileId: string) => set((state) => ({
        activeFileId: state.openFiles.includes(fileId) ? fileId : state.activeFileId
      })),

      getFileById: (fileId: string) => {
        const state = useCollaborationStore.getState();
        const findFile = (files: FileSystemNode[]): FileSystemNode | undefined => {
          for (const file of files) {
            if (file.id === fileId) return file;
            if (file.children) {
              const found = findFile(file.children);
              if (found) return found;
            }
          }
          return undefined;
        };
        return findFile(state.fileSystem);
      },
      
      addUploadedFile: (file) =>
        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, file]
        })),
      
      removeUploadedFile: (fileName) =>
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter(f => f.name !== fileName)
        })),

      clearUploadedFiles: () => {
        set({ uploadedFiles: [] });
      },
      
      addToMemory: (type, content) =>
        set((state) => ({
          contextMemory: {
            ...state.contextMemory,
            [type]: [...state.contextMemory[type], content]
          }
        })),
      
      updateCollaborationFlow: (flow) => set({ collaborationFlow: flow }),
      
      updateAiWorker: (workerId, updates) =>
        set((state) => ({
          aiWorkers: {
            ...state.aiWorkers,
            [workerId]: { ...state.aiWorkers[workerId], ...updates }
          }
        }))
    }),
    {
      name: 'collaboration-store',
      partialize: (state) => ({
        messages: state.messages,
        settings: state.settings,
        codeContent: state.codeContent,
        fileSystem: state.fileSystem,
        contextMemory: state.contextMemory,
        aiWorkers: state.aiWorkers
      }),
    }
  )
);