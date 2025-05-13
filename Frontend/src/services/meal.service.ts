import { fetchAPI } from '@/lib/utils';
import { MealLog } from '@/types/health';

// Interface to match the backend model structure
export interface MealLogDTO {
  id?: number;
  meal_type: string;
  food_items: any; // JSON field in backend
  total_calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  date: string;
  time: string;
  user?: number;
}

// Convert frontend MealLog to backend MealLogDTO
export const mealToDTO = (meal: Omit<MealLog, 'id'>): Omit<MealLogDTO, 'id'> => {
  const date = new Date(meal.timestamp);
  return {
    meal_type: meal.type,
    food_items: meal.name ? [{ name: meal.name, calories: meal.calories }] : [],
    total_calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    notes: meal.notes,
    date: date.toISOString().split('T')[0], // YYYY-MM-DD format
    time: date.toTimeString().split(' ')[0], // HH:MM:SS format
  };
};

// Convert backend MealLogDTO to frontend MealLog
export const dtoToMeal = (dto: MealLogDTO): MealLog => {
  const dateTime = `${dto.date}T${dto.time}`;
  const foodItem = Array.isArray(dto.food_items) && dto.food_items.length > 0 
    ? dto.food_items[0] 
    : { name: '', calories: 0 };
  
  return {
    id: dto.id?.toString() || '',
    name: foodItem.name || 'Meal',
    calories: dto.total_calories,
    protein: dto.protein || 0,
    carbs: dto.carbs || 0,
    fat: dto.fat || 0,
    timestamp: new Date(dateTime).toISOString(),
    type: dto.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    notes: dto.notes
  };
};

// Meal API service
export const MealService = {
  getAll: async (): Promise<MealLog[]> => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetchAPI('health/meals/', 'GET', null, token);
      
      // Handle paginated response
      if (response && response.results) {
        return response.results.map(dtoToMeal);
      }
      
      // Fallback if not paginated
      return response.map(dtoToMeal);
    } catch (error) {
      console.error('Error fetching meals:', error);
      throw error;
    }
  },

  getByDate: async (date: string): Promise<MealLog[]> => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetchAPI(`health/meals/?date=${date}`, 'GET', null, token);
      
      // Handle paginated response
      if (response && response.results) {
        return response.results.map(dtoToMeal);
      }
      
      return response.map(dtoToMeal);
    } catch (error) {
      console.error('Error fetching meals by date:', error);
      throw error;
    }
  },

  create: async (meal: Omit<MealLog, 'id'>): Promise<MealLog> => {
    try {
      const token = localStorage.getItem('access');
      const mealDTO = mealToDTO(meal);
      const response = await fetchAPI('health/meals/', 'POST', mealDTO, token);
      return dtoToMeal(response);
    } catch (error) {
      console.error('Error creating meal:', error);
      throw error;
    }
  },

  update: async (id: string, meal: Omit<MealLog, 'id'>): Promise<MealLog> => {
    try {
      const token = localStorage.getItem('access');
      const mealDTO = mealToDTO(meal);
      const numericId = id.includes('-') ? id : Number(id);
      const response = await fetchAPI(`health/meals/${numericId}/`, 'PUT', mealDTO, token);
      return dtoToMeal(response);
    } catch (error) {
      console.error('Error updating meal:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('access');
      const numericId = id.includes('-') ? id : Number(id);
      console.log(`Attempting to delete meal with ID: ${numericId}, original ID: ${id}`);
      const response = await fetchAPI(`health/meals/${numericId}/`, 'DELETE', null, token);
      console.log(`Delete response:`, response);
      return response;
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  }
}; 