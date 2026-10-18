import { test, expect } from '@playwright/test';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { exportHtml } from '../../tooling/export-html.js';
let directory;
const files = {};
test.beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'scrollytale-offline-'));
  for (const [name, input] of Object.entries({ story: 'story.mdx', modes: 'examples/modes.mdx', assets: 'tests/offline/fixtures/assets.mdx', homepage: 'examples/visdelta.mdx' })) {
    files[name] = path.join(directory, `${name}.html`);
    await exportHtml({ input, output: files[name] });
  }
});
test.afterAll(async () => { if (directory) await rm(directory, { recursive: true, force: true }); });

for (const width of [1440, 390]) {
  test(`single file preserves step and scroll behavior offline at ${width}px`, async ({ page, context }) => {
    await context.setOffline(true);
    await page.setViewportSize({ width, height: 900 });
    const errors = [], external = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith('data:') && request.url() !== pathToFileURL(files.modes).href) external.push(request.url()); });
    await page.goto(pathToFileURL(files.modes).href);
    await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(2);
    const step = page.locator('#step-playback'), scroll = page.locator('#scroll-progress');
    for (const index of [1, 2, 0]) {
      await step.locator('.step-number').nth(index).click();
      await expect(step).toHaveAttribute('data-position', `${index}.0000`);
    }
    await scroll.evaluate(section => {
      const line = section.clientWidth < 700 ? Math.min(innerHeight * .8, section.querySelector('.story-figure').offsetHeight + 100) : innerHeight * .55;
      const anchors = [...section.querySelectorAll('.story-step')].map(node => Math.round(node.getBoundingClientRect().top + scrollY - line));
      window.scrollTo({ top: (anchors[0] + anchors[1]) / 2, behavior: 'instant' });
    });
    await expect.poll(async () => Number(await scroll.getAttribute('data-position'))).toBeCloseTo(.5, 2);
    const paused = await scroll.getAttribute('data-position');
    await page.waitForTimeout(900);
    await expect(scroll).toHaveAttribute('data-position', paused);
    await page.getByRole('button', { name: 'Toggle theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.setViewportSize({ width: width === 390 ? 560 : 1200, height: 850 });
    await scroll.locator('.step-number').first().click();
    await expect(scroll).toHaveAttribute('data-position', '0.0000');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('JSON, imported images, literal media and closing-script text survive standalone packaging', async ({ page, context }) => {
  await context.setOffline(true);
  const external = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('data:') && request.url() !== pathToFileURL(files.assets).href) external.push(request.url()); });
  await page.goto(pathToFileURL(files.assets).href);
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(1);
  await expect(page.getByTestId('closing-tag')).toHaveText('</script><span>still text</span>');
  await expect(page.locator('.vd-bar')).toHaveCount(2);
  await expect(page.locator('.vd-style-paper')).toHaveCount(1);
  expect(await page.locator('img').evaluateAll(nodes => nodes.every(node => node.complete && node.naturalWidth === 40 && node.src.startsWith('data:')))).toBe(true);
  const html = await readFile(files.assets, 'utf8');
  expect(html).not.toMatch(/<script[^>]+src=/i);
  expect(html).not.toMatch(/<link[^>]+rel=["']stylesheet/i);
  expect(external).toEqual([]);
  expect(errors).toEqual([]);
});

test('the current story also opens from its single file', async ({ page, context }) => {
  await context.setOffline(true);
  await page.goto(pathToFileURL(files.story).href);
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(1);
  await expect(page.locator('.story-step')).toHaveCount(3);
});


test('all homepage chart modules initialize from inlined dynamic imports offline', async ({ page, context }) => {
  await context.setOffline(true);
  const external = [], errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('data:') && request.url() !== pathToFileURL(files.homepage).href) external.push(request.url()); });
  await page.goto(pathToFileURL(files.homepage).href);
  await expect(page.locator('.scrolly[data-status="Ready"]')).toHaveCount(6, { timeout: 30000 });
  for (const name of ['bar', 'line', 'area', 'point', 'unit']) {
    await expect(page.locator(`#home-${name} .chart-mount svg`).first()).toBeAttached();
  }
  await expect(page.locator('.error')).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});
