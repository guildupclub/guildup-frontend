import type { ApiResponse, ApiError } from '@/types/api.types';
import { API_BASE_URL, ERROR_MESSAGES } from '@/utils/constants';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = this.getAuthToken();
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const result: ApiResponse<T> = await response.json();
      
      // Handle API-level errors (when server returns error in response body)
      if (result.r === 'e') {
        throw new Error(result.message || result.error || ERROR_MESSAGES.SERVER_ERROR);
      }

      return result.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      
      // Handle network errors or other unknown errors
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }

  private async handleErrorResponse(response: Response): Promise<void> {
    let errorMessage: string = ERROR_MESSAGES.UNKNOWN_ERROR;

    switch (response.status) {
      case 400:
        errorMessage = ERROR_MESSAGES.VALIDATION_ERROR;
        break;
      case 401:
        errorMessage = ERROR_MESSAGES.UNAUTHORIZED;
        this.handleUnauthorized();
        break;
      case 404:
        errorMessage = ERROR_MESSAGES.NOT_FOUND;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorMessage = ERROR_MESSAGES.SERVER_ERROR;
        break;
    }

    // Try to get more specific error message from response
    try {
      const errorResponse: ApiResponse = await response.json();
      if (errorResponse.message || errorResponse.error) {
        errorMessage  = errorResponse.message || errorResponse.error || errorMessage;
      }
    } catch {
      // Ignore JSON parsing errors, use default error message
    }

    const apiError: ApiError = {
      message: errorMessage,
      status: response.status,
      code: response.statusText,
    };

    throw apiError;
  }

  private getAuthToken(): string | null {
    // Get token from localStorage or session storage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    }
    return null;
  }

  private handleUnauthorized(): void {
    // Clear auth tokens and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      // You might want to trigger a logout action here
      // window.location.href = '/signin';
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint;
    
    return this.request<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload method
  async upload<T>(
    endpoint: string, 
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Add auth token if available
      const token = this.getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result: ApiResponse<T> = JSON.parse(xhr.responseText);
            if (result.r === 'e') {
              reject(new Error(result.message || result.error || ERROR_MESSAGES.SERVER_ERROR));
            } else {
              resolve(result.data as T);
            }
          } catch (error) {
            reject(new Error(ERROR_MESSAGES.SERVER_ERROR));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error(ERROR_MESSAGES.NETWORK_ERROR));
      });

      xhr.open('POST', url);
      xhr.send(formData);
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export the class for testing or creating new instances
export { ApiClient }; 