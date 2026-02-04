import axiosClient from "@/lib/axiosClient";

interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: string;
  };
  token: string;
}



// user login
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axiosClient.post<LoginResponse>('/users/login', {
      email,
      password,
    });

    if (!response.data?.token) {
      throw new Error('Invalid response from server');
    }

    return {
      success: true,
      message: response.data.message || 'Successfully logged in!',
      token: response.data.token,
      user: response.data.user
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred during login';
    throw new Error(errorMessage);
  }
};


// user check auth
export const userCheckAuth = async () => {
  try {
    const response = await axiosClient.get('/users/check-auth');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to check auth';
    throw new Error(errorMessage);
  }
};

// Update user profile
export const updateUserProfile = async (formData: FormData) => {
  try {
    const response = await axiosClient.patch('/partner/update-partner-info', formData);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
    throw new Error(errorMessage);
  }
};

// forgot password
export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosClient.post('/partner/forgot-password/send-otp', { email });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to send OTP';
    throw new Error(errorMessage);
  }
};

// match otp
export const matchOTP = async (email: string, otp: string) => {
  try {
    const response = await axiosClient.post('/partner/forgot-password/verify-otp', { email, otp });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to match OTP';
    throw new Error(errorMessage);
  }
};


// reset password
export const resetPassword = async (email: string, password: string) => {
  try {
    const response = await axiosClient.post('/partner/forgot-password/reset', { email, password });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to reset password';
    throw new Error(errorMessage);
  }
};


// change password
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await axiosClient.post('/partner/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
    throw new Error(errorMessage);
  }
};




// employee login with id 


// employees/auth/login/id
export const employeeLoginWithId = async (id: string) => {
  try {
    const response = await axiosClient.post('/employees/auth/login/id', { id });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.message || error.message || 'Failed to login with id';
    throw new Error(errorMessage);
  }
}