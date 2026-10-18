import React, {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as initialDocument from "../../story.mdx";
import { Editor } from "./Editor.jsx";
const Story = initialDocument.default;

class PreviewBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      const Previous = this.props.previous;
      return (
        <>
          <div className="preview-error" role="alert">
            <strong>The draft could not render.</strong>
            <pre>{this.state.error.message}</pre>
            <p>The previous working document is shown below.</p>
          </div>
          <Previous />
        </>
      );
    }
    return this.props.children;
  }
}
function CommitPreview({ Content, metadata, onCommit }) {
  useEffect(() => {
    onCommit(Content);
    document.title = metadata?.title || "Scrollytale";
  }, [Content, metadata, onCommit]);
  return <Content />;
}
function readTheme() {
  try {
    return (
      localStorage.getItem("scrollytale:theme") ??
      (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    );
  } catch {
    return "light";
  }
}
export function App() {
  const [authoring, setAuthoring] = useState(
    location.pathname.endsWith("/authoring"),
  );
  const [theme, setTheme] = useState(readTheme);
  const [preview, setPreview] = useState({
    Content: Story,
    metadata: initialDocument.meta,
    revision: 0,
  });
  const previous = useRef(Story);
  const [diskError, setDiskError] = useState("");
  const diskPending = useRef(false);
  const commit = useCallback((Content) => {
    previous.current = Content;
  }, []);
  const showPreview = useCallback((module) => {
    setPreview((current) => ({
      Content: module.default,
      metadata: module.meta,
      revision: current.revision + 1,
    }));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("scrollytale:theme", theme);
    } catch {
      /* A disabled storage area does not prevent reading. */
    }
    window.dispatchEvent(new Event("scrollytale:theme"));
  }, [theme]);
  useEffect(() => {
    const route = () => setAuthoring(location.pathname.endsWith("/authoring"));
    window.addEventListener("popstate", route);
    return () => window.removeEventListener("popstate", route);
  }, []);
  useEffect(() => {
    if (!import.meta.hot) return;
    let current = true;
    let revision = 0;
    const changed = async () => {
      diskPending.current = true;
      if (authoring) return;
      const token = ++revision;
      try {
        const sourceResponse = await fetch("/__authoring/source");
        const { source } = await sourceResponse.json();
        const response = await fetch("/__authoring/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!current || token !== revision) return;
        const module = await import(/* @vite-ignore */ result.url);
        if (current && token === revision) {
          showPreview(module);
          diskPending.current = false;
          setDiskError("");
        }
      } catch (error) {
        if (current && token === revision) setDiskError(error.message);
      }
    };
    import.meta.hot.on("scrollytale:source-changed", changed);
    if (!authoring && diskPending.current) changed();
    return () => {
      current = false;
      import.meta.hot.off("scrollytale:source-changed", changed);
    };
  }, [authoring, showPreview]);
  function toggleAuthoring(event) {
    event.preventDefault();
    const next = !authoring;
    history.pushState({}, "", next ? "/authoring" : "/");
    setAuthoring(next);
  }
  return (
    <>
      <a className="skip-link" href="#story">
        Skip to story
      </a>
      <nav className="app-nav" aria-label="Story tools">
        <a
          href="/"
          className="wordmark"
          onClick={(event) => {
            if (authoring) toggleAuthoring(event);
          }}
        >
          scrollytale<span>↘</span>
        </a>
        <div>
          <span className="nav-caption">MDX × VisDelta</span>
          {import.meta.env.DEV ? (
            <a
              className="mode-link"
              href={authoring ? "/" : "/authoring"}
              onClick={toggleAuthoring}
            >
              {authoring ? "Read story" : "Edit story"}
            </a>
          ) : null}
          <button
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
            aria-label="Toggle theme"
          >
            {theme === "light" ? "Dark ◐" : "Light ◑"}
          </button>
        </div>
      </nav>
      <div
        className={`workspace${authoring && import.meta.env.DEV ? " is-authoring" : ""}`}
      >
        {import.meta.env.DEV ? (
          <Editor onPreview={showPreview} hidden={!authoring} />
        ) : null}
        <main id="story" className="story-document">
          {diskError ? (
            <div className="preview-error" role="alert">
              {diskError}
            </div>
          ) : null}
          <PreviewBoundary key={preview.revision} previous={previous.current}>
            <CommitPreview
              Content={preview.Content}
              metadata={preview.metadata}
              onCommit={commit}
            />
          </PreviewBoundary>
          <footer className="page-footer">
            <span>Scrollytale</span>
            <span>Written in MDX. Drawn by VisDelta.</span>
            <a href="#story">Back to top ↑</a>
          </footer>
        </main>
      </div>
    </>
  );
}
