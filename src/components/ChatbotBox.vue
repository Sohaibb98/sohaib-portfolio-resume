<template>
  <div class="chatbot-box">
    <div class="chatbot-header">Sohaib's Agent</div>
    <div class="chatbot-body">
      <!-- Chatbot UI will go here -->
      <p>Chatbot coming soon...</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatbotBox'
}
</script>

<style scoped>
.chatbot-box {
  position: fixed;
  right: 30px;
  bottom: 30px;
  width: 320px;
  min-height: 120px;
  background: #fff;
  border: 2px solid var(--highlight-color-right, #007bff);
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.12);
  z-index: 9999;
  display: flex;
  flex-direction: column;
}
.chatbot-header {
  background: var(--highlight-color-right, #007bff);
  color: #fff;
  padding: 10px 16px;
  font-weight: bold;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}
.chatbot-body {
  padding: 16px;
  flex: 1;
}
</style>
