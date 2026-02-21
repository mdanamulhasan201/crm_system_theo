import axiosClient from "@/lib/axiosClient";

// /v2/appointment/by-date
// With employee: filter by id1,id2. Without employee (or empty): all appointments for date range.
// &limit=30 &startDate=YYYY-MM-DD &endDate=YYYY-MM-DD &cursor= &employee= (optional)

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
  startDate: string,
  endDate: string,
  cursor: string,
  employee?: string
): Promise<GetAppointmentsByDateResponse> => {
  const params = new URLSearchParams({
    limit: String(limit),
    startDate,
    endDate,
    cursor: cursor || ''
  });
  if (employee && employee.trim()) {
    params.set('employee', employee.trim());
  }
  const response = await axiosClient.get<GetAppointmentsByDateResponse>(
    `/v2/appointment/by-date?${params.toString()}`
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