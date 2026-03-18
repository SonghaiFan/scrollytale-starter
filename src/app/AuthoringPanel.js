import { computed, defineComponent, h, ref, watch } from "vue";

import { getMarkerKindForVisType } from "./navMarkers.js";

function getStepBody(step) {
  return typeof step === "string" ? step : step?.body ?? "";
}

function formatStepDescriptor(step) {
  if (!step || typeof step !== "object") {
    return "{step}";
  }

  const pairs = Object.entries(step).filter(
    ([key, value]) => key !== "body" && key !== "text" && value != null && value !== ""
  );

  if (!pairs.length) {
    return "{step}";
  }

  const formatted = pairs
    .map(([key, value]) => `${key}=${JSON.stringify(String(value))}`)
    .join(" ");

  return `{${formatted}}`;
}

function renderSourceTokens(line) {
  if (!line.trim()) {
    return [h("span", { class: "token-text" }, " ")];
  }

  if (line.trim() === "---") {
    return [h("span", { class: "token-divider" }, line)];
  }

  const directiveMatch = line.match(/^(\s*)(::[a-z-]+)(.*)$/i);
  if (directiveMatch) {
    const [, indent, directive, rest] = directiveMatch;
    return [
      indent ? h("span", { class: "token-text" }, indent) : null,
      h("span", { class: "token-directive" }, directive),
      rest ? h("span", { class: "token-directive-rest" }, rest) : null,
    ].filter(Boolean);
  }

  if (/^\s*::$/.test(line)) {
    return [h("span", { class: "token-directive" }, line)];
  }

  const headingMatch = line.match(/^(\s*)(#{1,6})(\s*)(.*)$/);
  if (headingMatch) {
    const [, indent, hashes, spacing, text] = headingMatch;
    return [
      indent ? h("span", { class: "token-text" }, indent) : null,
      h("span", { class: "token-heading-mark" }, hashes),
      spacing ? h("span", { class: "token-yaml-sep" }, spacing) : null,
      text ? h("span", { class: "token-heading-text" }, text) : null,
    ].filter(Boolean);
  }

  const yamlMatch = line.match(/^(\s*)([A-Za-z0-9_-]+)(\s*:\s*)(.*)$/);
  if (yamlMatch) {
    const [, indent, key, separator, value] = yamlMatch;
    return [
      indent ? h("span", { class: "token-text" }, indent) : null,
      h("span", { class: "token-yaml-key" }, key),
      h("span", { class: "token-yaml-sep" }, separator),
      value ? h("span", { class: "token-yaml-value" }, value) : null,
    ].filter(Boolean);
  }

  if (/^\s*</.test(line)) {
    return [h("span", { class: "token-html" }, line)];
  }

  return [h("span", { class: "token-text" }, line)];
}

function renderSourcePreview(source) {
  return source.split("\n").map((line, index) =>
    h(
      "div",
      {
        key: `line-${index}`,
        class: `authoring-source-line${line.length ? "" : " is-empty"}`,
      },
      renderSourceTokens(line)
    )
  );
}

export const AuthoringPanel = defineComponent({
  name: "AuthoringPanel",
  props: {
    story: {
      type: Object,
      required: true,
    },
    activeTargetId: {
      type: String,
      default: "",
    },
    navigateTo: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const drafts = ref({});
    const dirty = ref({});
    const savingId = ref("");
    const saveStatus = ref({});
    const editorPreviewRefs = ref({});

    const activeSection = computed(() => {
      if (!props.activeTargetId) {
        return props.story.sections[0] ?? null;
      }

      const activeSectionId = props.activeTargetId.replace(/-step-\d+$/, "");
      return props.story.sections.find((section) => section.id === activeSectionId) ?? null;
    });

    const activeStepIndex = computed(() => {
      const match = props.activeTargetId.match(/-step-(\d+)$/);
      return match ? Number(match[1]) - 1 : -1;
    });

    watch(
      () => JSON.stringify(props.story.sections.map((section) => ({ id: section.id, raw: section.raw }))),
      () => {
        const nextDrafts = { ...drafts.value };

        props.story.sections.forEach((section) => {
          if (nextDrafts[section.id] == null || !dirty.value[section.id]) {
            nextDrafts[section.id] = section.raw;
          }
        });

        drafts.value = nextDrafts;
      },
      { immediate: true }
    );

    async function saveSection(section) {
      const raw = drafts.value[section.id] ?? section.raw;
      savingId.value = section.id;
      saveStatus.value = { ...saveStatus.value, [section.id]: "" };

      try {
        const response = await fetch("/__authoring/save-section", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: section.id,
            raw,
          }),
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok) {
          throw new Error(result.error ?? "Could not save section.");
        }

        dirty.value = { ...dirty.value, [section.id]: false };
        saveStatus.value = { ...saveStatus.value, [section.id]: "Saved" };
      } catch (error) {
        saveStatus.value = {
          ...saveStatus.value,
          [section.id]: error instanceof Error ? error.message : "Save failed.",
        };
      } finally {
        savingId.value = "";
      }
    }

    function revertSection(section) {
      drafts.value = {
        ...drafts.value,
        [section.id]: section.raw,
      };
      dirty.value = {
        ...dirty.value,
        [section.id]: false,
      };
      saveStatus.value = {
        ...saveStatus.value,
        [section.id]: "",
      };
    }

    function updateDraft(section, value) {
      drafts.value = {
        ...drafts.value,
        [section.id]: value,
      };
      dirty.value = {
        ...dirty.value,
        [section.id]: value !== section.raw,
      };
      saveStatus.value = {
        ...saveStatus.value,
        [section.id]: "",
      };
    }

    function syncEditorScroll(sectionId, event) {
      const preview = editorPreviewRefs.value[sectionId];
      if (!preview) {
        return;
      }

      preview.scrollTop = event.target.scrollTop;
      preview.scrollLeft = event.target.scrollLeft;
    }

    return () =>
      h("aside", { class: "authoring-panel", "aria-label": "Authoring inspector" }, [
          h("div", { class: "authoring-panel-inner" }, [
            h("div", { class: "authoring-panel-head" }, [
            h("div", { class: "authoring-panel-headline" }, [
              h("p", { class: "authoring-panel-kicker" }, "Authoring"),
              h("h2", { class: "authoring-panel-title" }, "Story"),
            ]),
          ]),

          h(
            "div",
            { class: "authoring-section-list" },
            props.story.sections.map((section) => {
              const isActive = activeSection.value?.id === section.id;
              const draft = drafts.value[section.id] ?? section.raw;
              const isDirty = Boolean(dirty.value[section.id]);
              const isSaving = savingId.value === section.id;
              const status = saveStatus.value[section.id] ?? "";

              return h(
                "section",
                {
                  key: section.id,
                  class: `authoring-section-item${isActive ? " is-active" : ""}`,
                },
                [
                  h(
                    "button",
                    {
                      type: "button",
                      class: `authoring-section-button${isActive ? " is-active" : ""}`,
                      onClick: () => props.navigateTo(section.id),
                    },
                    [
                      h(
                        "span",
                        {
                          class: `authoring-section-marker is-${getMarkerKindForVisType(section.vis.type)}`,
                          "aria-hidden": "true",
                        }
                      ),
                      h("span", { class: "authoring-section-copy" }, [
                        h("span", { class: "authoring-section-name" }, section.title),
                        h(
                          "span",
                          { class: "authoring-section-meta" },
                          `${section.layout} · ${section.vis.type} · flow:${section.chapter?.flow ?? "vertical"}`
                        ),
                      ]),
                    ]
                  ),
                  isActive
                    ? h("div", { class: "authoring-section-details" }, [
                        h("div", { class: "authoring-editor-shell" }, [
                          h(
                            "pre",
                            {
                              class: "authoring-source is-editor-overlay",
                              ref: (element) => {
                                if (element) {
                                  editorPreviewRefs.value[section.id] = element;
                                } else {
                                  delete editorPreviewRefs.value[section.id];
                                }
                              },
                              "aria-hidden": "true",
                            },
                            renderSourcePreview(draft)
                          ),
                          h("textarea", {
                            class: "authoring-editor",
                            spellcheck: "false",
                            value: draft,
                            onInput: (event) => updateDraft(section, event.target.value),
                            onScroll: (event) => syncEditorScroll(section.id, event),
                            onKeydown: (event) => {
                              if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                                event.preventDefault();
                                saveSection(section);
                              }
                            },
                          }),
                        ]),
                        h("div", { class: "authoring-editor-actions" }, [
                          h(
                            "button",
                            {
                              type: "button",
                              class: "authoring-editor-button is-primary",
                              disabled: !isDirty || isSaving,
                              onClick: () => saveSection(section),
                            },
                            isSaving ? "Saving..." : "Save"
                          ),
                          h(
                            "button",
                            {
                              type: "button",
                              class: "authoring-editor-button",
                              disabled: !isDirty || isSaving,
                              onClick: () => revertSection(section),
                            },
                            "Revert"
                          ),
                          h(
                            "span",
                            {
                              class: `authoring-editor-status${
                                status === "Saved"
                                  ? " is-success"
                                  : status
                                    ? " is-error"
                                    : ""
                              }`,
                            },
                            status
                          ),
                        ]),
                        section.copy.steps?.length
                          ? h(
                              "div",
                              { class: "authoring-step-list" },
                              section.copy.steps.map((step, index) =>
                                h(
                                  "button",
                                  {
                                    key: `${section.id}-step-${index + 1}`,
                                    type: "button",
                                    class: `authoring-step-button${
                                      activeStepIndex.value === index ? " is-active" : ""
                                    }`,
                                    onClick: () =>
                                      props.navigateTo(`${section.id}-step-${index + 1}`),
                                  },
                                  [
                                    h("span", { class: "authoring-step-visual" }, [
                                      h("span", { class: "authoring-step-descriptor" }, formatStepDescriptor(step)),
                                      h("span", { class: "visually-hidden" }, getStepBody(step)),
                                    ]),
                                  ]
                                )
                              )
                            )
                          : null,
                      ])
                    : null,
                ]
              );
            })
          ),
        ]),
      ]);
  },
});
