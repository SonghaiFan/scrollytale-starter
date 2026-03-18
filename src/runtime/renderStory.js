import MarkdownIt from "markdown-it";
import scrollama from "scrollama";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

function cleanupScrollamaDebug() {
  document.querySelectorAll(".scrollama__debug-step").forEach((node) => node.remove());
}

function buildStepUpdatePayload(section, index) {
  return {
    index,
    step: section.copy.steps[index] ?? null,
    steps: section.copy.steps,
  };
}

function setupScrolly(section, sectionEl, steps, visController, debug, scrollamaConfig) {
  if (!steps.length || !visController?.update) {
    return;
  }

  const scroller = scrollama();
  const offset = Number(scrollamaConfig?.offset);
  const threshold = Number(scrollamaConfig?.threshold);

  scroller
    .setup({
      step: `#${CSS.escape(sectionEl.id)} .step`,
      offset: Number.isFinite(offset) ? offset : 0.55,
      progress: true,
      threshold: Number.isFinite(threshold) ? Math.max(1, Math.round(threshold)) : 4,
      once: false,
      debug,
    })
    .onStepEnter(({ element, index }) => {
      steps.forEach((stepEl) => stepEl.classList.remove("is-active"));
      element.classList.add("is-active");
      visController.update(buildStepUpdatePayload(section, index));
    })
    .onStepProgress(({ element, index, progress: stepProgress }) => {
      element.style.setProperty("--scrolly-step-progress", String(stepProgress));
      visController.updateProgress?.({
        index,
        progress: stepProgress,
        step: section.copy.steps[index] ?? null,
      });
    });

  visController.update(buildStepUpdatePayload(section, 0));

  sectionEl.__scrollytaleScroller = scroller;
}

function applyViewportSizing(app) {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const stepH = Math.max(360, Math.floor(viewportHeight * 0.95));
  const figureHeight = Math.max(320, Math.floor(viewportHeight * 0.9));
  const figureMarginTop = Math.max(16, (viewportHeight - figureHeight) / 4);

  app.style.setProperty("--scrollytale-step-gap", `${stepH}px`);
  app.style.setProperty("--scrollytale-figure-height", `${figureHeight}px`);
  app.style.setProperty("--scrollytale-figure-top", `${figureMarginTop}px`);
  app.style.setProperty("--scrollytale-chapter-height", `${stepH}px`);
}

export function renderStory({
  app,
  story,
  sources,
  layouts,
  visualizations,
  debug = false,
  scrollama: scrollamaConfig = {},
}) {
  cleanupScrollamaDebug();
  applyViewportSizing(app);

  app.innerHTML = `
    <main class="app-shell">
      <div class="story-root"></div>
    </main>
  `;

  const storyRoot = app.querySelector(".story-root");
  const sectionElements = [];
  const sectionControllers = [];
  let resizeFrame = 0;

  const runResize = () => {
    applyViewportSizing(app);
    sectionControllers.forEach(({ sectionEl }) => {
      sectionEl.__scrollytaleScroller?.resize?.();
    });
    sectionControllers.forEach(({ visController }) => {
      visController?.resize?.();
    });
  };

  const resizeHandler = () => {
    if (resizeFrame) {
      window.cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = 0;
      runResize();
    });
  };

  story.sections.forEach((section) => {
    const renderLayout = layouts[section.layout];
    const sectionResult = renderLayout({
      section,
      markdown: md,
    });

    sectionResult.steps.forEach((stepEl, index) => {
      stepEl.id = `${section.id}-step-${index + 1}`;
    });

    storyRoot.append(sectionResult.element);
    sectionElements.push(sectionResult.element);

    if (!sectionResult.figure) {
      return;
    }

    const renderVis = visualizations[section.vis.type];
    const sectionData = section.vis.data.source ? sources[section.vis.data.source] ?? [] : [];
    const visController = renderVis({
      container: sectionResult.figure,
      section,
      data: sectionData,
      sources,
    });
    sectionControllers.push({
      sectionEl: sectionResult.element,
      visController,
    });

    if (section.layout.startsWith("scrolly")) {
      setupScrolly(
        section,
        sectionResult.element,
        sectionResult.steps,
        visController,
        debug,
        scrollamaConfig
      );
    } else if (visController?.update) {
      visController.update(buildStepUpdatePayload(section, 0));
    }
  });

  window.addEventListener("resize", resizeHandler);

  return {
    sectionElements,
    destroy() {
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }
      sectionElements.forEach((sectionEl) => {
        sectionEl.__scrollytaleScroller?.destroy?.();
      });
      sectionControllers.forEach(({ visController }) => {
        visController?.destroy?.();
      });
      cleanupScrollamaDebug();
      window.removeEventListener("resize", resizeHandler);
    },
  };
}
