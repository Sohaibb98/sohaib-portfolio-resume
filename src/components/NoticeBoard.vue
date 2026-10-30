<template>
  <section class="board">
    <span class="pin" aria-hidden="true"></span>
    <h3 class="title">🚀 Features in progress</h3>
    <ul class="items">
      <li v-for="f in features" :key="f.label">
        <span class="status" :class="f.status" :title="labels[f.status]"></span>
        <span class="label">{{ f.label }}</span>
        <span class="tag" :class="f.status">{{ labels[f.status] }}</span>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  name: 'NoticeBoard',
  data() {
    return {
      labels: { live: 'Beta', progress: 'In progress', planned: 'Planned' },
      features: [
        { label: 'PDF download', status: 'live' },
        { label: 'Deployment pipelines', status: 'progress' },
        { label: 'Recruiter screening chatbot', status: 'live' },
        { label: 'Multi-backend (next: Go)', status: 'planned' }
      ]
    }
  }
}
</script>

<style scoped>
.board {
  position: relative;
  padding: 20px;
  border-radius: var(--radius);
  background: var(--amber-soft);
  border: 1px dashed #e3b45c;
}

.pin {
  position: absolute;
  top: -6px;
  right: 22px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ef6b5f, #b8322a);
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.25);
}

.title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #5b3d06;
}

.items {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
}

.items li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13.5px;
  color: #3f2c08;
}

.status {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}

.status.live {
  background: var(--green);
}

.status.progress {
  background: var(--amber);
}

.status.planned {
  background: transparent;
  border: 1.5px solid #b58a3a;
}

.label {
  flex: 1;
}

.tag {
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: #8a6420;
  white-space: nowrap;
}

.tag.live {
  color: var(--green);
}
</style>
