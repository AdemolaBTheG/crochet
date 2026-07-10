import {
  addPatternToFolder,
  createPatternFolder,
  getPatternFolderById,
  getPatternIdsForFolder,
  getPatternFolders,
  getRecentPatternFolders,
  removePatternFromFolder,
  type CreatePatternFolderInput,
} from '@/services/pattern-folders';
import { useDbStore } from '@/stores/dbStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export function usePatternFolders() {
  const db = useDbStore((state) => state.db);

  return useQuery({
    queryKey: ['pattern-folders'],
    queryFn: async () => {
      if (!db) return [];
      return getPatternFolders(db);
    },
    enabled: !!db,
  });
}

export function useRecentPatternFolders(limit = 5) {
  const db = useDbStore((state) => state.db);

  return useQuery({
    queryKey: ['pattern-folders', 'recent', limit],
    queryFn: async () => {
      if (!db) return [];
      return getRecentPatternFolders(db, limit);
    },
    enabled: !!db,
  });
}

export function usePatternFolder(folderId: number | null) {
  const db = useDbStore((state) => state.db);

  return useQuery({
    queryKey: ['pattern-folders', folderId],
    queryFn: async () => {
      if (!db || !folderId) return null;
      return getPatternFolderById(db, folderId);
    },
    enabled: !!db && !!folderId,
  });
}

export function usePatternIdsForFolder(folderId: number | null) {
  const db = useDbStore((state) => state.db);

  return useQuery({
    queryKey: ['pattern-folders', folderId, 'pattern-ids'],
    queryFn: async () => {
      if (!db || !folderId) return [];
      return getPatternIdsForFolder(db, folderId);
    },
    enabled: !!db && !!folderId,
  });
}

export function useCreatePatternFolder() {
  const db = useDbStore((state) => state.db);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePatternFolderInput) => {
      if (!db) throw new Error('Database unavailable');
      return createPatternFolder(db, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pattern-folders'] }),
        queryClient.invalidateQueries({ queryKey: ['pattern-folders', 'recent'] }),
      ]);
    },
  });
}

export function useAddPatternToFolder() {
  const db = useDbStore((state) => state.db);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { folderId: number; patternId: number }) => {
      if (!db) throw new Error('Database unavailable');
      await addPatternToFolder(db, input.folderId, input.patternId);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pattern-folders'] }),
        queryClient.invalidateQueries({ queryKey: ['pattern-folders', 'recent'] }),
      ]);
    },
  });
}

export function useRemovePatternFromFolder() {
  const db = useDbStore((state) => state.db);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { folderId: number; patternId: number }) => {
      if (!db) throw new Error('Database unavailable');
      await removePatternFromFolder(db, input.folderId, input.patternId);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['pattern-folders'] }),
        queryClient.invalidateQueries({ queryKey: ['pattern-folders', 'recent'] }),
      ]);
    },
  });
}
