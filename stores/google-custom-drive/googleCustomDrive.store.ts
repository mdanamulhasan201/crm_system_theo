import { create } from 'zustand';
import {
  createFile,
  createFolder,
  deleteFolder,
  getAllFolderAndFiles,
  getPath,
  moveFolderAndFiles,
  renameFileAndFolder,
  type CreateFilePayload,
  type CreateFolderPayload,
  type DriveEntityType,
  type GetAllFolderAndFilesParams,
  type MoveFolderAndFilesPayload,
  type RenameFileAndFolderPayload,
} from '@/apis/googleCustomDriveApis';

type DriveItem = {
  id?: string;
  name?: string;
  type?: DriveEntityType | string;
  [key: string]: unknown;
};

type DrivePathItem = {
  id?: string;
  name?: string;
  [key: string]: unknown;
};

type DriveCollectionResponse = {
  data?: DriveItem[];
  folders?: DriveItem[];
  files?: DriveItem[];
  pagination?: {
    cursor?: string | null;
    nextCursor?: string | null;
    hasNextPage?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

interface GoogleCustomDriveStore {
  items: DriveItem[];
  path: DrivePathItem[];
  pagination: DriveCollectionResponse['pagination'] | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  lastResponse: unknown | null;
  clearError: () => void;
  reset: () => void;
  fetchAll: (params: GetAllFolderAndFilesParams) => Promise<DriveCollectionResponse>;
  fetchPath: (folderId: string) => Promise<unknown>;
  createFolderAction: (payload: CreateFolderPayload) => Promise<unknown>;
  uploadFileAction: (payload: CreateFilePayload) => Promise<unknown>;
  deleteFolderAction: (folderId: string) => Promise<unknown>;
  moveItemsAction: (payload: MoveFolderAndFilesPayload) => Promise<unknown>;
  renameItemAction: (payload: RenameFileAndFolderPayload) => Promise<unknown>;
}

const initialState = {
  items: [] as DriveItem[],
  path: [] as DrivePathItem[],
  pagination: null as DriveCollectionResponse['pagination'] | null,
  isLoading: false,
  isMutating: false,
  error: null as string | null,
  lastResponse: null as unknown | null,
};

const extractItems = (response: DriveCollectionResponse): DriveItem[] => {
  if (Array.isArray(response.data)) return response.data;

  const folders = Array.isArray(response.folders) ? response.folders : [];
  const files = Array.isArray(response.files) ? response.files : [];
  return [...folders, ...files];
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export const useGoogleCustomDriveStore = create<GoogleCustomDriveStore>((set) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  reset: () => set({ ...initialState }),

  fetchAll: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const response = (await getAllFolderAndFiles(params)) as DriveCollectionResponse;
      set({
        items: extractItems(response),
        pagination: response.pagination ?? null,
        lastResponse: response,
      });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch folders/files');
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPath: async (folderId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getPath(folderId);
      const path = Array.isArray((response as { data?: unknown }).data)
        ? ((response as { data: DrivePathItem[] }).data ?? [])
        : [];

      set({
        path,
        lastResponse: response,
      });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch folder path');
      set({ error: message });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  createFolderAction: async (payload) => {
    try {
      set({ isMutating: true, error: null });
      const response = await createFolder(payload);
      set({ lastResponse: response });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create folder');
      set({ error: message });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },

  uploadFileAction: async (payload) => {
    try {
      set({ isMutating: true, error: null });
      const response = await createFile(payload);
      set({ lastResponse: response });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to upload file');
      set({ error: message });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },

  deleteFolderAction: async (folderId) => {
    try {
      set({ isMutating: true, error: null });
      const response = await deleteFolder(folderId);
      set({ lastResponse: response });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete folder');
      set({ error: message });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },

  moveItemsAction: async (payload) => {
    try {
      set({ isMutating: true, error: null });
      const response = await moveFolderAndFiles(payload);
      set({ lastResponse: response });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to move items');
      set({ error: message });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },

  renameItemAction: async (payload) => {
    try {
      set({ isMutating: true, error: null });
      const response = await renameFileAndFolder(payload);
      set({ lastResponse: response });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to rename item');
      set({ error: message });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },
}));
