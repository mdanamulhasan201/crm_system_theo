import axiosClient from "@/lib/axiosClient";

type ApiError = {
  response?: { data?: { message?: string; error?: string } };
  message?: string;
};

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const err = error as ApiError;
  return (
    err.response?.data?.message ||
    err.response?.data?.error ||
    err.message ||
    fallback
  );
};

export type DriveEntityType = "file" | "folder";

export interface CreateFolderPayload {
  customerId: string;
  name: string;
  parentId?: string | null;
}

export interface CreateFilePayload {
  customerId: string;
  file: File;
  folderId?: string;
}

export interface GetAllFolderAndFilesParams {
  customerId: string;
  limit?: number;
  cursor?: string | null;
  folder?: string | null;
}

export interface MoveItemPayload {
  type: DriveEntityType;
  id: string[];
}

export interface MoveFolderAndFilesPayload {
  items: MoveItemPayload[];
  targetParentId: string;
}

export interface RenameFileAndFolderPayload {
  type: DriveEntityType;
  id: string;
  name: string;
}


// ========================== create folder and nested folder ==========================
export const createFolder = async ({
  customerId,
  name,
  parentId,
}: CreateFolderPayload) => {
  try {
    const payload: { customerId: string; name: string; parentId?: string | null } = {
      customerId,
      name,
    };
    if (parentId !== undefined) {
      payload.parentId = parentId;
    }

    const response = await axiosClient.post("/v3/folders/create", payload);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to create folder"));
  }
};


// ========================== create file in folder ==========================
export const createFile = async ({ customerId, file, folderId }: CreateFilePayload) => {
  try {
    const formData = new FormData();
    formData.append("customerId", customerId);
    formData.append("file", file);

    if (folderId) {
      formData.append("folderId", folderId);
    }

    const response = await axiosClient.post("/v3/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to upload file"));
  }
};


// ========================== get all folder and files ==========================
export const getAllFolderAndFiles = async ({
  customerId,
  limit = 10,
  cursor = null,
  folder = null,
}: GetAllFolderAndFilesParams) => {
  try {
    const query = new URLSearchParams();
    query.set("customerId", customerId);
    query.set("limit", String(limit));

    if (cursor) {
      query.set("cursor", cursor);
    }
    if (folder) {
      query.set("folder", folder);
    }

    const response = await axiosClient.get(`/v3/folders/get-all?${query.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch folders and files"));
  }
};


// ========================== get path ==========================
export const getPath = async (folderId: string) => {
  try {
    const response = await axiosClient.get(`/v3/folders/path?folderId=${folderId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to fetch folder path"));
  }
};


// ========================== delete folder ==========================
export const deleteFolder = async (folderId: string) => {
  try {
    const response = await axiosClient.delete(`/v3/folders/delete?folderId=${folderId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete folder"));
  }
};

export const deleteFile = async (fileId: string) => {
  try {
    const response = await axiosClient.delete(`/v3/files/delete?fileId=${fileId}`);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to delete file"));
  }
};



// ========================== move folder and files ==========================
export const moveFolderAndFiles = async ({
  items,
  targetParentId,
}: MoveFolderAndFilesPayload) => {
  try {
    const response = await axiosClient.post("/v3/customer-folder/move", {
      items,
      targetParentId,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to move files and folders"));
  }
};


// ========================== rename file and folder ==========================
export const renameFileAndFolder = async ({
  type,
  id,
  name,
}: RenameFileAndFolderPayload) => {
  try {
    const response = await axiosClient.post("/v3/customer-folder/update", {
      type,
      id,
      name,
    });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Failed to rename file or folder"));
  }
};
