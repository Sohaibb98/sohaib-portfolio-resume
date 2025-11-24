// API service for fetching resume data
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

class ApiService {
  async fetchResumeData() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}/resume-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }
}

export default new ApiService();