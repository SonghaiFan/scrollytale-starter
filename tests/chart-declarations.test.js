import test from "node:test";
import assert from "node:assert/strict";
import { bar } from "visdelta";
import {
  retainChartDeclarations,
  sameDeclaration,
} from "../src/runtime/chartDeclarations.js";

const rows = [
  { region: "North", value: 18, other: 6 },
  { region: "South", value: 12, other: 9 },
];
const chart = () => bar(rows).x("region").y("value");
test("inline native chart expressions and new children arrays retain one session declaration", () => {
  const first = retainChartDeclarations(null, [
    chart(),
    chart().highlight({ region: "North" }),
    chart(),
  ]);
  for (let i = 0; i < 30; i++) {
    assert.equal(
      retainChartDeclarations(first, [
        chart(),
        chart().highlight({ region: "North" }),
        chart(),
      ]),
      first,
    );
  }
  assert.notEqual(
    retainChartDeclarations(first, [
      chart(),
      chart().highlight({ region: "South" }),
      chart(),
    ]),
    first,
  );
  assert.notEqual(
    retainChartDeclarations(first, [chart().y("other"), chart(), chart()]),
    first,
  );
  assert.notEqual(
    retainChartDeclarations(first, [
      bar([{ region: "North", value: 19 }])
        .x("region")
        .y("value"),
      chart(),
      chart(),
    ]),
    first,
  );
  assert.notEqual(retainChartDeclarations(first, [chart(), chart()]), first);
});
test("complete declaration comparison preserves plugin identity and authored value distinctions", () => {
  const module = {};
  const custom = (plugin, spec) => ({
    chartModule: () => plugin,
    toSpec: () => spec,
  });
  const initial = retainChartDeclarations(null, [
    custom(module, { data: { name: "source" }, meta: { title: "Original" } }),
  ]);
  assert.equal(
    retainChartDeclarations(initial, [
      custom(module, { meta: { title: "Original" }, data: { name: "source" } }),
    ]),
    initial,
  );
  assert.notEqual(
    retainChartDeclarations(initial, [custom({}, initial.specs[0])]),
    initial,
  );
  assert.notEqual(
    retainChartDeclarations(initial, [
      custom(module, { data: { name: "other" }, meta: { title: "Original" } }),
    ]),
    initial,
  );
  assert.notEqual(
    retainChartDeclarations(initial, [
      custom(module, { data: { name: "source" }, meta: { title: "Changed" } }),
    ]),
    initial,
  );
  assert.equal(sameDeclaration({ x: undefined }, {}), false);
  assert.equal(sameDeclaration({ x: NaN }, { x: null }), false);
  assert.equal(sameDeclaration([1, 2], [2, 1]), false);
  assert.equal(sameDeclaration(new Date(1), new Date(2)), false);
  assert.equal(sameDeclaration({ fn() {} }, { fn() {} }), false);
});
