import { getChartTheme } from "./shared.js";
import {
  aq,
  d3,
  evaluateFrameworkSource,
  getFrameworkDimensions,
  getFrameworkUpdatePayload,
  loadPlotModule,
  renderFrameworkError,
} from "./frameworkShared.js";

function resolvePlotSource(section, step) {
  if (step?.vis?.type === "plot" && step.vis.source) {
    return step.vis.source;
  }

  return section.vis.options?.source ?? "";
}

function buildDefaultPlotOptions(dimensions, theme) {
  return {
    width: dimensions.width,
    height: dimensions.height,
    marginTop: dimensions.margin.top,
    marginRight: dimensions.margin.right,
    marginBottom: dimensions.margin.bottom,
    marginLeft: dimensions.margin.left,
    className: "chart-plot",
    style: {
      background: theme.surface,
      color: theme.ink,
      fontFamily: '"Roboto Mono", ui-monospace, monospace',
      fontSize: "11px",
    },
  };
}

function isElement(value) {
  return value instanceof Element;
}

function isPlotConfig(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function renderPlotNative({ container, section, data }) {
  let currentIndex = 0;
  let currentStep = null;
  let renderToken = 0;

  async function draw(payload) {
    const next = getFrameworkUpdatePayload(payload);
    const dimensions = getFrameworkDimensions(container);
    const theme = getChartTheme();
    const source = resolvePlotSource(section, next.step);
    const token = ++renderToken;

    currentIndex = next.index;
    currentStep = next.step;

    if (!source) {
      renderFrameworkError(container, "No Plot code block was found for this section or step.");
      return;
    }

    try {
      const Plot = await loadPlotModule();
      if (token !== renderToken) {
        return;
      }

      const defaults = buildDefaultPlotOptions(dimensions, theme);
      const result = evaluateFrameworkSource(source, {
        Plot,
        aq,
        d3,
        data,
        step: next.step,
        section,
        dimensions,
      });

      let node;

      if (isElement(result)) {
        node = result;
      } else if (result && typeof result.plot === "function") {
        node = result.plot(defaults);
      } else if (isPlotConfig(result)) {
        node = Plot.plot({
          ...defaults,
          ...result,
          style: {
            ...defaults.style,
            ...(result.style ?? {}),
          },
        });
      } else {
        throw new Error("Plot block must return a Plot mark, Plot config, or DOM node.");
      }

      node.classList.add("chart-svg");
      if (token !== renderToken) {
        return;
      }
      container.replaceChildren(node);
    } catch (error) {
      renderFrameworkError(
        container,
        error instanceof Error ? error.message : "Unknown Plot execution error."
      );
    }
  }

  draw(0);

  return {
    update(payload) {
      void draw(payload);
    },
    resize() {
      void draw({ index: currentIndex, step: currentStep });
    },
    destroy() {
      renderToken += 1;
    },
  };
}
