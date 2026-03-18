import { renderBarChart } from "../visualizations/bar.js";
import { renderHtmlContainer } from "../visualizations/html.js";
import { renderLineChart } from "../visualizations/line.js";
import { renderPlotNative } from "../visualizations/plotNative.js";
import { renderScatterChart } from "../visualizations/scatter.js";
import { renderUnitChart } from "../visualizations/unit.js";
import { renderVegaLiteNative } from "../visualizations/vegaLiteNative.js";

export function registerVisualizations() {
  return {
    html: renderHtmlContainer,
    bar: renderBarChart,
    line: renderLineChart,
    plot: renderPlotNative,
    scatter: renderScatterChart,
    unit: renderUnitChart,
    "vega-lite": renderVegaLiteNative,
  };
}
