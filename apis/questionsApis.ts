import axiosClient from "@/lib/axiosClient";




// get einlagen question with option 
export const getEinlagenQuestionWithOption = async (customerId: string) => {
    try {
        const response = await axiosClient.get(`/questions/insoles/${customerId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

// save einlagen question with option  
export const saveEinlagenQuestionWithOptionByCustomerId = async (customerId: string, questionData: any) => {
    try {
        const response = await axiosClient.post(`/questions/insoles/${customerId}`, questionData);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}


// get massschuhe question with option  
export const getMassschuheQuestionWithOption = async (customerId: string) => {
    try {
        const response = await axiosClient.get(`/questions/shoes/${customerId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// save massschuhe question with option  
export const saveMassschuheQuestionWithOptionByCustomerId = async (customerId: string, questionData: any) => {
    try {
        const response = await axiosClient.post(`/questions/shoes/${customerId}`, questionData);
        return response.data;
    } catch (error) {

        throw error;
    }
}



// get all questions 
export const getAllQuestions = async () => {
    try {
        const response = await axiosClient.get(`/questions/get-questions`);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// question controller  questions/controll-questions 

// pass in body
// {
//     "controlShoeQuestions": [6,7]
// "controlInsolesQuestions": [2,3,7,6]


    

// }
export const questionController = async (questionData: any) => {
    try {
        const response = await axiosClient.post(`/questions/controll-questions`, questionData);
        return response.data;
    } catch (error) {
        throw error;
    }
}


// save question 