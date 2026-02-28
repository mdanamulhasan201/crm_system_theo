import axiosClient from "@/lib/axiosClient";

// get my mentor v2/mentors/my-mentor
export const getMyMentor = async () => {
    try {
        const response = await axiosClient.get('/v2/mentors/my-mentor');
        return response.data;
    } catch (error) {
        throw error;
    }
}
// v2/mentors/my-mentor