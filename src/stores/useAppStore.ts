// T18: Zustand store for UI state management
// Uses zustand v5 API — in-memory only, no persistence

import { create } from 'zustand';
import type { VisitFormData } from '../types';

interface AppState {
  // Rankings screen — which tab is currently active
  activeRankingTab: string;
  setActiveRankingTab: (tab: string) => void;

  // Add Visit form — draft state survives backgrounding
  visitFormDraft: Partial<VisitFormData> | null;
  setVisitFormDraft: (draft: Partial<VisitFormData> | null) => void;
  clearVisitFormDraft: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeRankingTab: 'top_cafes',
  setActiveRankingTab: (tab) => set({ activeRankingTab: tab }),

  visitFormDraft: null,
  setVisitFormDraft: (draft) => set({ visitFormDraft: draft }),
  clearVisitFormDraft: () => set({ visitFormDraft: null }),
}));
