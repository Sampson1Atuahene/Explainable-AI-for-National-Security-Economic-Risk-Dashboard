import { aggregateFxHistory, fetchFxHistory } from './fxHistory';

describe('fetchFxHistory', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('requests one year of public USD reference history and sorts observations', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        rates: {
          '2026-11-27': { EUR: 0.92, GBP: 0.76, JPY: 159, CHF: 0.83, CNY: 6.65 },
          '2026-11-26': { EUR: 0.91, GBP: 0.75, JPY: 158, CHF: 0.82, CNY: 6.64 },
        },
      }),
    });
    const signal = new AbortController().signal;

    await expect(fetchFxHistory(signal, new Date('2026-11-27T14:00:00Z'))).resolves.toEqual([
      {
        date: '2026-11-26',
        rates: { EUR: 0.91, GBP: 0.75, JPY: 158, CHF: 0.82, CNY: 6.64 },
      },
      {
        date: '2026-11-27',
        rates: { EUR: 0.92, GBP: 0.76, JPY: 159, CHF: 0.83, CNY: 6.65 },
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.frankfurter.dev/v1/2025-11-27..2026-11-27?base=USD&symbols=EUR,GBP,JPY,CHF,CNY',
      { signal },
    );
  });

  it('surfaces failed responses and invalid payloads', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValueOnce({ ok: false, status: 503 });
    await expect(fetchFxHistory(undefined, new Date('2026-11-27T00:00:00Z')))
      .rejects.toThrow('FX history request failed (503)');

    jest.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rates: [] }),
    });
    await expect(fetchFxHistory(undefined, new Date('2026-11-27T00:00:00Z')))
      .rejects.toThrow('FX history response was invalid');
  });
});

describe('aggregateFxHistory', () => {
  const observations = [
    { date: '2026-10-30', rates: { EUR: 0.9 } },
    { date: '2026-11-20', rates: { EUR: 0.91 } },
    { date: '2026-11-23', rates: { EUR: 0.92 } },
    { date: '2026-11-27', rates: { EUR: 0.93 } },
  ];

  it('keeps observed daily rates and uses the last available rate in each week or month', () => {
    expect(aggregateFxHistory(observations, 'daily')).toHaveLength(4);
    expect(aggregateFxHistory(observations, 'weekly')).toEqual([
      { date: '2026-10-30', rates: { EUR: 0.9 }, period: '2026-10-26' },
      { date: '2026-11-20', rates: { EUR: 0.91 }, period: '2026-11-16' },
      { date: '2026-11-27', rates: { EUR: 0.93 }, period: '2026-11-23' },
    ]);
    expect(aggregateFxHistory(observations, 'monthly')).toEqual([
      { date: '2026-10-30', rates: { EUR: 0.9 }, period: '2026-10' },
      { date: '2026-11-27', rates: { EUR: 0.93 }, period: '2026-11' },
    ]);
  });

  it('does not fabricate observations for unsupported intraday horizons', () => {
    expect(aggregateFxHistory(observations, 'hourly')).toEqual([]);
    expect(aggregateFxHistory(observations, 'per-minute')).toEqual([]);
  });
});
