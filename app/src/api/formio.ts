import axios, { AxiosInstance } from 'axios';
import { FormioForm, FormioSubmission, FormioError } from '@/types/formio';

class FormioClient {
  private client: AxiosInstance;
  private baseURL: string;
  private projectURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_FORMIO_URL || 'http://localhost:3001';
    this.projectURL = process.env.EXPO_PUBLIC_FORMIO_PROJECT_URL || 'http://localhost:3001/project';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          this.token = null;
          // You might want to redirect to login here
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: any): FormioError {
    if (error.response?.data) {
      return {
        name: error.response.data.name || 'FormioError',
        message: error.response.data.message || 'An error occurred',
        details: error.response.data.details || [],
      };
    }
    
    return {
      name: 'NetworkError',
      message: error.message || 'Network error occurred',
    };
  }

  // Authentication
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    try {
      const response = await this.client.post('/user/login', {
        data: { email, password },
      });
      
      this.token = response.headers['x-jwt-token'] || response.data.token;
      return {
        token: this.token!,
        user: response.data,
      };
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async logout(): Promise<void> {
    this.token = null;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; version?: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  // Forms
  async getForms(): Promise<FormioForm[]> {
    try {
      const response = await this.client.get('/form');
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async getForm(formId: string): Promise<FormioForm> {
    try {
      const response = await this.client.get(`/form/${formId}`);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async getFormByPath(path: string): Promise<FormioForm> {
    try {
      const response = await this.client.get(`/${path}`);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async createForm(form: Partial<FormioForm>): Promise<FormioForm> {
    try {
      const response = await this.client.post('/form', form);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async updateForm(formId: string, form: Partial<FormioForm>): Promise<FormioForm> {
    try {
      const response = await this.client.put(`/form/${formId}`, form);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async deleteForm(formId: string): Promise<void> {
    try {
      await this.client.delete(`/form/${formId}`);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  // Submissions
  async getSubmissions(formId: string, params?: any): Promise<FormioSubmission[]> {
    try {
      const response = await this.client.get(`/form/${formId}/submission`, { params });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async getSubmission(formId: string, submissionId: string): Promise<FormioSubmission> {
    try {
      const response = await this.client.get(`/form/${formId}/submission/${submissionId}`);
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async createSubmission(formId: string, data: any): Promise<FormioSubmission> {
    try {
      const response = await this.client.post(`/form/${formId}/submission`, { data });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async updateSubmission(
    formId: string,
    submissionId: string,
    data: any
  ): Promise<FormioSubmission> {
    try {
      const response = await this.client.put(`/form/${formId}/submission/${submissionId}`, { data });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async deleteSubmission(formId: string, submissionId: string): Promise<void> {
    try {
      await this.client.delete(`/form/${formId}/submission/${submissionId}`);
    } catch (error) {
      throw this.formatError(error);
    }
  }

  // Draft submissions
  async saveDraft(formId: string, data: any): Promise<FormioSubmission> {
    try {
      const response = await this.client.post(`/form/${formId}/submission`, {
        data,
        state: 'draft',
      });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  async getDrafts(formId: string): Promise<FormioSubmission[]> {
    try {
      const response = await this.client.get(`/form/${formId}/submission`, {
        params: { state: 'draft' },
      });
      return response.data;
    } catch (error) {
      throw this.formatError(error);
    }
  }

  // Utility methods
  getFormURL(formId: string): string {
    return `${this.baseURL}/form/${formId}`;
  }

  getSubmissionURL(formId: string, submissionId: string): string {
    return `${this.baseURL}/form/${formId}/submission/${submissionId}`;
  }

  // Set custom token (for testing or external auth)
  setToken(token: string): void {
    this.token = token;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

// Export singleton instance
export const formioClient = new FormioClient();
export default formioClient;