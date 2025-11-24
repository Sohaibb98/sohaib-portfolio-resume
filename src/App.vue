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

export default {
  components: { Resume, Welcome, ChatbotBox, RightPanel }
}
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
</style>


