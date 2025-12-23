import axiosClient from "@/lib/axiosClient";

interface SuggestionData {
    name: string;
    email: string;
    phone: string;
    firma: string;
    category?: string;
    suggestion: string;
}

interface EmailData {
    reason: string; 
    name: string;
    phone: string;
    suggestion: string;
}

//post suggestion - accepts FormData for file uploads
export const postSuggestion = async (data: FormData | SuggestionData): Promise<any> => {
    try {
        const config = data instanceof FormData 
            ? {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
            : {};
        
        const response = await axiosClient.post('/suggestions/improvement', data as any, config);
        return response.data;
    } catch (error) {
        throw error;
    }
};


// feetF1st apis email
export const feetF1stEmail = async (data: EmailData) => {
    try {
        const response = await axiosClient.post('/suggestions/feetf1rst', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};
