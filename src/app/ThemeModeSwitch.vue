<script setup>
defineProps({
  theme: { type: String, required: true },
  setTheme: { type: Function, required: true },
});
</script>

<template>
  <nav class="app-mode-switch theme-mode-switch" aria-label="Color theme">
    <button
      type="button"
      class="app-mode-link is-light"
      :class="{ 'is-active': theme === 'light' }"
      aria-label="Light"
      @click="setTheme('light')"
    >
      <svg class="app-mode-icon" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="2.4" fill="none" stroke="currentColor" stroke-width="1.15" />
        <path d="M8 1.5 8 3"    fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" />
        <path d="M8 13 8 14.5"  fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" />
        <path d="M1.5 8 3 8"    fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" />
        <path d="M13 8 14.5 8"  fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" />
      </svg>
      <span class="visually-hidden">Light</span>
    </button>

    <button
      type="button"
      class="app-mode-link is-dark"
      :class="{ 'is-active': theme === 'dark' }"
      aria-label="Dark"
      @click="setTheme('dark')"
    >
      <svg class="app-mode-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d="M10.9 2.1a5.5 5.5 0 1 0 2.8 10.3A5.8 5.8 0 0 1 10.9 2.1Z"
          fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"
        />
      </svg>
      <span class="visually-hidden">Dark</span>
    </button>
  </nav>
</template>
