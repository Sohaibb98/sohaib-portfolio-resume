<template>
  <div class="right-panel">
    <!-- Action Buttons -->
    <div class="action-buttons">
      <button @click="scheduleCall" class="action-btn schedule-btn">
        <span class="btn-content">
          <span class="btn-icon">📅</span>
          <span class="btn-text">Schedule a Call</span>
        </span>
        <span class="hover-icon"><i class="fa-solid fa-external-link"></i></span>
      </button>
    </div>

    <!-- Notice Board -->
    <NoticeBoard />
  </div>
</template>

<script>
import NoticeBoard from './NoticeBoard.vue'

export default {
  name: 'RightPanel',
  components: { NoticeBoard },
  data() {
    return {
      calendlyUrl: import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com'
    }
  },
  methods: {
    scheduleCall() {
      window.open(this.calendlyUrl, '_blank');
    }
  }
}
</script>

<style scoped>
.right-panel {
  flex: 0 0 calc(30% - 10px);
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  min-width: 0;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.action-btn {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.action-btn:active {
  transform: translateY(-2px);
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-icon {
  font-size: 32px;
  transition: all 0.3s ease;
}

.btn-text {
  text-align: center;
  line-height: 1.3;
  font-size: 15px;
}

.schedule-btn {
  background: #3498db;
  color: white;
}

.schedule-btn:hover {
  background: #2980b9;
}

/* Hover Hyperlink Icon */
.hover-icon {
  position: absolute;
  font-size: 80px;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.3s ease;
  pointer-events: none;
}

.hover-icon i {
  font-size: 60px;
}

.suggestion-btn:hover .btn-content,
.schedule-btn:hover .btn-content {
  opacity: 0;
  transform: scale(0.8);
}

.suggestion-btn:hover .hover-icon,
.schedule-btn:hover .hover-icon {
  opacity: 1;
  transform: scale(1);
}
</style>
