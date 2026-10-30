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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_LOCAL);

      const response = await fetch(LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // don't throw on non-2xx to avoid breaking UX; return status
      return { ok: response.ok, status: response.status };
    } catch (error) {
      // swallow errors; return info for debugging
      if (import.meta.env.DEV) console.debug('Error logging visit:', error);
      return { ok: false, error: error.message || String(error) };
    }
  }

  // ---- Recruiter chatbot ("Sohaib's Agent") ----
  async chatStatus() {
    try {
      const res = await fetch(`${API_BASE_URL}/chat/status`);
      if (!res.ok) return { enabled: false };
      return await res.json();
    } catch (e) {
      return { enabled: false };
    }
  }

  // history: [{ role: 'user' | 'assistant', content }]
  async sendChat(message, history = []) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: controller.signal
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(typeof data.detail === 'string' ? data.detail : `HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }
      return data.reply;
    } catch (e) {
      if (e.name === 'AbortError') {
        const err = new Error('The assistant took too long to answer. Please try again.');
        err.status = 408;
        throw err;
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export default new ApiService();