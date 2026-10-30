<template>
  <section class="hero">
    <div class="hero-inner">
      <div class="identity">
        <img :src="photo" alt="Portrait of Sohaib Baqai" class="photo" />

        <div class="intro">
          <p class="greeting">Greetings from Sohaib! <span class="wave" aria-hidden="true">👋</span></p>
          <h1 class="name">{{ profile?.name || 'Sohaib Baqai' }}</h1>
          <p v-if="profile" class="title">{{ profile.title }}</p>
          <span v-else class="skeleton-line" style="width: 220px"></span>

          <p v-if="profile?.intro_text" class="lead">{{ profile.intro_text }}</p>

          <ul class="facts">
            <li v-if="location">
              <i class="fa-solid fa-location-dot"></i>
              {{ location.city }}, {{ location.country }}
            </li>
            <li v-if="contact?.email">
              <i class="fa-regular fa-envelope"></i>
              <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
            </li>
            <li v-if="contact?.linkedin">
              <i class="fa-brands fa-linkedin"></i>
              <a :href="contact.linkedin" target="_blank" rel="noopener">LinkedIn</a>
            </li>
          </ul>
        </div>
      </div>

      <blockquote class="quote no-print">
        <span class="qmark" aria-hidden="true">“</span>
        <p>
          Let this portfolio be my playground to practice and demonstrate my skills
          as a Software Developer, using much of what I've learnt over the years,
          especially with Vue.js.
        </p>
        <footer>Built from scratch: Vue 3 · FastAPI · MongoDB</footer>
      </blockquote>
    </div>
  </section>
</template>

<script>
import { getAssetPath } from '@/utils/helpers.js'

export default {
  name: 'Welcome',
  props: {
    profile: { type: Object, default: null },
    contact: { type: Object, default: null },
    location: { type: Object, default: null },
    calendlyUrl: { type: String, default: '' }
  },
  computed: {
    photo() {
      return getAssetPath('/Sohaib.PNG')
    }
  }
}
</script>

<style scoped>
.hero {
  background:
    radial-gradient(900px 400px at 85% -10%, rgba(240, 160, 32, 0.14), transparent 60%),
    radial-gradient(700px 380px at 0% 120%, rgba(35, 78, 120, 0.45), transparent 60%),
    var(--hero-bg);
  color: var(--hero-ink);
}

.hero-inner {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 56px 24px 64px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 48px;
  align-items: center;
}

.identity {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.photo {
  width: 132px;
  height: 132px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid var(--hero-bg);
  box-shadow: 0 0 0 2px var(--amber);
}

.greeting {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 13px;
  letter-spacing: 0.04em;
  color: var(--amber);
}

.wave {
  display: inline-block;
  transform-origin: 70% 70%;
  animation: wave 2.4s ease-in-out 1s 2;
}

@keyframes wave {
  0%, 60%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(14deg); }
  20%, 40% { transform: rotate(-8deg); }
}

.name {
  margin: 6px 0 0;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(42px, 6vw, 64px);
  line-height: 1;
  letter-spacing: -0.01em;
}

.title {
  margin: 10px 0 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--hero-ink);
  opacity: 0.9;
}

.lead {
  margin: 16px 0 0;
  max-width: 560px;
  color: var(--hero-ink-2);
  font-size: 15.5px;
}

.facts {
  list-style: none;
  padding: 0;
  margin: 22px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  font-size: 14px;
  color: var(--hero-ink-2);
}

.facts li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.facts i {
  color: var(--amber);
  font-size: 13px;
}

.facts a {
  color: var(--hero-ink);
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.25);
}

.facts a:hover {
  border-bottom-color: var(--amber);
}

.quote {
  position: relative;
  margin: 0;
  padding: 26px 24px 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.03);
}

.qmark {
  position: absolute;
  top: -22px;
  left: 18px;
  font-family: var(--font-display);
  font-size: 72px;
  line-height: 1;
  color: var(--amber);
}

.quote p {
  margin: 0;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 20px;
  line-height: 1.4;
  color: var(--hero-ink);
}

.quote footer {
  margin-top: 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--hero-ink-2);
}

.skeleton-line {
  display: block;
  height: 14px;
  margin-top: 14px;
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 960px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}

@media (max-width: 600px) {
  .hero-inner {
    padding: 36px 16px 44px;
  }
  .identity {
    flex-direction: column;
    gap: 20px;
  }
  .photo {
    width: 96px;
    height: 96px;
  }
  .quote p {
    font-size: 18px;
  }
}

@media print {
  .hero {
    background: none;
    color: var(--ink);
  }
  .hero-inner {
    padding: 0 0 14px;
    display: block;
    border-bottom: 1px solid var(--line);
    margin-bottom: 14px;
  }
  .photo {
    width: 80px;
    height: 80px;
    box-shadow: none;
    border: none;
  }
  .greeting {
    display: none;
  }
  .name {
    font-size: 34px;
  }
  .title,
  .facts a {
    color: var(--ink);
  }
  .lead,
  .facts {
    color: var(--ink-2);
  }
}
</style>
