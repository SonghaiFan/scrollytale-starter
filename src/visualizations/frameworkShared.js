import * as aq from "arquero";
import * as d3 from "d3";

import { readIntVar } from "./shared.js";
import SAMPLE_ENTRIES from "virtual:sample-datasets";

let plotModulePromise = null;
let vegaEmbedModulePromise = null;
let samplesPromise = null;

export function getFrameworkDimensions(container) {
  const bounds = container.getBoundingClientRect();
  // Subtract container padding so the chart never overflows into the gutters.
  const style = getComputedStyle(container);
  const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

  return {
    width:  Math.max(bounds.width  - padX, 320),
    height: Math.max(bounds.height - padY, 360),
    margin: {
      top:    readIntVar("--plot-margin-top",    20),
      right:  readIntVar("--plot-margin-right",  20),
      bottom: readIntVar("--plot-margin-bottom", 44),
      left:   readIntVar("--plot-margin-left",   52),
    },
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

function parseStepSelection(raw, caseSensitive = false) {
  if (raw == null) {
    return null;
  }

  const tokens = String(raw)
    .split(",")
    .map(token => token.trim())
    .filter(Boolean)
    .map(token => (caseSensitive ? token : token.toLowerCase()));

  if (!tokens.length || tokens.some(token => token === "all" || token === "*")) {
    return null;
  }

  return new Set(tokens);
}

function normalizeToken(value, caseSensitive = false) {
  const token = value == null ? "" : String(value);
  return caseSensitive ? token : token.toLowerCase();
}

function getRowValueResolver(field, accessor) {
  if (typeof accessor === "function") {
    return accessor;
  }

  if (typeof field === "function") {
    return field;
  }

  if (typeof field === "string" && field) {
    return row => row?.[field];
  }

  throw new Error("stepUtils requires a field or accessor function.");
}

function resolveSelection(step, intent, options = {}) {
  const { caseSensitive = false, value } = options;
  return parseStepSelection(value ?? step?.[intent], caseSensitive);
}

export function createStepUtils(step) {
  return {
    values(intent = "focus", options = {}) {
      return resolveSelection(step, intent, options);
    },
    focus(rows, options = {}) {
      if (!Array.isArray(rows)) {
        return [];
      }

      const {
        field,
        accessor,
        value,
        caseSensitive = false,
        activeOpacity = 1,
        inactiveOpacity = 0.12,
        opacityField = "__opacity",
      } = options;
      const getRowValue = getRowValueResolver(field, accessor);
      const selected = resolveSelection(step, "focus", { caseSensitive, value });

      return rows.map(row => {
        const key = normalizeToken(getRowValue(row), caseSensitive);
        const isActive = !selected || selected.has(key);
        return {
          ...row,
          [opacityField]: isActive ? activeOpacity : inactiveOpacity,
        };
      });
    },
    filter(rows, options = {}) {
      if (!Array.isArray(rows)) {
        return [];
      }

      const { field, accessor, value, caseSensitive = false } = options;
      const getRowValue = getRowValueResolver(field, accessor);
      const selected = resolveSelection(step, "filter", { caseSensitive, value });

      if (!selected) {
        return rows;
      }

      return rows.filter(row => selected.has(normalizeToken(getRowValue(row), caseSensitive)));
    },
    focusBy(field, rows, options = {}) {
      return this.focus(rows, { ...options, field });
    },
    filterBy(field, rows, options = {}) {
      return this.filter(rows, { ...options, field });
    },
    opacity(opacityField = "__opacity", fallback = 1) {
      return row => row?.[opacityField] ?? fallback;
    },
    opacityChannels(opacityField = "__opacity") {
      return {
        fillOpacity: this.opacity(opacityField),
        strokeOpacity: this.opacity(opacityField),
      };
    },
  };
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

export function loadSamples() {
  if (!samplesPromise) {
    samplesPromise = Promise.all(
      SAMPLE_ENTRIES.map(async ([id, url, type]) => {
        const table =
          type === "json"
            ? await aq.loadJSON(url)
            : await aq.loadCSV(url, { autoType: true });
        return [id, table.objects()];
      })
    ).then(Object.fromEntries);
  }

  return samplesPromise;
}

export function loadVegaEmbedModule() {
  if (!vegaEmbedModulePromise) {
    vegaEmbedModulePromise = import("vega-embed");
  }

  return vegaEmbedModulePromise;
}

export { d3 };
export { aq };
