import test from 'node:test';
import assert from 'node:assert/strict';
import { chartStylePresets, defineChartStyle } from 'visdelta/chart-style';
import { resolveChartStyle } from '../src/runtime/chartStyle.js';

test('chartStyle names resolve to stable native modules and custom modules retain identity', () => {
  assert.equal(resolveChartStyle(undefined), undefined);
  for (const [name, module] of Object.entries(chartStylePresets)) {
    assert.equal(resolveChartStyle(name), module);
    assert.equal(resolveChartStyle(module), module);
  }
  const custom = defineChartStyle({ key: 'my-style', plot: { grid: 'horizontal' } });
  assert.equal(resolveChartStyle(custom), custom);
  for (const value of ['unknown', 'constructor', '__proto__', null, 1, true, [], {}, { key: 'config-only' }, { ...custom, axisTitle: null }])
    assert.throws(() => resolveChartStyle(value), /chartStyle/);
});
