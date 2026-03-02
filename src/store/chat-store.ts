"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareModelSelection {
  assistantId: string;
  modelId: string;
  providerName: string;
}

export interface ChatStore {
  currentBranchPath: string[];
  inputDraft: string;
  isComposing: boolean;
  compareModels: CompareModelSelection[];
  setCurrentBranch: (path: string[]) => void;
  updateDraft: (content: string) => void;
  setIsComposing: (isComposing: boolean) => void;
  setCompareModels: (models: CompareModelSelection[]) => void;
  clearCompareModels: () => void;
  reset: () => void;
}

const INITIAL_STATE: Pick<
  ChatStore,
  "currentBranchPath" | "inputDraft" | "isComposing" | "compareModels"
> = {
  currentBranchPath: [],
  inputDraft: "",
  isComposing: false,
  compareModels: [],
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      setCurrentBranch: (path) => set({ currentBranchPath: path }),
      updateDraft: (content) => set({ inputDraft: content }),
      setIsComposing: (isComposing) => set({ isComposing }),
      setCompareModels: (models) => set({ compareModels: models }),
      clearCompareModels: () => set({ compareModels: [] }),
      reset: () => set({ ...INITIAL_STATE }),
    }),
    {
      name: "mkchat-chat",
      partialize: (state) => ({
        currentBranchPath: state.currentBranchPath,
        inputDraft: state.inputDraft,
      }),
    },
  ),
);
