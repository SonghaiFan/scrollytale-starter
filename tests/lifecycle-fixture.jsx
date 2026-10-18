import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { defineChartStyle } from "visdelta/chart-style";
import { spaciousStyle } from "../src/story/styles.js";
import { bar } from "visdelta";
import { Scrolly, Step } from "../src/components/story.jsx";

const brokenStyle = defineChartStyle({ key: "broken", axisTitle() { throw new Error("Style preparation failed"); } });

function Parent() {
  const [chartStyle, setChartStyle] = useState(undefined);
  const [revision, setRevision] = useState(0);
  const [value, setValue] = useState(18);
  const [field, setField] = useState("value");
  // Deliberately reconstruct rows, the builder, highlight and JSX on every render.
  const chart = bar([
    { region: "North", value, other: 6 },
    { region: "South", value: 12, other: 9 },
  ])
    .x("region")
    .y(field);
  return (
    <div className="story-document">
      <div className="fixture-controls">
        <button onClick={() => setRevision((v) => v + 1)}>Render parent</button>
        <button onClick={() => setValue((v) => v + 1)}>Change data</button>
        <button
          onClick={() => setField((v) => (v === "value" ? "other" : "value"))}
        >
          Change field
        </button>
        <button onClick={() => setChartStyle("paper")}>Paper style</button>
        <button onClick={() => setChartStyle("dark")}>Dark style</button>
        <button onClick={() => setChartStyle(spaciousStyle)}>Custom style</button>
        <button onClick={() => setChartStyle(brokenStyle)}>Broken style</button>
        <button onClick={() => setChartStyle(undefined)}>Inherited style</button>
        <span>Revision {revision}</span>
      </div>
      <Scrolly chartStyle={chartStyle}>
        <Step chart={chart}>
          <h2>All regions</h2>
        </Step>
        <Step chart={chart.highlight({ region: "North" })}>
          <h2>North</h2>
        </Step>
        <Step chart={chart}>
          <h2>All again</h2>
        </Step>
      </Scrolly>
      <Scrolly chartStyle={chartStyle}>
        <Step chart={chart}>
          <h2>A single chart</h2>
        </Step>
      </Scrolly>
    </div>
  );
}
export function mountLifecycleHarness() {
  const root = createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <Parent />
    </React.StrictMode>,
  );
  return () => root.unmount();
}
