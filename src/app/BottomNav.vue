<script setup>
import { computed, ref } from "vue";

import AppModeSwitch from "./AppModeSwitch.vue";
import ThemeModeSwitch from "./ThemeModeSwitch.vue";

const props = defineProps({
  targets:           { type: Array,    default: () => [] },
  activeTargetId:    { type: String,   default: "" },
  routeMode:         { type: String,   required: true },
  presentingHref:    { type: String,   required: true },
  authoringHref:     { type: String,   required: true },
  navigateMode:      { type: Function, required: true },
  showThemeToggle:   { type: Boolean,  default: false },
  theme:             { type: String,   default: "light" },
  setTheme:          { type: Function, required: true },
  debug:             { type: Boolean,  default: false },
  setDebug:          { type: Function, default: null },
  scrollamaConfig:   { type: Object,   default: () => ({}) },
  setScrollamaConfig:{ type: Function, default: null },
  showProgress:      { type: Boolean,  default: true },
  showArrows:        { type: Boolean,  default: true },
  orientation:       { type: String,   default: "horizontal" },
  embedded:          { type: Boolean,  default: false },
});

const emit = defineEmits(["navigate"]);

const isConfigOpen = ref(false);

const activeIndex = computed(() =>
  Math.max(0, props.targets.findIndex((t) => t.id === props.activeTargetId))
);

function navigateBy(delta) {
  const next = props.targets[activeIndex.value + delta];
  if (next) emit("navigate", next.id);
}
</script>

<template>
  <nav
    class="bottom-nav"
    :class="{
      'is-vertical': orientation === 'vertical',
      'is-embedded': embedded,
      'is-pinned':   isConfigOpen,
    }"
    aria-label="Story navigation"
  >
    <!-- Scrollama config panel (authoring only) -->
    <div v-if="setScrollamaConfig && isConfigOpen" class="bottom-nav-config-panel">
      <div class="bottom-nav-config-block">
        <div class="bottom-nav-config-row">
          <span class="bottom-nav-config-label">Trigger line</span>
          <span class="bottom-nav-config-value">
            {{ Math.round(scrollamaConfig.offset * 100) }}% viewport
          </span>
        </div>
        <p class="bottom-nav-config-help">Where a step becomes active in the viewport.</p>
      </div>
      <input
        class="bottom-nav-range"
        type="range" min="0.1" max="0.9" step="0.05"
        :value="String(scrollamaConfig.offset)"
        @input="setScrollamaConfig({ offset: Number($event.target.value) })"
      />

      <div class="bottom-nav-config-grid">
        <div class="bottom-nav-config-block">
          <span class="bottom-nav-config-label">Progress detail</span>
          <span class="bottom-nav-config-value">{{ scrollamaConfig.threshold }}px</span>
        </div>
      </div>
      <input
        class="bottom-nav-range"
        type="range" min="1" max="12" step="1"
        :value="String(scrollamaConfig.threshold)"
        @input="setScrollamaConfig({ threshold: Number($event.target.value) })"
      />
    </div>

    <div class="bottom-nav-inner">
      <!-- Left: mode + theme + debug/settings tools -->
      <div class="bottom-nav-settings">
        <AppModeSwitch
          :mode="routeMode"
          :presenting-href="presentingHref"
          :authoring-href="authoringHref"
          :navigate-mode="navigateMode"
        />

        <ThemeModeSwitch
          v-if="showThemeToggle"
          :theme="theme"
          :set-theme="setTheme"
        />

        <div v-if="setDebug || setScrollamaConfig" class="app-mode-switch bottom-nav-tool-group">
          <button
            v-if="setDebug"
            type="button"
            class="app-mode-link is-debug-tool"
            :class="{ 'is-active': debug }"
            :aria-label="debug ? 'Disable scroll debug' : 'Enable scroll debug'"
            :title="debug ? 'Disable scroll debug' : 'Enable scroll debug'"
            @click="setDebug(!debug)"
          >
            <svg class="bottom-nav-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5.25 5.5h5.5v4.25a2.75 2.75 0 0 1-5.5 0Z"
                fill="none" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round" />
              <path d="M6.25 5.5V4.75a1.75 1.75 0 1 1 3.5 0v.75"
                fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" />
              <path d="M8 8v1.5M3.75 7H5M11 7h1.25M5 3.75l.65.65M10.35 4.4 11 3.75"
                fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" />
            </svg>
            <span class="visually-hidden">Debug</span>
          </button>

          <button
            v-if="setScrollamaConfig"
            type="button"
            class="app-mode-link is-settings-tool"
            :class="{ 'is-active': isConfigOpen }"
            :aria-label="isConfigOpen ? 'Hide Scrollama settings' : 'Show Scrollama settings'"
            :title="isConfigOpen ? 'Hide Scrollama settings' : 'Show Scrollama settings'"
            @click="isConfigOpen = !isConfigOpen"
          >
            <svg class="bottom-nav-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 4.5h10M3 8h10M3 11.5h10"
                fill="none" stroke="currentColor" stroke-width="1.15" stroke-linecap="round" />
              <circle cx="6"   cy="4.5"  r="1.25" fill="var(--chrome-bg)" stroke="currentColor" stroke-width="1.15" />
              <circle cx="10"  cy="8"    r="1.25" fill="var(--chrome-bg)" stroke="currentColor" stroke-width="1.15" />
              <circle cx="7.5" cy="11.5" r="1.25" fill="var(--chrome-bg)" stroke="currentColor" stroke-width="1.15" />
            </svg>
            <span class="visually-hidden">Settings</span>
          </button>
        </div>
      </div>

      <!-- Right: nav dots + prev/next arrows -->
      <div v-if="showProgress && targets.length" class="bottom-nav-progress">
        <button
          v-if="showArrows"
          type="button"
          class="bottom-nav-button"
          :disabled="activeIndex === 0"
          aria-label="Previous stop"
          @click="navigateBy(-1)"
        >
          <svg class="bottom-nav-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M9.75 3.5 5.25 8l4.5 4.5"
              fill="none" stroke="currentColor" stroke-width="1.25"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        <div class="bottom-nav-track">
          <div class="bottom-nav-links">
            <button
              v-for="target in targets"
              :key="target.id"
              type="button"
              class="bottom-nav-link"
              :class="{ 'is-active': target.id === activeTargetId }"
              :aria-label="target.label"
              :title="target.label"
              @click="emit('navigate', target.id)"
            >
              <span
                class="bottom-nav-dot"
                :class="target.kind === 'section' ? 'bottom-nav-dot-section' : 'bottom-nav-dot-step'"
                aria-hidden="true"
              />
              <span class="visually-hidden">
                {{ target.kind === "section" ? "Section" : "Step" }}
              </span>
            </button>
          </div>
        </div>

        <button
          v-if="showArrows"
          type="button"
          class="bottom-nav-button"
          :disabled="activeIndex === targets.length - 1"
          aria-label="Next stop"
          @click="navigateBy(1)"
        >
          <svg class="bottom-nav-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M6.25 3.5 10.75 8l-4.5 4.5"
              fill="none" stroke="currentColor" stroke-width="1.25"
              stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  </nav>
</template>
