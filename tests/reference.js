import { chart as starterChart } from "../story.mdx";
import { styleChart, neutralChart, spaciousStyle } from "../src/story/styles.js";
import { resolveChartStyle } from "../src/runtime/chartStyle.js";
import { transition } from "visdelta";
import {
  housingStates,
  barStates,
  pointStates,
  unitStates,
} from "./story-charts.js";
const stories = {
  styles: [styleChart, styleChart.highlight({ region: "North" })],
  neutralStyle: [neutralChart],
  starter: [
    starterChart,
    starterChart.highlight({ region: "North" }),
    starterChart,
  ],
  housing: housingStates,
  ranking: barStates,
  observations: pointStates,
  households: unitStates,
};
export async function staticFrame(id, index, width, height, chartStyle) {
  const mount = document.createElement("div");
  mount.style.cssText = `position:fixed;left:-20000px;top:0;width:${width}px;height:${height}px`;
  document.body.append(mount);
  let controller;
  try {
    const state = stories[id][index];
    controller = await transition(state, state, {
      target: mount,
      chartStyle: resolveChartStyle(chartStyle === "custom" ? spaciousStyle : chartStyle),
      width: "auto",
      height: "auto",
    });
    controller.progress(1);
    return [...mount.querySelectorAll("g,path,circle,rect,line,text")].map(
      (node) => ({
        tag: node.tagName,
        text: node.tagName === "text" ? node.textContent : "",
        attrs: [
          "d",
          "cx",
          "cy",
          "r",
          "x",
          "y",
          "x1",
          "x2",
          "y1",
          "y2",
          "width",
          "height",
          "opacity",
          "stroke",
          "stroke-width",
          "fill",
          "transform",
          "style",
          "stroke-dasharray",
          "stroke-dashoffset",
        ].map((attr) => [attr, node.getAttribute(attr)]),
      }),
    );
  } finally {
    controller?.destroy();
    mount.remove();
  }
}

export { mountLifecycleHarness } from "./lifecycle-fixture.jsx";
