import { line, bar, point, unit } from "visdelta";

// Illustrative index values, not a source of housing market statistics.
export const rows = [
  [2019, 92, 72, 58],
  [2020, 97, 78, 63],
  [2021, 104, 85, 69],
  [2022, 109, 91, 74],
].flatMap(([year, inner, middle, outer]) => [
  { id: `inner-${year}`, year, region: "Inner", value: inner },
  { id: `middle-${year}`, year, region: "Middle", value: middle },
  { id: `outer-${year}`, year, region: "Outer", value: outer },
]);
const palette = ["#2155e8", "#159c75", "#e98a37"];
export const housingChart = line(rows)
  .datumKey("id")
  .x("year", {
    type: "ordinal",
    domain: [2019, 2020, 2021, 2022],
    label: "Year",
  })
  .y("value", { domain: [0, 120], label: "Illustrative housing index" })
  .key(["year", "region"])
  .breakdown("region")
  .color("region", { range: palette });
const latest = rows.filter((row) => row.year === 2022);
export const barChart = bar(latest)
  .datumKey("id")
  .x("region")
  .y("value", { domain: [0, 120] })
  .key("region")
  .color("region", { range: palette });
export const pointChart = point(rows)
  .datumKey("id")
  .key("id")
  .x("year", {
    type: "ordinal",
    domain: [2019, 2020, 2021, 2022],
    label: "Year",
  })
  .y("value", { domain: [0, 120] })
  .color("region", { range: palette });
const households = Array.from({ length: 36 }, (_, index) => ({
  id: `household-${index}`,
  region: ["Inner", "Middle", "Outer"][Math.floor(index / 12)],
  count: 1,
}));
export const unitChart = unit(households)
  .datumKey("id")
  .key("id")
  .value("count", { unitValue: 1 })
  .group("region")
  .layout("grid", { columns: 9 })
  .color("region", { range: palette });
