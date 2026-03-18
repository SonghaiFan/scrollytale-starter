<script setup>
defineProps({
  mode:           { type: String,   required: true },
  presentingHref: { type: String,   required: true },
  authoringHref:  { type: String,   required: true },
  navigateMode:   { type: Function, required: true },
});
</script>

<template>
  <nav class="app-mode-switch" aria-label="Application mode">
    <a
      :href="presentingHref"
      class="app-mode-link is-presenting"
      :class="{ 'is-active': mode === 'presenting' }"
      @click.prevent="navigateMode('presenting')"
    >
      <svg class="app-mode-icon" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="2.25" y="3" width="11.5" height="8" rx="1.25"
          fill="none" stroke="currentColor" stroke-width="1.25" />
        <path d="M5.5 12.5h5"
          fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
      </svg>
      <span class="visually-hidden">Presenting</span>
    </a>

    <a
      :href="authoringHref"
      class="app-mode-link is-authoring"
      :class="{ 'is-active': mode === 'authoring' }"
      @click.prevent="navigateMode('authoring')"
    >
      <svg class="app-mode-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M3 11.75L11.6 3.15a1.4 1.4 0 0 1 1.98 1.98L4.98 13.73 3 14l.27-1.98Z"
          fill="none" stroke="currentColor" stroke-width="1.25" stroke-linejoin="round"
        />
      </svg>
      <span class="visually-hidden">Authoring</span>
    </a>
  </nav>
</template>
