import type { DriveEntityType } from '@/apis/googleCustomDriveApis';

export type BreadcrumbItem = {
  id: string | null;
  name: string;
};

export type ActionTarget = {
  id: string;
  name: string;
  type: DriveEntityType;
};

