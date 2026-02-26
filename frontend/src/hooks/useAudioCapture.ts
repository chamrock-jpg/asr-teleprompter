import { useState, useRef, useCallback } from 'react';
import { float32ToInt16 } from '@/lib/audioEncoder';

const SAMPLE_RATE = 16000;

interface UseAudioCaptureReturn {
  start: () => Promise<void>;
  stop: () => void;
  isCapturing: boolean;
  error: string | null;
}

export function useAudioCapture(
  onAudioChunk: (pcmData: ArrayBuffer) => void,
): UseAudioCaptureReturn {
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const start = useCallback(async () => {
    try {
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;

      // Load AudioWorklet
      const workletUrl = new URL('../workers/audioWorklet.ts', import.meta.url);
      await audioContext.audioWorklet.addModule(workletUrl);

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        if (event.data.type === 'audio') {
          const float32: Float32Array = event.data.data;
          const pcmBuffer = float32ToInt16(float32);
          onAudioChunk(pcmBuffer);
        }
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      setIsCapturing(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start audio capture';
      setError(msg);
      console.error('Audio capture error:', err);
    }
  }, [onAudioChunk]);

  const stop = useCallback(() => {
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    setIsCapturing(false);
  }, []);

  return { start, stop, isCapturing, error };
}
