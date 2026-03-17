import { renderChapter } from "../layouts/chapter.js";
import { renderFullWidth } from "../layouts/fullWidth.js";
import { renderHero } from "../layouts/hero.js";
import { renderScrollyLeft } from "../layouts/scrollyLeft.js";
import { renderScrollyOverlay } from "../layouts/scrollyOverlay.js";
import { renderScrollyRight } from "../layouts/scrollyRight.js";

export function registerLayouts() {
  return {
    chapter: renderChapter,
    hero: renderHero,
    "scrolly-left": renderScrollyLeft,
    "scrolly-overlay": renderScrollyOverlay,
    "scrolly-right": renderScrollyRight,
    "full-width": renderFullWidth,
  };
}
