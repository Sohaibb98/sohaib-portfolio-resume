<template>
  <TopNav :calendly-url="calendlyUrl" :ready="!!resume" @download="downloadPdf" />

  <Welcome
    :profile="profile"
    :contact="resume?.contact"
    :location="currentLocation"
    :calendly-url="calendlyUrl"
  />

  <main class="page" id="top">
    <div class="layout">
      <section class="main-col" aria-live="polite">
        <!-- Loading -->
        <div v-if="loading" class="card state">
          <div class="spinner" aria-hidden="true"></div>
          <p class="state-title">Loading resume…</p>
          <p class="state-sub">
            The API runs on Render's free tier, so the first visit can take up to
            ~30 seconds while the server wakes up.
          </p>
          <div class="skeleton">
            <span v-for="n in 5" :key="n" :style="{ width: 100 - n * 9 + '%' }"></span>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="card state">
          <i class="fa-solid fa-plug-circle-exclamation state-icon" aria-hidden="true"></i>
          <p class="state-title">Couldn't load the resume</p>
          <p class="state-sub">{{ error }}</p>
          <button class="btn btn-primary" @click="fetchResumeData">
            <i class="fa-solid fa-rotate-right"></i> Try again
          </button>
        </div>

        <!-- Resume -->
        <Resume
          v-else
          :resume="resume"
          :all-skills="allSkills"
          :selected-skills="selectedSkills"
          @toggle-skill="toggleSkill"
          @clear-skills="selectedSkills = []"
        />
      </section>

      <RightPanel
        :resume="resume"
        :all-skills="allSkills"
        :selected-skills="selectedSkills"
        :calendly-url="calendlyUrl"
        @toggle-skill="toggleSkill"
      />
    </div>
  </main>

  <footer class="site-footer no-print">
    <span>© {{ year }} Sohaib Baqai</span>
    <span class="dot" aria-hidden="true">·</span>
    <span>Vue 3 · FastAPI on Render · MongoDB · GitHub Pages</span>
  </footer>

  <ChatbotBox />
</template>

<script>
import TopNav from './components/TopNav.vue'
import Welcome from './components/Welcome.vue'
import Resume from './components/Resume.vue'
import RightPanel from './components/RightPanel.vue'
import ChatbotBox from './components/ChatbotBox.vue'
import ApiService from './services/ApiService.js'
import { normalizeSkill } from './utils/helpers.js'

export default {
  components: { TopNav, Welcome, Resume, RightPanel, ChatbotBox },
  data() {
    return {
      resume: null,
      loading: true,
      error: null,
      selectedSkills: [],
      calendlyUrl: import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com',
      year: new Date().getFullYear()
    }
  },
  computed: {
    profile() {
      return this.resume?.personal_info || null
    },
    currentLocation() {
      const visa = this.resume?.visa || {}
      const entry = Object.entries(visa).find(([, v]) => v && v.cur_loc)
      return entry ? { country: entry[0], ...entry[1] } : null
    },
    // Every skill that can be filtered on: the curated skill_tags plus any
    // skill that appears on a project or certification (deduplicated).
    allSkills() {
      const r = this.resume
      if (!r) return []
      const seen = new Map()
      const add = (s) => {
        const key = normalizeSkill(s)
        if (key && !seen.has(key)) seen.set(key, s)
      }
      ;(r.skill_tags || []).forEach(add)
      ;(r.experiences || []).forEach((e) =>
        (e.positions || []).forEach((p) =>
          (p.projects || []).forEach((pr) => (pr.skills || []).forEach(add))
        )
      )
      ;(r.projects || []).forEach((p) => (p.skills || []).forEach(add))
      ;(r.certifications || []).forEach((c) => (c.skills || []).forEach(add))
      return [...seen.values()]
    }
  },
  mounted() {
    this.fetchResumeData()
    try {
      visitLogger()
    } catch (e) {
      // ignore
    }
  },
  methods: {
    async fetchResumeData() {
      this.loading = true
      this.error = null
      try {
        const data = await ApiService.fetchResumeData()
        this.resume = { ...data, projects: data.projects || [] }
      } catch (e) {
        this.error = e.message === 'Request timeout'
          ? 'The server took too long to respond. It may still be waking up, so give it another try.'
          : e.message
        console.error('Failed to fetch resume data:', e)
      } finally {
        this.loading = false
      }
    },
    toggleSkill(skill) {
      const key = normalizeSkill(skill)
      const idx = this.selectedSkills.findIndex((s) => normalizeSkill(s) === key)
      if (idx > -1) {
        this.selectedSkills.splice(idx, 1)
      } else {
        // Store the canonical spelling from the tag list when there is one
        const canonical = this.allSkills.find((s) => normalizeSkill(s) === key) || skill
        this.selectedSkills.push(canonical)
        this.$nextTick(() => {
          const el = document.getElementById('resume-start')
          if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth' })
        })
      }
    },
    downloadPdf() {
      window.print()
    }
  }
}

// Send a non-blocking visit log when the app starts
export const visitLogger = async () => {
  try {
    const hasWindow = typeof window !== 'undefined'
    const hasNavigator = typeof navigator !== 'undefined'

    const screenWidth = hasWindow && window.screen ? window.screen.width : 0
    const screenHeight = hasWindow && window.screen ? window.screen.height : 0

    let timeZone = 'Unknown'
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    const payload = {
      timestamp: new Date().toISOString(),
      path: hasWindow ? window.location.pathname : '',
      userAgent: hasNavigator ? navigator.userAgent : '',
      screen_resolution: screenWidth && screenHeight ? `${screenWidth}x${screenHeight}` : 'Unknown',
      language: hasNavigator ? (navigator.language || navigator.userLanguage) : 'Unknown',
      local_timezone: timeZone,
      coordinates: null
    }

    // fire-and-forget background analytics dispatch
    ApiService.logVisit(payload)
  } catch (e) {
    // swallow analytics errors silently to preserve main app runtime
  }
}
</script>

<style scoped>
.page {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 28px;
  align-items: start;
}

.main-col {
  min-width: 0;
}

/* Loading / error */
.state {
  padding: 48px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.state-title {
  margin: 8px 0 0;
  font-size: 18px;
  font-weight: 600;
}

.state-sub {
  margin: 0 0 16px;
  max-width: 440px;
  color: var(--ink-3);
  font-size: 14px;
}

.state-icon {
  font-size: 34px;
  color: var(--red);
}

.spinner {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 3px solid var(--line);
  border-top-color: var(--accent);
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.skeleton {
  width: 100%;
  max-width: 520px;
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.skeleton span {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, var(--line) 0%, var(--surface-2) 50%, var(--line) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

.site-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 28px 24px 96px;
  border-top: 1px solid var(--line);
  color: var(--ink-3);
  font-size: 13px;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .page {
    padding: 20px 14px 48px;
  }
}

@media print {
  .page {
    padding: 0;
    max-width: none;
  }
  .layout {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .layout > :deep(.sidebar) {
    order: -1;
  }
}
</style>
