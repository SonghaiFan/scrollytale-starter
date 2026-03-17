import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from "vue";

import storySource from "../../story.md?raw";
import { loadSources } from "../runtime/loadSources.js";
import { normalizeStory } from "../runtime/normalizeStory.js";
import { parseStory } from "../runtime/parseStory.js";
import { registerLayouts } from "../runtime/registerLayouts.js";
import { registerVisualizations } from "../runtime/registerVisualizations.js";
import { applyTheme, getStoredTheme } from "../runtime/theme.js";
import { AuthoringPanel } from "./AuthoringPanel.js";
import { BottomNav } from "./BottomNav.js";
import { getModeHref, getRouteState } from "./routes.js";
import { StoryRuntime } from "./StoryRuntime.js";

const DEBUG_STORAGE_KEY = "scrollytale-debug";
const SCROLLAMA_STORAGE_KEY = "scrollytale-scrollama";
const DEFAULT_SCROLLAMA_CONFIG = {
  offset: 0.55,
  threshold: 4,
};

function sanitizeScrollamaConfig(config) {
  const next = {
    ...DEFAULT_SCROLLAMA_CONFIG,
    ...(config ?? {}),
  };

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

function renderError(message) {
  return h("main", { class: "app-shell" }, [
    h("section", { class: "section-shell section-full-width" }, [
      h("div", { class: "section-copy" }, [
        h("p", { class: "eyebrow" }, "Runtime error"),
        h("h1", null, "Scrollytale starter could not boot."),
        h("pre", { class: "error-block" }, message),
      ]),
    ]),
  ]);
}

function renderLoading() {
  return h("main", { class: "app-shell" }, [
    h("section", { class: "section-shell section-full-width" }, [
      h("div", { class: "section-copy" }, [
        h("p", { class: "eyebrow" }, "Loading"),
        h("h1", null, "Preparing the story model"),
        h(
          "p",
          null,
          "Vue now owns the outer app shell, while the existing scrollytelling runtime still handles layouts, D3 charts, and scroll interactions."
        ),
      ]),
    ]),
  ]);
}

export const App = defineComponent({
  name: "ScrollytaleApp",
  setup() {
    const route = ref(getRouteState());
    const state = ref({
      loading: true,
      error: null,
      story: null,
      sources: null,
      navTargets: [],
      activeTargetId: "",
      requestedTarget: null,
      theme: "light",
      debug: false,
      scrollama: DEFAULT_SCROLLAMA_CONFIG,
    });

    const layouts = registerLayouts();
    const visualizations = registerVisualizations();

    const warningText = computed(() =>
      state.value.story?.warnings?.length ? state.value.story.warnings.join("\n") : ""
    );
    const presentingHref = computed(() => getModeHref(route.value.basePath, "presenting"));
    const authoringHref = computed(() => getModeHref(route.value.basePath, "authoring"));
    const isAuthoring = computed(() => route.value.mode === "authoring");

    function syncRouteState() {
      route.value = getRouteState();
    }

    onMounted(async () => {
      window.addEventListener("popstate", syncRouteState);

      try {
        const parsed = parseStory(storySource);
        const story = normalizeStory(parsed);
        const sources = await loadSources(story.data?.sources ?? []);

        state.value = {
          loading: false,
          error: null,
          story,
          sources,
          navTargets: [],
          activeTargetId: "",
          requestedTarget: null,
          theme: getStoredTheme(),
          debug: window.localStorage.getItem(DEBUG_STORAGE_KEY) === "true",
          scrollama: getStoredScrollamaConfig(),
        };

        await nextTick();
        applyTheme(state.value.theme);

        if (story.warnings.length) {
          console.warn("Story normalization warnings:", story.warnings);
        }
      } catch (error) {
        console.error(error);

        state.value = {
          loading: false,
          error,
          story: null,
          sources: null,
          navTargets: [],
          activeTargetId: "",
          requestedTarget: null,
          theme: "light",
          debug: false,
          scrollama: DEFAULT_SCROLLAMA_CONFIG,
        };
      }
    });

    onBeforeUnmount(() => {
      window.removeEventListener("popstate", syncRouteState);
    });

    function navigateTo(targetId) {
      state.value.requestedTarget = {
        id: targetId,
        nonce: Date.now(),
      };
    }

    function navigateMode(mode) {
      const href = getModeHref(route.value.basePath, mode);

      if (window.location.pathname !== href) {
        window.history.pushState({}, "", href);
        syncRouteState();
      }
    }

    function setTheme(theme) {
      state.value.theme = applyTheme(theme);
    }

    function setDebug(debug) {
      state.value.debug = Boolean(debug);
      window.localStorage.setItem(DEBUG_STORAGE_KEY, String(state.value.debug));
    }

    function setScrollamaConfig(partial) {
      state.value.scrollama = sanitizeScrollamaConfig({
        ...state.value.scrollama,
        ...(partial ?? {}),
      });
      window.localStorage.setItem(
        SCROLLAMA_STORAGE_KEY,
        JSON.stringify(state.value.scrollama)
      );
    }

    return () => {
      if (state.value.error) {
        return renderError(state.value.error.message);
      }

      if (state.value.loading || !state.value.story || !state.value.sources) {
        return renderLoading();
      }

      return h(
        "div",
        {
          class: `vue-app-shell${isAuthoring.value ? " is-authoring-mode" : ""}${
            state.value.debug ? " is-debug-mode" : ""
          }`,
        },
        [
        h(StoryRuntime, {
          story: state.value.story,
          sources: state.value.sources,
          layouts,
          visualizations,
          activeTargetId: state.value.activeTargetId,
          debug: state.value.debug,
          scrollama: state.value.scrollama,
          requestedTarget: state.value.requestedTarget,
          onTargetsChange: (targets) => {
            state.value.navTargets = targets;

            if (!state.value.activeTargetId && targets[0]) {
              state.value.activeTargetId = targets[0].id;
            }
          },
          onActiveTargetChange: (targetId) => {
            state.value.activeTargetId = targetId;
          },
        }),
        h("div", { class: `bottom-dock-shell${isAuthoring.value ? " is-authoring" : ""}` }, [
          h("div", { class: "bottom-dock-reveal", "aria-hidden": "true" }),
          h(BottomNav, {
            targets: state.value.navTargets,
            activeTargetId: state.value.activeTargetId,
            routeMode: route.value.mode,
            presentingHref: presentingHref.value,
            authoringHref: authoringHref.value,
            navigateMode,
            showThemeToggle: state.value.story.chrome?.themeToggle,
            theme: state.value.theme,
            setTheme,
            debug: state.value.debug,
            setDebug: isAuthoring.value ? setDebug : null,
            scrollamaConfig: state.value.scrollama,
            setScrollamaConfig: isAuthoring.value ? setScrollamaConfig : null,
            showProgress: state.value.story.chrome?.bottomNav,
            showArrows: false,
            orientation: "horizontal",
            onNavigate: navigateTo,
          }),
        ]),
        isAuthoring.value
          ? h(AuthoringPanel, {
              story: state.value.story,
              activeTargetId: state.value.activeTargetId,
              navigateTo,
            })
          : null,
        warningText.value
          ? h("pre", { class: "visually-hidden", "aria-hidden": "true" }, warningText.value)
          : null,
        ]
      );
    };
  },
});
