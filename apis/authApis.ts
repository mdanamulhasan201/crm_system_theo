import axiosClient from "@/lib/axiosClient";

// First login response (no role) - redirect to manage-profile
interface FirstLoginResponse {
  success: boolean;
  message: string;
  token: string;
}

// user login (first step: returns token only, no role)
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axiosClient.post<FirstLoginResponse>('/v2/auth/system-login', {
      email,
      password,
    });

    if (!response.data?.token) {
      throw new Error('Invalid response from server');
    }

    return {
      success: response.data.success,
      message: response.data.message || 'Successfully logged in!',
      token: response.data.token,
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred during login';
    throw new Error(errorMessage);
  }
};


// get profile list  v2/auth/profile-selection
export const getProfileList = async () => {
  try {
    const response = await axiosClient.get('/v2/auth/profile-selection');
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to get profile list';
    throw new Error(errorMessage);
  }
}


// v2/auth/logical-login/{id}?role=PARTNER
// body: { password } when hasPassword true, else {}
export const logicalLogin = async (id: string, role: string, password?: string) => {
  try {
    const body = password != null && password !== '' ? { password } : {};
    const response = await axiosClient.post(`/v2/auth/logical-login/${id}?role=${role}`, body);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Failed to logical login';
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


// set seceret password v2/auth/set-secret-password
export const setSecretPassword = async (secretPassword: string) => {
  try {
    const response = await axiosClient.post('/v2/auth/set-secret-password', { secretPassword });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.response?.message || error.message || 'Failed to set secret password';
    throw new Error(errorMessage);
  }
}



