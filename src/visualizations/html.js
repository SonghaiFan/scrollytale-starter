export function renderHtmlContainer({ container, section }) {
  container.innerHTML = `
    <div class="figure-card figure-card-html">
      <p class="figure-kicker">HTML container</p>
      <h3>${section.headline}</h3>
      <p>${section.copy.summary || "This section is ready for custom HTML or a future embedded D3 visualization."}</p>
    </div>
  `;

  return {
    update() {},
  };
}

