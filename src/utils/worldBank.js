const PROXY_PREFIX = '/api/worldbank';
const API_ORIGIN = 'https://api.worldbank.org';

export async function fetchWorldBank(url, signal) {
  const response = await fetch(url, { signal });
  if (response.status !== 403) return response;

  if (!url.startsWith(PROXY_PREFIX)) {
    throw new Error('World Bank proxy returned 403 for an unsupported request URL.');
  }

  const fallbackUrl = `${API_ORIGIN}${url.slice(PROXY_PREFIX.length)}`;
  return fetch(fallbackUrl, { signal });
}
