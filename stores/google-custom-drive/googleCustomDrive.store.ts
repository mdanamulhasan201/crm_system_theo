import { create } from 'zustand';
import {
  createFile,
  createFolder,
  deleteFolderFile,
  getAllFolderAndFiles,
  getPath,
  moveFolderAndFiles,
  renameFileAndFolder,
  type CreateFilePayload,
  type CreateFolderPayload,
  type DeleteFolderFileItemPayload,
  type DriveEntityType,
  type GetAllFolderAndFilesParams,
  type MoveFolderAndFilesPayload,
  type RenameFileAndFolderPayload,
} from '@/apis/googleCustomDriveApis';

export type DriveFolder = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  _count?: {
    children?: number;
    files?: number;
  };
  [key: string]: unknown;
};

export type DriveFile = {
  id: string;
  name: string;
  type?: string;
  size?: number;
  url: string;
  folderId: string | null;
  customerId: string;
  createdAt: string;
  [key: string]: unknown;
};

export type DrivePathItem = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type DriveCollectionResponse = {
  success?: boolean;
  message?: string;
  data?: {
    folders?: DriveFolder[];
    files?: DriveFile[];
  };
  hasNextFilesPage?: boolean;
  nextFileCursor?: string | null;
  [key: string]: unknown;
};

export type FetchAllFolderAndFilesParams = GetAllFolderAndFilesParams & {
  silent?: boolean;
};

type DrivePagination = {
  hasNextFilesPage: boolean;
  nextFileCursor: string | null;
};

type DriveItem = {
  id: string;
  name: string;
  type: DriveEntityType;
  createdAt: string;
  childrenCount?: number;
  filesCount?: number;
  size?: number;
  url?: string;
  raw: DriveFolder | DriveFile;
};

interface GoogleCustomDriveStore {
  items: DriveItem[];
  folders: DriveFolder[];
  files: DriveFile[];
  path: DrivePathItem[];
  pagination: DrivePagination;
  isLoading: boolean;
  isRefreshing: boolean;
  isMutating: boolean;
  error: string | null;
  lastResponse: unknown | null;
  clearError: () => void;
  reset: () => void;
  fetchAll: (params: FetchAllFolderAndFilesParams) => Promise<DriveCollectionResponse>;
  fetchPath: (folderId: string, options?: { silent?: boolean }) => Promise<unknown>;
  createFolderAction: (payload: CreateFolderPayload) => Promise<unknown>;
  uploadFileAction: (payload: CreateFilePayload) => Promise<unknown>;
  deleteItemAction: (type: DriveEntityType, id: string) => Promise<unknown>;
  deleteItemsAction: (items: Array<{ type: DriveEntityType; id: string }>) => Promise<unknown>;
  moveItemsAction: (payload: MoveFolderAndFilesPayload) => Promise<unknown>;
  renameItemAction: (payload: RenameFileAndFolderPayload) => Promise<unknown>;
}

const initialState = {
  items: [] as DriveItem[],
  folders: [] as DriveFolder[],
  files: [] as DriveFile[],
  path: [] as DrivePathItem[],
  pagination: {
    hasNextFilesPage: false,
    nextFileCursor: null,
  } as DrivePagination,
  isLoading: false,
  isRefreshing: false,
  isMutating: false,
  error: null as string | null,
  lastResponse: null as unknown | null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const normalizeFolders = (response: DriveCollectionResponse): DriveFolder[] => {
  const folders = response.data?.folders;
  return Array.isArray(folders) ? folders : [];
};

const normalizeFiles = (response: DriveCollectionResponse): DriveFile[] => {
  const files = response.data?.files;
  return Array.isArray(files) ? files : [];
};

const buildItems = (folders: DriveFolder[], files: DriveFile[]): DriveItem[] => {
  const folderItems: DriveItem[] = folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    type: 'folder',
    createdAt: folder.createdAt,
    childrenCount: folder._count?.children ?? 0,
    filesCount: folder._count?.files ?? 0,
    raw: folder,
  }));

  const fileItems: DriveItem[] = files.map((file) => ({
    id: file.id,
    name: file.name,
    type: 'file',
    createdAt: file.createdAt,
    size: file.size,
    url: file.url,
    raw: file,
  }));

  return [...folderItems, ...fileItems];
};

export const useGoogleCustomDriveStore = create<GoogleCustomDriveStore>((set) => ({
  ...initialState,

  clearError: () => set({ error: null }),

  reset: () => set({ ...initialState }),

  fetchAll: async (params) => {
    const { silent, ...apiParams } = params;
    try {
      if (silent) {
        set({ isRefreshing: true, error: null });
      } else {
        set({ isLoading: true, error: null });
      }
      const response = (await getAllFolderAndFiles(apiParams)) as DriveCollectionResponse;
      const folders = normalizeFolders(response);
      const files = normalizeFiles(response);

      set({
        folders,
        files,
        items: buildItems(folders, files),
        pagination: {
          hasNextFilesPage: Boolean(response.hasNextFilesPage),
          nextFileCursor: response.nextFileCursor ?? null,
        },
        lastResponse: response,
      });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to fetch folders/files');
      set({ error: message });
      throw error;
    } finally {
      set((state) =>
        silent
          ? { isRefreshing: false }
          : { isLoading: false, isRefreshing: state.isRefreshing }
      );
    }
  },

  fetchPath: async (folderId, options) => {
    const silent = options?.silent ?? false;
    try {
      if (silent) {
        set({ isRefreshing: true, error: null });
      } else {
        set({ isLoading: true, error: null });
      }
      const response = await getPath(folderId);
      const pathPayload = (response as { data?: { path?: unknown } })?.data?.path;
      const path = Array.isArray(pathPayload) ? (pathPayload as DrivePathItem[]) : [];

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
      set((state) =>
        silent
          ? { isRefreshing: false }
          : { isLoading: false, isRefreshing: state.isRefreshing }
      );
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

  deleteItemAction: async (type, id) => {
    try {
      set({ isMutating: true, error: null });
      const response = await deleteFolderFile([{ type, id: [id] }]);
      set({ lastResponse: response });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, `Failed to delete ${type}`);
      set({ error: message });
      throw error;
    } finally {
      set({ isMutating: false });
    }
  },

  deleteItemsAction: async (items) => {
    try {
      set({ isMutating: true, error: null });

      const grouped = items.reduce<Record<DriveEntityType, string[]>>(
        (acc, current) => {
          acc[current.type].push(current.id);
          return acc;
        },
        { file: [], folder: [] }
      );

      const payload: DeleteFolderFileItemPayload[] = [];
      if (grouped.file.length > 0) payload.push({ type: 'file', id: grouped.file });
      if (grouped.folder.length > 0) payload.push({ type: 'folder', id: grouped.folder });

      const response = await deleteFolderFile(payload);
      set({ lastResponse: response });
      return response;
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to delete selected items');
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
