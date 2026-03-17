import { computed, defineComponent, h, ref } from "vue";

import { AppModeSwitch } from "./AppModeSwitch.js";
import { ThemeModeSwitch } from "./ThemeModeSwitch.js";

function renderNavMarker(kind) {
  return h("span", {
    class: `bottom-nav-dot bottom-nav-dot-${kind === "section" ? "section" : "step"}`,
    "aria-hidden": "true",
  });
}

function renderPrevIcon() {
  return h(
    "svg",
    {
      class: "bottom-nav-icon",
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
    },
    [
      h("path", {
        d: "M9.75 3.5 5.25 8l4.5 4.5",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.25",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    ]
  );
}

function renderNextIcon() {
  return h(
    "svg",
    {
      class: "bottom-nav-icon",
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
    },
    [
      h("path", {
        d: "M6.25 3.5 10.75 8l-4.5 4.5",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.25",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      }),
    ]
  );
}

function renderDebugIcon() {
  return h(
    "svg",
    {
      class: "bottom-nav-icon",
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
    },
    [
      h("path", {
        d: "M5.25 5.5h5.5v4.25a2.75 2.75 0 0 1-5.5 0Z",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.15",
        "stroke-linejoin": "round",
      }),
      h("path", {
        d: "M6.25 5.5V4.75a1.75 1.75 0 1 1 3.5 0v.75",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.15",
        "stroke-linecap": "round",
      }),
      h("path", {
        d: "M8 8v1.5M3.75 7H5M11 7h1.25M5 3.75l.65.65M10.35 4.4 11 3.75",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.15",
        "stroke-linecap": "round",
      }),
    ]
  );
}

function renderSettingsIcon() {
  return h(
    "svg",
    {
      class: "bottom-nav-icon",
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
    },
    [
      h("path", {
        d: "M3 4.5h10M3 8h10M3 11.5h10",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.15",
        "stroke-linecap": "round",
      }),
      h("circle", {
        cx: "6",
        cy: "4.5",
        r: "1.25",
        fill: "var(--chrome-bg)",
        stroke: "currentColor",
        "stroke-width": "1.15",
      }),
      h("circle", {
        cx: "10",
        cy: "8",
        r: "1.25",
        fill: "var(--chrome-bg)",
        stroke: "currentColor",
        "stroke-width": "1.15",
      }),
      h("circle", {
        cx: "7.5",
        cy: "11.5",
        r: "1.25",
        fill: "var(--chrome-bg)",
        stroke: "currentColor",
        "stroke-width": "1.15",
      }),
    ]
  );
}

export const BottomNav = defineComponent({
  name: "BottomNav",
  props: {
    targets: {
      type: Array,
      default: () => [],
    },
    activeTargetId: {
      type: String,
      default: "",
    },
    routeMode: {
      type: String,
      required: true,
    },
    presentingHref: {
      type: String,
      required: true,
    },
    authoringHref: {
      type: String,
      required: true,
    },
    navigateMode: {
      type: Function,
      required: true,
    },
    showThemeToggle: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: "light",
    },
    setTheme: {
      type: Function,
      required: true,
    },
    debug: {
      type: Boolean,
      default: false,
    },
    setDebug: {
      type: Function,
      default: null,
    },
    scrollamaConfig: {
      type: Object,
      default: () => ({}),
    },
    setScrollamaConfig: {
      type: Function,
      default: null,
    },
    showProgress: {
      type: Boolean,
      default: true,
    },
    showArrows: {
      type: Boolean,
      default: true,
    },
    orientation: {
      type: String,
      default: "horizontal",
    },
    embedded: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["navigate"],
  setup(props, { emit }) {
    const isConfigOpen = ref(false);
    const activeIndex = computed(() =>
      Math.max(
        0,
        props.targets.findIndex((target) => target.id === props.activeTargetId)
      )
    );

    function navigateBy(delta) {
      const nextTarget = props.targets[activeIndex.value + delta];
      if (nextTarget) {
        emit("navigate", nextTarget.id);
      }
    }

    return () => {
      return h(
        "nav",
        {
          class: `bottom-nav${props.orientation === "vertical" ? " is-vertical" : ""}${
            props.embedded ? " is-embedded" : ""
          }${isConfigOpen.value ? " is-pinned" : ""}`,
          "aria-label": "Story navigation",
        },
        [
        props.setScrollamaConfig && isConfigOpen.value
          ? h("div", { class: "bottom-nav-config-panel" }, [
              h("div", { class: "bottom-nav-config-block" }, [
                h("div", { class: "bottom-nav-config-row" }, [
                  h("span", { class: "bottom-nav-config-label" }, "Trigger line"),
                  h(
                    "span",
                    { class: "bottom-nav-config-value" },
                    `${Math.round(props.scrollamaConfig.offset * 100)}% viewport`
                  ),
                ]),
                h(
                  "p",
                  { class: "bottom-nav-config-help" },
                  "Where a step becomes active in the viewport."
                ),
              ]),
              h("input", {
                class: "bottom-nav-range",
                type: "range",
                min: "0.1",
                max: "0.9",
                step: "0.05",
                value: String(props.scrollamaConfig.offset),
                onInput: (event) =>
                  props.setScrollamaConfig({
                    offset: Number(event.target.value),
                  }),
              }),
              h("div", { class: "bottom-nav-config-grid" }, [
                h("div", { class: "bottom-nav-config-block" }, [
                  h("span", { class: "bottom-nav-config-label" }, "Progress detail"),
                  h(
                    "span",
                    { class: "bottom-nav-config-value" },
                    `${props.scrollamaConfig.threshold}px`
                  ),
                ]),
              ]),
              h("input", {
                class: "bottom-nav-range",
                type: "range",
                min: "1",
                max: "12",
                step: "1",
                value: String(props.scrollamaConfig.threshold),
                onInput: (event) =>
                  props.setScrollamaConfig({
                    threshold: Number(event.target.value),
                  }),
              }),
            ])
          : null,
        h("div", { class: "bottom-nav-inner" }, [
          h("div", { class: "bottom-nav-settings" }, [
            h(AppModeSwitch, {
              mode: props.routeMode,
              presentingHref: props.presentingHref,
              authoringHref: props.authoringHref,
              navigateMode: props.navigateMode,
            }),
            props.showThemeToggle
              ? h(ThemeModeSwitch, {
                  theme: props.theme,
                  setTheme: props.setTheme,
                })
              : null,
            props.setDebug || props.setScrollamaConfig
              ? h("div", { class: "app-mode-switch bottom-nav-tool-group" }, [
                  props.setDebug
                    ? h(
                        "button",
                        {
                          type: "button",
                          class: `app-mode-link is-debug-tool${props.debug ? " is-active" : ""}`,
                          "aria-label": props.debug ? "Disable scroll debug" : "Enable scroll debug",
                          title: props.debug ? "Disable scroll debug" : "Enable scroll debug",
                          onClick: () => props.setDebug(!props.debug),
                        },
                        [renderDebugIcon(), h("span", { class: "visually-hidden" }, "Debug")]
                      )
                    : null,
                  props.setScrollamaConfig
                    ? h(
                        "button",
                        {
                          type: "button",
                          class: `app-mode-link is-settings-tool${isConfigOpen.value ? " is-active" : ""}`,
                          "aria-label": isConfigOpen.value
                            ? "Hide Scrollama settings"
                            : "Show Scrollama settings",
                          title: isConfigOpen.value
                            ? "Hide Scrollama settings"
                            : "Show Scrollama settings",
                          onClick: () => {
                            isConfigOpen.value = !isConfigOpen.value;
                          },
                        },
                        [renderSettingsIcon(), h("span", { class: "visually-hidden" }, "Settings")]
                      )
                    : null,
                ])
              : null,
          ]),
          props.showProgress && props.targets.length
            ? h("div", { class: "bottom-nav-progress" }, [
                props.showArrows
                  ? h(
                      "button",
                      {
                        type: "button",
                        class: "bottom-nav-button",
                        disabled: activeIndex.value === 0,
                        onClick: () => navigateBy(-1),
                        "aria-label": "Previous stop",
                      },
                      renderPrevIcon()
                    )
                  : null,
                h("div", { class: "bottom-nav-track" }, [
                  h(
                    "div",
                    { class: "bottom-nav-links" },
                    props.targets.map((target) =>
                      h(
                        "button",
                        {
                          key: target.id,
                          type: "button",
                          class: `bottom-nav-link${target.id === props.activeTargetId ? " is-active" : ""}`,
                          "aria-label": target.label,
                          title: target.label,
                          onClick: () => emit("navigate", target.id),
                        },
                        [
                          renderNavMarker(target.kind),
                          h(
                            "span",
                            { class: "visually-hidden" },
                            target.kind === "section" ? "Section" : "Step"
                          ),
                        ]
                      )
                    )
                  ),
                ]),
                props.showArrows
                  ? h(
                      "button",
                      {
                        type: "button",
                        class: "bottom-nav-button",
                        disabled: activeIndex.value === props.targets.length - 1,
                        onClick: () => navigateBy(1),
                        "aria-label": "Next stop",
                      },
                      renderNextIcon()
                    )
                  : null,
              ])
            : null,
        ]),
        ]
      );
    };
  },
});
