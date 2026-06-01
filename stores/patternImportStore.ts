import type { ImportedPatternDraft } from '@/services/ai';
import { create } from 'zustand';

export type PatternImportRequest =
  | {
      source: 'file';
      fileName?: string;
      mimeType?: string;
      base64?: string;
      sourceText?: string;
      sourceUrl?: string;
      notes?: string;
    }
  | {
      source: 'photo';
      mimeType: string;
      base64: string;
      notes?: string;
    }
  | {
      source: 'website';
      url: string;
      notes?: string;
    }
  | {
      source: 'youtube';
      url: string;
      notes?: string;
    };

type PatternImportStore = {
  request: PatternImportRequest | null;
  result: ImportedPatternDraft | null;
  error: string | null;
  setRequest: (request: PatternImportRequest) => void;
  setResult: (result: ImportedPatternDraft) => void;
  setError: (error: string | null) => void;
  clear: () => void;
};

export const usePatternImportStore = create<PatternImportStore>((set) => ({
  request: null,
  result: null,
  error: null,
  setRequest: (request) => set({ request, result: null, error: null }),
  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error }),
  clear: () => set({ request: null, result: null, error: null }),
}));
