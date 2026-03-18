<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import { renderStory } from "../runtime/renderStory.js";
import { getMarkerKindForVisType } from "./navMarkers.js";

const props = defineProps({
  story:          { type: Object,  required: true },
  sources:        { type: Object,  required: true },
  layouts:        { type: Object,  required: true },
  visualizations: { type: Object,  required: true },
  requestedTarget:{ type: Object,  default: null },
  activeTargetId: { type: String,  default: "" },
  debug:          { type: Boolean, default: false },
  scrollama:      { type: Object,  default: () => ({}) },
});

const emit = defineEmits(["targets-change", "active-target-change"]);

const root = ref(null);
let storyController = null;
let navObserver = null;

// ── Nav target discovery ───────────────────────────────────────────────────────
function buildNavTargets(rootEl, story) {
  return [...rootEl.querySelectorAll(".story-section")].flatMap((sectionEl, index) => {
    const stepEls = [...sectionEl.querySelectorAll(".step")];
    const sectionMeta = story.sections.find((s) => s.id === sectionEl.id);
    const kind = getMarkerKindForVisType(sectionMeta?.vis?.type);

    if (stepEls.length) {
      return stepEls.map((stepEl) => ({
        id: stepEl.id,
        label: stepEl.textContent.trim().replace(/\s+/g, " ").slice(0, 72),
        kind,
      }));
    }

    return [{
      id: sectionEl.id,
      label: sectionEl.querySelector("h2, h1")?.textContent?.trim() ?? `Section ${index + 1}`,
      kind,
    }];
  });
}

// ── Scroll ─────────────────────────────────────────────────────────────────────
function scrollToTarget(targetId) {
  if (!targetId || !root.value) return;
  root.value
    .querySelector(`#${CSS.escape(targetId)}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── IntersectionObserver nav ───────────────────────────────────────────────────
function setupNavObserver(targets) {
  navObserver?.disconnect();
  if (!root.value || !targets.length) return;

  const elements = targets
    .map((t) => root.value.querySelector(`#${CSS.escape(t.id)}`))
    .filter(Boolean);

  if (!elements.length) return;

  navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) emit("active-target-change", visible.target.id);
    },
    { threshold: [0.2, 0.35, 0.5, 0.65], rootMargin: "-15% 0px -35% 0px" }
  );

  elements.forEach((el) => navObserver.observe(el));

  const preferred = props.requestedTarget?.id || props.activeTargetId;
  const initial = targets.find((t) => t.id === preferred)?.id ?? targets[0].id;
  emit("active-target-change", initial);
}

// ── Story mount / remount ──────────────────────────────────────────────────────
async function mountStory() {
  const scrollY = window.scrollY;
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
  window.scrollTo({ top: scrollY, behavior: "instant" });

  const targets = buildNavTargets(root.value, props.story);
  emit("targets-change", targets);
  setupNavObserver(targets);
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────
onMounted(mountStory);

onBeforeUnmount(() => {
  storyController?.destroy?.();
  navObserver?.disconnect();
});

// Navigate on demand — only when the nonce changes (not on every re-render)
watch(() => props.requestedTarget?.nonce, () => scrollToTarget(props.requestedTarget?.id));

// Remount when story content, debug flag, or scrollama config changes
watch(
  [() => props.story, () => props.debug, () => JSON.stringify(props.scrollama)],
  mountStory
);
</script>

<template>
  <div ref="root" class="vue-story-runtime" />
</template>
