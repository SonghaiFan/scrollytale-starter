import MarkdownIt from "markdown-it";
import scrollama from "scrollama";

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

function renderHeader(story) {
  return `
    <header class="app-header">
      <p class="eyebrow">scrollytale-starter</p>
      <h1>${story.title}</h1>
    </header>
  `;
}

function setupScrolly(sectionEl, steps, visController) {
  if (!steps.length || !visController?.update) {
    return;
  }

  const scroller = scrollama();

  scroller
    .setup({
      step: `#${CSS.escape(sectionEl.id)} .step`,
      offset: 0.55,
    })
    .onStepEnter(({ element, index }) => {
      steps.forEach((stepEl) => stepEl.classList.remove("is-active"));
      element.classList.add("is-active");
      visController.update(index);
    });

  visController.update(0);

  sectionEl.__scrollytaleScroller = scroller;
}

export function renderStory({ app, story, sources, layouts, visualizations }) {
  app.innerHTML = `
    <main class="app-shell">
      ${renderHeader(story)}
      <div class="story-root"></div>
    </main>
  `;

  const storyRoot = app.querySelector(".story-root");

  story.sections.forEach((section) => {
    const renderLayout = layouts[section.layout];
    const sectionResult = renderLayout({
      section,
      markdown: md,
    });

    storyRoot.append(sectionResult.element);

    const renderVis = visualizations[section.vis.type];
    const sectionData = section.vis.data.source ? sources[section.vis.data.source] ?? [] : [];
    const visController = renderVis({
      container: sectionResult.figure,
      section,
      data: sectionData,
    });

    if (section.layout.startsWith("scrolly")) {
      setupScrolly(sectionResult.element, sectionResult.steps, visController);
    } else if (visController?.update) {
      visController.update(0);
    }
  });
}
