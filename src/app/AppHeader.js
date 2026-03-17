import { defineComponent, h } from "vue";

import { AppModeSwitch } from "./AppModeSwitch.js";

export const AppHeader = defineComponent({
  name: "AppHeader",
  props: {
    story: {
      type: Object,
      required: true,
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
  },
  setup(props) {
    return () =>
      h("header", { class: "app-header" }, [
        h("div", { class: "app-shell app-header-shell" }, [
          h("div", { class: "app-chrome-bar" }, [
            h("div", { class: "app-brand" }, [
              h("p", { class: "app-wordmark" }, "Scrollytale"),
              h("p", { class: "app-story-label" }, props.story.title),
            ]),
            h(AppModeSwitch, {
              mode: props.routeMode,
              presentingHref: props.presentingHref,
              authoringHref: props.authoringHref,
              navigateMode: props.navigateMode,
            }),
            props.story.chrome?.themeToggle
              ? h("div", { class: "theme-switch-shell" }, [
                  h("span", { class: "theme-switch-label" }, "Light"),
                  h("label", { class: "theme-switch", for: "theme-toggle" }, [
                    h("input", {
                      id: "theme-toggle",
                      type: "checkbox",
                      "aria-label": "Toggle dark mode",
                    }),
                    h("span", { class: "slider round" }),
                  ]),
                  h("span", { class: "theme-switch-label" }, "Dark"),
                ])
              : h("div", { class: "theme-switch-shell is-placeholder" }),
          ]),
        ]),
      ]);
  },
});
