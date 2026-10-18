import test from "node:test";
import assert from "node:assert/strict";
import {
  positionForScroll,
  scrollForPosition,
} from "../src/runtime/progress.js";

test("authored boundaries, hold, reverse and fast jumps share one deterministic mapping", () => {
  const anchors = [100, 500, 1100, 1400];
  assert.equal(positionForScroll(-1000, anchors), 0);
  assert.equal(positionForScroll(10000, anchors), 3);
  assert.equal(positionForScroll(250, anchors), 0);
  anchors.forEach((y, i) => assert.equal(positionForScroll(y, anchors), i));
  const positions = [0, 0.25, 0.5, 0.9, 1, 1.3, 2, 2.5, 3];
  for (const p of [...positions, ...positions.toReversed(), 0, 3, 1.5]) {
    assert.ok(
      Math.abs(positionForScroll(scrollForPosition(p, anchors), anchors) - p) <
        1e-10,
    );
  }
});
test("one state, changing dimensions and invalid inputs have explicit outcomes", () => {
  assert.equal(positionForScroll(999, [200]), 0);
  assert.equal(scrollForPosition(2, [200]), 200);
  assert.notEqual(
    scrollForPosition(0.5, [0, 100]),
    scrollForPosition(0.5, [0, 200]),
  );
  for (const anchors of [[], [1, 1], [2, 1], [NaN]])
    assert.throws(() => positionForScroll(0, anchors));
  for (const hold of [-1, 1, Infinity, NaN])
    assert.throws(() => positionForScroll(0, [0, 1], hold));
  assert.throws(() => positionForScroll(NaN, [0]));
  assert.throws(() => scrollForPosition(Infinity, [0]));
});
