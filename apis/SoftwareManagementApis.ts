import axiosClient from "@/lib/axiosClient";
// get all software management /v2/software_version/get-all?page=1&limit=2
export const getAllSoftwareManagement = async (page: number, limit: number) => {
    try {
        const response = await axiosClient.get(
            `/v2/software_version/get-all?page=${page}&limit=${limit}`
        );
        return response.data;
    } catch (error: any) {
        throw error;
    }
};

