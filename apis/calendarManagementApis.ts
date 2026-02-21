import axiosClient from "@/lib/axiosClient";

// /v2/appointment/by-date
// &limit=30 &employee=id1,id2 &startDate=YYYY-MM-DD &endDate=YYYY-MM-DD &cursor=

export interface AppointmentByDateAssignedTo {
  employeId: string;
  assignedTo: string;
}

export interface AppointmentByDateItem {
  id: string;
  customer_name: string;
  time: string;
  date: string;
  reason: string;
  assignedTo: AppointmentByDateAssignedTo[];
  duration: number;
  details?: string;
  isClient?: boolean;
  userId?: string;
  reminder?: number;
  reminderSent?: boolean;
  customerId?: string;
  createdAt?: string;
}

export interface GetAppointmentsByDateResponse {
  success: boolean;
  data: AppointmentByDateItem[];
  pagination: { limit: number; hasMore: boolean; cursor?: string };
}

export const getAppointmentsByDate = async (
  limit: number,
  employee: string,
  startDate: string,
  endDate: string,
  cursor: string
): Promise<GetAppointmentsByDateResponse> => {
  const response = await axiosClient.get<GetAppointmentsByDateResponse>(
    `/v2/appointment/by-date?limit=${limit}&employee=${encodeURIComponent(employee)}&startDate=${startDate}&endDate=${endDate}&cursor=${encodeURIComponent(cursor)}`
  );
  return response.data;
};


// get dot in my calendar 
// v2/appointment/all-appointments-date

// &year=2026
// &employee={{id,id,id}}
// &month=2
// responce:
// {
//     "success": true,
//     "dates": [
//         "2026-02-17"
//     ]
// }