import { renderChapter } from "../layouts/chapter.js";
import { renderFullWidth } from "../layouts/fullWidth.js";
import { renderHero } from "../layouts/hero.js";
import { renderScrollyBottom } from "../layouts/scrollyBottom.js";
import { renderSideBySide } from "../layouts/sideBySide.js";
import { renderScrollyLeft } from "../layouts/scrollyLeft.js";
import { renderScrollyOverlay } from "../layouts/scrollyOverlay.js";
import { renderScrollyRight } from "../layouts/scrollyRight.js";
import { renderScrollyTop } from "../layouts/scrollyTop.js";
import { renderVisContainer } from "../layouts/visContainer.js";

export function registerLayouts() {
  return {
    chapter: renderChapter,
    "side-by-side": renderSideBySide,
    "vis-container": renderVisContainer,
    hero: renderHero,
    "scrolly-bottom": renderScrollyBottom,
    "scrolly-left": renderScrollyLeft,
    "scrolly-overlay": renderScrollyOverlay,
    "scrolly-right": renderScrollyRight,
    "scrolly-top": renderScrollyTop,
    "full-width": renderFullWidth,
  };
}
