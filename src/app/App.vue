<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

import storySource from "../../story.md?raw";
import { loadSources } from "../runtime/loadSources.js";
import { normalizeStory } from "../runtime/normalizeStory.js";
import { parseStory } from "../runtime/parseStory.js";
import { registerLayouts } from "../runtime/registerLayouts.js";
import { registerVisualizations } from "../runtime/registerVisualizations.js";
import { applyTheme, getStoredTheme } from "../runtime/theme.js";
import AuthoringPanel from "./AuthoringPanel.vue";
import BottomNav from "./BottomNav.vue";
import { getModeHref, getRouteState } from "./routes.js";
import StoryRuntime from "./StoryRuntime.vue";

const DEBUG_STORAGE_KEY = "scrollytale-debug";
const SCROLLAMA_STORAGE_KEY = "scrollytale-scrollama";
const DEFAULT_SCROLLAMA_CONFIG = { offset: 0.55, threshold: 4 };

function sanitizeScrollamaConfig(config) {
  const next = { ...DEFAULT_SCROLLAMA_CONFIG, ...(config ?? {}) };
  const offset = Number(next.offset);
  const threshold = Number(next.threshold);
  return {
    offset: Number.isFinite(offset) ? Math.min(0.9, Math.max(0.1, offset)) : 0.55,
    threshold: Number.isFinite(threshold) ? Math.max(1, Math.round(threshold)) : 4,
  };
}

function getStoredScrollamaConfig() {
  try {
    const raw = window.localStorage.getItem(SCROLLAMA_STORAGE_KEY);
    return raw ? sanitizeScrollamaConfig(JSON.parse(raw)) : DEFAULT_SCROLLAMA_CONFIG;
  } catch {
    return DEFAULT_SCROLLAMA_CONFIG;
  }
}

// ── Route ──────────────────────────────────────────────────────────────────────
const route = ref(getRouteState());

// ── Story state ────────────────────────────────────────────────────────────────
const isLoading = ref(true);
const error = ref(null);
const story = ref(null);
const sources = ref(null);
const navTargets = ref([]);
const activeTargetId = ref("");
const requestedTarget = ref(null);

// ── Persistence ────────────────────────────────────────────────────────────────
const theme = ref("light");
const debug = ref(false);
const scrollama = ref(DEFAULT_SCROLLAMA_CONFIG);

const layouts = registerLayouts();
const visualizations = registerVisualizations();

// ── Derived ────────────────────────────────────────────────────────────────────
const warningText = computed(() =>
  story.value?.warnings?.length ? story.value.warnings.join("\n") : ""
);
const presentingHref = computed(() => getModeHref(route.value.basePath, "presenting"));
const authoringHref = computed(() => getModeHref(route.value.basePath, "authoring"));
const isAuthoring = computed(() => route.value.mode === "authoring");
const shellClass = computed(() =>
  ["vue-app-shell", isAuthoring.value && "is-authoring-mode", debug.value && "is-debug-mode"]
    .filter(Boolean)
    .join(" ")
);

// ── Route sync ─────────────────────────────────────────────────────────────────
function syncRouteState() {
  route.value = getRouteState();
}

// ── Mutations ──────────────────────────────────────────────────────────────────
function navigateTo(targetId) {
  requestedTarget.value = { id: targetId, nonce: Date.now() };
}

function navigateMode(mode) {
  const href = getModeHref(route.value.basePath, mode);
  if (window.location.pathname !== href) {
    window.history.pushState({}, "", href);
    syncRouteState();
  }
}

function setTheme(next) {
  theme.value = applyTheme(next);
}

function setDebug(next) {
  debug.value = Boolean(next);
  window.localStorage.setItem(DEBUG_STORAGE_KEY, String(debug.value));
}

function setScrollamaConfig(partial) {
  scrollama.value = sanitizeScrollamaConfig({ ...scrollama.value, ...(partial ?? {}) });
  window.localStorage.setItem(SCROLLAMA_STORAGE_KEY, JSON.stringify(scrollama.value));
}

function onTargetsChange(targets) {
  navTargets.value = targets;
  if (!activeTargetId.value && targets[0]) {
    activeTargetId.value = targets[0].id;
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  window.addEventListener("popstate", syncRouteState);

  if (import.meta.hot) {
    import.meta.hot.on("scrollytale:story-update", ({ source }) => {
      try {
        story.value = normalizeStory(parseStory(source));
        if (story.value.warnings.length) {
          console.warn("Story HMR warnings:", story.value.warnings);
        }
      } catch (err) {
        console.error("Story HMR update failed:", err);
      }
    });
  }

  try {
    const parsed = parseStory(storySource);
    const normalized = normalizeStory(parsed);
    const loadedSources = await loadSources(normalized.data?.sources ?? []);

    story.value = normalized;
    sources.value = loadedSources;
    theme.value = getStoredTheme();
    debug.value = window.localStorage.getItem(DEBUG_STORAGE_KEY) === "true";
    scrollama.value = getStoredScrollamaConfig();
    isLoading.value = false;

    await nextTick();
    applyTheme(theme.value);

    if (normalized.warnings.length) {
      console.warn("Story normalization warnings:", normalized.warnings);
    }
  } catch (err) {
    console.error(err);
    error.value = err;
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("popstate", syncRouteState);
});
</script>

<template>
  <!-- Error state -->
  <main v-if="error" class="app-shell">
    <section class="story-section is-full">
      <div class="section-content">
        <p class="eyebrow">Runtime error</p>
        <h1>Scrollytale starter could not boot.</h1>
        <pre class="error-block">{{ error.message }}</pre>
      </div>
    </section>
  </main>

  <!-- Loading state -->
  <main v-else-if="isLoading || !story || !sources" class="app-shell">
    <section class="story-section is-full">
      <div class="section-content">
        <p class="eyebrow">Loading</p>
        <h1>Preparing the story model</h1>
        <p>
          Vue now owns the outer app shell, while the existing scrollytelling
          runtime still handles layouts, D3 charts, and scroll interactions.
        </p>
      </div>
    </section>
  </main>

  <!-- App shell -->
  <div v-else :class="shellClass">
    <StoryRuntime
      :story="story"
      :sources="sources"
      :layouts="layouts"
      :visualizations="visualizations"
      :active-target-id="activeTargetId"
      :debug="debug"
      :scrollama="scrollama"
      :requested-target="requestedTarget"
      @targets-change="onTargetsChange"
      @active-target-change="activeTargetId = $event"
    />

    <div :class="['bottom-dock-shell', isAuthoring && 'is-authoring']">
      <div class="bottom-dock-reveal" aria-hidden="true" />
      <BottomNav
        :targets="navTargets"
        :active-target-id="activeTargetId"
        :route-mode="route.mode"
        :presenting-href="presentingHref"
        :authoring-href="authoringHref"
        :navigate-mode="navigateMode"
        :show-theme-toggle="story.chrome?.themeToggle"
        :theme="theme"
        :set-theme="setTheme"
        :debug="debug"
        :set-debug="isAuthoring ? setDebug : null"
        :scrollama-config="scrollama"
        :set-scrollama-config="isAuthoring ? setScrollamaConfig : null"
        :show-progress="story.chrome?.bottomNav"
        :show-arrows="false"
        orientation="horizontal"
        @navigate="navigateTo"
      />
    </div>

    <AuthoringPanel
      v-if="isAuthoring"
      :story="story"
      :active-target-id="activeTargetId"
      :navigate-to="navigateTo"
    />

    <pre v-if="warningText" class="visually-hidden" aria-hidden="true">{{ warningText }}</pre>
  </div>
</template>
