import { useState, useCallback, type DragEvent } from 'react';
import { useScriptStore } from '@/store/scriptStore';

export function ScriptEditor() {
  const [text, setText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const setScript = useScriptStore((s) => s.setScript);
  const hasScript = useScriptStore((s) => s.words.length > 0);

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      setScript(text.trim());
    }
  }, [text, setScript]);

  const handleFileRead = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          setText(content);
          setScript(content.trim());
        }
      };
      reader.readAsText(file);
    },
    [setScript],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileRead(file);
    },
    [handleFileRead],
  );

  if (hasScript) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        maxWidth: '800px',
        margin: '0 auto',
        height: '100%',
        justifyContent: 'center',
      }}
    >
      <h1 style={{ fontSize: '28px', fontWeight: 700, textAlign: 'center' }}>
        ASR Teleprompter
      </h1>
      <p style={{ textAlign: 'center', opacity: 0.7 }}>
        Paste your script below or drag-and-drop a text file
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          position: 'relative',
          border: `2px dashed ${isDragging ? '#fbbf24' : '#555'}`,
          borderRadius: '12px',
          transition: 'border-color 0.2s',
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your script here... (supports Chinese, English, and mixed content)"
          style={{
            width: '100%',
            height: '300px',
            padding: '16px',
            fontSize: '16px',
            lineHeight: 1.6,
            border: 'none',
            borderRadius: '12px',
            resize: 'vertical',
            backgroundColor: '#1a1a2e',
            color: '#e0e0e0',
            outline: 'none',
            fontFamily: 'system-ui, sans-serif',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          style={{
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            cursor: text.trim() ? 'pointer' : 'not-allowed',
            backgroundColor: text.trim() ? '#fbbf24' : '#333',
            color: text.trim() ? '#000' : '#666',
            transition: 'all 0.2s',
          }}
        >
          Start Teleprompter
        </button>

        <label
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            borderRadius: '8px',
            border: '1px solid #555',
            cursor: 'pointer',
            color: '#e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Upload File
          <input
            type="file"
            accept=".txt,.md,.srt"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </label>
      </div>
    </div>
  );
}
