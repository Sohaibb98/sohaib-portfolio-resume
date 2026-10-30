<template>
  <header class="nav no-print" :class="{ scrolled }">
    <div class="nav-inner">
      <a href="#top" class="brand" aria-label="Back to top">
        <span class="mark">SB</span>
        <span class="brand-name">Sohaib Baqai</span>
      </a>

      <nav class="links" aria-label="Sections">
        <a href="#experience">Experience</a>
        <a href="#projects">Projects</a>
        <a href="#education">Education</a>
        <a href="#certifications">Certifications</a>
      </nav>

      <div class="actions">
        <button
          class="btn btn-ghost"
          :disabled="!ready"
          @click="$emit('download')"
          title="Download as PDF (exports the current filtered view)"
        >
          <i class="fa-solid fa-file-arrow-down"></i>
          <span class="hide-sm">PDF</span>
        </button>
        <a class="btn btn-amber" :href="calendlyUrl" target="_blank" rel="noopener">
          <i class="fa-regular fa-calendar"></i>
          <span class="hide-sm">Schedule a call</span>
        </a>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'TopNav',
  props: {
    calendlyUrl: { type: String, required: true },
    ready: { type: Boolean, default: false }
  },
  emits: ['download'],
  data() {
    return { scrolled: false }
  },
  mounted() {
    this.onScroll()
    window.addEventListener('scroll', this.onScroll, { passive: true })
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    onScroll() {
      this.scrolled = window.scrollY > 8
    }
  }
}
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 60;
  height: var(--nav-h);
  background: rgba(16, 18, 22, 0.92);
  backdrop-filter: saturate(140%) blur(10px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.nav.scrolled {
  border-bottom-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

.nav-inner {
  max-width: var(--max-w);
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--hero-ink);
}

.mark {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: var(--amber);
  color: #1b1405;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
}

.brand-name {
  font-weight: 600;
  font-size: 15px;
}

.links {
  display: flex;
  gap: 4px;
  margin-left: 8px;
}

.links a {
  padding: 6px 12px;
  border-radius: 999px;
  color: var(--hero-ink-2);
  font-size: 14px;
  text-decoration: none;
  transition: color 0.15s, background 0.15s;
}

.links a:hover {
  color: var(--hero-ink);
  background: rgba(255, 255, 255, 0.06);
}

.actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.btn-ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.18);
  color: var(--hero-ink);
}

.btn-ghost:hover {
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .links {
    display: none;
  }
}

@media (max-width: 520px) {
  .nav-inner {
    padding: 0 14px;
    gap: 12px;
  }
  .hide-sm {
    display: none;
  }
  .btn {
    width: 38px;
    padding: 0;
  }
}
</style>
