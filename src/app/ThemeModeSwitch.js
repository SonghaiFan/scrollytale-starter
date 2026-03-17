import { computed, defineComponent, h } from "vue";

function renderSunIcon() {
  return h(
    "svg",
    {
      class: "app-mode-icon",
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
    },
    [
      h("circle", {
        cx: "8",
        cy: "8",
        r: "2.4",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.15",
      }),
      ...[
        ["8", "1.5", "8", "3"],
        ["8", "13", "8", "14.5"],
        ["1.5", "8", "3", "8"],
        ["13", "8", "14.5", "8"],
      ].map(([x1, y1, x2, y2]) =>
        h("path", {
          d: `M${x1} ${y1} ${x2} ${y2}`,
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "1.15",
          "stroke-linecap": "round",
        })
      ),
    ]
  );
}

function renderMoonIcon() {
  return h(
    "svg",
    {
      class: "app-mode-icon",
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
    },
    [
      h("path", {
        d: "M10.9 2.1a5.5 5.5 0 1 0 2.8 10.3A5.8 5.8 0 0 1 10.9 2.1Z",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.15",
        "stroke-linejoin": "round",
      }),
    ]
  );
}

export const ThemeModeSwitch = defineComponent({
  name: "ThemeModeSwitch",
  props: {
    theme: {
      type: String,
      required: true,
    },
    setTheme: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const items = computed(() => [
      { key: "light", label: "Light", icon: renderSunIcon },
      { key: "dark", label: "Dark", icon: renderMoonIcon },
    ]);

    return () =>
      h(
        "nav",
        {
          class: "app-mode-switch theme-mode-switch",
          "aria-label": "Color theme",
        },
        items.value.map((item) =>
          h(
            "button",
            {
              key: item.key,
              type: "button",
              class: `app-mode-link${props.theme === item.key ? " is-active" : ""}`,
              "aria-label": item.label,
              onClick: () => props.setTheme(item.key),
            },
            [item.icon(), h("span", { class: "visually-hidden" }, item.label)]
          )
        )
      );
  },
});
