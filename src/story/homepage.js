// Adapted from VisDelta website/components/home/code-pipeline.tsx and scroll-story.tsx.
// Same illustrative rows and cumulative native declarations; no homepage runtime dependency.
import { bar, line, area, point, unit } from 'visdelta';

export const rows = [
  { year: 2004, country: 'Norway', sites: 5 },
  { year: 2004, country: 'Denmark', sites: 4 },
  { year: 2004, country: 'Sweden', sites: 13 },
  { year: 2022, country: 'Norway', sites: 8 },
  { year: 2022, country: 'Denmark', sites: 10 },
  { year: 2022, country: 'Sweden', sites: 15 },
];

export const barBase = bar(rows).x("year").y("sites").breakdown("country");

export const lineBase = line(rows).x("year").y("sites").breakdown("country");

export const areaBase = area(rows).x("year").y("sites").breakdown("country");

export const pointBase = point(rows).x("sites").y("country").key(["year", "country"]);

export const unitBase = unit(rows).x("year").key(["year", "country"]).value("sites", { unitValue: 2 });

export const products = [
  { product: 'Hardware', revenue: 42, profit: 9 },
  { product: 'Software', revenue: 31, profit: 17 },
  { product: 'Cloud', revenue: 27, profit: 14 },
  { product: 'Services', revenue: 36, profit: 8 },
  { product: 'Support', revenue: 18, profit: 6 },
  { product: 'Training', revenue: 12, profit: 5 },
];
export const revenue = bar(products).x('product', { label: 'Product' }).y('revenue', { label: 'Revenue ($M)' }).key('product');
export const profit = revenue.y('profit', { label: 'Profit ($M)' });
export const ranked = profit.sort('profit', 'descending');
