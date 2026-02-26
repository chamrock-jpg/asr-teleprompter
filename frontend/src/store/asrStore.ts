import { create } from 'zustand';

interface ASRStore {
  isConnected: boolean;
  isRecording: boolean;
  lastTranscription: string;
  error: string | null;

  setConnected: (v: boolean) => void;
  setRecording: (v: boolean) => void;
  setLastTranscription: (text: string) => void;
  setError: (err: string | null) => void;
}

export const useASRStore = create<ASRStore>((set) => ({
  isConnected: false,
  isRecording: false,
  lastTranscription: '',
  error: null,

  setConnected: (v) => set({ isConnected: v }),
  setRecording: (v) => set({ isRecording: v }),
  setLastTranscription: (text) => set({ lastTranscription: text }),
  setError: (err) => set({ error: err }),
}));
