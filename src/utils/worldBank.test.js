import { fetchWorldBank } from './worldBank';

describe('fetchWorldBank', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retries a forbidden proxy request against the public World Bank API', async () => {
    const proxyResponse = { status: 403 };
    const apiResponse = { status: 200 };
    const fetchMock = jest.spyOn(global, 'fetch')
      .mockResolvedValueOnce(proxyResponse)
      .mockResolvedValueOnce(apiResponse);
    const signal = new AbortController().signal;
    const url = '/api/worldbank/v2/country/WLD/indicator/NY.GDP.MKTP.KD.ZG?format=json';

    await expect(fetchWorldBank(url, signal)).resolves.toBe(apiResponse);

    expect(fetchMock).toHaveBeenNthCalledWith(1, url, { signal });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.MKTP.KD.ZG?format=json',
      { signal },
    );
  });

  it('does not retry responses other than 403', async () => {
    const response = { status: 503 };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce(response);

    await expect(fetchWorldBank('/api/worldbank/v2/country', undefined)).resolves.toBe(response);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses the public World Bank API directly in production builds', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const response = { status: 200 };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce(response);
    const url = '/api/worldbank/v2/country?format=json';

    try {
      await expect(fetchWorldBank(url, undefined)).resolves.toBe(response);
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.worldbank.org/v2/country?format=json',
      { signal: undefined },
    );
  });
});
