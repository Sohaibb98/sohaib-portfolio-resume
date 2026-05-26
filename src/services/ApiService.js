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

  async logVisit(payload = {}) {
    const LOG_URL = import.meta.env.VITE_LOG_VISIT_URL || 'http://localhost:8000/log-visit';
    const API_TIMEOUT_LOCAL = import.meta.env.VITE_API_TIMEOUT || 30000;
    try {
      console.log("Logging visit with payload:", payload);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_LOCAL);

      const response = await fetch(LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Visit logged with status:', response.status);
      const data = await response.json();
      console.log('Visit logged with Response Data:', data);

      // don't throw on non-2xx to avoid breaking UX; return status
      return { ok: response.ok, status: response.status };
    } catch (error) {
      // swallow errors; return info for debugging
      console.log('Error logging visit:', error);
      return { ok: false, error: error.message || String(error) };
    }
  }
}

export default new ApiService();