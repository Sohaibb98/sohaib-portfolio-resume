<template>
  <div>
    <Welcome />
  </div>
  <div class="app-layout">
    <div class="resume-section">
      <Resume />
    </div>
    <RightPanel />
    <ChatbotBox />
  </div>
</template>

<script>
import Resume from './components/Resume.vue'
import Welcome from './components/Welcome.vue'
import ChatbotBox from './components/ChatbotBox.vue'
import RightPanel from './components/RightPanel.vue'
import ApiService from './services/ApiService.js'

export default {
  components: { Resume, Welcome, ChatbotBox, RightPanel },
  mounted() {
    // Call visit logger once when root component mounts
    try {
      visitLogger();
    } catch (e) {
      // ignore
    }
  }
}

// Send a non-blocking visit log when the app starts
export const visitLogger = async () => {
  try {
    // 1. Gather browser-level metrics safely (checking for 'undefined' to keep it SSR-safe if needed)
    const hasWindow = typeof window !== 'undefined';
    const hasNavigator = typeof navigator !== 'undefined';

    const screenWidth = hasWindow && window.screen ? window.screen.width : 0;
    const screenHeight = hasWindow && window.screen ? window.screen.height : 0;
    
    let timeZone = 'Unknown';
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // 2. Build the exact payload shape expected by your FastAPI backend
    const payload = {
      // Original fields
      timestamp: new Date().toISOString(),
      path: hasWindow ? window.location.pathname : '',
      userAgent: hasNavigator ? navigator.userAgent : '',
      
      // New telemetry fields matching backend Pydantic expectations
      screen_resolution: screenWidth && screenHeight ? `${screenWidth}x${screenHeight}` : 'Unknown',
      language: hasNavigator ? (navigator.language || navigator.userLanguage) : 'Unknown',
      local_timezone: timeZone,
      coordinates: null // Explicitly pass null for now (or insert GPS coordinates object if captured later)
    };

    // fire-and-forget background analytics dispatch
    ApiService.logVisit(payload).then((res) => {
      // optional: console.debug('logVisit result', res);
    });
  } catch (e) {
    // swallow analytics errors silently to preserve main app runtime
  }
};
</script>

<style scoped>
.app-layout {
  position: relative;
  display: flex;
  gap: 20px;
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f5f5;
  max-width: 100vw;
  box-sizing: border-box;
}

.resume-section {
  flex: 1 1 70%;
  display: flex;
  justify-content: center;
  min-width: 0;
  overflow: visible;
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
    padding: 10px;
    gap: 15px;
  }

  .resume-section {
    flex: 1 1 100%;
    width: 100%;
  }
}
</style>


