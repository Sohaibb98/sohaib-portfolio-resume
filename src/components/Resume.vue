<template>
  <div class="resume">
    <div id="resume-start"></div>

    <!-- ============ Skill filter ============ -->
    <div class="filter card no-print">
      <div class="search" :class="{ open: dropdownOpen }">
        <i class="fa-solid fa-magnifying-glass search-icon" aria-hidden="true"></i>
        <input
          ref="search"
          type="search"
          v-model="searchQuery"
          placeholder="Tailor this resume: filter by a skill, e.g. Python or Vue.js"
          aria-label="Filter resume by skill"
          role="combobox"
          :aria-expanded="dropdownOpen"
          aria-controls="skill-suggestions"
          autocomplete="off"
          @focus="focused = true"
          @blur="onBlur"
          @keydown.down.prevent="move(1)"
          @keydown.up.prevent="move(-1)"
          @keydown.enter.prevent="pickActive"
          @keydown.esc="searchQuery = ''"
        />
        <ul v-if="dropdownOpen" id="skill-suggestions" class="dropdown" role="listbox">
          <li
            v-for="(skill, idx) in suggestions"
            :key="skill"
            role="option"
            :aria-selected="idx === activeIndex"
            :class="{ active: idx === activeIndex }"
            @mousedown.prevent="pick(skill)"
            @mouseenter="activeIndex = idx"
          >
            {{ skill }}
          </li>
        </ul>
      </div>

      <div v-if="selectedSkills.length" class="filter-status">
        <div class="chips">
          <button
            v-for="skill in selectedSkills"
            :key="skill"
            class="chip is-active"
            @click="$emit('toggle-skill', skill)"
            :aria-label="`Remove ${skill} filter`"
          >
            {{ skill }} <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <span class="match-count">{{ matchSummary }}</span>
        <button class="link-btn" @click="$emit('clear-skills')">Clear</button>
      </div>
      <div v-else class="filter-status">
        <span class="hint">Try:</span>
        <div class="chips">
          <button v-for="skill in quickPicks" :key="skill" class="chip" @click="pick(skill)">
            {{ skill }}
          </button>
        </div>
      </div>
    </div>

    <p v-if="selectedSkills.length" class="print-only tailored">
      Tailored for: {{ selectedSkills.join(', ') }}
    </p>

    <!-- Nothing matches -->
    <div v-if="selectedSkills.length && totalMatches === 0" class="card empty">
      <i class="fa-regular fa-face-meh" aria-hidden="true"></i>
      <p>Nothing in the resume is tagged with {{ selectedSkills.join(' or ') }} yet.</p>
      <button class="btn" @click="$emit('clear-skills')">Clear filters</button>
    </div>

    <!-- ============ Experience ============ -->
    <section v-if="filteredExperiences.length" id="experience" class="card section">
      <header class="section-head">
        <span class="eyebrow">01</span>
        <h2>{{ h.experience }}</h2>
      </header>

      <article v-for="(company, ci) in filteredExperiences" :key="company.company + ci" class="company">
        <div class="company-head">
          <img
            v-if="company.image"
            :src="asset(company.image)"
            :alt="`${company.company} logo`"
            class="logo"
          />
          <h3>{{ company.company }}</h3>
        </div>

        <ol class="timeline">
          <li v-for="(pos, pi) in company.positions" :key="pi" class="role">
            <div class="row">
              <h4>{{ pos.title }}</h4>
              <span v-if="pos.duration" class="date">{{ duration(pos.duration) }}</span>
            </div>
            <p v-if="pos.summary" class="summary">{{ pos.summary }}</p>

            <div v-for="(p, pk) in pos.projects" :key="pk" class="project">
              <div class="row">
                <h5>{{ p.title }}</h5>
                <span v-if="p.position" class="role-tag">{{ p.position }}</span>
              </div>
              <p v-if="p.description" class="desc">{{ p.description }}</p>
              <ul v-if="p.bullets && p.bullets.length" class="bullets">
                <li v-for="(b, bi) in p.bullets" :key="bi">{{ b }}</li>
              </ul>
              <SkillChips :skills="p.skills" :selected="selectedKeys" @toggle="(s) => $emit('toggle-skill', s)" />
            </div>
          </li>
        </ol>
      </article>
    </section>

    <!-- ============ Projects ============ -->
    <section v-if="filteredProjects.length" id="projects" class="card section">
      <header class="section-head">
        <span class="eyebrow">02</span>
        <h2>{{ h.projects }}</h2>
      </header>

      <div class="project-grid">
        <article v-for="(project, pi) in filteredProjects" :key="pi" class="project-card">
          <div class="row">
            <h5>{{ project.title }}</h5>
            <span v-if="project.duration" class="date">{{ duration(project.duration) }}</span>
          </div>
          <p v-if="project.position" class="role-tag">{{ project.position }}</p>
          <p v-if="project.description" class="desc">{{ project.description }}</p>
          <ul v-if="project.bullets && project.bullets.length" class="bullets">
            <li v-for="(b, bi) in project.bullets" :key="bi">{{ b }}</li>
          </ul>
          <SkillChips :skills="project.skills" :selected="selectedKeys" @toggle="(s) => $emit('toggle-skill', s)" />
        </article>
      </div>
    </section>

    <!-- ============ Education ============ -->
    <section v-if="education.length" id="education" class="card section">
      <header class="section-head">
        <span class="eyebrow">03</span>
        <h2>{{ h.education }}</h2>
      </header>

      <article v-for="(edu, ei) in education" :key="ei" class="edu">
        <div class="row">
          <h4>{{ edu.title }}</h4>
          <span v-if="edu.duration" class="date">{{ duration(edu.duration) }}</span>
        </div>
        <p class="institute">
          {{ edu.institute }}<template v-if="edu.location"> · {{ edu.location }}</template>
        </p>
        <ul v-if="edu.description && edu.description.length" class="bullets">
          <li v-for="(b, bi) in edu.description" :key="bi">{{ b }}</li>
        </ul>
      </article>
    </section>

    <!-- ============ Certifications ============ -->
    <section v-if="filteredCertifications.length" id="certifications" class="card section">
      <header class="section-head">
        <span class="eyebrow">04</span>
        <h2>{{ h.certifications }}</h2>
        <div class="view-toggle no-print" role="group" aria-label="Certification view">
          <button
            :class="{ active: certView === 'list' }"
            :aria-pressed="certView === 'list'"
            title="List view"
            @click="certView = 'list'"
          >
            <i class="fa-solid fa-list"></i>
          </button>
          <button
            :class="{ active: certView === 'grid' }"
            :aria-pressed="certView === 'grid'"
            title="Gallery view"
            @click="certView = 'grid'"
          >
            <i class="fa-solid fa-table-cells-large"></i>
          </button>
        </div>
      </header>

      <!-- List view -->
      <ul v-if="certView === 'list' || printing" class="cert-list">
        <li v-for="(cert, ci) in visibleCerts" :key="ci">
          <button class="cert-row" @click="openCert(cert)">
            <span class="cert-main">
              <span class="cert-title">{{ cert.title }}</span>
              <span class="cert-meta">
                {{ cert.issued_by }}<template v-if="cert.type"> · {{ cert.type }}</template>
              </span>
            </span>
            <span class="date">{{ cert.date }}</span>
            <i class="fa-solid fa-chevron-right cert-arrow no-print" aria-hidden="true"></i>
          </button>
        </li>
      </ul>

      <!-- Grid view -->
      <div v-else class="cert-grid">
        <button
          v-for="(cert, ci) in visibleCerts"
          :key="ci"
          class="cert-tile"
          :title="cert.title"
          @click="openCert(cert)"
        >
          <span class="thumb">
            <img
              v-if="cert.image_path && !brokenThumbs[cert.title]"
              :src="certImg(cert.image_path)"
              :alt="`${cert.title} certificate`"
              loading="lazy"
              @error="brokenThumbs[cert.title] = true"
            />
            <i v-else class="fa-solid fa-award" aria-hidden="true"></i>
          </span>
          <span class="tile-title">{{ cert.title }}</span>
          <span class="tile-meta">{{ cert.issued_by }}</span>
        </button>
      </div>

      <button
        v-if="filteredCertifications.length > certLimit"
        class="show-more no-print"
        @click="showAllCerts = !showAllCerts"
      >
        {{ showAllCerts ? 'Show less' : `Show all ${filteredCertifications.length}` }}
        <i :class="['fa-solid', showAllCerts ? 'fa-chevron-up' : 'fa-chevron-down']"></i>
      </button>
    </section>

    <!-- ============ Certificate modal ============ -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedCert" class="modal-overlay" @click="closeCert">
          <div class="modal" role="dialog" aria-modal="true" :aria-label="selectedCert.title" @click.stop>
            <div class="modal-header">
              <div>
                <p class="eyebrow">{{ selectedCert.type || 'Certification' }}</p>
                <h3>{{ selectedCert.title }}</h3>
              </div>
              <button class="icon-btn" @click="closeCert" aria-label="Close">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="cert-image-wrap">
                <img
                  v-if="selectedCert.image_path && !imageError"
                  :src="certImg(selectedCert.image_path)"
                  :alt="`${selectedCert.title} certificate`"
                  class="cert-image"
                  @error="imageError = true"
                />
                <p v-else class="cert-fallback">
                  <i class="fa-regular fa-image"></i>
                  {{ selectedCert.image_path ? 'Certificate image could not be loaded.' : 'No certificate image available.' }}
                </p>
              </div>

              <p v-if="selectedCert.description" class="desc">{{ selectedCert.description }}</p>
              <dl class="cert-facts">
                <div v-if="selectedCert.issued_by"><dt>Issued by</dt><dd>{{ selectedCert.issued_by }}</dd></div>
                <div v-if="selectedCert.date"><dt>Date</dt><dd>{{ selectedCert.date }}</dd></div>
              </dl>
              <SkillChips :skills="selectedCert.skills" :selected="selectedKeys" @toggle="filterFromModal" />

              <a
                v-if="selectedCert.link"
                :href="selectedCert.link"
                target="_blank"
                rel="noopener"
                class="btn btn-primary verify"
              >
                Verify certificate <i class="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import SkillChips from './SkillChips.vue'
import { normalizeSkill, getAssetPath, certImageUrl, formatDuration } from '@/utils/helpers.js'

const DEFAULT_HEADLINES = {
  experience: 'Experience',
  projects: 'Projects',
  education: 'Education',
  certifications: 'Certifications'
}

export default {
  name: 'Resume',
  components: { SkillChips },
  props: {
    resume: { type: Object, required: true },
    allSkills: { type: Array, default: () => [] },
    selectedSkills: { type: Array, default: () => [] }
  },
  emits: ['toggle-skill', 'clear-skills'],
  data() {
    return {
      searchQuery: '',
      focused: false,
      activeIndex: 0,
      certView: 'list',
      certLimit: 6,
      showAllCerts: false,
      selectedCert: null,
      imageError: false,
      brokenThumbs: {},
      printing: false
    }
  },
  computed: {
    h() {
      return { ...DEFAULT_HEADLINES, ...(this.resume.headlines || {}) }
    },
    experiences() {
      return this.resume.experiences || []
    },
    education() {
      return this.resume.education || []
    },
    selectedKeys() {
      return new Set(this.selectedSkills.map(normalizeSkill))
    },
    suggestions() {
      const q = normalizeSkill(this.searchQuery)
      if (!q) return []
      return this.allSkills
        .filter((s) => normalizeSkill(s).includes(q) && !this.selectedKeys.has(normalizeSkill(s)))
        .sort((a, b) => normalizeSkill(a).indexOf(q) - normalizeSkill(b).indexOf(q))
        .slice(0, 8)
    },
    dropdownOpen() {
      return this.focused && this.suggestions.length > 0
    },
    quickPicks() {
      const core = (this.resume.skills || []).map(normalizeSkill)
      const picks = this.allSkills.filter((s) => core.includes(normalizeSkill(s)))
      return (picks.length ? picks : this.allSkills).slice(0, 6)
    },
    filteredExperiences() {
      if (!this.selectedSkills.length) return this.experiences
      return this.experiences
        .map((company) => ({
          ...company,
          positions: (company.positions || [])
            .map((pos) => ({ ...pos, projects: (pos.projects || []).filter((p) => this.matches(p.skills)) }))
            .filter((pos) => pos.projects.length)
        }))
        .filter((company) => company.positions.length)
    },
    filteredProjects() {
      const projects = this.resume.projects || []
      if (!this.selectedSkills.length) return projects
      return projects.filter((p) => this.matches(p.skills))
    },
    filteredCertifications() {
      const certs = this.resume.certifications || []
      if (!this.selectedSkills.length) return certs
      return certs.filter((c) => this.matches(c.skills))
    },
    visibleCerts() {
      return this.showAllCerts || this.printing
        ? this.filteredCertifications
        : this.filteredCertifications.slice(0, this.certLimit)
    },
    matchCounts() {
      const roles = this.filteredExperiences.reduce((n, c) => n + c.positions.length, 0)
      return {
        roles,
        projects: this.filteredProjects.length,
        certs: this.filteredCertifications.length
      }
    },
    totalMatches() {
      const c = this.matchCounts
      return c.roles + c.projects + c.certs
    },
    matchSummary() {
      const c = this.matchCounts
      const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`
      return [plural(c.roles, 'role'), plural(c.projects, 'project'), plural(c.certs, 'cert')].join(' · ')
    }
  },
  watch: {
    searchQuery() {
      this.activeIndex = 0
    },
    selectedSkills() {
      this.showAllCerts = false
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onKey)
    window.addEventListener('beforeprint', this.onBeforePrint)
    window.addEventListener('afterprint', this.onAfterPrint)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
    window.removeEventListener('beforeprint', this.onBeforePrint)
    window.removeEventListener('afterprint', this.onAfterPrint)
  },
  methods: {
    asset: getAssetPath,
    certImg: certImageUrl,
    duration: formatDuration,
    matches(skills) {
      return (skills || []).some((s) => this.selectedKeys.has(normalizeSkill(s)))
    },
    move(step) {
      const n = this.suggestions.length
      if (!n) return
      this.activeIndex = (this.activeIndex + step + n) % n
    },
    pickActive() {
      const s = this.suggestions[this.activeIndex]
      if (s) this.pick(s)
    },
    pick(skill) {
      if (!this.selectedKeys.has(normalizeSkill(skill))) this.$emit('toggle-skill', skill)
      this.searchQuery = ''
    },
    onBlur() {
      setTimeout(() => {
        this.focused = false
      }, 120)
    },
    openCert(cert) {
      this.imageError = false
      this.selectedCert = cert
    },
    closeCert() {
      this.selectedCert = null
    },
    filterFromModal(skill) {
      this.closeCert()
      this.$emit('toggle-skill', skill)
    },
    onBeforePrint() {
      this.printing = true
    },
    onAfterPrint() {
      this.printing = false
    },
    onKey(e) {
      if (e.key === 'Escape' && this.selectedCert) this.closeCert()
    }
  }
}
</script>

<style scoped>
.resume {
  display: grid;
  gap: 20px;
}

#resume-start {
  scroll-margin-top: calc(var(--nav-h) + 16px);
}

/* ---------- Filter ---------- */
.filter {
  position: sticky;
  top: calc(var(--nav-h) + 12px);
  z-index: 40;
  padding: 12px;
}

.search {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-3);
  font-size: 14px;
  pointer-events: none;
}

.search input {
  width: 100%;
  height: 46px;
  padding: 0 16px 0 42px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface-2);
  font: inherit;
  font-size: 15px;
  color: var(--ink);
  outline: none;
  transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
}

.search input:focus {
  border-color: var(--accent);
  background: var(--surface);
  box-shadow: 0 0 0 4px var(--accent-soft);
}

.search input::placeholder {
  color: var(--ink-3);
}

.dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(20, 22, 28, 0.12);
  max-height: 280px;
  overflow-y: auto;
}

.dropdown li {
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.dropdown li.active {
  background: var(--accent-soft);
  color: var(--accent);
}

.filter-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  padding: 10px 4px 2px;
  font-size: 13px;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.hint {
  color: var(--ink-3);
}

.match-count {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-3);
}

.link-btn {
  border: none;
  background: none;
  padding: 0;
  color: var(--red);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.link-btn:hover {
  text-decoration: underline;
}

.empty {
  padding: 40px 24px;
  text-align: center;
  color: var(--ink-2);
}

.empty i {
  font-size: 28px;
  color: var(--ink-3);
}

/* ---------- Sections ---------- */
.section {
  padding: 28px 32px 30px;
  scroll-margin-top: calc(var(--nav-h) + 90px);
}

.section-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 22px;
}

.section-head .eyebrow {
  color: var(--amber);
}

.section-head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 32px;
  line-height: 1;
}

.row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  flex-wrap: wrap;
}

.date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--ink-3);
  white-space: nowrap;
}

h3,
h4,
h5 {
  margin: 0;
  color: var(--ink);
}

h4 {
  font-size: 16px;
  font-weight: 600;
}

h5 {
  font-size: 15px;
  font-weight: 600;
}

.desc {
  margin: 6px 0 0;
  color: var(--ink-2);
}

.bullets {
  margin: 8px 0 0;
  padding-left: 18px;
  color: var(--ink-2);
}

.bullets li {
  margin-bottom: 3px;
}

.bullets li::marker {
  color: var(--amber);
}

.role-tag {
  margin: 0;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--accent);
}

/* ---------- Experience ---------- */
.company + .company {
  margin-top: 30px;
  padding-top: 26px;
  border-top: 1px solid var(--line);
}

.company-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.company-head h3 {
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--line);
  background: var(--surface);
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0 0 0 17px;
}

.role {
  position: relative;
  padding: 0 0 22px 28px;
  border-left: 2px solid var(--line);
}

.role:last-child {
  padding-bottom: 0;
  border-left-color: transparent;
}

.role::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--surface);
  border: 2px solid var(--accent);
}

.role:last-child::after {
  content: '';
  position: absolute;
  left: -2px;
  top: 0;
  height: 8px;
  border-left: 2px solid var(--line);
}

.role:first-child:last-child::after {
  display: none;
}

.summary {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--ink-3);
}

.project {
  margin-top: 12px;
  padding: 14px 16px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

/* ---------- Projects ---------- */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
}

.project-card {
  display: flex;
  flex-direction: column;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  background: var(--surface-2);
  transition: border-color 0.15s, transform 0.15s;
}

.project-card:hover {
  border-color: var(--line-strong);
  transform: translateY(-2px);
}

.project-card .role-tag {
  margin-top: 2px;
}

.project-card :deep(.skill-chips) {
  margin-top: auto;
  padding-top: 12px;
}

/* ---------- Education ---------- */
.edu + .edu {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

.institute {
  margin: 2px 0 0;
  color: var(--ink-2);
  font-size: 14px;
}

/* ---------- Certifications ---------- */
.view-toggle {
  margin-left: auto;
  display: flex;
  padding: 3px;
  border-radius: 10px;
  background: var(--surface-2);
  border: 1px solid var(--line);
}

.view-toggle button {
  width: 32px;
  height: 28px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--ink-3);
  cursor: pointer;
}

.view-toggle button.active {
  background: var(--surface);
  color: var(--accent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.cert-list {
  list-style: none;
  margin: 0 -12px;
  padding: 0;
}

.cert-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.cert-row:hover {
  background: var(--surface-2);
}

.cert-list li + li .cert-row {
  border-top: 1px solid var(--line);
  border-radius: 0;
}

.cert-list li + li .cert-row:hover {
  border-radius: var(--radius-sm);
}

.cert-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.cert-title {
  font-weight: 600;
  color: var(--ink);
}

.cert-meta {
  font-size: 13px;
  color: var(--ink-3);
}

.cert-arrow {
  font-size: 11px;
  color: var(--ink-3);
  transition: transform 0.15s;
}

.cert-row:hover .cert-arrow {
  transform: translateX(3px);
  color: var(--accent);
}

.cert-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.cert-tile {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
}

.thumb {
  display: grid;
  place-items: center;
  aspect-ratio: 1.41;
  margin-bottom: 8px;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--line-strong);
  font-size: 30px;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.cert-tile:hover .thumb {
  border-color: var(--accent);
  box-shadow: 0 6px 18px rgba(20, 22, 28, 0.1);
}

.cert-tile:hover .thumb img {
  transform: scale(1.04);
}

.tile-title {
  font-size: 13.5px;
  font-weight: 600;
  line-height: 1.35;
  color: var(--ink);
}

.tile-meta {
  font-size: 12px;
  color: var(--ink-3);
}

.show-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-sm);
  background: none;
  color: var(--ink-2);
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
}

.show-more:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* ---------- Cert modal ---------- */
.cert-image-wrap {
  display: grid;
  place-items: center;
  padding: 12px;
  margin-bottom: 18px;
  border-radius: var(--radius-sm);
  background: var(--surface-2);
}

.cert-image {
  max-width: 100%;
  max-height: 42vh;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.cert-fallback {
  margin: 0;
  padding: 36px 12px;
  color: var(--ink-3);
}

.cert-facts {
  display: flex;
  gap: 32px;
  margin: 16px 0 12px;
}

.cert-facts dt {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-3);
}

.cert-facts dd {
  margin: 2px 0 0;
  font-weight: 500;
}

.verify {
  margin-top: 20px;
}

/* ---------- Print ---------- */
.print-only {
  display: none;
}

@media print {
  .resume {
    gap: 6px;
  }
  .print-only {
    display: block;
  }
  .tailored {
    margin: 0;
    font-family: var(--font-mono);
    font-size: 9pt;
    color: var(--ink-3);
  }
  .section {
    padding: 8px 0 4px;
  }
  .section-head {
    margin-bottom: 10px;
    break-after: avoid;
  }
  .company-head,
  .role > .row {
    break-after: avoid;
  }
  .company + .company {
    margin-top: 16px;
    padding-top: 12px;
  }
  .project {
    padding: 8px 0 0;
    margin-top: 6px;
  }
  .role {
    padding-bottom: 12px;
  }
  .section-head h2 {
    font-size: 20pt;
  }
  .project,
  .project-card {
    background: none;
    break-inside: avoid;
  }
  .project-card {
    padding: 10px;
    transform: none !important;
  }
  .project-grid {
    grid-template-columns: 1fr 1fr;
  }
  .cert-grid {
    display: none;
  }
}

/* ---------- Responsive ---------- */
@media (max-width: 600px) {
  .filter {
    top: calc(var(--nav-h) + 6px);
    padding: 10px;
  }
  .match-count {
    margin-left: 0;
    width: 100%;
    order: 3;
  }
  .section {
    padding: 22px 18px 24px;
  }
  .section-head h2 {
    font-size: 27px;
  }
  .timeline {
    padding-left: 6px;
  }
  .role {
    padding-left: 20px;
  }
  .project {
    padding: 12px;
  }
  .cert-list {
    margin: 0 -8px;
  }
  .cert-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}
</style>
