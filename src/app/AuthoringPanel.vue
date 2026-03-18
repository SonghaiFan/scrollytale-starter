<script setup>
import { computed, ref, watch } from "vue";

import { getMarkerKindForVisType } from "./navMarkers.js";

// ── Props ──────────────────────────────────────────────────────────────────────
const props = defineProps({
  story:          { type: Object,   required: true },
  activeTargetId: { type: String,   default: "" },
  navigateTo:     { type: Function, required: true },
});

// ── State ──────────────────────────────────────────────────────────────────────
const drafts           = ref({});
const dirty            = ref({});
const savingId         = ref("");
const saveStatus       = ref({});
const editorPreviewRefs = ref({});

// ── Computed ───────────────────────────────────────────────────────────────────
const activeSection = computed(() => {
  if (!props.activeTargetId) return props.story.sections[0] ?? null;
  const sectionId = props.activeTargetId.replace(/-step-\d+$/, "");
  return props.story.sections.find((s) => s.id === sectionId) ?? null;
});

const activeStepIndex = computed(() => {
  const match = props.activeTargetId.match(/-step-(\d+)$/);
  return match ? Number(match[1]) - 1 : -1;
});

// ── Draft sync ─────────────────────────────────────────────────────────────────
watch(
  () => JSON.stringify(props.story.sections.map((s) => ({ id: s.id, raw: s.raw }))),
  () => {
    const next = { ...drafts.value };
    props.story.sections.forEach((s) => {
      if (next[s.id] == null || !dirty.value[s.id]) next[s.id] = s.raw;
    });
    drafts.value = next;
  },
  { immediate: true }
);

// ── Actions ────────────────────────────────────────────────────────────────────
async function saveSection(section) {
  const raw = drafts.value[section.id] ?? section.raw;
  savingId.value = section.id;
  saveStatus.value = { ...saveStatus.value, [section.id]: "" };

  try {
    const res = await fetch("/__authoring/save-section", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: section.id, raw }),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || !result.ok) throw new Error(result.error ?? "Could not save section.");
    dirty.value = { ...dirty.value, [section.id]: false };
    saveStatus.value = { ...saveStatus.value, [section.id]: "Saved" };
  } catch (err) {
    saveStatus.value = {
      ...saveStatus.value,
      [section.id]: err instanceof Error ? err.message : "Save failed.",
    };
  } finally {
    savingId.value = "";
  }
}

function revertSection(section) {
  drafts.value    = { ...drafts.value,    [section.id]: section.raw };
  dirty.value     = { ...dirty.value,     [section.id]: false };
  saveStatus.value= { ...saveStatus.value,[section.id]: "" };
}

function updateDraft(section, value) {
  drafts.value    = { ...drafts.value,    [section.id]: value };
  dirty.value     = { ...dirty.value,     [section.id]: value !== section.raw };
  saveStatus.value= { ...saveStatus.value,[section.id]: "" };
}

function syncEditorScroll(sectionId, event) {
  const preview = editorPreviewRefs.value[sectionId];
  if (!preview) return;
  preview.scrollTop  = event.target.scrollTop;
  preview.scrollLeft = event.target.scrollLeft;
}

function setPreviewRef(sectionId, el) {
  if (el) editorPreviewRefs.value[sectionId] = el;
  else    delete editorPreviewRefs.value[sectionId];
}

function onEditorKeydown(event, section) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveSection(section);
  }
}

// ── Source preview syntax tokens ───────────────────────────────────────────────
function tokenizeLine(line) {
  if (!line.trim()) return `<span class="token-text"> </span>`;

  if (line.trim() === "---")
    return `<span class="token-divider">${line}</span>`;

  const directive = line.match(/^(\s*)(::[a-z-]+)(.*)$/i);
  if (directive) {
    const [, indent, keyword, rest] = directive;
    return [
      indent   ? `<span class="token-text">${indent}</span>`           : "",
      `<span class="token-directive">${keyword}</span>`,
      rest     ? `<span class="token-directive-rest">${rest}</span>`   : "",
    ].join("");
  }

  if (/^\s*::$/.test(line))
    return `<span class="token-directive">${line}</span>`;

  const heading = line.match(/^(\s*)(#{1,6})(\s*)(.*)$/);
  if (heading) {
    const [, indent, hashes, spacing, text] = heading;
    return [
      indent  ? `<span class="token-text">${indent}</span>`            : "",
      `<span class="token-heading-mark">${hashes}</span>`,
      spacing ? `<span class="token-yaml-sep">${spacing}</span>`       : "",
      text    ? `<span class="token-heading-text">${text}</span>`      : "",
    ].join("");
  }

  const yaml = line.match(/^(\s*)([A-Za-z0-9_-]+)(\s*:\s*)(.*)$/);
  if (yaml) {
    const [, indent, key, sep, value] = yaml;
    return [
      indent  ? `<span class="token-text">${indent}</span>`            : "",
      `<span class="token-yaml-key">${key}</span>`,
      `<span class="token-yaml-sep">${sep}</span>`,
      value   ? `<span class="token-yaml-value">${value}</span>`       : "",
    ].join("");
  }

  if (/^\s*</.test(line))
    return `<span class="token-html">${line}</span>`;

  return `<span class="token-text">${line}</span>`;
}

function sourcePreviewHtml(source) {
  return source
    .split("\n")
    .map((line) => {
      const isEmpty = !line.length;
      return `<div class="authoring-source-line${isEmpty ? " is-empty" : ""}">${tokenizeLine(line)}</div>`;
    })
    .join("");
}

// ── Step helpers ───────────────────────────────────────────────────────────────
function getStepBody(step) {
  return typeof step === "string" ? step : step?.body ?? "";
}

function formatStepDescriptor(step) {
  if (!step || typeof step !== "object") return "{step}";
  if (step.focus)    return `focus · ${step.focus}`;
  if (step.filter)   return `filter · ${step.filter}`;
  if (step.vis?.type)return `{ ${step.vis.type} }`;
  const body    = typeof step.body === "string" ? step.body : "";
  const snippet = body.replace(/[#*`[\]]/g, "").trim().slice(0, 48);
  return snippet || "{step}";
}
</script>

<template>
  <aside class="authoring-panel" aria-label="Authoring inspector">
    <div class="authoring-panel-inner">

      <!-- Header -->
      <div class="authoring-panel-head">
        <div class="authoring-panel-headline">
          <p class="authoring-panel-kicker">Authoring</p>
          <h2 class="authoring-panel-title">Story</h2>
        </div>
      </div>

      <!-- Section list -->
      <div class="authoring-section-list">
        <section
          v-for="section in story.sections"
          :key="section.id"
          class="authoring-section-item"
          :class="{ 'is-active': activeSection?.id === section.id }"
        >
          <!-- Section nav button -->
          <button
            type="button"
            class="authoring-section-button"
            :class="{ 'is-active': activeSection?.id === section.id }"
            @click="navigateTo(section.id)"
          >
            <span
              class="authoring-section-marker"
              :class="`is-${getMarkerKindForVisType(section.vis.type)}`"
              aria-hidden="true"
            />
            <span class="authoring-section-copy">
              <span class="authoring-section-name">{{ section.title }}</span>
              <span class="authoring-section-meta">{{ section.layout }} · {{ section.vis.type }}</span>
            </span>
          </button>

          <!-- Expanded editor (active section only) -->
          <div v-if="activeSection?.id === section.id" class="authoring-section-details">
            <div class="authoring-editor-shell">
              <!-- Syntax-highlighted overlay -->
              <pre
                class="authoring-source is-editor-overlay"
                :ref="(el) => setPreviewRef(section.id, el)"
                aria-hidden="true"
                v-html="sourcePreviewHtml(drafts[section.id] ?? section.raw)"
              />
              <!-- Editable textarea -->
              <textarea
                class="authoring-editor"
                spellcheck="false"
                :value="drafts[section.id] ?? section.raw"
                @input="updateDraft(section, $event.target.value)"
                @scroll="syncEditorScroll(section.id, $event)"
                @keydown="onEditorKeydown($event, section)"
              />
            </div>

            <!-- Save / revert actions -->
            <div class="authoring-editor-actions">
              <button
                type="button"
                class="authoring-editor-button is-primary"
                :disabled="!dirty[section.id] || savingId === section.id"
                @click="saveSection(section)"
              >
                {{ savingId === section.id ? "Saving…" : "Save" }}
              </button>
              <button
                type="button"
                class="authoring-editor-button"
                :disabled="!dirty[section.id] || savingId === section.id"
                @click="revertSection(section)"
              >
                Revert
              </button>
              <span
                class="authoring-editor-status"
                :class="{
                  'is-success': saveStatus[section.id] === 'Saved',
                  'is-error':   saveStatus[section.id] && saveStatus[section.id] !== 'Saved',
                }"
              >
                {{ saveStatus[section.id] ?? "" }}
              </span>
            </div>

            <!-- Step list -->
            <div v-if="section.copy.steps?.length" class="authoring-step-list">
              <button
                v-for="(step, index) in section.copy.steps"
                :key="`${section.id}-step-${index + 1}`"
                type="button"
                class="authoring-step-button"
                :class="{ 'is-active': activeStepIndex === index }"
                @click="navigateTo(`${section.id}-step-${index + 1}`)"
              >
                <span class="authoring-step-visual">
                  <span class="authoring-step-descriptor">{{ formatStepDescriptor(step) }}</span>
                  <span class="visually-hidden">{{ getStepBody(step) }}</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>

    </div>
  </aside>
</template>
