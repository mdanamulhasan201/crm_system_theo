'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { getAllFolderAndFiles } from '@/apis/googleCustomDriveApis';
import type { DriveCollectionResponse } from '@/stores/google-custom-drive/googleCustomDrive.store';

export const DRIVE_FILES_QUERY_ROOT = 'drive-files' as const;

export function driveFilesQueryKey(
  customerId: string,
  folderId: string | null,
  search: string,
  limit: number
) {
  return [DRIVE_FILES_QUERY_ROOT, customerId, folderId ?? 'root', search, limit] as const;
}

type UseDriveInfiniteFilesParams = {
  customerId: string;
  folderId: string | null;
  search: string;
  limit: number;
  enabled?: boolean;
};

export function useDriveInfiniteFiles({
  customerId,
  folderId,
  search,
  limit,
  enabled = true,
}: UseDriveInfiniteFilesParams) {
  const searchTrim = search.trim();

  return useInfiniteQuery({
    queryKey: driveFilesQueryKey(customerId, folderId, searchTrim, limit),
    queryFn: async ({ pageParam }) => {
      const res = (await getAllFolderAndFiles({
        customerId,
        limit,
        folder: folderId,
        cursor: pageParam ?? null,
        search: searchTrim.length > 0 ? searchTrim : null,
      })) as DriveCollectionResponse;
      return res;
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextFilesPage && lastPage.nextFileCursor) {
        return lastPage.nextFileCursor;
      }
      return undefined;
    },
    enabled: Boolean(enabled && customerId),
  });
}
