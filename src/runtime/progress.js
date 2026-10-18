function validate(anchors, hold) {
  if (
    !anchors.length ||
    !Number.isFinite(hold) ||
    hold < 0 ||
    hold >= 1 ||
    anchors.some(
      (v, i) => !Number.isFinite(v) || (i > 0 && v <= anchors[i - 1]),
    )
  ) {
    throw new Error(
      "Expected increasing finite step anchors and hold in [0, 1).",
    );
  }
}
export function positionForScroll(y, anchors, hold = 0.45) {
  validate(anchors, hold);
  if (!Number.isFinite(y)) throw new Error("Scroll position must be finite.");
  if (y <= anchors[0]) return 0;
  const last = anchors.length - 1;
  if (y >= anchors[last]) return last;
  const index = anchors.findIndex((end, i) => i > 0 && y < end) - 1;
  const fraction = (y - anchors[index]) / (anchors[index + 1] - anchors[index]);
  return index + Math.max(0, (fraction - hold) / (1 - hold));
}
export function scrollForPosition(position, anchors, hold = 0.45) {
  validate(anchors, hold);
  if (!Number.isFinite(position))
    throw new Error("Story position must be finite.");
  const value = Math.max(0, Math.min(anchors.length - 1, position));
  if (Number.isInteger(value)) return anchors[value];
  const index = Math.floor(value);
  return (
    anchors[index] +
    (hold + (value - index) * (1 - hold)) *
      (anchors[index + 1] - anchors[index])
  );
}
