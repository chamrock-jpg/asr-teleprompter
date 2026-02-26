import { create } from 'zustand';
import type { DisplaySettings, MatcherConfig } from '@/types';

const STORAGE_KEY = 'teleprompter-settings';

const defaultDisplay: DisplaySettings = {
  fontSize: 48,
  fontFamily: 'system-ui, sans-serif',
  textColor: '#ffffff',
  backgroundColor: '#000000',
  highlightColor: '#fbbf24',
  isMirrored: false,
  marginPercent: 10,
  lineHeight: 1.6,
  scrollSpeed: 5,
};

const defaultMatcher: MatcherConfig = {
  windowBehind: 10,
  windowAhead: 50,
  minNgram: 2,
  maxNgram: 5,
  confidenceThreshold: 0.6,
  jumpThreshold: 0.85,
};

interface SettingsStore {
  display: DisplaySettings;
  matcher: MatcherConfig;
  isAutoFollow: boolean;
  isFullScreen: boolean;

  updateDisplay: (partial: Partial<DisplaySettings>) => void;
  updateMatcher: (partial: Partial<MatcherConfig>) => void;
  setAutoFollow: (v: boolean) => void;
  setFullScreen: (v: boolean) => void;
  loadFromStorage: () => void;
}

function loadStored(): { display: DisplaySettings; matcher: MatcherConfig } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        display: { ...defaultDisplay, ...parsed.display },
        matcher: { ...defaultMatcher, ...parsed.matcher },
      };
    }
  } catch {
    // ignore
  }
  return { display: defaultDisplay, matcher: defaultMatcher };
}

function saveToStorage(display: DisplaySettings, matcher: MatcherConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ display, matcher }));
  } catch {
    // ignore
  }
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...loadStored(),
  isAutoFollow: true,
  isFullScreen: false,

  updateDisplay: (partial) => {
    const display = { ...get().display, ...partial };
    saveToStorage(display, get().matcher);
    set({ display });
  },

  updateMatcher: (partial) => {
    const matcher = { ...get().matcher, ...partial };
    saveToStorage(get().display, matcher);
    set({ matcher });
  },

  setAutoFollow: (v) => set({ isAutoFollow: v }),
  setFullScreen: (v) => set({ isFullScreen: v }),

  loadFromStorage: () => {
    const stored = loadStored();
    set(stored);
  },
}));
