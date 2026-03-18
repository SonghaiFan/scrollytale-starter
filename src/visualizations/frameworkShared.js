import * as aq from "arquero";
import * as d3 from "d3";

import aaplUrl from "@observablehq/sample-datasets/aapl.csv?url";
import alphabetUrl from "@observablehq/sample-datasets/alphabet.csv?url";
import carsUrl from "@observablehq/sample-datasets/cars.csv?url";
import citywagesUrl from "@observablehq/sample-datasets/citywages.csv?url";
import diamondsUrl from "@observablehq/sample-datasets/diamonds.csv?url";
import flareUrl from "@observablehq/sample-datasets/flare.csv?url";
import industriesUrl from "@observablehq/sample-datasets/industries.csv?url";
import miserablesUrl from "@observablehq/sample-datasets/miserables.json?url";
import olympiansUrl from "@observablehq/sample-datasets/olympians.csv?url";
import penguinsUrl from "@observablehq/sample-datasets/penguins.csv?url";
import pizzaUrl from "@observablehq/sample-datasets/pizza.csv?url";
import weatherUrl from "@observablehq/sample-datasets/weather.csv?url";

const SAMPLE_ENTRIES = [
  ["aapl", aaplUrl, "csv"],
  ["alphabet", alphabetUrl, "csv"],
  ["cars", carsUrl, "csv"],
  ["citywages", citywagesUrl, "csv"],
  ["diamonds", diamondsUrl, "csv"],
  ["flare", flareUrl, "csv"],
  ["industries", industriesUrl, "csv"],
  ["miserables", miserablesUrl, "json"],
  ["olympians", olympiansUrl, "csv"],
  ["penguins", penguinsUrl, "csv"],
  ["pizza", pizzaUrl, "csv"],
  ["weather", weatherUrl, "csv"],
];

let plotModulePromise = null;
let vegaEmbedModulePromise = null;
let samplesPromise = null;

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
