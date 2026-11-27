import { fetchWorldBank } from './worldBank';

describe('fetchWorldBank', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls the public World Bank API URL directly', async () => {
    const response = { status: 200 };
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce(response);
    const signal = new AbortController().signal;
    const url = 'https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.KD.ZG?format=json';

    await expect(fetchWorldBank(url, signal)).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(url, { signal });
  });
});
