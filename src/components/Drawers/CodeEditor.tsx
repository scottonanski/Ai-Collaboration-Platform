import React, { useRef, useEffect } from 'react';
import Editor, { OnMount, OnChange, Monaco } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  language: string;
  className?: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string | number;
  width?: string | number;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language = 'javascript',
  className = '',
  onChange,
  readOnly = false,
  height = '100%',
  width = '100%',
  options = {}
}) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    // Configure editor options after mount
    editor.updateOptions({
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      readOnly,
      ...options
    });
  };

  const handleEditorChange: OnChange = (value = '') => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className={`mockup-code w-full h-full bg-zinc-900 rounded-md shadow-inner ${className}`}>
      <Editor
        height={height}
        width={width}
        defaultLanguage={language}
        language={language}
        theme="vs-dark"
        value={code}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly,
          lineNumbers: 'on',
          roundedSelection: false,
          scrollBeyondLastLine: false,
          fontSize: 14,
          wordWrap: 'on',
          minimap: { enabled: false },
          automaticLayout: true,
          fontFamily: 'Fira Code, Fira Mono, Menlo, monospace',
          tabSize: 2,
          ...options
        }}
      />
    </div>
  );
};

export default CodeEditor;