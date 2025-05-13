import { fetchAPI } from '@/lib/utils';
import { WaterLog } from '@/types/health';

// Interface to match the backend model structure
export interface WaterLogDTO {
  id?: number;
  amount: number;
  date: string;
  time: string;
  user?: number;
}

// Convert frontend WaterLog to backend WaterLogDTO
export const waterToDTO = (water: Omit<WaterLog, 'id'>): Omit<WaterLogDTO, 'id'> => {
  const date = new Date(water.timestamp);
  return {
    amount: water.amount,
    date: date.toISOString().split('T')[0], // YYYY-MM-DD format
    time: date.toTimeString().split(' ')[0], // HH:MM:SS format
  };
};

// Convert backend WaterLogDTO to frontend WaterLog
export const dtoToWater = (dto: WaterLogDTO): WaterLog => {
  const dateTime = `${dto.date}T${dto.time}`;
  
  return {
    id: dto.id?.toString() || '',
    amount: dto.amount,
    timestamp: new Date(dateTime).toISOString(),
  };
};

// Water API service
export const WaterService = {
  getAll: async (): Promise<WaterLog[]> => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetchAPI('health/water/', 'GET', null, token);
      
      // Handle paginated response
      if (response && response.results) {
        return response.results.map(dtoToWater);
      }
      
      // Fallback if not paginated
      return response.map(dtoToWater);
    } catch (error) {
      console.error('Error fetching water logs:', error);
      throw error;
    }
  },

  getByDate: async (date: string): Promise<WaterLog[]> => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetchAPI(`health/water/?date=${date}`, 'GET', null, token);
      
      // Handle paginated response
      if (response && response.results) {
        return response.results.map(dtoToWater);
      }
      
      return response.map(dtoToWater);
    } catch (error) {
      console.error('Error fetching water logs by date:', error);
      throw error;
    }
  },

  getDailyTotal: async (date?: string): Promise<number> => {
    try {
      const token = localStorage.getItem('access');
      const dateParam = date ? `?date=${date}` : '';
      const response = await fetchAPI(`health/water/daily_total/${dateParam}`, 'GET', null, token);
      return response.total_amount || 0;
    } catch (error) {
      console.error('Error fetching daily water total:', error);
      return 0;
    }
  },

  create: async (water: Omit<WaterLog, 'id'>): Promise<WaterLog> => {
    try {
      const token = localStorage.getItem('access');
      const waterDTO = waterToDTO(water);
      const response = await fetchAPI('health/water/', 'POST', waterDTO, token);
      return dtoToWater(response);
    } catch (error) {
      console.error('Error creating water log:', error);
      throw error;
    }
  },

  update: async (id: string, water: Omit<WaterLog, 'id'>): Promise<WaterLog> => {
    try {
      const token = localStorage.getItem('access');
      const waterDTO = waterToDTO(water);
      const numericId = id.includes('-') ? id : Number(id);
      const response = await fetchAPI(`health/water/${numericId}/`, 'PUT', waterDTO, token);
      return dtoToWater(response);
    } catch (error) {
      console.error('Error updating water log:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('access');
      const numericId = id.includes('-') ? id : Number(id);
      console.log(`Attempting to delete water log with ID: ${numericId}, original ID: ${id}`);
      await fetchAPI(`health/water/${numericId}/`, 'DELETE', null, token);
    } catch (error) {
      console.error('Error deleting water log:', error);
      throw error;
    }
  }
}; 