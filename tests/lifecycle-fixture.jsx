import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { bar } from "visdelta";
import { Scrolly, Step } from "../src/components/story.jsx";

function Parent() {
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
        <span>Revision {revision}</span>
      </div>
      <Scrolly>
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
      <Scrolly>
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
