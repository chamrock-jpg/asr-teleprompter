import { create } from 'zustand';
import type { WordToken } from '@/types';
import { parseScript } from '@/lib/scriptParser';

interface ScriptStore {
  rawText: string;
  words: WordToken[];
  currentWordIndex: number;

  setScript: (text: string) => void;
  setCurrentIndex: (index: number) => void;
  reset: () => void;
}

export const useScriptStore = create<ScriptStore>((set) => ({
  rawText: '',
  words: [],
  currentWordIndex: 0,

  setScript: (text: string) => {
    const words = parseScript(text);
    set({ rawText: text, words, currentWordIndex: 0 });
  },

  setCurrentIndex: (index: number) => {
    set({ currentWordIndex: index });
  },

  reset: () => {
    set({ rawText: '', words: [], currentWordIndex: 0 });
  },
}));
