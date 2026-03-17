import { renderBarChart } from "../visualizations/bar.js";
import { renderHtmlContainer } from "../visualizations/html.js";
import { renderLineChart } from "../visualizations/line.js";
import { renderScatterChart } from "../visualizations/scatter.js";
import { renderUnitChart } from "../visualizations/unit.js";

export function registerVisualizations() {
  return {
    html: renderHtmlContainer,
    bar: renderBarChart,
    line: renderLineChart,
    scatter: renderScatterChart,
    unit: renderUnitChart,
  };
}
