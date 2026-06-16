import axios from 'axios';
import { apiClient } from './client';
import type {
  ApiResponse,
  UploadFileResponse,
  AnalysisResponse,
  AuthUser,
} from './types';

// Pull the backend's error message out of an Axios error, falling back to a default.
const toMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.message || fallback;
  }
  return fallback;
};

export const register = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthUser>>('/auth/register', {
      email,
      password,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Registration failed');
    }
    return response.data.data;
  } catch (err) {
    throw new Error(toMessage(err, 'Registration failed'));
  }
};

export const login = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  try {
    const response = await apiClient.post<ApiResponse<AuthUser>>('/auth/login', {
      email,
      password,
    });
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Login failed');
    }
    return response.data.data;
  } catch (err) {
    throw new Error(toMessage(err, 'Login failed'));
  }
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/auth/logout');
};

// Returns the current user, or null if not authenticated.
export const getMe = async (): Promise<AuthUser | null> => {
  try {
    const response = await apiClient.get<ApiResponse<AuthUser>>('/auth/me');
    return response.data.data ?? null;
  } catch {
    return null;
  }
};

export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<UploadFileResponse>>(
    '/users/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error('File upload failed');
  }

  return response.data.data.filePath;
};

export const getAnalysis = async (
  filePath: string,
  question: string
): Promise<AnalysisResponse> => {
  const response = await apiClient.post<ApiResponse<AnalysisResponse>>(
    '/users/getanalysis',
    { filePath, question }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.message || 'Analysis failed');
  }

  return response.data.data;
};
