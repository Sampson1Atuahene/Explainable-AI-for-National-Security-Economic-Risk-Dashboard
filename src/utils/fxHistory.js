const FX_API_BASE = 'https://api.frankfurter.dev/v1';

export const FX_HISTORY_CURRENCIES = ['EUR', 'GBP', 'JPY', 'CHF', 'CNY'];

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function getHistoryUrl(now) {
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 365);
  const symbols = FX_HISTORY_CURRENCIES.join(',');
  return `${FX_API_BASE}/${toISODate(startDate)}..${toISODate(endDate)}?base=USD&symbols=${symbols}`;
}

export async function fetchFxHistory(signal, now = new Date()) {
  const response = await fetch(getHistoryUrl(now), { signal });
  if (!response.ok) throw new Error(`FX history request failed (${response.status})`);

  const payload = await response.json();
  if (!payload?.rates || typeof payload.rates !== 'object' || Array.isArray(payload.rates)) {
    throw new Error('FX history response was invalid');
  }

  return Object.entries(payload.rates)
    .filter(([date, rates]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      rates &&
      typeof rates === 'object' &&
      !Array.isArray(rates) &&
      FX_HISTORY_CURRENCIES.some((currency) => Number.isFinite(rates[currency])),
    )
    .map(([date, rates]) => ({
      date,
      rates: Object.fromEntries(
        FX_HISTORY_CURRENCIES.map((currency) => [
          currency,
          Number.isFinite(rates[currency]) ? rates[currency] : null,
        ]),
      ),
    }))
    .sort((left, right) => left.date.localeCompare(right.date));
}

function getPeriodKey(date, horizon) {
  if (horizon === 'monthly') return date.slice(0, 7);
  if (horizon === 'weekly') {
    const weekStart = new Date(`${date}T00:00:00.000Z`);
    const daysSinceMonday = (weekStart.getUTCDay() + 6) % 7;
    weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
    return toISODate(weekStart);
  }
  return date;
}

export function aggregateFxHistory(observations, horizon) {
  if (!['daily', 'weekly', 'monthly'].includes(horizon)) return [];

  const periods = new Map();
  observations.forEach((observation) => {
    const key = getPeriodKey(observation.date, horizon);
    periods.set(key, { ...observation, period: key });
  });
  return [...periods.values()];
}
