<template>
  <div class="notice-board">
    <div class="notice-board-header">
      <h2 class="notice-title">🚀 Features In Progress</h2>
      <div class="pin pin-left"></div>
      <div class="pin pin-right"></div>
    </div>
    <div class="notice-board-content">
      <ul class="features-list">
        <li class="feature-item">
          <span class="feature-icon">📄</span>
          <span class="feature-text">PDF Download</span>
          <span class="status-badge">In Progress</span>
        </li>
        <li class="feature-item">
          <span class="feature-icon">📧</span>
          <span class="feature-text">Deployment Pipelines</span>
          <span class="status-badge">In Progress</span>
        </li>
        <li class="feature-item">
          <span class="feature-icon">🤖</span>
          <span class="feature-text">Chatbot to assist recruiters with their screening</span>
          <span class="status-badge">In Progress</span>
        </li>
        <li class="feature-item">
          <span class="feature-icon">⚡</span>
          <span class="feature-text">Multi-Backend (Next in Go lang)</span>
          <span class="status-badge">Planned</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoticeBoard'
}
</script>

<style scoped>
/* Notice Board Styles */
.notice-board {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15), 
              inset 0 1px 0 rgba(255, 255, 255, 0.6);
  position: relative;
  border: 3px solid #d4a259;
}

.notice-board-header {
  position: relative;
  padding: 20px 20px 15px;
  border-bottom: 2px dashed #d4a259;
}

.notice-title {
  margin: 0;
  font-size: 22px;
  font-weight: bold;
  color: #2d3436;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
}

/* Decorative Pins */
.pin {
  position: absolute;
  top: -8px;
  width: 16px;
  height: 16px;
  background: radial-gradient(circle, #e74c3c 0%, #c0392b 100%);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3),
              inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.pin::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 50%;
}

.pin-left {
  left: 20px;
}

.pin-right {
  right: 20px;
}

.notice-board-content {
  padding: 20px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  border-left: 4px solid #3498db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.feature-text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #2d3436;
  line-height: 1.4;
}

.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  white-space: nowrap;
}

.feature-item:nth-child(1) .status-badge,
.feature-item:nth-child(2) .status-badge,
.feature-item:nth-child(3) .status-badge {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: white;
}

.feature-item:nth-child(4) .status-badge {
  background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
  color: white;
}
</style>
