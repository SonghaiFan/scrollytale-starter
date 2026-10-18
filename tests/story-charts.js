// Expected native endpoints for the advanced example, independent of MDX rendering.
import {
  housingChart,
  barChart,
  pointChart,
  unitChart,
} from "../src/story/housing.js";
export const housingStates = [
  housingChart,
  housingChart.highlight({ region: "Inner" }),
  housingChart.highlight({ region: ["Middle", "Outer"] }),
  housingChart,
];
export const barStates = [
  barChart,
  barChart.highlight({ region: "Inner" }),
  barChart,
];
export const pointStates = [
  pointChart,
  pointChart.highlight({ region: "Outer" }),
  pointChart,
];
export const unitStates = [
  unitChart,
  unitChart.highlight({ region: "Middle" }),
  unitChart,
];
