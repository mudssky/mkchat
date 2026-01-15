"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatStore {
  currentBranchPath: string[];
  inputDraft: string;
  isComposing: boolean;
  setCurrentBranch: (path: string[]) => void;
  updateDraft: (content: string) => void;
  setIsComposing: (isComposing: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE: Pick<
  ChatStore,
  "currentBranchPath" | "inputDraft" | "isComposing"
> = {
  currentBranchPath: [],
  inputDraft: "",
  isComposing: false,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,
      setCurrentBranch: (path) => set({ currentBranchPath: path }),
      updateDraft: (content) => set({ inputDraft: content }),
      setIsComposing: (isComposing) => set({ isComposing }),
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
