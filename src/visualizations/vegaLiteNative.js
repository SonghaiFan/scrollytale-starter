import { getChartTheme } from "./shared.js";
import {
  aq,
  d3,
  evaluateJsonOrExpression,
  getFrameworkDimensions,
  getFrameworkUpdatePayload,
  loadSamples,
  loadVegaEmbedModule,
  renderFrameworkError,
} from "./frameworkShared.js";

function resolveVegaLiteSource(section, step) {
  if (step?.vis?.type === "vega-lite" && step.vis.source) {
    return step.vis.source;
  }

  return section.vis.options?.source ?? "";
}

export function renderVegaLiteNative({ container, section, data, sources = {} }) {
  let currentIndex = 0;
  let currentStep = null;
  let renderToken = 0;
  let currentEmbed = null;

  async function draw(payload) {
    const next = getFrameworkUpdatePayload(payload);
    const dimensions = getFrameworkDimensions(container);
    const theme = getChartTheme();
    const source = resolveVegaLiteSource(section, next.step);
    const token = ++renderToken;

    currentIndex = next.index;
    currentStep = next.step;

    currentEmbed?.finalize?.();
    currentEmbed = null;

    if (!source) {
      renderFrameworkError(container, "No Vega-Lite code block was found for this section or step.");
      return;
    }

    const host = document.createElement("div");
    host.className = "chart-svg chart-vega-lite";
    host.style.width = "100%";
    host.style.height = "100%";
    host.style.background = theme.surface;
    container.replaceChildren(host);

    try {
      const [{ default: embed }, samples] = await Promise.all([loadVegaEmbedModule(), loadSamples()]);
      if (token !== renderToken) {
        return;
      }

      const spec = evaluateJsonOrExpression(source, {
        aq,
        d3,
        data,
        sources,
        samples,
        step: next.step,
        section,
        dimensions,
      });

      if (!spec || typeof spec !== "object") {
        throw new Error("Vega-Lite block must return a spec object or valid JSON.");
      }

      const normalizedSpec = {
        ...spec,
        width: spec.width ?? Math.max(160, dimensions.width - dimensions.margin.left - dimensions.margin.right),
        height:
          spec.height ?? Math.max(160, dimensions.height - dimensions.margin.top - dimensions.margin.bottom),
        data:
          spec.data ??
          (Array.isArray(data) && data.length
            ? { values: data }
            : undefined),
      };

      const result = await embed(host, normalizedSpec, {
        actions: false,
        renderer: "svg",
      });

      if (token !== renderToken) {
        result.finalize?.();
        return;
      }

      currentEmbed = result;
    } catch (error) {
      renderFrameworkError(
        container,
        error instanceof Error ? error.message : "Unknown Vega-Lite execution error."
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
      currentEmbed?.finalize?.();
      currentEmbed = null;
    },
  };
}
