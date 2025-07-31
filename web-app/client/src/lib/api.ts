import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchData = async (turbineId: string, startDate: Date, endDate: Date) => {
  try {
    const response = await axios.get(`${API_URL}/turbine/${turbineId}`, {
      params: {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.detail || 'An unexpected error occurred.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

export const checkBackendStatus = async () => {
  try {
    await axios.get(`${API_URL}/get`);
    return true;
  } catch (error) {
    return false;
  }
}; 