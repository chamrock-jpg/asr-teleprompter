import { useRef, useCallback, useEffect } from 'react';
import { useASRStore } from '@/store/asrStore';
import { arrayBufferToBase64 } from '@/lib/audioEncoder';
import type { WSServerMessage, TranscriptionSegment } from '@/types';

interface UseWebSocketReturn {
  connect: () => void;
  disconnect: () => void;
  sendAudioChunk: (data: ArrayBuffer) => void;
  sendStop: () => void;
}

export function useWebSocket(
  url: string,
  onTranscription: (segment: TranscriptionSegment, isPartial: boolean) => void,
): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const { setConnected, setError } = useASRStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setError(null);
    };

    ws.onmessage = (event) => {
      try {
        const msg: WSServerMessage = JSON.parse(event.data);
        if (msg.type === 'transcription') {
          onTranscription(msg.segment, msg.is_partial);
        } else if (msg.type === 'status' && msg.status === 'error') {
          setError(msg.message ?? 'Unknown error');
        }
      } catch {
        // ignore parse errors
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = () => {
      setError('WebSocket connection failed');
      setConnected(false);
    };
  }, [url, onTranscription, setConnected, setError]);

  const disconnect = useCallback(() => {
    wsRef.current?.close();
    wsRef.current = null;
    setConnected(false);
  }, [setConnected]);

  const sendAudioChunk = useCallback((data: ArrayBuffer) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'audio_chunk',
        data: arrayBufferToBase64(data),
      }));
    }
  }, []);

  const sendStop = useCallback(() => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'stop' }));
    }
  }, []);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  return { connect, disconnect, sendAudioChunk, sendStop };
}
