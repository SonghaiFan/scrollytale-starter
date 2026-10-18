import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
let authoringStory;
test.beforeAll(async ({ request }) => {
  const response = await request.get("http://127.0.0.1:5183/__test__/location");
  authoringStory = (await response.json()).storyPath;
});

async function ready(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/examples/housing");
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(4);
  await expect(
    page.locator(".chart-mount .vd-view > svg:not(.vd-legend-svg)"),
  ).toHaveCount(4);
  expect(errors).toEqual([]);
  return errors;
}
async function seek(page, id, value, expected = value) {
  const section = page.locator(`#${id}`);
  if (await section.getAttribute("data-mode") === "step") {
    await section.locator(".step-number").nth(Math.round(value)).click();
    await expect.poll(async () => Number(await section.getAttribute("data-position"))).toBeCloseTo(value, 3);
    return;
  }
  if (!await section.locator("input[type=range]").count()) {
    await section.evaluate((section, value) => {
      const activation = section.clientWidth < 700
        ? Math.min(innerHeight * .8, section.querySelector(".story-figure").offsetHeight + 100)
        : innerHeight * .55;
      const anchors = [...section.querySelectorAll(".story-step")].map(step =>
        Math.round(step.getBoundingClientRect().top + scrollY - activation));
      const index = Math.floor(value);
      const fraction = value - index;
      const top = fraction === 0 ? anchors[index]
        : anchors[index] + (anchors[index + 1] - anchors[index]) * (.45 + fraction * .55);
      window.scrollTo({ top, behavior: "instant" });
    }, value);
    await expect.poll(async () => Number(await section.getAttribute("data-position"))).toBeCloseTo(expected, 1);
    return;
  }
  await section.locator("input[type=range]").evaluate((input, value) => {
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set;
    setter.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
  await expect
    .poll(async () => Number(await section.getAttribute("data-position")))
    .toBeCloseTo(expected, 1);
}
async function frame(page, id) {
  return page.locator(`#${id} .chart-mount`).evaluate((mount) =>
    [...mount.querySelectorAll("g,path,circle,rect,line,text")].map((node) => ({
      tag: node.tagName,
      text: node.tagName === "text" ? node.textContent : "",
      attrs: [
        "d",
        "cx",
        "cy",
        "r",
        "x",
        "y",
        "x1",
        "x2",
        "y1",
        "y2",
        "width",
        "height",
        "opacity",
        "stroke",
        "stroke-width",
        "fill",
        "transform",
        "style",
        "stroke-dasharray",
        "stroke-dashoffset",
      ].map((attr) => [attr, node.getAttribute(attr)]),
    })),
  );
}
for (const width of [1440, 390]) {
  test(`production: forward/reverse/jumps, all charts, idle and resize at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = await ready(page);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const section = page.locator("#housing");
    await seek(page, "housing", 1);
    const boundary = await frame(page, "housing");
    const independent = await page
      .locator("#housing .chart-host")
      .evaluate(async (host) => {
        const { staticFrame } = await import("/__verification/reference.js");
        const { width, height } = host.getBoundingClientRect();
        return staticFrame("housing", 1, width, height);
      });
    expect(boundary).toEqual(independent);
    await seek(page, "housing", 1.5);
    const middle = await frame(page, "housing");
    expect(middle).not.toEqual(boundary);
    await seek(page, "housing", 3);
    await seek(page, "housing", 1.5);
    expect(await frame(page, "housing")).toEqual(middle);
    await seek(page, "housing", 0);
    await seek(page, "housing", 1);
    expect(await frame(page, "housing")).toEqual(boundary);
    for (const id of ["ranking", "observations", "households"]) {
      await seek(page, id, 1);
      const endpoint = await frame(page, id);
      expect(endpoint.length).toBeGreaterThan(0);
      const expected = await page
        .locator(`#${id} .chart-host`)
        .evaluate(async (host, id) => {
          const { staticFrame } = await import("/__verification/reference.js");
          const { width, height } = host.getBoundingClientRect();
          return staticFrame(id, 1, width, height);
        }, id);
      expect(endpoint).toEqual(expected);
      await seek(page, id, 2);
      await seek(page, id, 1);
      expect(await frame(page, id)).toEqual(endpoint);
    }
    await seek(page, "housing", 1);
    await page.screenshot({
      path: info.outputPath(`story-${width}.png`),
      fullPage: false,
    });
    await page.evaluate(() => {
      window.__mutations = 0;
      window.__observer = new MutationObserver((records) => {
        window.__mutations += records.length;
      });
      document.querySelectorAll(".chart-mount").forEach((mount) =>
        window.__observer.observe(mount, {
          subtree: true,
          attributes: true,
          childList: true,
        }),
      );
    });
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => window.__mutations)).toBe(0);
    await page.evaluate(() => window.__observer.disconnect());
    const beforeWidth = await section
      .locator("svg")
      .first()
      .getAttribute("viewBox");
    await page.setViewportSize({
      width: width === 390 ? 560 : 1200,
      height: 800,
    });
    await expect
      .poll(() => section.locator("svg").first().getAttribute("viewBox"))
      .not.toEqual(beforeWidth);
    await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(4);
    await seek(page, "housing", 1);
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.locator(".error")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("reduced motion snaps scroll to complete authored states", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page);
  await seek(page, "housing", 1);
  const section = page.locator("#housing");
  await seek(page, "housing", 1.3, 1);
  await expect(section).toHaveAttribute("data-position", "1.0000");
});

test("MDX editor: compile/import/render failures, recovery, save conflict and cleanup", async ({
  page,
}) => {
  const original = await fs.readFile(authoringStory, "utf8");
  await page.goto("http://127.0.0.1:5183/authoring");
  const editor = page.getByRole("textbox", { name: "MDX source" });
  await expect(editor).toHaveValue(original);
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(1);
  const draft = original.replaceAll(
    "Three regions, one picture",
    "The MDX editing loop",
  );
  try {
    await editor.fill(draft);
    await page.getByRole("button", { name: "Preview draft" }).click();
    await expect(
      page.getByRole("heading", { name: "The MDX editing loop" }),
    ).toBeVisible();
    expect(await fs.readFile(authoringStory, "utf8")).toEqual(original);
    await page.getByRole("link", { name: "Read story" }).click();
    await page.getByRole("link", { name: "Edit story" }).click();
    await expect(editor).toHaveValue(draft);
    await editor.fill(
      "import Missing from './this-module-does-not-exist.js'\n\n" + draft,
    );
    await page.getByRole("button", { name: "Preview draft" }).click();
    await expect(page.locator(".editor [role=alert]")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "The MDX editing loop" }),
    ).toBeVisible();
    await editor.fill(draft + "\n<Broken");
    await page.getByRole("button", { name: "Preview draft" }).click();
    await expect(page.locator(".editor [role=alert]")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "The MDX editing loop" }),
    ).toBeVisible();
    await expect(editor).toHaveValue(draft + "\n<Broken");
    await editor.fill(draft.replace("<Step chart={chart}>", "<Step>"));
    await page.getByRole("button", { name: "Preview draft" }).click();
    await expect(page.locator(".preview-error")).toContainText(
      "Step 1 needs a native VisDelta chart declaration",
    );
    await expect(
      page.getByRole("heading", { name: "The MDX editing loop" }),
    ).toBeVisible();
    await editor.fill(draft);
    await page.getByRole("button", { name: "Preview draft" }).click();
    await expect(page.locator(".preview-error")).toHaveCount(0);
    await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(1);
    await expect(page.locator(".chart-mount")).toHaveCount(1);
    // A save must not erase changes made outside this editor.
    await fs.writeFile(authoringStory, original + "\n");
    await page.getByRole("button", { name: "Save file" }).click();
    await expect(page.locator(".editor [role=alert]")).toContainText(
      "changed on disk",
    );
    await expect(editor).toHaveValue(draft);
    expect(await fs.readFile(authoringStory, "utf8")).toEqual(original + "\n");
    await fs.writeFile(authoringStory, original);
    await page.getByRole("button", { name: "Save file" }).click();
    await expect.poll(() => fs.readFile(authoringStory, "utf8")).toBe(draft);
    await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(1);
    await expect(page.locator(".chart-mount")).toHaveCount(1);
    await page.getByRole("link", { name: "Read story" }).click();
    await expect(page.locator(".editor")).toBeHidden();
    await page.getByRole("link", { name: "Edit story" }).click();
    await expect(editor).toHaveValue(draft);
    await expect(page.locator(".chart-mount")).toHaveCount(1);
  } finally {
    await fs.writeFile(authoringStory, original);
  }
});

test("external file changes refresh the reader while retaining a dirty editor draft", async ({
  page,
}) => {
  const original = await fs.readFile(authoringStory, "utf8");
  try {
    await page.goto("http://127.0.0.1:5183/authoring");
    const editor = page.getByRole("textbox", { name: "MDX source" });
    await expect(editor).toHaveValue(original);
    const draft = original.replaceAll(
      "Three regions, one picture",
      "My unsaved draft",
    );
    await editor.fill(draft);
    await page.getByRole("link", { name: "Read story" }).click();
    await fs.writeFile(
      authoringStory,
      original.replaceAll("Three regions, one picture", "An external edit"),
    );
    await expect(
      page.getByRole("heading", { name: "An external edit" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Edit story" }).click();
    await expect(editor).toHaveValue(draft);
    await expect(page.locator(".editor-message")).toContainText(
      "changed on disk",
    );
    await page.goBack();
    await page.goForward();
    await expect(editor).toHaveValue(draft);
  } finally {
    await fs.writeFile(authoringStory, original);
  }
});

test("a stale preview response cannot replace newer text or its preview", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:5183/authoring");
  const editor = page.getByRole("textbox", { name: "MDX source" });
  const source = await fs.readFile(authoringStory, "utf8");
  await expect(editor).toHaveValue(source);
  let release;
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let seen;
  const requested = new Promise((resolve) => {
    seen = resolve;
  });
  await page.route("**/__authoring/preview", async (route) => {
    const response = await route.fetch();
    seen();
    await gate;
    await route.fulfill({ response });
  });
  await editor.fill(
    source.replaceAll("Three regions, one picture", "Stale preview"),
  );
  await page.getByRole("button", { name: "Preview draft" }).click();
  await requested;
  const latest = source.replaceAll("Three regions, one picture", "Newer text");
  await editor.fill(latest);
  release();
  await expect(
    page.getByRole("button", { name: "Preview draft" }),
  ).toBeEnabled();
  await expect(editor).toHaveValue(latest);
  await expect(
    page.getByRole("heading", { name: "Three regions, one picture" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Stale preview" }),
  ).toHaveCount(0);
  page.once("dialog", (dialog) => dialog.accept());
  await page.reload();
  await expect(editor).toHaveValue(latest);
  await expect(page.locator(".editor-message")).toContainText(
    "Restored your unsaved draft",
  );
});

for (const width of [1440, 390]) {
  test(`MDX documentation fits and navigates at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("http://127.0.0.1:4174/scrollytale-starter/");
    await expect(
      page.getByRole("heading", { name: "Scrollytale", exact: true }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Documentation" })
      .getByRole("link", { name: "Component API", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Component API", exact: true }),
    ).toBeVisible();
    await expect(page.locator("table")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath(`docs-${width}.png`) });
    await page
      .getByRole("navigation", { name: "Documentation" })
      .getByRole("link", { name: "Architecture & verification", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Architecture and verification",
        exact: true,
      }),
    ).toBeVisible();
  });
}

test("Step chart declarations settle through parent renders, theme and real chart changes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__sessions = { created: 0, destroyed: 0 };
    const append = Element.prototype.append;
    Element.prototype.append = function (...nodes) {
      for (const node of nodes)
        if (node instanceof Element && node.classList.contains("chart-mount"))
          window.__sessions.created++;
      return append.apply(this, nodes);
    };
    const remove = Element.prototype.remove;
    Element.prototype.remove = function () {
      if (this.classList.contains("chart-mount")) window.__sessions.destroyed++;
      return remove.call(this);
    };
  });
  await page.goto("/__verification/lifecycle.html");
  await page.evaluate(async () => {
    window.__disposeHarness = (
      await import("/__verification/reference.js")
    ).mountLifecycleHarness();
  });
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(2);
  const ids = await page
    .locator(".scrolly")
    .evaluateAll((nodes) => nodes.map((node) => node.id));
  expect(new Set(ids).size).toBe(2);
  expect(ids.every(Boolean)).toBe(true);
  const initial = await page.evaluate(() => ({ ...window.__sessions }));
  for (let i = 0; i < 8; i++)
    await page.getByRole("button", { name: "Render parent" }).click();
  await expect(page.getByText("Revision 8")).toBeVisible();
  expect(await page.evaluate(() => window.__sessions)).toEqual(initial);
  expect(
    await page
      .locator(".scrolly")
      .evaluateAll((nodes) => nodes.map((node) => node.id)),
  ).toEqual(ids);
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
    window.dispatchEvent(new Event("scrollytale:theme"));
  });
  expect(await page.evaluate(() => window.__sessions)).toEqual(initial);
  await seek(page, ids[0], 1);
  expect(await page.evaluate(() => window.__sessions)).toEqual(initial);
  for (const name of ["Change data", "Change field"]) {
    const before = await page.evaluate(() => ({ ...window.__sessions }));
    await page.getByRole("button", { name }).click();
    await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(2);
    await expect
      .poll(() => page.evaluate(() => window.__sessions.created))
      .toBe(before.created + 2);
    expect(await page.evaluate(() => window.__sessions.destroyed)).toBe(
      before.destroyed + 2,
    );
  }
  const settled = await page.evaluate(() => ({ ...window.__sessions }));
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.__sessions)).toEqual(settled);
  await page.evaluate(() => window.__disposeHarness());
  await expect(page.locator(".chart-mount")).toHaveCount(0);
  expect(await page.evaluate(() => window.__sessions.created)).toEqual(
    await page.evaluate(() => window.__sessions.destroyed),
  );
});

test("MDX defaults and explicit same-name imports render without competing syntax", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:5183/authoring");
  const editor = page.getByRole("textbox", { name: "MDX source" });
  await expect(editor).toBeEnabled();
  const source = `import { bar } from 'visdelta'
export const chart = bar([{ region: 'North', value: 18 }, { region: 'South', value: 12 }]).x('region').y('value')

<Scrolly>
  <Step chart={chart}>All regions.</Step>
  <Step chart={chart.highlight({ region: 'North' })}>North.</Step>
  <Step chart={chart}>All again.</Step>
</Scrolly>`;
  await editor.fill(source);
  await page.getByRole("button", { name: "Preview draft" }).click();
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(1);
  await expect(page.locator(".story-step")).toHaveCount(3);
  await expect(
    page.getByRole("region", { name: "Chart story", exact: true }),
  ).toBeVisible();
  await editor.fill(
    source.replace("chart={chart.highlight({ region: 'North' })}", ""),
  );
  await page.getByRole("button", { name: "Preview draft" }).click();
  await expect(page.locator(".preview-error")).toContainText(
    "Step 2 needs a native VisDelta chart declaration",
  );
  await editor.fill(source.replace("<Scrolly>", "<Scrolly states={[]}>"));
  await page.getByRole("button", { name: "Preview draft" }).click();
  await expect(page.locator(".preview-error")).toContainText(
    "Scrolly no longer accepts states",
  );
  await editor.fill(
    "import { Scrolly, Step } from './tests/custom-components.jsx'\n\n<Scrolly><Step>My own components</Step></Scrolly>",
  );
  await page.getByRole("button", { name: "Preview draft" }).click();
  await expect(page.getByTestId("custom-step")).toHaveText("My own components");
  await expect(page.locator(".preview-error")).toHaveCount(0);
  await expect(page.locator(".chart-mount")).toHaveCount(0);
});

for (const width of [1440, 390]) {
  test(`default starter works without component imports or technical props at ${width}px`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Three regions, one picture" }),
    ).toBeVisible();
    await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(1);
    await expect(page.locator(".story-step")).toHaveCount(3);
    await expect(page.locator(".chart-controls, .story-figure output")).toHaveCount(0);
    const id = await page.locator(".scrolly").getAttribute("id");
    for (const position of [0, 1, 2, 1, 0]) {
      await seek(page, id, position);
      const actual = await frame(page, id);
      const expected = await page
        .locator(".chart-host")
        .evaluate(async (host, index) => {
          const { staticFrame } = await import("/__verification/reference.js");
          const { width, height } = host.getBoundingClientRect();
          return staticFrame("starter", index, width, height);
        }, position);
      expect(actual).toEqual(expected);
    }
    await seek(page, id, 1);
    await expect(
      page.locator('.story-step[aria-current="step"]'),
    ).toContainText("Look north");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: info.outputPath(`starter-${width}.png`) });
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect
      .poll(() =>
        page
          .locator(".vd-bar")
          .first()
          .evaluate((mark) => getComputedStyle(mark).fill),
      )
      .toBe(
        await page
          .locator("html")
          .evaluate((root) => getComputedStyle(root).color),
      );
    await page.screenshot({
      path: info.outputPath(`starter-dark-${width}.png`),
    });
    expect(errors).toEqual([]);
  });
}

test("step entry plays on its own, reverses mid-flight and retains playback through resize/theme", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const section = page.locator(".scrolly");
  await expect(section).toHaveAttribute("data-status", "Ready");
  const id = await section.getAttribute("id");
  await section.locator(".step-number").nth(1).click();
  await expect.poll(async () => {
    const value = Number(await section.getAttribute("data-position"));
    return value > .05 && value < .95;
  }).toBe(true);
  await section.locator(".step-number").nth(0).click();
  await expect.poll(async () => Number(await section.getAttribute("data-position"))).toBe(0);
  await section.locator(".step-number").nth(1).click();
  await expect.poll(async () => Number(await section.getAttribute("data-position")) > .05).toBe(true);
  await page.evaluate(() => window.scrollBy({ top: 120, behavior: "instant" }));
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect.poll(async () => Number(await section.getAttribute("data-position"))).toBe(1);
  const expected = await section.locator(".chart-host").evaluate(async host => {
    const { staticFrame } = await import("/__verification/reference.js");
    const { width, height } = host.getBoundingClientRect();
    return staticFrame("starter", 1, width, height);
  });
  expect(await frame(page, id)).toEqual(expected);
  await section.locator(".step-number").nth(2).click();
  await section.locator(".step-number").nth(0).click();
  await expect.poll(async () => Number(await section.getAttribute("data-position"))).toBe(0);
});

test("step mode respects reduced motion without timed playback", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator(".scrolly");
  await expect(section).toHaveAttribute("data-status", "Ready");
  await section.locator(".step-number").nth(1).click();
  await expect(section).toHaveAttribute("data-position", "1.0000");
  await section.locator(".step-number").nth(0).click();
  await expect(section).toHaveAttribute("data-position", "0.0000");
});

for (const width of [1440, 390]) {
  test(`compare both playback modes on one page at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/examples/modes");
    await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(2);
    await expect(page.locator(".chart-controls")).toHaveCount(0);
    const step = page.locator("#step-playback");
    const scroll = page.locator("#scroll-progress");
    await expect(step).toHaveAttribute("data-mode", "step");
    await expect(scroll).toHaveAttribute("data-mode", "scroll");
    await step.locator(".step-number").nth(1).click();
    await expect.poll(async () => Number(await step.getAttribute("data-position"))).toBe(1);
    await scroll.evaluate(section => {
      const activation = section.clientWidth < 700
        ? Math.min(innerHeight * .8, section.querySelector(".story-figure").offsetHeight + 100)
        : innerHeight * .55;
      const anchors = [...section.querySelectorAll(".story-step")].map(element =>
        Math.round(element.getBoundingClientRect().top + scrollY - activation));
      window.scrollTo({ top: (anchors[0] + anchors[1]) / 2, behavior: "instant" });
    });
    await expect.poll(async () => Number(await scroll.getAttribute("data-position"))).toBeCloseTo(.5, 2);
    const paused = await scroll.getAttribute("data-position");
    await page.waitForTimeout(900);
    await expect(scroll).toHaveAttribute("data-position", paused);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await scroll.locator(".step-number").nth(0).click();
    await expect(scroll).toHaveAttribute("data-position", "0.0000");
    await page.getByRole("link", { name: "再体验 Step 模式 ↑" }).click();
    await expect(step).toBeInViewport();
    await page.goto("http://127.0.0.1:5183/examples/modes");
    await expect(page.getByRole("link", { name: "Compare playback modes", exact: true }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const width of [1440, 390]) {
  test(`VisDelta homepage demos render and play in MDX at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto("/examples/visdelta");
    await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(6, { timeout: 30000 });
    await expect(page.locator(".chart-controls, .error")).toHaveCount(0);
    for (const name of ["bar", "line", "area", "point", "unit"]) {
      const section = page.locator(`#home-${name}`);
      await expect(section.locator(".story-step")).toHaveCount(4);
      for (const index of [1, 2, 3, 0]) {
        await section.locator(".step-number").nth(index).click();
        await expect.poll(async () => Number(await section.getAttribute("data-position")), { timeout: 20000 }).toBe(index);
        await expect(section.locator(".chart-mount svg").first()).toBeVisible();
      }
    }
    const scroll = page.locator("#home-products");
    for (const index of [1, 2, 3, 0]) {
      await scroll.locator(".step-number").nth(index).click();
      await expect(scroll).toHaveAttribute("data-position", `${index}.0000`);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

async function expectStyleFrame(page, id, index, style, story = "styles") {
  const section = page.locator(`#${id}`);
  const expected = await section.locator(".chart-host").evaluate(async (host, { index, style, story }) => {
    const { staticFrame } = await import("/__verification/reference.js");
    const { width, height } = host.getBoundingClientRect();
    return staticFrame(story, index, width, height, style);
  }, { index, style, story });
  expect(await frame(page, id)).toEqual(expected);
}

for (const width of [1440, 390]) {
  test(`MDX chartStyle presets and custom module retain scoped presentation at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/examples/styles");
    await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(5);
    const styles = ["paper", "dark", "editorial", "d3", "custom"];
    for (const style of styles) {
      const section = page.locator(`#style-${style}`);
      await expect(section.locator(`.vd-style-${style === "custom" ? "spacious" : style}`)).toHaveCount(1);
      await section.locator(".step-number").first().click();
      await expectStyleFrame(page, `style-${style}`, 0, style, style === "d3" ? "neutralStyle" : "styles");
      const geometry = await section.locator(".chart-host").evaluate(host => {
        const box = host.getBoundingClientRect();
        return [...host.querySelectorAll('svg, .vd-legend text')].filter(node => getComputedStyle(node).display !== 'none').every(node => {
          const bounds = node.getBoundingClientRect();
          return bounds.left >= box.left - 1 && bounds.right <= box.right + 1 && bounds.top >= box.top - 1 && bounds.bottom <= box.bottom + 1;
        });
      });
      expect(geometry).toBe(true);
      if (style !== "d3") {
        const fills = await section.locator(".vd-bar").evaluateAll(nodes => [...new Set(nodes.map(node => getComputedStyle(node).fill))].sort());
        expect(fills).toEqual(["rgb(217, 119, 6)", "rgb(37, 99, 235)"].sort());
      }
    }
    const paper = page.locator("#style-paper");
    const dark = page.locator("#style-dark");
    await expect(paper.locator(".vd-figure")).toHaveCSS("background-color", "rgb(255, 253, 247)");
    await expect(dark.locator(".vd-figure")).toHaveCSS("background-color", "rgb(17, 22, 28)");
    await expect(paper.locator(".vd-transition-root")).toHaveCSS("font-family", /Georgia/);
    await expect(dark.locator(".vd-transition-root")).toHaveCSS("font-family", /monospace/);
    expect(await paper.locator(".vd-axis text").first().evaluate(node => getComputedStyle(node).fill)).toBe("rgb(116, 102, 83)");
    for (const index of [1, 0]) {
      await seek(page, "style-paper", index);
      await expectStyleFrame(page, "style-paper", index, "paper");
      await seek(page, "style-dark", index);
      await expectStyleFrame(page, "style-dark", index, "dark");
    }
    await seek(page, "style-paper", 0);
    await paper.locator(".story-figure").screenshot({ path: info.outputPath(`paper-${width}.png`) });
    await page.getByRole("button", { name: "Toggle theme" }).click();
    await expect(paper.locator(".vd-figure")).toHaveCSS("background-color", "rgb(255, 253, 247)");
    await expect(dark.locator(".vd-figure")).toHaveCSS("background-color", "rgb(17, 22, 28)");
    await page.setViewportSize({ width: width === 390 ? 560 : 1200, height: 850 });
    await seek(page, "style-paper", 0);
    await expectStyleFrame(page, "style-paper", 0, "paper");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await paper.locator(".story-figure").screenshot({ path: info.outputPath(`paper-resized-${width}.png`) });
  });
}

test("style changes preserve live progress, keep stable modules, and settle after rapid replacement", async ({ page }) => {
  await page.goto("/__verification/lifecycle.html");
  await page.evaluate(async () => {
    window.__disposeHarness = (await import("/__verification/reference.js")).mountLifecycleHarness();
  });
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(2);
  const section = page.locator(".scrolly").first();
  await section.locator(".step-number").nth(1).click();
  await expect(section).toHaveAttribute("data-position", "1.0000");
  await page.evaluate(() => {
    window.__positions = [];
    window.__positionObserver = new MutationObserver(() => window.__positions.push(document.querySelector('.scrolly').dataset.position));
    window.__positionObserver.observe(document.querySelector('.scrolly'), { attributes: true, attributeFilter: ['data-position'] });
  });
  await page.getByRole("button", { name: "Paper style", exact: true }).evaluate(button => button.click());
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(2);
  await expect(section.locator(".vd-style-paper")).toHaveCount(1);
  await expect(section).toHaveAttribute("data-position", "1.0000");
  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
    window.dispatchEvent(new Event("scrollytale:theme"));
  });
  await expect(page.locator(".scrolly").nth(1).locator(".vd-bar").first()).toHaveCSS("fill", "rgb(33, 24, 15)");
  const mount = await section.locator(".chart-mount").evaluate(node => { window.__styleMount = node; return node.dataset.position; });
  expect(mount).toBe("1");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Render parent", exact: true }).evaluate(button => button.click());
  expect(await section.locator(".chart-mount").evaluate(node => node === window.__styleMount)).toBe(true);
  await page.getByRole("button", { name: "Custom style", exact: true }).evaluate(button => button.click());
  await expect(section.locator(".vd-style-spacious")).toHaveCount(1);
  await section.locator(".chart-mount").evaluate(node => { window.__styleMount = node; });
  await page.getByRole("button", { name: "Render parent", exact: true }).evaluate(button => button.click());
  expect(await section.locator(".chart-mount").evaluate(node => node === window.__styleMount)).toBe(true);
  await page.evaluate(() => {
    document.querySelectorAll('.fixture-controls button').forEach(button => {
      if (['Paper style', 'Dark style'].includes(button.textContent)) button.click();
    });
  });
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(2);
  await expect(page.locator('.scrolly .vd-style-dark')).toHaveCount(2);
  await expect(page.locator('.chart-mount')).toHaveCount(2);
  await page.getByRole("button", { name: "Broken style", exact: true }).evaluate(button => button.click());
  await expect(page.locator('.scrolly[data-status="Chart could not render"]')).toHaveCount(2);
  await expect(page.locator('.scrolly .vd-style-dark')).toHaveCount(2);
  await expect(page.locator('.chart-mount')).toHaveCount(2);
  await expect(page.locator('.error').first()).toContainText("Style preparation failed");
  await page.getByRole("button", { name: "Paper style", exact: true }).evaluate(button => button.click());
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(2);
  await expect(page.locator('.error')).toHaveCount(0);
  expect(await page.evaluate(() => window.__positions.every(value => Number(value) === 1))).toBe(true);
  await page.evaluate(() => { window.__positionObserver.disconnect(); window.__disposeHarness(); });
  await expect(page.locator('.chart-mount')).toHaveCount(0);
});

test("invalid MDX chartStyle values report useful errors and preserve the working preview", async ({ page }) => {
  await page.goto("http://127.0.0.1:5183/authoring");
  const editor = page.getByRole("textbox", { name: "MDX source" });
  const source = `import { bar } from 'visdelta'
export const chart = bar([{region: 'North', value: 18}]).x('region').y('value')

<Scrolly chartStyle="paper"><Step chart={chart}>Paper chart.</Step></Scrolly>`;
  await editor.fill(source);
  await page.getByRole("button", { name: "Preview draft" }).click();
  await expect(page.locator('.vd-style-paper')).toHaveCount(1);
  for (const style of ['"unknown"', '{null}', '{{key: "incomplete"}}']) {
    await editor.fill(source.replace('"paper"', style));
    await page.getByRole("button", { name: "Preview draft" }).click();
    await expect(page.locator('.preview-error')).toContainText('chartStyle');
    await expect(page.locator('.vd-style-paper')).toHaveCount(1);
  }
});

test("changing style during forward and reverse playback keeps the current native target", async ({ page }) => {
  await page.goto("/__verification/lifecycle.html");
  await page.evaluate(async () => {
    window.__disposeHarness = (await import("/__verification/reference.js")).mountLifecycleHarness();
  });
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(2);
  const section = page.locator('.scrolly').first();
  // Observe in-page frames so browser RPC latency cannot hide the intermediate frame.
  async function switchDuringMotion(index, buttonText) {
    return section.evaluate((section, { index, buttonText }) => new Promise((resolve, reject) => {
      const started = performance.now();
      const inspect = () => {
        const value = Number(section.dataset.position);
        if (value > .05 && value < .95) {
          [...document.querySelectorAll('.fixture-controls button')].find(button => button.textContent === buttonText).click();
          resolve(value);
        } else if (performance.now() - started > 5000) reject(new Error('No intermediate native playback frame'));
        else requestAnimationFrame(inspect);
      };
      section.querySelectorAll('.step-number')[index].click();
      requestAnimationFrame(inspect);
    }), { index, buttonText });
  }
  const forward = await switchDuringMotion(1, 'Paper style');
  expect(forward).toBeGreaterThan(.05);
  expect(forward).toBeLessThan(.95);
  await expect(section.locator('.vd-style-paper:visible')).toHaveCount(1);
  await expect(section).toHaveAttribute('data-position', '1.0000');
  const reverse = await switchDuringMotion(0, 'Dark style');
  expect(reverse).toBeGreaterThan(.05);
  expect(reverse).toBeLessThan(.95);
  await expect(section.locator('.vd-style-dark:visible')).toHaveCount(1);
  await expect(section).toHaveAttribute('data-position', '0.0000');
  await expect(page.locator('.chart-mount')).toHaveCount(2);
  await expect(page.locator('.error')).toHaveCount(0);
  await page.evaluate(() => window.__disposeHarness());
});
