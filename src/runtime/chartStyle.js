import { chartStylePresets } from "visdelta/chart-style";

const presets = Object.keys(chartStylePresets);
const finiteFields = (value, fields) => value && fields.every(key => Number.isFinite(value[key]));

// Accept VisDelta's resolved module, rather than inventing a second style config.
export function resolveChartStyle(value) {
  if (value === undefined) return undefined;
  if (typeof value === "string") {
    if (Object.hasOwn(chartStylePresets, value)) return chartStylePresets[value];
    throw new Error(`Unknown Scrolly chartStyle "${value}". Choose ${presets.join(", ")}, or use defineChartStyle(...) from visdelta/chart-style.`);
  }
  if (
    value && typeof value === "object" && !Array.isArray(value) &&
    typeof value.key === "string" && value.key.trim() &&
    finiteFields(value.tickSpacing, ["x", "y"]) && value.tickSpacing.x > 0 && value.tickSpacing.y > 0 &&
    finiteFields(value.edgeTitleInset, ["top", "right", "bottom", "left"]) &&
    finiteFields(value.legendInset, ["top", "left"]) &&
    ["top", "right"].includes(value.legendPosition) &&
    value.plot && typeof value.plot === "object" && !Array.isArray(value.plot) &&
    typeof value.axisTitle === "function"
  ) return value;
  throw new Error("Scrolly chartStyle must be a preset name or a native defineChartStyle(...) module from visdelta/chart-style.");
}
