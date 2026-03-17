import { renderFullWidth } from "../layouts/fullWidth.js";
import { renderHero } from "../layouts/hero.js";
import { renderScrollyLeft } from "../layouts/scrollyLeft.js";
import { renderScrollyRight } from "../layouts/scrollyRight.js";

export function registerLayouts() {
  return {
    hero: renderHero,
    "scrolly-left": renderScrollyLeft,
    "scrolly-right": renderScrollyRight,
    "full-width": renderFullWidth,
  };
}

