import api from './axios';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

export const authApi = {
 
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      'https://gxiv4d2ndh.execute-api.us-east-1.amazonaws.com/dev/login',
      {
        email: credentials.email,
        password: credentials.password,
        group: 'blogger', 
      }
    );

    return response.data;
  },

  
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      'https://gxiv4d2ndh.execute-api.us-east-1.amazonaws.com/dev/signup',
      {
        name: credentials.name,  
        email: credentials.email,
        password: credentials.password,
        group: 'blogger',        
      }
    );

    return response.data;
  },
};
