import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import TimeAnalysis from './TimeAnalysis';

global.IS_REACT_ACT_ENVIRONMENT = true;

describe('TimeAnalysis horizon tabs', () => {
  let container;
  let root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        rates: {
          '2026-11-26': { EUR: 0.91, GBP: 0.75, JPY: 158, CHF: 0.82, CNY: 6.64 },
          '2026-11-27': { EUR: 0.92, GBP: 0.76, JPY: 159, CHF: 0.83, CNY: 6.65 },
        },
      }),
    });
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete global.fetch;
    delete global.ResizeObserver;
  });

  it('shows observed data for supported horizons and clear no-feed states for intraday horizons', async () => {
    await act(async () => {
      root.render(
        <TimeAnalysis
          chartData={[]}
          indicatorData={[]}
          fxData={{ date: '2026-11-27', rates: { EUR: 0.92, GBP: 0.76, JPY: 159, CHF: 0.83, CNY: 6.65 } }}
          fxError=""
          locationName="United States"
        />,
      );
    });

    const getTab = (name) => [...container.querySelectorAll('[role="tab"]')]
      .find((tab) => tab.textContent.includes(name));
    const panel = container.querySelector('[role="tabpanel"]');

    for (const [name, expected] of [
      ['Monthly', 'last available business-day rate in each calendar month'],
      ['Weekly', 'last available business-day rate in each calendar week'],
      ['Daily', 'daily business-day observations'],
    ]) {
      await act(async () => getTab(name).click());
      expect(getTab(name).getAttribute('aria-selected')).toBe('true');
      expect(panel.textContent).toContain(expected);
    }

    await act(async () => getTab('Hourly').click());
    expect(getTab('Hourly').getAttribute('aria-selected')).toBe('true');
    expect(panel.textContent).toContain('No hourly FX, market, payments, or event source is connected');

    await act(async () => getTab('Per minute').click());
    expect(getTab('Per minute').getAttribute('aria-selected')).toBe('true');
    expect(panel.textContent).toContain('No per-minute FX, market, payments, or event stream is connected');
  });

  it('supports arrow-key navigation between horizon tabs', async () => {
    await act(async () => {
      root.render(
        <TimeAnalysis chartData={[]} indicatorData={[]} fxData={null} fxError="" locationName="United States" />,
      );
    });
    const monthlyTab = [...container.querySelectorAll('[role="tab"]')]
      .find((tab) => tab.textContent.includes('Monthly'));

    await act(async () => {
      monthlyTab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });

    const weeklyTab = [...container.querySelectorAll('[role="tab"]')]
      .find((tab) => tab.textContent.includes('Weekly'));
    expect(weeklyTab.getAttribute('aria-selected')).toBe('true');
    expect(document.activeElement).toBe(weeklyTab);
  });
});
