import { create } from "zustand";

export interface DraftPost {
  image_base64: string;
  caption: string;
  prompt?: string;
}

interface PostState {
  draft: DraftPost | null;
  setDraft: (d: DraftPost | null) => void;
  saveTarget: DraftPost | null;
  openSaveModal: (d: DraftPost) => void;
  closeSaveModal: () => void;
}

export const usePostStore = create<PostState>((set) => ({
  draft: null,
  setDraft: (d) => set({ draft: d }),
  saveTarget: null,
  openSaveModal: (d) => set({ saveTarget: d }),
  closeSaveModal: () => set({ saveTarget: null }),
}));
