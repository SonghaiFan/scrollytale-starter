import MarkdownIt from "markdown-it";
import {
  cleanupScrollyDebug,
  createHorizontalScrollyController,
  createVerticalScrollyController,
  renderScrollyDebug,
} from "./scrollyEngine.js";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

function groupSectionsByFlow(sections) {
  const groups = [];

  sections.forEach((section) => {
    const flow = section.chapter?.flow ?? "vertical";
    const previous = groups[groups.length - 1];

    if (previous && previous.flow === flow) {
      previous.sections.push(section);
      return;
    }

    groups.push({ flow, sections: [section] });
  });

  return groups;
}

function buildStepUpdatePayload(section, index) {
  return {
    index,
    step: section.copy.steps[index] ?? null,
    steps: section.copy.steps,
  };
}


function applyViewportSizing(app) {
  const appWidth = Math.max(320, Math.round(app.getBoundingClientRect().width || window.innerWidth));
  const stepH = Math.floor(window.innerHeight * 0.95);
  const figureHeight = window.innerHeight * 0.9;
  const figureMarginTop = (window.innerHeight - figureHeight) / 4;
  const horizontalFigureHeight = Math.floor(window.innerHeight * 0.7);
  const horizontalTextHeight = Math.floor(window.innerHeight * 0.3);
  const horizontalStepWidth = Math.floor(appWidth * 0.95);

  app.style.setProperty("--scrollytale-panel-width", `${appWidth}px`);
  document.documentElement.style.setProperty("--scrollytale-panel-width", `${appWidth}px`);
  app.style.setProperty("--scrollytale-step-gap", `${stepH}px`);
  app.style.setProperty("--scrollytale-figure-height", `${figureHeight}px`);
  app.style.setProperty("--scrollytale-figure-top", `${figureMarginTop}px`);
  app.style.setProperty("--scrollytale-chapter-height", `${stepH}px`);
  app.style.setProperty("--scrollytale-horizontal-figure-height", `${horizontalFigureHeight}px`);
  app.style.setProperty("--scrollytale-horizontal-text-height", `${horizontalTextHeight}px`);
  app.style.setProperty("--scrollytale-horizontal-step-width", `${horizontalStepWidth}px`);
  document.documentElement.style.setProperty(
    "--scrollytale-horizontal-step-width",
    `${horizontalStepWidth}px`
  );
}

function buildHorizontalGroupElement() {
  const element = document.createElement("section");
  element.className = "flow-group flow-group-horizontal";
  element.innerHTML = `
    <div class="flow-group-horizontal-sticky">
      <div class="flow-group-horizontal-track"></div>
    </div>
  `;

  return {
    element,
    track: element.querySelector(".flow-group-horizontal-track"),
  };
}

function updateHorizontalGroups(horizontalGroups) {
  const viewportHeight = window.innerHeight;
  const panelWidth = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--scrollytale-panel-width")
  ) || window.innerWidth;

  horizontalGroups.forEach((group) => {
    const panels = group.sections.length;
    const maxShift = Math.max(0, (panels - 1) * panelWidth);
    const start = group.element.offsetTop;
    const distance = Math.max(viewportHeight, panels * viewportHeight - viewportHeight);
    const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));

    group.track.style.width = `${panels * panelWidth}px`;
    group.track.style.transform = `translate3d(${-progress * maxShift}px, 0, 0)`;
    group.element.style.minHeight = `${panels * viewportHeight}px`;

    group.scrollyControllers?.forEach((controller, index) => {
      if (!controller) {
        return;
      }

      const panelProgress = Math.min(1, Math.max(0, progress * panels - index));
      controller.update(panelProgress);
    });
  });
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
  cleanupScrollyDebug(app);
  applyViewportSizing(app);
  if (debug) {
    renderScrollyDebug(app, scrollamaConfig?.offset ?? 0.55);
  }

  app.innerHTML = `
    <main class="app-shell">
      <div class="story-root"></div>
    </main>
  `;

  const storyRoot = app.querySelector(".story-root");
  const sectionElements = [];
  const verticalScrollyControllers = [];
  const horizontalGroups = [];
  const resizeHandler = () => {
    applyViewportSizing(app);
    verticalScrollyControllers.forEach((controller) => controller?.update?.());
    updateHorizontalGroups(horizontalGroups);
    if (debug) {
      renderScrollyDebug(app, scrollamaConfig?.offset ?? 0.55);
    }
  };
  const scrollHandler = () => {
    verticalScrollyControllers.forEach((controller) => controller?.update?.());
    updateHorizontalGroups(horizontalGroups);
  };

  function renderSection(section, mountTarget, options = {}) {
    const renderLayout = layouts[section.layout];
    const sectionResult = renderLayout({
      section,
      markdown: md,
    });

    sectionResult.element.dataset.flow = section.chapter?.flow ?? "vertical";
    if (section.chapter?.isAnchor) {
      sectionResult.element.dataset.chapterAnchor = "true";
    }
    if (options.horizontalPanel) {
      sectionResult.element.classList.add("horizontal-flow-panel");
      sectionResult.element.dataset.horizontalIndex = String(options.horizontalIndex ?? 0);
    }

    sectionResult.steps.forEach((stepEl, index) => {
      stepEl.id = `${section.id}-step-${index + 1}`;
    });

    mountTarget.append(sectionResult.element);
    sectionElements.push(sectionResult.element);

    if (!sectionResult.figure) {
      return null;
    }

    const renderVis = visualizations[section.vis.type];
    const sectionData = section.vis.data.source ? sources[section.vis.data.source] ?? [] : [];
    const visController = renderVis({
      container: sectionResult.figure,
      section,
      data: sectionData,
    });

    if (section.layout.startsWith("scrolly") && !options.horizontalPanel) {
      const controller = createVerticalScrollyController({
        section,
        steps: sectionResult.steps,
        visController,
        buildStepUpdatePayload,
        offset: scrollamaConfig?.offset ?? 0.55,
        threshold: scrollamaConfig?.threshold ?? 4,
      });
      if (controller) {
        verticalScrollyControllers.push(controller);
      }
    } else if (visController?.update) {
      visController.update(buildStepUpdatePayload(section, 0));
    }

    if (section.layout.startsWith("scrolly") && options.horizontalPanel) {
      return createHorizontalScrollyController({
        section,
        steps: sectionResult.steps,
        strip: sectionResult.strip ?? null,
        narrativeCards: sectionResult.narrativeCards ?? [],
        visController,
        buildStepUpdatePayload,
      });
    }

    return null;
  }

  groupSectionsByFlow(story.sections).forEach((group) => {
    if (group.flow === "horizontal") {
      const horizontalGroup = buildHorizontalGroupElement();
      storyRoot.append(horizontalGroup.element);

      const scrollyControllers = [];

      group.sections.forEach((section, index) => {
        const controller = renderSection(section, horizontalGroup.track, {
          horizontalPanel: true,
          horizontalIndex: index,
        });
        scrollyControllers.push(controller);
      });

      horizontalGroups.push({
        ...horizontalGroup,
        sections: group.sections,
        scrollyControllers,
      });
      return;
    }

    group.sections.forEach((section) => {
      renderSection(section, storyRoot);
    });
  });

  window.addEventListener("resize", resizeHandler);
  window.addEventListener("scroll", scrollHandler, { passive: true });
  updateHorizontalGroups(horizontalGroups);

  return {
    sectionElements,
    destroy() {
      sectionElements.forEach((sectionEl) => {
        sectionEl.__scrollytaleScroller?.destroy?.();
      });
      verticalScrollyControllers.forEach((controller) => controller?.destroy?.());
      horizontalGroups.forEach((group) => {
        group.scrollyControllers?.forEach((controller) => controller?.destroy?.());
      });
      cleanupScrollyDebug(app);
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("scroll", scrollHandler);
    },
  };
}
