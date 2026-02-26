import { useState, useCallback } from 'react';
import { useScriptStore } from '@/store/scriptStore';
import { useASRStore } from '@/store/asrStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useAudioCapture } from '@/hooks/useAudioCapture';
import { useTextMatcher } from '@/hooks/useTextMatcher';
import { ScriptEditor } from '@/components/ScriptEditor';
import { TeleprompterView } from '@/components/TeleprompterView';
import { ASRControls } from '@/components/ASRControls';
import { SettingsPanel } from '@/components/SettingsPanel';
import type { TranscriptionSegment } from '@/types';

function getWsUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws/asr`;
}

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hasScript = useScriptStore((s) => s.words.length > 0);
  const reset = useScriptStore((s) => s.reset);
  const setRecording = useASRStore((s) => s.setRecording);
  const setLastTranscription = useASRStore((s) => s.setLastTranscription);
  const { processTranscription, resetPosition } = useTextMatcher();

  const handleTranscription = useCallback(
    (segment: TranscriptionSegment, _isPartial: boolean) => {
      setLastTranscription(segment.text);
      processTranscription(segment);
    },
    [processTranscription, setLastTranscription],
  );

  const { connect, disconnect, sendAudioChunk, sendStop } = useWebSocket(
    getWsUrl(),
    handleTranscription,
  );

  const { start: startCapture, stop: stopCapture } = useAudioCapture(sendAudioChunk);

  const handleStartRecording = useCallback(async () => {
    connect();
    await startCapture();
    setRecording(true);
  }, [connect, startCapture, setRecording]);

  const handleStopRecording = useCallback(() => {
    sendStop();
    stopCapture();
    disconnect();
    setRecording(false);
  }, [sendStop, stopCapture, disconnect, setRecording]);

  const handleReset = useCallback(() => {
    handleStopRecording();
    reset();
  }, [handleStopRecording, reset]);

  const handleWordClick = useCallback(
    (wordIndex: number) => {
      resetPosition(wordIndex);
    },
    [resetPosition],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      {hasScript && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 16px',
            backgroundColor: '#0f0f23',
            borderBottom: '1px solid #222',
            fontSize: '14px',
          }}
        >
          <span style={{ fontWeight: 600, color: '#fbbf24' }}>ASR Teleprompter</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() =>
                document.documentElement.requestFullscreen?.()
              }
              style={headerBtnStyle}
              title="Fullscreen (F)"
            >
              Fullscreen
            </button>
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              style={headerBtnStyle}
              title="Settings"
            >
              Settings
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {hasScript ? (
          <TeleprompterView onWordClick={handleWordClick} />
        ) : (
          <ScriptEditor />
        )}
      </div>

      {/* Bottom controls */}
      {hasScript && (
        <ASRControls
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          onReset={handleReset}
        />
      )}

      {/* Settings panel */}
      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

const headerBtnStyle: React.CSSProperties = {
  padding: '4px 12px',
  fontSize: '13px',
  borderRadius: '6px',
  border: '1px solid #444',
  backgroundColor: 'transparent',
  color: '#ccc',
  cursor: 'pointer',
};
