export const REGIONS = [
  { code: 'WLD', name: 'Global', shortName: 'World' },
  { code: 'SSF', name: 'Sub-Saharan Africa', shortName: 'Sub-Saharan Africa' },
  { code: 'EAS', name: 'East Asia & Pacific', shortName: 'East Asia & Pacific' },
  { code: 'SAS', name: 'South Asia', shortName: 'South Asia' },
  { code: 'ECS', name: 'Europe & Central Asia', shortName: 'Europe & Central Asia' },
  { code: 'LCN', name: 'Latin America & Caribbean', shortName: 'Latin America & Caribbean' },
  { code: 'MEA', name: 'Middle East & North Africa', shortName: 'Middle East & North Africa' },
  { code: 'NAC', name: 'North America', shortName: 'North America' },
];

export function getCountryOptions(countries, regionCode) {
  if (regionCode === 'WLD') return countries;
  return countries.filter((country) => country.regionCode === regionCode);
}
