import test from "node:test";
import assert from "node:assert/strict";
import { createChartSession } from "../src/runtime/chartSession.js";

function element() {
  return {
    children: [],
    dataset: {},
    append(node) {
      this.children.push(node);
      node.parent = this;
    },
    remove() {
      this.parent.children = this.parent.children.filter(
        (child) => child !== this,
      );
    },
  };
}
globalThis.document = { createElement: element };
function deferred() {
  let resolve, reject;
  const promise = new Promise((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
function controller() {
  return {
    values: [],
    destroyed: 0,
    resized: 0,
    progress(v) {
      this.values.push(v);
    },
    resize() {
      this.resized++;
    },
    destroy() {
      this.destroyed++;
    },
  };
}

test("pending seeks retain latest authored value and resize restores the current position", async () => {
  const pending = deferred(),
    c = controller(),
    host = element();
  let options;
  const session = createChartSession({
    host,
    states: [{}, {}, {}],
    sequence: (states, opts) => {
      options = opts;
      return pending.promise;
    },
  });
  session.seek(1.5);
  session.seek(0.5);
  await Promise.resolve();
  pending.resolve(c);
  await session.ready;
  assert.equal(options.target, host.children[0]);
  assert.deepEqual(c.values, [0.5]);
  session.seek(0.5);
  assert.deepEqual(c.values, [0.5]);
  session.seek(2);
  session.seek(0);
  session.seek(0.5);
  session.resize();
  assert.equal(c.resized, 1);
  assert.equal(c.values.at(-1), 0.5);
  assert.throws(() => session.seek(NaN));
  session.destroy();
  session.destroy();
  session.seek(1);
  session.resize();
  assert.equal(c.destroyed, 1);
  assert.equal(c.resized, 1);
  assert.equal(host.children.length, 0);
});
test("stale resolve cannot paint into a replacement mount, even on the same host", async () => {
  const pending = deferred(),
    stale = controller(),
    fresh = controller(),
    host = element();
  let oldMount;
  const old = createChartSession({
    host,
    states: [{}, {}],
    sequence: (_, options) => {
      oldMount = options.target;
      return pending.promise;
    },
  });
  await Promise.resolve();
  old.destroy();
  const replacement = createChartSession({
    host,
    states: [{}, {}],
    sequence: async (_, options) => {
      assert.notEqual(options.target, oldMount);
      return fresh;
    },
  });
  await replacement.ready;
  pending.resolve(stale);
  await old.ready;
  assert.equal(stale.destroyed, 1);
  assert.deepEqual(stale.values, []);
  assert.equal(host.children.length, 1);
  assert.deepEqual(fresh.values, [0]);
  replacement.destroy();
});
test("unmount before creation, stale rejection, single state and independent instances", async () => {
  let called = 0;
  const skipped = createChartSession({
    host: element(),
    states: [{}],
    transition: () => {
      called++;
    },
  });
  skipped.destroy();
  await skipped.ready;
  assert.equal(called, 0);
  const pending = deferred();
  let errors = 0;
  const rejected = createChartSession({
    host: element(),
    states: [{}, {}],
    sequence: () => pending.promise,
    onError: () => errors++,
  });
  await Promise.resolve();
  rejected.destroy();
  pending.reject(new Error("late"));
  await rejected.ready;
  assert.equal(errors, 0);
  const a = controller(),
    b = controller(),
    state = {};
  const single = createChartSession({
    host: element(),
    states: [state],
    transition: async (from, to) => {
      assert.equal(from, to);
      return a;
    },
  });
  const other = createChartSession({
    host: element(),
    states: [{}, {}],
    sequence: async () => b,
  });
  await Promise.all([single.ready, other.ready]);
  assert.deepEqual(a.values, [1]);
  other.seek(0.75);
  single.destroy();
  assert.equal(b.destroyed, 0);
  assert.equal(b.values.at(-1), 0.75);
  other.destroy();
});

test("step playback delegates to native play, retargets from its live frame and survives resize", async () => {
  const c = controller();
  c.value = 0;
  c.plays = [];
  c.play = function (options) { this.plays.push({ ...options }); };
  const session = createChartSession({
    host: element(), states: [{}, {}, {}], sequence: async () => c,
  });
  session.playTo(1, 300);
  await session.ready;
  assert.deepEqual(c.plays, [{ to: 1, duration: 300 }]);
  c.value = 0.4;
  assert.equal(session.value, 0.4);
  session.playTo(0, 300);
  assert.deepEqual(c.plays.at(-1), { to: 0, duration: 300 });
  const seeks = c.values.length;
  session.resize();
  assert.equal(c.values.length, seeks, "resize must not seek and cancel native playback");
  session.seek(2);
  assert.equal(c.values.at(-1), 2);
  assert.throws(() => session.playTo(1, -1));
  session.destroy();
  session.playTo(1);
  assert.equal(c.plays.length, 2);
});
