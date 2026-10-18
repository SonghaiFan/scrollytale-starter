import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import * as documentModule from "virtual:standalone-story";
import "visdelta/style.css";
import "./styles.css";

const Story = documentModule.default;
const metadata = Reflect.get(documentModule, "meta");
function StandaloneReader() {
  const [theme, setTheme] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof metadata?.title === "string") document.title = metadata.title;
    window.dispatchEvent(new Event("scrollytale:theme"));
  }, [theme]);
  return <>
    <a className="skip-link" href="#story">Skip to story</a>
    <nav className="app-nav" aria-label="Story tools">
      <span className="wordmark">scrollytale<span>↘</span></span>
      <button aria-label="Toggle theme" onClick={() => setTheme(current => current === "light" ? "dark" : "light")}>
        {theme === "light" ? "Dark ◐" : "Light ◑"}
      </button>
    </nav>
    <main id="story" className="story-document"><Story /></main>
  </>;
}
createRoot(document.getElementById("root")).render(<StandaloneReader />);
