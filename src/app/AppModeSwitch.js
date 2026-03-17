import { computed, defineComponent, h } from "vue";

function renderPresentingIcon() {
  return h(
    "svg",
    {
      class: "app-mode-icon",
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
    },
    [
      h("rect", {
        x: "2.25",
        y: "3",
        width: "11.5",
        height: "8",
        rx: "1.25",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.25",
      }),
      h("path", {
        d: "M5.5 12.5h5",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.25",
        "stroke-linecap": "round",
      }),
    ]
  );
}

function renderAuthoringIcon() {
  return h(
    "svg",
    {
      class: "app-mode-icon",
      viewBox: "0 0 16 16",
      "aria-hidden": "true",
    },
    [
      h("path", {
        d: "M3 11.75L11.6 3.15a1.4 1.4 0 0 1 1.98 1.98L4.98 13.73 3 14l.27-1.98Z",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.25",
        "stroke-linejoin": "round",
      }),
    ]
  );
}

export const AppModeSwitch = defineComponent({
  name: "AppModeSwitch",
  props: {
    mode: {
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
  },
  setup(props) {
    const items = computed(() => [
      {
        key: "presenting",
        label: "Presenting",
        href: props.presentingHref,
        icon: renderPresentingIcon,
      },
      {
        key: "authoring",
        label: "Authoring",
        href: props.authoringHref,
        icon: renderAuthoringIcon,
      },
    ]);

    return () =>
      h(
        "nav",
        {
          class: "app-mode-switch",
          "aria-label": "Application mode",
        },
        items.value.map((item) =>
          h(
            "a",
            {
              key: item.key,
              href: item.href,
              class: `app-mode-link${props.mode === item.key ? " is-active" : ""}`,
              onClick: (event) => {
                event.preventDefault();
                props.navigateMode(item.key);
              },
            },
            [
              item.icon(),
              h("span", { class: "visually-hidden" }, item.label),
            ]
          )
        )
      );
  },
});
