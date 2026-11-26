import { getCountryOptions, REGIONS } from './geography';

describe('geography options', () => {
  const countries = [
    { code: 'GHA', name: 'Ghana', regionCode: 'SSF' },
    { code: 'JPN', name: 'Japan', regionCode: 'EAS' },
    { code: 'USA', name: 'United States', regionCode: 'NAC' },
  ];

  it('uses data-backed World Bank regions and omits the empty Africa aggregate', () => {
    expect(REGIONS.map(({ code }) => code)).not.toContain('AFR');
    expect(REGIONS.find(({ code }) => code === 'SSF').name).toBe('Sub-Saharan Africa');
  });

  it('shows all countries globally and only matching countries for a selected region', () => {
    expect(getCountryOptions(countries, 'WLD')).toEqual(countries);
    expect(getCountryOptions(countries, 'SSF')).toEqual([countries[0]]);
  });
});
