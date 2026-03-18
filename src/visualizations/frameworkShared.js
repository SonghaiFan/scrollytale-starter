import * as aq from "arquero";
import * as d3 from "d3";

let plotModulePromise = null;
let vegaEmbedModulePromise = null;

export function getFrameworkDimensions(container) {
  const bounds = container.getBoundingClientRect();
  return {
    width: Math.max(bounds.width, 320),
    height: Math.max(bounds.height, 360),
    margin: { top: 24, right: 24, bottom: 48, left: 64 },
  };
}

export function getFrameworkUpdatePayload(payload) {
  if (typeof payload === "number") {
    return {
      index: payload,
      step: null,
    };
  }

  return {
    index: Number(payload?.index) || 0,
    step: payload?.step ?? null,
  };
}

export function evaluateFrameworkSource(source, scope) {
  const argNames = Object.keys(scope);
  const argValues = Object.values(scope);

  try {
    return new Function(...argNames, `"use strict"; return (${source});`)(...argValues);
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
  }

  return new Function(...argNames, `"use strict"; ${source}`)(...argValues);
}

export function evaluateJsonOrExpression(source, scope) {
  try {
    return JSON.parse(source);
  } catch {
    return evaluateFrameworkSource(source, scope);
  }
}

export function renderFrameworkError(container, message) {
  container.innerHTML = `<div class="figure-card">Framework render error: ${message}</div>`;
}

export function loadPlotModule() {
  if (!plotModulePromise) {
    plotModulePromise = import("@observablehq/plot");
  }

  return plotModulePromise;
}

export function loadVegaEmbedModule() {
  if (!vegaEmbedModulePromise) {
    vegaEmbedModulePromise = import("vega-embed");
  }

  return vegaEmbedModulePromise;
}

export { d3 };
export { aq };
