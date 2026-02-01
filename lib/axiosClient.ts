import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT, 
});

axiosClient.interceptors.request.use(
  (config) => {
    const employeeToken = localStorage.getItem('employeeToken');
    const mainToken = localStorage.getItem('token');
    const activeToken = employeeToken || mainToken;
    
    if (activeToken) {
      config.headers.Authorization = `${activeToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
