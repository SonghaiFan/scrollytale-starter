import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Overview from "./index.md";
import Authoring from "./authoring.md";
import Reference from "./reference.md";
import Architecture from "./architecture.md";
import "./styles.css";
const pages = {
  overview: Overview,
  authoring: Authoring,
  reference: Reference,
  architecture: Architecture,
};
const labels = {
  overview: "Start here",
  authoring: "Authoring",
  reference: "Component API",
  architecture: "Architecture & verification",
};
function Link({ href, children, ...props }) {
  const local = href?.match(/^\.\/([\w-]+)\.md$/);
  return (
    <a
      {...props}
      href={local ? `#${local[1] === "index" ? "overview" : local[1]}` : href}
    >
      {children}
    </a>
  );
}
const components = { a: Link };
function App() {
  const [page, setPage] = useState(location.hash.slice(1) || "overview");
  useEffect(() => {
    const change = () => {
      setPage(location.hash.slice(1) || "overview");
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const Content = pages[page];
  return (
    <>
      <header>
        <a className="wordmark" href="#overview">
          scrollytale ↘
        </a>
        <span>Documentation · MDX × VisDelta</span>
        <a href="https://github.com/SonghaiFan/scrollytale-starter">GitHub</a>
      </header>
      <div className="docs-layout">
        <nav aria-label="Documentation">
          {Object.entries(labels).map(([key, label]) => (
            <a
              key={key}
              href={`#${key}`}
              aria-current={page === key ? "page" : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <main>
          {Content ? (
            <Content components={components} />
          ) : (
            <>
              <h1>Page not found</h1>
              <a href="#overview">Start here</a>
            </>
          )}
        </main>
      </div>
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
