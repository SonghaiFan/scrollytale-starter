import * as d3 from "d3";
import { createSeriesColorScale } from "./shared.js";

function getDimensions(container) {
  const bounds = container.getBoundingClientRect();
  return {
    width: Math.max(bounds.width, 320),
  };
}

function getUpdatePayload(payload) {
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

function resolveFocusKeys(step, groupedKeys) {
  const focusValue = step?.focus;
  if (typeof focusValue !== "string" || !focusValue.trim()) {
    return groupedKeys;
  }

  const tokens = focusValue
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  if (!tokens.length || tokens.some((token) => /^(all|\*)$/i.test(token))) {
    return groupedKeys;
  }

  const matches = tokens
    .map((token) => {
      const lowered = token.toLowerCase();
      return groupedKeys.find((key) => String(key).toLowerCase() === lowered);
    })
    .filter(Boolean);

  return matches.length ? matches : groupedKeys;
}

function computeColumns(width, total) {
  if (width < 480) return Math.min(6, total);
  if (width < 720) return Math.min(8, total);
  if (width < 1024) return Math.min(10, total);
  return Math.min(12, total);
}

export function renderUnitChart({ container, section, data }) {
  const colorField = section.vis.fields.color;
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = `<div class="figure-card">Unit chart needs row-level data.</div>`;
    return { update() {} };
  }

  const limited = data.slice(0, 160).map((row, index) => ({
    ...row,
    __id: row.id ?? index + 1,
    __group: row[colorField] ?? "default",
  }));
  const groupKeys = [...new Set(limited.map((row) => row.__group))];
  const colors = createSeriesColorScale(groupKeys);
  const grid = document.createElement("div");
  grid.className = "unit-grid-chart";
  container.append(grid);

  let currentIndex = 0;
  let currentStep = null;

  function draw(activeIndex = 0, activeStep = null) {
    const { width } = getDimensions(container);
    const columns = computeColumns(width, limited.length);
    const activeCount = Math.max(
      1,
      Math.ceil(((activeIndex + 1) / Math.max(section.copy.steps.length, 1)) * limited.length)
    );
    const activeGroups = new Set(resolveFocusKeys(activeStep, groupKeys));

    grid.style.setProperty("--unit-grid-columns", String(columns));

    d3.select(grid)
      .selectAll("div.unit-grid-item")
      .data(limited, (d) => d.__id)
      .join((enter) =>
        enter
          .append("div")
          .attr("class", "unit-grid-item")
          .append("div")
          .attr("class", "unit-grid-block")
          .selection()
          .select(function () {
            return this.parentNode;
          })
      )
      .style("opacity", (d, index) => {
        if (index >= activeCount) {
          return "0.08";
        }
        return activeGroups.has(d.__group) ? "1" : "0.18";
      })
      .style("--unit-block-fill", (d) => colors(d.__group));
  }

  draw(0, null);
  window.addEventListener("resize", () => draw(currentIndex, currentStep));

  return {
    update(payload) {
      const next = getUpdatePayload(payload);
      currentIndex = next.index;
      currentStep = next.step;
      draw(next.index, next.step);
    },
  };
}
