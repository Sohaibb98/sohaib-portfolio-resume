<template>
  <div class="chatbot no-print">
    <Transition name="pop">
      <div v-if="open" id="chat-panel" class="panel" role="dialog" aria-label="Sohaib's Agent">
        <header class="head">
          <span class="avatar"><i class="fa-solid fa-robot"></i></span>
          <div class="who">
            <strong>Sohaib's Agent</strong>
            <span class="status">
              <span class="dot" :class="status"></span>
              {{ statusLabel }}
            </span>
          </div>
          <a :href="calendlyUrl" target="_blank" rel="noopener" class="head-btn" title="Book a call with Sohaib">
            <i class="fa-regular fa-calendar"></i>
          </a>
          <button class="head-btn" aria-label="Close chat" @click="open = false">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </header>

        <div ref="body" class="body" aria-live="polite">
          <!-- Intro -->
          <div class="bubble bot">
            Hi! I'm Sohaib's assistant. Ask me about his experience, skills, availability or
            work preferences.
          </div>

          <template v-if="status === 'disabled'">
            <div class="bubble bot">
              I'm still in training and not answering questions yet. 🚧 Meanwhile, the quickest
              way to reach Sohaib is a short call.
            </div>
            <a :href="calendlyUrl" target="_blank" rel="noopener" class="btn btn-primary book">
              <i class="fa-regular fa-calendar"></i> Book a call
            </a>
          </template>

          <template v-else>
            <div
              v-for="(m, i) in messages"
              :key="i"
              class="bubble"
              :class="[m.role === 'user' ? 'me' : 'bot', { error: m.error }]"
            >{{ m.content }}<a
                v-if="m.error"
                :href="calendlyUrl"
                target="_blank"
                rel="noopener"
                class="err-link"
              >Book a call instead →</a></div>

            <div v-if="sending" class="bubble bot typing" aria-label="Assistant is typing">
              <span></span><span></span><span></span>
              <em v-if="slow" class="slow">Waking up the server, this can take ~30s the first time…</em>
            </div>

            <div v-if="!userHasAsked && !sending" class="suggestions">
              <button v-for="q in suggestions" :key="q" class="suggestion" @click="send(q)">{{ q }}</button>
            </div>
          </template>
        </div>

        <form v-if="status !== 'disabled'" class="foot" @submit.prevent="send()">
          <input
            ref="input"
            v-model="draft"
            type="text"
            maxlength="500"
            placeholder="Ask about Sohaib…"
            aria-label="Your question"
            :disabled="sending"
          />
          <button type="submit" :disabled="sending || !draft.trim()" aria-label="Send">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </form>
        <p v-if="status !== 'disabled'" class="disclaimer">
          AI answers from Sohaib's own notes. It can make mistakes.
        </p>
      </div>
    </Transition>

    <button
      class="chat-fab"
      :class="{ open }"
      :aria-expanded="open"
      aria-controls="chat-panel"
      :aria-label="open ? 'Close chat' : 'Open Sohaib\'s Agent'"
      @click="toggle"
    >
      <i :class="open ? 'fa-solid fa-xmark' : 'fa-solid fa-comment-dots'"></i>
      <span v-if="!open" class="fab-label">Ask my agent</span>
    </button>
  </div>
</template>

<script>
import ApiService from '@/services/ApiService.js'

export default {
  name: 'ChatbotBox',
  data() {
    return {
      open: false,
      status: 'unknown', // unknown | enabled | disabled
      messages: [], // { role: 'user' | 'assistant', content, error? }
      draft: '',
      sending: false,
      slow: false,
      calendlyUrl: import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com',
      suggestions: [
        'Is he open to remote work?',
        'What is his strongest tech stack?',
        'When can he start?',
        'Where is he based?'
      ]
    }
  },
  computed: {
    userHasAsked() {
      return this.messages.some((m) => m.role === 'user')
    },
    statusLabel() {
      return { unknown: 'Connecting…', enabled: 'Online', disabled: 'In training' }[this.status]
    }
  },
  mounted() {
    window.addEventListener('keydown', this.onKey)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKey)
  },
  methods: {
    async toggle() {
      this.open = !this.open
      if (!this.open) return
      if (this.status === 'unknown') {
        // Also wakes the Render server up while the visitor reads the intro
        const { enabled } = await ApiService.chatStatus()
        this.status = enabled ? 'enabled' : 'disabled'
      }
      this.$nextTick(() => this.$refs.input && this.$refs.input.focus())
    },
    async send(text) {
      const message = (text ?? this.draft).trim()
      if (!message || this.sending) return
      this.draft = ''

      const history = this.messages
        .filter((m) => !m.error)
        .slice(-8)
        .map(({ role, content }) => ({ role, content }))

      this.messages.push({ role: 'user', content: message })
      this.sending = true
      this.slow = false
      const slowTimer = setTimeout(() => (this.slow = true), 6000)
      this.scrollDown()

      try {
        const reply = await ApiService.sendChat(message, history)
        this.status = 'enabled'
        this.messages.push({ role: 'assistant', content: reply })
      } catch (e) {
        if (e.status === 503) this.status = 'disabled'
        this.messages.push({
          role: 'assistant',
          error: true,
          content: e.status ? e.message : "I couldn't reach the server. Please check your connection and try again. "
        })
      } finally {
        clearTimeout(slowTimer)
        this.sending = false
        this.slow = false
        this.scrollDown()
        this.$nextTick(() => this.$refs.input && this.$refs.input.focus())
      }
    },
    scrollDown() {
      this.$nextTick(() => {
        const el = this.$refs.body
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    onKey(e) {
      if (e.key === 'Escape' && this.open) this.open = false
    }
  }
}
</script>

<style scoped>
.chatbot {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 900;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.chat-fab {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  min-width: 52px;
  padding: 0 20px;
  border: none;
  border-radius: 999px;
  background: var(--hero-bg);
  color: var(--hero-ink);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(10, 12, 16, 0.3);
  transition: transform 0.15s, background 0.15s;
}

.chat-fab i {
  font-size: 18px;
  color: var(--amber);
}

.chat-fab:hover {
  transform: translateY(-2px);
}

.chat-fab.open {
  padding: 0;
  justify-content: center;
}

.panel {
  display: flex;
  flex-direction: column;
  width: 360px;
  max-width: calc(100vw - 32px);
  height: min(560px, calc(100vh - 120px));
  overflow: hidden;
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-lg);
  transform-origin: bottom right;
}

.head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 10px 12px 16px;
  background: var(--hero-bg);
  color: var(--hero-ink);
}

.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--amber);
  color: #1b1405;
}

.who {
  flex: 1;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.who strong {
  font-size: 14.5px;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--hero-ink-2);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--hero-ink-2);
}

.dot.enabled {
  background: #3ccf7f;
}

.dot.disabled {
  background: var(--amber);
}

.head-btn {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--hero-ink-2);
  text-decoration: none;
  cursor: pointer;
}

.head-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--hero-ink);
}

.body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--surface-2);
}

.bubble {
  max-width: 86%;
  padding: 9px 13px;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.bubble.bot {
  align-self: flex-start;
  border-radius: 4px 14px 14px 14px;
  background: var(--surface);
  border: 1px solid var(--line);
  color: var(--ink-2);
}

.bubble.me {
  align-self: flex-end;
  border-radius: 14px 4px 14px 14px;
  background: var(--accent);
  color: var(--accent-ink);
}

.bubble.error {
  border-color: #f0c9c6;
  background: #fdf3f2;
  color: #8a2d28;
}

.err-link {
  display: block;
  margin-top: 6px;
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
}

.typing {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink-3);
  animation: blink 1.2s infinite ease-in-out;
}

.typing span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes blink {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}

.slow {
  flex-basis: 100%;
  margin-top: 4px;
  font-size: 12px;
  color: var(--ink-3);
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.suggestion {
  padding: 6px 11px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--surface);
  color: var(--ink-2);
  font-size: 12.5px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.suggestion:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.book {
  align-self: flex-start;
  margin-top: 6px;
  height: 34px;
  font-size: 13px;
}

.foot {
  display: flex;
  gap: 8px;
  padding: 10px 12px 4px;
  border-top: 1px solid var(--line);
}

.foot input {
  flex: 1;
  min-width: 0;
  height: 38px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface-2);
  font: inherit;
  font-size: 14px;
  outline: none;
}

.foot input:focus {
  border-color: var(--accent);
  background: var(--surface);
}

.foot button {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: var(--accent);
  color: var(--accent-ink);
  cursor: pointer;
}

.foot button:disabled {
  background: var(--line);
  color: var(--ink-3);
  cursor: not-allowed;
}

.disclaimer {
  margin: 0;
  padding: 2px 12px 10px;
  font-size: 11px;
  color: var(--ink-3);
  text-align: center;
}

.pop-enter-active,
.pop-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.pop-enter-from,
.pop-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.96);
}

@media (max-width: 600px) {
  .chatbot {
    right: 14px;
    bottom: 14px;
  }
  .fab-label {
    display: none;
  }
  .chat-fab {
    padding: 0;
    justify-content: center;
  }
  .panel {
    height: min(560px, calc(100vh - 100px));
  }
}
</style>
