import { defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { renderStory } from "../runtime/renderStory.js";

function buildNavTargets(root) {
  const sectionElements = [...root.querySelectorAll(".section-shell")];
  const targets = [];

  sectionElements.forEach((sectionEl, index) => {
    const stepEls = [...sectionEl.querySelectorAll(".step")];

    if (stepEls.length) {
      stepEls.forEach((stepEl) => {
        targets.push({
          id: stepEl.id,
          label: stepEl.textContent.trim().replace(/\s+/g, " ").slice(0, 72),
          symbol: "\u25cf",
        });
      });
      return;
    }

    targets.push({
      id: sectionEl.id,
      label: sectionEl.querySelector("h2, h1")?.textContent?.trim() ?? `Section ${index + 1}`,
      symbol: "\u25a0",
    });
  });

  return targets;
}

export const StoryRuntime = defineComponent({
  name: "StoryRuntime",
  props: {
    story: {
      type: Object,
      required: true,
    },
    sources: {
      type: Object,
      required: true,
    },
    layouts: {
      type: Object,
      required: true,
    },
    visualizations: {
      type: Object,
      required: true,
    },
    requestedTarget: {
      type: Object,
      default: null,
    },
    activeTargetId: {
      type: String,
      default: "",
    },
    debug: {
      type: Boolean,
      default: false,
    },
    scrollama: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["targets-change", "active-target-change"],
  setup(props, { emit }) {
    const root = ref(null);
    let storyController = null;
    let navObserver = null;

    function scrollToTarget(targetId) {
      if (!targetId || !root.value) {
        return;
      }

      root.value
        .querySelector(`#${CSS.escape(targetId)}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function setupNavObserver(targets) {
      navObserver?.disconnect();
      if (!root.value || !targets.length) {
        return;
      }

      const elements = targets
        .map((target) => root.value.querySelector(`#${CSS.escape(target.id)}`))
        .filter(Boolean);

      if (!elements.length) {
        return;
      }

      navObserver = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

          if (!visible) {
            return;
          }

          emit("active-target-change", visible.target.id);
        },
        {
          threshold: [0.2, 0.35, 0.5, 0.65],
          rootMargin: "-15% 0px -35% 0px",
        }
      );

      elements.forEach((element) => navObserver.observe(element));

      const preferredTargetId = props.requestedTarget?.id || props.activeTargetId;
      const nextActiveTarget =
        targets.find((target) => target.id === preferredTargetId)?.id ?? targets[0].id;

      emit("active-target-change", nextActiveTarget);
    }

    async function mountStory() {
      storyController?.destroy?.();
      navObserver?.disconnect();

      storyController = renderStory({
        app: root.value,
        story: props.story,
        sources: props.sources,
        layouts: props.layouts,
        visualizations: props.visualizations,
        debug: props.debug,
        scrollama: props.scrollama,
      });

      await nextTick();

      const targets = buildNavTargets(root.value);
      emit("targets-change", targets);
      setupNavObserver(targets);
    }

    onMounted(async () => {
      await mountStory();
    });

    onBeforeUnmount(() => {
      storyController?.destroy?.();
      navObserver?.disconnect();
    });

    watch(
      () => props.requestedTarget?.nonce,
      () => {
        scrollToTarget(props.requestedTarget?.id);
      }
    );

    watch(
      () => props.debug,
      async () => {
        await mountStory();
      }
    );

    watch(
      () => JSON.stringify(props.scrollama),
      async () => {
        await mountStory();
      }
    );

    return () =>
      h("div", {
        ref: root,
        class: "vue-story-runtime",
      });
  },
});
