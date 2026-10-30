<template>
  <aside class="sidebar">
    <template v-if="resume">
      <!-- Contact -->
      <section class="card panel">
        <h3 class="panel-title">{{ h.contact }}</h3>

        <div v-if="contact.email" class="contact-row">
          <i class="fa-regular fa-envelope ico"></i>
          <a :href="`mailto:${contact.email}`" class="truncate">{{ contact.email }}</a>
          <button class="icon-btn sm no-print" :title="copied ? 'Copied!' : 'Copy email'" @click="copyEmail">
            <i :class="copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'"></i>
          </button>
        </div>

        <div v-if="contact.linkedin" class="contact-row">
          <i class="fa-brands fa-linkedin ico"></i>
          <a :href="contact.linkedin" target="_blank" rel="noopener" class="truncate">{{ linkedinHandle }}</a>
        </div>

        <ul v-if="contact.mobiles && contact.mobiles.length" class="phones">
          <li v-for="(m, idx) in contact.mobiles" :key="idx" class="contact-row">
            <i class="fa-solid fa-mobile-screen ico"></i>
            <span class="mono phone">{{ m.number }}</span>
            <span class="phone-actions no-print">
              <a
                v-if="m.callStatus === 'active'"
                :href="`tel:${m.number}`"
                class="icon-btn sm ok"
                :title="`Call ${m.number}`"
              ><i class="fa-solid fa-phone"></i></a>
              <span v-else class="icon-btn sm off" :title="statusLabel(m.callStatus, 'Calls')">
                <i class="fa-solid fa-phone-slash"></i>
              </span>

              <a
                v-if="m.whatsappStatus === 'active'"
                :href="`https://wa.me/${digits(m.number)}`"
                target="_blank"
                rel="noopener"
                class="icon-btn sm ok"
                :title="`WhatsApp ${m.number}`"
              ><i class="fa-brands fa-whatsapp"></i></a>
              <span v-else class="icon-btn sm off" :title="statusLabel(m.whatsappStatus, 'WhatsApp')">
                <i class="fa-brands fa-whatsapp"></i>
              </span>
            </span>
          </li>
        </ul>

        <a :href="calendlyUrl" target="_blank" rel="noopener" class="btn btn-primary cta no-print">
          <i class="fa-regular fa-calendar"></i> Book a 30-min call
        </a>
      </section>

      <!-- Visa / locations -->
      <section v-if="visaList.length" class="card panel">
        <h3 class="panel-title">{{ h.visa }}</h3>
        <ul class="visa-list">
          <li v-for="v in visaList" :key="v.country">
            <button class="visa-row" @click="selectedVisa = v">
              <img :src="asset(v.flag_path)" :alt="`${v.country} flag`" class="flag" />
              <span class="visa-text">
                <span class="visa-country">{{ v.country }}</span>
                <span class="visa-type">{{ v.type }}</span>
              </span>
              <span v-if="v.cur_loc" class="here" title="Currently here">
                <span class="pulse"></span> Here now
              </span>
              <i v-else class="fa-solid fa-chevron-right chev no-print"></i>
            </button>
          </li>
        </ul>
      </section>

      <!-- Core skills -->
      <section v-if="resume.skills && resume.skills.length" class="card panel">
        <h3 class="panel-title">{{ h.skills }}</h3>
        <div class="chips">
          <component
            :is="filterable(skill) ? 'button' : 'span'"
            v-for="skill in resume.skills"
            :key="skill"
            class="chip"
            :class="{ 'is-active': isSelected(skill) }"
            :title="filterable(skill) ? `Filter resume by ${skill}` : null"
            @click="filterable(skill) && $emit('toggle-skill', skill)"
          >{{ skill }}</component>
        </div>
        <p class="note no-print">Click a skill to tailor the resume.</p>
      </section>

      <!-- Tech profiles -->
      <section v-if="resume.coding_profiles && resume.coding_profiles.length" class="card panel no-print">
        <h3 class="panel-title">{{ h.tech_profiles }}</h3>
        <ul class="profiles">
          <li v-for="p in resume.coding_profiles" :key="p.link">
            <a :href="p.link" target="_blank" rel="noopener">
              {{ p.name }}
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </li>
        </ul>
      </section>
    </template>

    <NoticeBoard class="no-print" />

    <!-- Visa modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedVisa" class="modal-overlay" @click="selectedVisa = null">
          <div class="modal visa-modal" role="dialog" aria-modal="true" @click.stop>
            <div class="modal-header">
              <div class="visa-modal-title">
                <img :src="asset(selectedVisa.flag_path)" alt="" class="flag lg" />
                <div>
                  <p class="eyebrow">{{ selectedVisa.cur_loc ? 'Current location' : 'Visa status' }}</p>
                  <h3>{{ selectedVisa.country }}</h3>
                </div>
              </div>
              <button class="icon-btn" aria-label="Close" @click="selectedVisa = null">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <dl class="modal-body visa-facts">
              <div><dt>Stays in</dt><dd>{{ selectedVisa.city }}</dd></div>
              <div><dt>Visa type</dt><dd>{{ selectedVisa.type }}</dd></div>
              <div v-if="selectedVisa.validity"><dt>Valid until</dt><dd>{{ validity(selectedVisa.validity) }}</dd></div>
            </dl>
          </div>
        </div>
      </Transition>
    </Teleport>
  </aside>
</template>

<script>
import NoticeBoard from './NoticeBoard.vue'
import { getAssetPath, normalizeSkill } from '@/utils/helpers.js'

const DEFAULT_HEADLINES = {
  contact: 'Contact',
  visa: 'Visa Status',
  skills: 'Skills',
  tech_profiles: 'Tech Profiles'
}

export default {
  name: 'RightPanel',
  components: { NoticeBoard },
  props: {
    resume: { type: Object, default: null },
    allSkills: { type: Array, default: () => [] },
    selectedSkills: { type: Array, default: () => [] },
    calendlyUrl: { type: String, required: true }
  },
  emits: ['toggle-skill'],
  data() {
    return {
      selectedVisa: null,
      copied: false
    }
  },
  computed: {
    h() {
      return { ...DEFAULT_HEADLINES, ...(this.resume?.headlines || {}) }
    },
    contact() {
      return this.resume?.contact || {}
    },
    linkedinHandle() {
      const m = /linkedin\.com\/in\/([^/?#]+)/i.exec(this.contact.linkedin || '')
      return m ? `in/${m[1]}` : 'LinkedIn'
    },
    visaList() {
      return Object.entries(this.resume?.visa || {})
        .map(([country, v]) => ({ country, ...v }))
        .sort((a, b) => Number(!!b.cur_loc) - Number(!!a.cur_loc))
    },
    allSkillKeys() {
      return new Set(this.allSkills.map(normalizeSkill))
    },
    selectedKeys() {
      return new Set(this.selectedSkills.map(normalizeSkill))
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    asset: getAssetPath,
    digits(n) {
      return String(n).replace(/\D/g, '')
    },
    filterable(skill) {
      return this.allSkillKeys.has(normalizeSkill(skill))
    },
    isSelected(skill) {
      return this.selectedKeys.has(normalizeSkill(skill))
    },
    statusLabel(status, what) {
      return status === 'temporarily off' ? `${what} temporarily unavailable` : `${what} unavailable`
    },
    validity(v) {
      const m = /^(\d{4})-(\d{2})$/.exec(v)
      if (m) {
        return new Date(Number(m[1]), Number(m[2]) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      }
      return v.charAt(0).toUpperCase() + v.slice(1)
    },
    async copyEmail() {
      try {
        await navigator.clipboard.writeText(this.contact.email)
        this.copied = true
        setTimeout(() => (this.copied = false), 1600)
      } catch (e) {
        window.location.href = `mailto:${this.contact.email}`
      }
    },
    onKey(e) {
      if (e.key === 'Escape' && this.selectedVisa) this.selectedVisa = null
    }
  }
}
</script>

<style scoped>
.sidebar {
  display: grid;
  gap: 16px;
  min-width: 0;
}

.panel {
  padding: 20px;
}

.panel-title {
  margin: 0 0 12px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-3);
}

/* Contact */
.contact-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
  font-size: 14px;
}

.ico {
  width: 16px;
  text-align: center;
  color: var(--ink-3);
}

.contact-row a {
  text-decoration: none;
  color: var(--ink);
}

.contact-row a:hover {
  color: var(--accent);
}

.truncate {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.phones {
  list-style: none;
  margin: 0;
  padding: 0;
}

.phone {
  flex: 1;
  font-size: 13px;
  color: var(--ink);
}

.phone-actions {
  display: flex;
  gap: 2px;
}

.icon-btn.sm {
  width: 30px;
  height: 30px;
  font-size: 13px;
  text-decoration: none;
}

.icon-btn.ok {
  color: var(--green);
}

.icon-btn.ok:hover {
  background: #e7f4ec;
}

.icon-btn.off {
  color: var(--line-strong);
  cursor: not-allowed;
}

.icon-btn.off:hover {
  background: transparent;
}

.cta {
  width: 100%;
  margin-top: 14px;
}

/* Visa */
.visa-list {
  list-style: none;
  margin: 0 -8px;
  padding: 0;
}

.visa-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s;
}

.visa-row:hover {
  background: var(--surface-2);
}

.flag {
  width: 28px;
  height: 20px;
  object-fit: cover;
  border-radius: 3px;
  box-shadow: 0 0 0 1px var(--line);
}

.flag.lg {
  width: 44px;
  height: 31px;
  border-radius: 4px;
}

.visa-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.visa-country {
  font-weight: 600;
  font-size: 14px;
}

.visa-type {
  font-size: 12.5px;
  color: var(--ink-3);
}

.here {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #e7f4ec;
  color: var(--green);
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.pulse {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 0 0 rgba(47, 143, 91, 0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  70% {
    box-shadow: 0 0 0 6px rgba(47, 143, 91, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(47, 143, 91, 0);
  }
}

.chev {
  font-size: 11px;
  color: var(--ink-3);
}

/* Skills */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.chips span.chip {
  cursor: default;
}

.note {
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--ink-3);
}

/* Profiles */
.profiles {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 2px;
}

.profiles a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
}

.profiles li:last-child a {
  border-bottom: none;
}

.profiles a i {
  font-size: 11px;
  color: var(--ink-3);
  transition: transform 0.15s, color 0.15s;
}

.profiles a:hover {
  color: var(--accent);
}

.profiles a:hover i {
  color: var(--accent);
  transform: translate(2px, -2px);
}

/* Visa modal */
.visa-modal {
  max-width: 420px;
}

.visa-modal-title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.visa-facts {
  margin: 0;
}

.visa-facts > div {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}

.visa-facts > div:last-child {
  border-bottom: none;
}

.visa-facts dt {
  color: var(--ink-3);
}

.visa-facts dd {
  margin: 0;
  font-weight: 600;
}

@media (max-width: 960px) {
  .sidebar {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    align-items: start;
  }
}

@media print {
  .sidebar {
    grid-template-columns: 1.4fr 1fr 1fr;
    gap: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--line);
    font-size: 9pt;
  }
  .panel {
    padding: 0;
  }
  .panel-title {
    margin-bottom: 4px;
  }
  .contact-row {
    min-height: 0;
    padding: 1px 0;
    font-size: 9pt;
  }
  .contact-row a.truncate {
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .visa-row {
    padding: 2px 8px;
  }
  .here {
    background: none;
    padding: 0;
  }
  .pulse {
    display: none;
  }
}
</style>
