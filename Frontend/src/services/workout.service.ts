import { fetchAPI } from '@/lib/utils';
import { WorkoutLog } from '@/types/health';

// Interface to match the backend model structure
export interface WorkoutLogDTO {
  id?: number;
  workout_type: string;
  activity: string;
  duration: number;
  calories_burned: number;
  distance?: number;
  notes?: string;
  date: string;
  time: string;
  user?: number;
}

// Convert frontend WorkoutLog to backend WorkoutLogDTO
export const workoutToDTO = (workout: Omit<WorkoutLog, 'id'>): Omit<WorkoutLogDTO, 'id'> => {
  const date = new Date(workout.date);
  return {
    workout_type: mapWorkoutTypeToBackend(workout.type),
    activity: workout.type,
    duration: workout.duration,
    calories_burned: workout.calories,
    notes: workout.notes,
    date: date.toISOString().split('T')[0], // YYYY-MM-DD format
    time: date.toTimeString().split(' ')[0], // HH:MM:SS format
  };
};

// Convert backend WorkoutLogDTO to frontend WorkoutLog
export const dtoToWorkout = (dto: WorkoutLogDTO): WorkoutLog => {
  const dateTime = `${dto.date}T${dto.time}`;
  
  return {
    id: dto.id?.toString() || '',
    type: dto.activity,
    duration: dto.duration,
    calories: dto.calories_burned,
    date: new Date(dateTime).toISOString(),
    intensity: mapIntensityFromWorkoutType(dto.workout_type),
    notes: dto.notes,
  };
};

// Map frontend workout type to backend workout_type
const mapWorkoutTypeToBackend = (type: string): string => {
  const mapping: { [key: string]: string } = {
    'Running': 'cardio',
    'Walking': 'cardio',
    'Cycling': 'cardio',
    'Swimming': 'cardio',
    'Strength Training': 'strength',
    'HIIT': 'crossfit',
    'Yoga': 'flexibility',
    'Pilates': 'flexibility',
    'Dance': 'cardio',
    'Basketball': 'sports',
    'Soccer': 'sports',
    'Tennis': 'sports',
    'Hiking': 'cardio',
    'Rowing': 'cardio',
    'Elliptical': 'cardio',
    'CrossFit': 'crossfit',
  };

  return mapping[type] || 'other';
};

// Map backend workout_type to intensity
const mapIntensityFromWorkoutType = (workoutType: string): 'Low' | 'Medium' | 'High' => {
  const intensityMap: { [key: string]: 'Low' | 'Medium' | 'High' } = {
    'cardio': 'Medium',
    'strength': 'High',
    'flexibility': 'Low',
    'sports': 'Medium',
    'crossfit': 'High',
    'other': 'Medium',
  };

  return intensityMap[workoutType] || 'Medium';
};

// Workout API service
export const WorkoutService = {
  getAll: async (): Promise<WorkoutLog[]> => {
    const token = localStorage.getItem('access');
    const response = await fetchAPI('health/workouts/', 'GET', null, token);
    
    // Handle paginated response
    if (response && response.results) {
      return response.results.map(dtoToWorkout);
    }
    
    // Fallback if not paginated
    return response.map(dtoToWorkout);
  },

  getByDate: async (date: string): Promise<WorkoutLog[]> => {
    const token = localStorage.getItem('access');
    const response = await fetchAPI(`health/workouts/?date=${date}`, 'GET', null, token);
    return response.map(dtoToWorkout);
  },

  create: async (workout: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> => {
    const token = localStorage.getItem('access');
    const workoutDTO = workoutToDTO(workout);
    const response = await fetchAPI('health/workouts/', 'POST', workoutDTO, token);
    return dtoToWorkout(response);
  },

  update: async (id: string, workout: Omit<WorkoutLog, 'id'>): Promise<WorkoutLog> => {
    const token = localStorage.getItem('access');
    const workoutDTO = workoutToDTO(workout);
    const response = await fetchAPI(`health/workouts/${id}/`, 'PUT', workoutDTO, token);
    return dtoToWorkout(response);
  },

  delete: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('access');
      
      // Make sure we're using the correct ID from the database
      // If it's a UUID, we'll use it as is, otherwise convert to number
      const numericId = id.includes('-') ? id : Number(id);
      
      console.log(`Attempting to delete workout with ID: ${numericId}, original ID: ${id}`);
      
      const response = await fetchAPI(`health/workouts/${numericId}/`, 'DELETE', null, token);
      console.log(`Delete response:`, response);
      
      return response;
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  }
}; 