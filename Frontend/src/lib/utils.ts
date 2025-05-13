import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// new
// Hardcoded API base URL since we can't update the .env file in this environment
const BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchAPI = async (endpoint: string, method = 'GET', body?: any, token?: string) => {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error(`API Error ${res.status} for ${method} ${endpoint}:`, errorData);
      throw new Error(errorData.detail || `API error: ${res.status}`);
    }

    // For DELETE requests, don't try to parse JSON
    if (method === 'DELETE') {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error(`API Request Failed for ${method} ${endpoint}:`, error);
    throw error;
  }
};
