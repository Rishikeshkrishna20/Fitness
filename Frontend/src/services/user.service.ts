import { fetchAPI } from '@/lib/utils';
import { User } from '@/types/health';

// Interface to match the backend user model
export interface UserProfileDTO {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  height?: number;
  weight?: number;
  gender?: string;
  date_of_birth?: string;
  blood_type?: string;
  emergency_contact?: string;
  medical_conditions?: string[];
  allergies?: string[];
  goal?: string;
  profile_picture?: string;
}

// Convert backend UserProfileDTO to frontend User
export const dtoToUser = (dto: UserProfileDTO): User => {
  return {
    id: dto.id.toString(),
    email: dto.email,
    first_name: dto.first_name,
    last_name: dto.last_name,
    name: dto.first_name && dto.last_name ? `${dto.first_name} ${dto.last_name}` : dto.first_name || '',
    height: dto.height,
    weight: dto.weight,
    gender: dto.gender,
    age: dto.date_of_birth ? calculateAge(dto.date_of_birth) : undefined,
    bloodType: dto.blood_type,
    emergencyContact: dto.emergency_contact,
    medicalConditions: dto.medical_conditions,
    allergies: dto.allergies,
    goal: dto.goal,
    avatar: dto.profile_picture,
  };
};

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth: string): number => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

// Interface for weight history item
export interface WeightHistoryItem {
  date: string;
  weight: number;
}

// User API service
export const UserService = {
  // Get current user profile
  getProfile: async (): Promise<User> => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetchAPI('users/profile/', 'GET', null, token);
      return dtoToUser(response);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  // Update user profile including weight
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetchAPI('users/profile/', 'PUT', userData, token);
      return dtoToUser(response);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },
  
  // Update user weight specifically
  updateWeight: async (weight: number): Promise<User> => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetchAPI('users/profile/', 'PATCH', { weight }, token);
      return dtoToUser(response);
    } catch (error) {
      console.error('Error updating weight:', error);
      throw error;
    }
  },
  
  // Get user from localStorage with fallback to API
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Try to get user from localStorage first
      const userJson = localStorage.getItem('user');
      if (userJson) {
        return JSON.parse(userJson);
      }
      
      // If not in localStorage, fetch from API
      return await UserService.getProfile();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Get user weight history
  getWeightHistory: async (): Promise<WeightHistoryItem[]> => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetchAPI('users/weight-history/', 'GET', null, token);
      
      if (Array.isArray(response)) {
        return response.map(item => ({
          date: item.date,
          weight: item.weight
        }));
      }
      
      // If no history from API, create a basic history from current user
      const user = await UserService.getCurrentUser();
      if (user?.weight) {
        return [
          { date: new Date().toISOString().split('T')[0], weight: user.weight }
        ];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching weight history:', error);
      
      // Fallback to localStorage user if API fails
      try {
        const user = await UserService.getCurrentUser();
        if (user?.weight) {
          return [
            { date: new Date().toISOString().split('T')[0], weight: user.weight }
          ];
        }
      } catch (e) {
        console.error('Fallback to localStorage also failed:', e);
      }
      
      return [];
    }
  }
}; 