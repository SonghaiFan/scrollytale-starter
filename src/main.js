import "./styles/base.css";
import "./styles/layout.css";
import "./styles/scrolly.css";
import "./styles/custom.css";

import storySource from "../story.md?raw";
import { loadSources } from "./runtime/loadSources.js";
import { normalizeStory } from "./runtime/normalizeStory.js";
import { parseStory } from "./runtime/parseStory.js";
import { renderStory } from "./runtime/renderStory.js";
import { registerLayouts } from "./runtime/registerLayouts.js";
import { registerVisualizations } from "./runtime/registerVisualizations.js";

async function boot() {
  const parsed = parseStory(storySource);
  const story = normalizeStory(parsed);
  const sources = await loadSources(story.data?.sources ?? []);
  const app = document.querySelector("#app");

  renderStory({
    app,
    story,
    sources,
    layouts: registerLayouts(),
    visualizations: registerVisualizations(),
  });

  if (story.warnings.length) {
    console.warn("Story normalization warnings:", story.warnings);
  }
}

boot().catch((error) => {
  const app = document.querySelector("#app");
  console.error(error);

  if (app) {
    app.innerHTML = `
      <main class="app-shell">
        <section class="section-shell section-full-width">
          <div class="section-copy">
            <p class="eyebrow">Runtime error</p>
            <h1>Scrollytale starter could not boot.</h1>
            <pre class="error-block">${error.message}</pre>
          </div>
        </section>
      </main>
    `;
  }
});

