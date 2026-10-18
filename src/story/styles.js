import { bar } from 'visdelta';
import { defineChartStyle } from 'visdelta/chart-style';

export const styleChart = bar([
  { year: 2021, region: 'North', value: 18 },
  { year: 2021, region: 'South', value: 12 },
  { year: 2022, region: 'North', value: 22 },
  { year: 2022, region: 'South', value: 15 },
]).x('year', { label: 'Year' }).y('value', { label: 'Revenue' })
  .breakdown('region').color('region', { range: ['#2563eb', '#d97706'] });

export const neutralChart = bar([
  { region: 'North', value: 18 },
  { region: 'South', value: 12 },
]).x('region', { label: 'Region' }).y('value', { label: 'Revenue' });

// A structural module: CSS colors continue to inherit from the page.
export const spaciousStyle = defineChartStyle({
  key: 'spacious',
  tickSpacing: { x: 100, y: 65 },
  legendPosition: 'right',
  plot: { margin: { top: 34, right: 24, bottom: 50, left: 60 }, grid: 'horizontal' },
  axisTitle: channel => channel?.label,
});
