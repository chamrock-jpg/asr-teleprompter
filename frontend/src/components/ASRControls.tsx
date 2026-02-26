import { useCallback } from 'react';
import { useASRStore } from '@/store/asrStore';
import { useSettingsStore } from '@/store/settingsStore';

interface ASRControlsProps {
  onStartRecording: () => void;
  onStopRecording: () => void;
  onReset: () => void;
}

export function ASRControls({
  onStartRecording,
  onStopRecording,
  onReset,
}: ASRControlsProps) {
  const isConnected = useASRStore((s) => s.isConnected);
  const isRecording = useASRStore((s) => s.isRecording);
  const lastTranscription = useASRStore((s) => s.lastTranscription);
  const error = useASRStore((s) => s.error);
  const isAutoFollow = useSettingsStore((s) => s.isAutoFollow);
  const setAutoFollow = useSettingsStore((s) => s.setAutoFollow);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  }, [isRecording, onStartRecording, onStopRecording]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        backgroundColor: '#0f0f23',
        borderTop: '1px solid #333',
      }}
    >
      {/* Record button */}
      <button
        onClick={handleToggleRecording}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: isRecording ? '3px solid #ef4444' : '3px solid #555',
          backgroundColor: isRecording ? '#ef4444' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <div
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '3px',
              backgroundColor: '#fff',
            }}
          />
        ) : (
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
            }}
          />
        )}
      </button>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: error
              ? '#ef4444'
              : isRecording
                ? '#22c55e'
                : isConnected
                  ? '#fbbf24'
                  : '#666',
            animation: isRecording ? 'pulse 1.5s infinite' : undefined,
          }}
        />
        <span style={{ fontSize: '13px', color: '#999' }}>
          {error
            ? 'Error'
            : isRecording
              ? 'Listening...'
              : isConnected
                ? 'Ready'
                : 'Disconnected'}
        </span>
      </div>

      {/* Auto-follow toggle */}
      <button
        onClick={() => setAutoFollow(!isAutoFollow)}
        style={{
          padding: '6px 14px',
          fontSize: '13px',
          borderRadius: '6px',
          border: `1px solid ${isAutoFollow ? '#fbbf24' : '#555'}`,
          backgroundColor: isAutoFollow ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
          color: isAutoFollow ? '#fbbf24' : '#999',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
      >
        Auto-Follow {isAutoFollow ? 'ON' : 'OFF'}
      </button>

      {/* Last transcription preview */}
      <div
        style={{
          flex: 1,
          fontSize: '13px',
          color: '#666',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {lastTranscription && (
          <span title={lastTranscription}>ASR: {lastTranscription}</span>
        )}
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        style={{
          padding: '6px 14px',
          fontSize: '13px',
          borderRadius: '6px',
          border: '1px solid #555',
          backgroundColor: 'transparent',
          color: '#999',
          cursor: 'pointer',
        }}
      >
        New Script
      </button>

      {error && (
        <span style={{ fontSize: '12px', color: '#ef4444' }} title={error}>
          {error}
        </span>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
