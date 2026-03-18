function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function resolveTriggerOffset(offset) {
  if (typeof offset === "string" && offset.trim().endsWith("px")) {
    const px = Number.parseFloat(offset);
    return Number.isFinite(px) ? px : window.innerHeight * 0.55;
  }

  const numeric = Number(offset);
  return Number.isFinite(numeric) ? numeric * window.innerHeight : window.innerHeight * 0.55;
}

function quantizeProgress(distance, size, granularity) {
  const safeSize = Math.max(size, 1);
  const safeGranularity = Math.max(1, Math.round(Number(granularity) || 4));
  const quantized = Math.floor(Math.max(distance, 0) / safeGranularity) * safeGranularity;
  return clamp(quantized / safeSize);
}

function setActiveStepState(steps, activeIndex, activeProgress = 0) {
  steps.forEach((stepEl, index) => {
    stepEl.classList.toggle("is-active", index === activeIndex);
    const localProgress =
      index < activeIndex ? 1 : index > activeIndex ? 0 : clamp(activeProgress);
    stepEl.style.setProperty("--scrolly-step-progress", String(localProgress));
  });
}

function setActiveNarrativeCardState(cards, activeIndex) {
  cards.forEach((cardEl, index) => {
    cardEl.classList.toggle("is-active", index === activeIndex);
  });
}

export function cleanupScrollyDebug(root = document) {
  root.querySelectorAll(".scrollytale-debug-guide").forEach((node) => node.remove());
}

export function renderScrollyDebug(app, offset) {
  cleanupScrollyDebug(app);

  const horizontalLine = document.createElement("div");
  horizontalLine.className = "scrollytale-debug-guide scrollytale-debug-line";
  horizontalLine.style.top =
    typeof offset === "string" && offset.trim().endsWith("px")
      ? offset.trim()
      : `${clamp(Number(offset) || 0.55) * 100}vh`;

  const verticalLine = document.createElement("div");
  verticalLine.className = "scrollytale-debug-guide scrollytale-debug-line-vertical";

  app.append(horizontalLine, verticalLine);
}

export function createVerticalScrollyController({
  section,
  steps,
  visController,
  buildStepUpdatePayload,
  offset = 0.55,
  threshold = 4,
}) {
  if (!steps.length || !visController?.update) {
    return null;
  }

  let activeIndex = -1;

  function update() {
    const trigger = resolveTriggerOffset(offset);
    let nextIndex = 0;

    steps.forEach((stepEl, index) => {
      const rect = stepEl.getBoundingClientRect();
      if (trigger >= rect.top) {
        nextIndex = index;
      }
    });

    const activeStepEl = steps[nextIndex];
    const rect = activeStepEl.getBoundingClientRect();
    const progress = quantizeProgress(trigger - rect.top, rect.height, threshold);

    if (nextIndex !== activeIndex) {
      activeIndex = nextIndex;
      visController.update(buildStepUpdatePayload(section, nextIndex));
    }

    setActiveStepState(steps, nextIndex, progress);
    visController.updateProgress?.({
      index: nextIndex,
      progress,
      step: section.copy.steps[nextIndex] ?? null,
    });
  }

  update();

  return {
    update,
    destroy() {
      steps.forEach((stepEl) => {
        stepEl.style.removeProperty("--scrolly-step-progress");
      });
    },
  };
}

export function createHorizontalScrollyController({
  section,
  steps,
  strip = null,
  narrativeCards = [],
  visController,
  buildStepUpdatePayload,
}) {
  if (!steps.length || !visController?.update) {
    return null;
  }

  const stepCount = steps.length;
  let activeIndex = -1;
  let hasBootstrapped = false;

  function update(panelProgress) {
    const clamped = clamp(panelProgress);
    const stripViewport = strip?.parentElement ?? null;

    if (strip && narrativeCards.length > 1) {
      const referenceCard = narrativeCards[0];
      const cardWidth = referenceCard?.getBoundingClientRect().width ?? 0;
      const computed = getComputedStyle(strip);
      const gap = Number.parseFloat(computed.columnGap || computed.gap || "0") || 0;
      const cardSpan = cardWidth + gap;
      const maxShift = Math.max(0, (narrativeCards.length - 1) * cardSpan);
      strip.style.transform = `translate3d(${-clamped * maxShift}px, 0, 0)`;
    }

    const triggerLeft = stripViewport?.getBoundingClientRect().left ?? 0;

    let activeNarrativeIndex = 0;
    narrativeCards.forEach((cardEl, index) => {
      if (cardEl.getBoundingClientRect().left <= triggerLeft + 1) {
        activeNarrativeIndex = index;
      }
    });
    setActiveNarrativeCardState(narrativeCards, activeNarrativeIndex);

    let nextIndex = 0;
    steps.forEach((stepEl, index) => {
      if (stepEl.getBoundingClientRect().left <= triggerLeft + 1) {
        nextIndex = index;
      }
    });

    const activeStepEl = steps[nextIndex];
    const rect = activeStepEl?.getBoundingClientRect();
    const progress = rect ? clamp((triggerLeft - rect.left) / Math.max(rect.width, 1)) : 0;

    if (!hasBootstrapped || nextIndex !== activeIndex) {
      activeIndex = nextIndex;
      visController.update(buildStepUpdatePayload(section, nextIndex));
      hasBootstrapped = true;
    }

    const activeStepIndexForUi = activeNarrativeIndex === 0 ? -1 : nextIndex;
    setActiveStepState(steps, activeStepIndexForUi, progress);

    visController.updateProgress?.({
      index: nextIndex,
      progress,
      step: section.copy.steps[nextIndex] ?? null,
    });
  }

  update(0);

  return {
    update,
    destroy() {
      if (strip) {
        strip.style.removeProperty("transform");
      }
      steps.forEach((stepEl) => {
        stepEl.style.removeProperty("--scrolly-step-progress");
      });
    },
  };
}
