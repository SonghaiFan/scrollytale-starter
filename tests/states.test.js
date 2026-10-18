import test from "node:test";
import assert from "node:assert/strict";
import { delta } from "visdelta";
import {
  housingStates,
  barStates,
  pointStates,
  unitStates,
} from "../src/story/housing.js";

test("the shipped narratives change attention without silently filtering their records", () => {
  for (const states of [housingStates, barStates, pointStates, unitStates]) {
    const baseline = states[0].rows();
    for (const state of states) assert.deepEqual(state.rows(), baseline);
    assert.deepEqual(delta(states[0], states.at(-1)).stateChanges, []);
    for (let index = 1; index < states.length; index++) {
      const changes = delta(states[index - 1], states[index]).stateChanges;
      assert.ok(changes.length > 0);
      assert.ok(changes.every((change) => change.category === "attention"));
    }
  }
});
