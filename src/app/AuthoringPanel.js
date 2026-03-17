import { computed, defineComponent, h, ref, watch } from "vue";

function getStepBody(step) {
  return typeof step === "string" ? step : step?.body ?? "";
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

    return () =>
      h("aside", { class: "authoring-panel", "aria-label": "Authoring inspector" }, [
        h("div", { class: "authoring-panel-inner" }, [
          h("div", { class: "authoring-panel-head" }, [
            h("p", { class: "authoring-panel-kicker" }, "Authoring"),
            h("h2", { class: "authoring-panel-title" }, "Story"),
            h("p", { class: "authoring-panel-copy" }, "Edit the active section and save back to story.md."),
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
                      h("span", { class: "authoring-section-marker", "aria-hidden": "true" }, "•"),
                      h("span", { class: "authoring-section-copy" }, [
                        h("span", { class: "authoring-section-name" }, section.title),
                        h(
                          "span",
                          { class: "authoring-section-meta" },
                          `${section.layout} · ${section.vis.type}`
                        ),
                      ]),
                    ]
                  ),
                  isActive
                    ? h("div", { class: "authoring-section-details" }, [
                        h("textarea", {
                          class: "authoring-editor",
                          spellcheck: "false",
                          value: draft,
                          onInput: (event) => updateDraft(section, event.target.value),
                          onKeydown: (event) => {
                            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
                              event.preventDefault();
                              saveSection(section);
                            }
                          },
                        }),
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
                                    h("span", { class: "authoring-step-index" }, `${index + 1}`),
                                    h(
                                      "span",
                                      { class: "authoring-step-copy" },
                                      (() => {
                                        const body = getStepBody(step);
                                        return body.length > 88
                                          ? `${body.slice(0, 88).trim()}…`
                                          : body;
                                      })()
                                    ),
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
