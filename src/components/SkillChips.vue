<template>
  <div v-if="skills && skills.length" class="skill-chips">
    <button
      v-for="skill in skills"
      :key="skill"
      class="chip"
      :class="{ 'is-active': selected.has(normalize(skill)) }"
      :title="selected.has(normalize(skill)) ? `Remove ${skill} filter` : `Filter by ${skill}`"
      @click="$emit('toggle', skill)"
    >
      {{ skill }}
    </button>
  </div>
</template>

<script>
import { normalizeSkill } from '@/utils/helpers.js'

export default {
  name: 'SkillChips',
  props: {
    skills: { type: Array, default: () => [] },
    selected: { type: Set, default: () => new Set() }
  },
  emits: ['toggle'],
  methods: {
    normalize: normalizeSkill
  }
}
</script>

<style scoped>
.skill-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

@media print {
  .chip {
    border-color: var(--line);
    background: none !important;
    color: var(--ink-2) !important;
  }
}
</style>
