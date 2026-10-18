import React, {
  Children,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { sequence, transition } from "visdelta";
import { retainChartDeclarations } from "../runtime/chartDeclarations.js";
import { createChartSession } from "../runtime/chartSession.js";
import { positionForScroll, scrollForPosition } from "../runtime/progress.js";

export function Hero({ eyebrow, children }) {
  return (
    <header className="hero">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      {children}
      <span className="scroll-cue">Scroll to explore ↓</span>
    </header>
  );
}
export function Chapter({ id, children }) {
  return (
    <section id={id} className="chapter">
      {children}
    </section>
  );
}
export function Step({ children }) {
  return <>{children}</>;
}

export function Scrolly(props) {
  const {
    id: authoredId,
    title,
    layout = "left",
    hold = 0.45,
    children,
  } = props;
  const generatedId = useId();
  const declarations = useRef(null);
  if ("states" in props)
    throw new Error(
      "Scrolly no longer accepts states. Put a chart on each Step: <Step chart={chart}>…</Step>.",
    );
  const steps = Children.toArray(children);
  if (!steps.length)
    throw new Error("Scrolly needs at least one <Step chart={chart}>…</Step>.");
  const charts = steps.map((step, index) => {
    if (!isValidElement(step) || step.type !== Step)
      throw new Error(
        `Scrolly child ${index + 1} must be a direct <Step chart={chart}>…</Step>.`,
      );
    if (typeof step.props.chart?.toSpec !== "function")
      throw new Error(
        `Step ${index + 1} needs a native VisDelta chart declaration. For example: <Step chart={chart}>Your Markdown</Step>.`,
      );
    return step.props.chart;
  });
  if (!Number.isFinite(hold) || hold < 0 || hold >= 1)
    throw new Error("Scrolly hold must be in [0, 1).");
  if (!["left", "right"].includes(layout))
    throw new Error("Scrolly layout must be left or right.");
  if (
    authoredId !== undefined &&
    (typeof authoredId !== "string" || !authoredId.trim())
  )
    throw new Error("Scrolly id must be a nonempty string when provided.");
  if (title !== undefined && (typeof title !== "string" || !title.trim()))
    throw new Error("Scrolly title must be a nonempty string when provided.");
  const id = authoredId ?? `scrolly-${generatedId.replace(/:/g, "")}`;
  const label = title ?? "Chart story";
  declarations.current = retainChartDeclarations(declarations.current, charts);
  const states = declarations.current.charts;
  const root = useRef(null);
  const chartHost = useRef(null);
  const driver = useRef(null);
  const [status, setStatus] = useState("Preparing chart…");
  const [error, setError] = useState("");
  const [position, setPosition] = useState(0);
  const [active, setActive] = useState(0);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    let frame = 0;
    let anchors = [];
    let measureNeeded = true;
    let destroyed = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const section = root.current;
    const host = chartHost.current;
    const stepElements = [...section.querySelectorAll(".story-step")];
    setError("");
    setStatus("Preparing chart…");
    const session = createChartSession({
      host,
      states,
      sequence,
      transition,
      onReady: () => {
        setStatus("Ready");
        schedule(true);
      },
      onError: (reason) => {
        setError(reason.message);
        setStatus("Chart could not render");
      },
    });
    function measure() {
      const activation =
        section.clientWidth < 700
          ? Math.min(
              window.innerHeight * 0.8,
              section.querySelector(".story-figure").offsetHeight + 100,
            )
          : window.innerHeight * 0.55;
      anchors = stepElements.map((element) =>
        Math.round(
          element.getBoundingClientRect().top + window.scrollY - activation,
        ),
      );
      measureNeeded = false;
    }
    function tick() {
      frame = 0;
      if (destroyed) return;
      if (measureNeeded) measure();
      const raw = positionForScroll(window.scrollY, anchors, hold);
      const value = reduced.matches ? Math.round(raw) : raw;
      session.seek(value);
      setPosition(value);
      let index = 0;
      anchors.forEach((anchor, i) => {
        if (window.scrollY >= anchor - 1) index = i;
      });
      setActive(reduced.matches ? Math.round(raw) : index);
    }
    function schedule(measureAgain = false) {
      if (measureAgain === true) measureNeeded = true;
      if (!frame && !destroyed) frame = requestAnimationFrame(tick);
    }
    function refresh() {
      session.resize();
      schedule(true);
    }
    const observer = new ResizeObserver(refresh);
    observer.observe(host);
    stepElements.forEach((element) => observer.observe(element));
    const onScroll = () => schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("scrollytale:theme", refresh);
    reduced.addEventListener("change", onScroll);
    document.fonts?.ready.then(() => {
      if (!destroyed) refresh();
    });
    setEmbedded(window !== window.parent);
    driver.current = {
      go(value) {
        measure();
        window.scrollTo({
          top: scrollForPosition(value, anchors, hold),
          behavior: "instant",
        });
        schedule();
      },
    };
    schedule(true);
    return () => {
      destroyed = true;
      driver.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scrollytale:theme", refresh);
      reduced.removeEventListener("change", onScroll);
      session.destroy();
    };
  }, [states, hold, layout, id]);

  return (
    <section
      ref={root}
      id={id}
      className={`scrolly layout-${layout}`}
      aria-label={label}
      data-position={position.toFixed(4)}
      data-status={status}
    >
      {title ? (
        <div className="scrolly-heading">
          <h2>{title}</h2>
        </div>
      ) : null}
      <div className="scrolly-grid">
        <figure className="story-figure">
          <div
            ref={chartHost}
            className="chart-host"
            role="group"
            aria-label={label}
          />
          <figcaption>
            <span className="chart-status" role="status">
              {status}
            </span>
            <output>
              {position.toFixed(2)} <span>/ {states.length - 1}</span>
            </output>
          </figcaption>
          {error ? (
            <pre className="error" role="alert">
              {error}
            </pre>
          ) : null}
          <div className="chart-controls">
            <button
              onClick={() => driver.current?.go(0)}
              disabled={status !== "Ready"}
            >
              Back to start ↑
            </button>
            <label>
              Position
              <input
                aria-label={`${label} position`}
                type="range"
                min="0"
                max={states.length - 1}
                step="0.01"
                value={position}
                disabled={status !== "Ready" || states.length === 1}
                onChange={(event) =>
                  driver.current?.go(Number(event.target.value))
                }
              />
            </label>
          </div>
          {embedded ? (
            <p className="embed-note">
              For a full-height embed, open this story in its own window to
              scroll through it.
            </p>
          ) : null}
        </figure>
        <div className="story-steps">
          {steps.map((step, index) => (
            <article
              className="story-step"
              key={step.key ?? index}
              id={`${id}-step-${index + 1}`}
              aria-current={active === index ? "step" : undefined}
            >
              <a
                className="step-number"
                href={`#${id}-step-${index + 1}`}
                onClick={(event) => {
                  event.preventDefault();
                  driver.current?.go(index);
                }}
                aria-label={`Go to step ${index + 1}`}
              >
                {String(index + 1).padStart(2, "0")}
              </a>
              <div className="step-copy">{step.props.children}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
