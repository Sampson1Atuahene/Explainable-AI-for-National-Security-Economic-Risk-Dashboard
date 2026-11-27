import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Clock3, Radio, TrendingUp } from 'lucide-react';
import { aggregateFxHistory, fetchFxHistory } from '../utils/fxHistory';

const HORIZONS = [
  { id: 'monthly', label: 'Monthly', detail: 'Monthly FX reference' },
  { id: 'weekly', label: 'Weekly', detail: 'Weekly FX reference' },
  { id: 'daily', label: 'Daily', detail: 'Daily FX reference' },
  { id: 'hourly', label: 'Hourly', detail: 'Not connected' },
  { id: 'per-minute', label: 'Per minute', detail: 'Not connected' },
];

const CURRENCIES = [
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'CHF', name: 'Swiss franc' },
  { code: 'CNY', name: 'Chinese yuan' },
];

function getAvailability(horizon, observations, historyLoading, historyError, fxData) {
  if (horizon === 'monthly' || horizon === 'weekly' || horizon === 'daily') {
    if (historyLoading) return 'Loading historical USD FX reference rates from Frankfurter / ECB…';
    if (historyError) return `Historical FX reference data could not be loaded: ${historyError}`;
    if (observations.length) {
      const periodDescription = horizon === 'monthly'
        ? 'last available business-day rate in each calendar month'
        : horizon === 'weekly'
          ? 'last available business-day rate in each calendar week'
          : 'daily business-day observations';
      return `Showing ${observations.length} periods using the ${periodDescription}. Rates are reported per 1 USD; non-business days are omitted, not interpolated.`;
    }
    return fxData
      ? 'The latest reference snapshot is available, but historical FX observations are not currently available.'
      : 'Historical and latest FX reference rates are unavailable.';
  }
  if (horizon === 'hourly') {
    return 'No hourly FX, market, payments, or event source is connected. Hourly values are not estimated from daily observations.';
  }
  return 'No per-minute FX, market, payments, or event stream is connected. Live observations are not simulated.';
}

function TimeAnalysis({ chartData, indicatorData, fxData, fxError, locationName }) {
  const [horizon, setHorizon] = React.useState('monthly');
  const [currency, setCurrency] = React.useState('EUR');
  const [fxHistory, setFxHistory] = React.useState([]);
  const [historyLoading, setHistoryLoading] = React.useState(true);
  const [historyError, setHistoryError] = React.useState('');
  const tabRefs = React.useRef([]);
  const selectedHorizon = HORIZONS.find((item) => item.id === horizon);
  const observedYears = new Set(chartData.map((item) => item.year)).size;
  const periodData = React.useMemo(
    () => aggregateFxHistory(fxHistory, horizon),
    [fxHistory, horizon],
  );
  const selectedRates = periodData.map((point) => ({
    date: point.date,
    rate: point.rates[currency],
  }));
  const availableSeries = ['monthly', 'weekly', 'daily'].includes(horizon);

  React.useEffect(() => {
    const controller = new AbortController();
    setHistoryLoading(true);
    setHistoryError('');
    fetchFxHistory(controller.signal)
      .then((history) => {
        if (!controller.signal.aborted) setFxHistory(history);
      })
      .catch((error) => {
        if (error.name !== 'AbortError' && !controller.signal.aborted) {
          setHistoryError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });
    return () => controller.abort();
  }, []);

  const handleTabKeyDown = (event, index) => {
    let nextIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % HORIZONS.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + HORIZONS.length) % HORIZONS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = HORIZONS.length - 1;
    else return;

    event.preventDefault();
    setHorizon(HORIZONS[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="time-analysis-page" aria-label="Time horizon analysis">
      <div className="panel horizon-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">MULTI-HORIZON MONITOR</p>
            <h2>Choose an analysis horizon</h2>
          </div>
          <span className="source-pill"><Clock3 size={13} /> {locationName}</span>
        </div>
        <div className="horizon-tabs" role="tablist" aria-label="Analysis time horizon">
          {HORIZONS.map((item, index) => (
            <button
              aria-selected={horizon === item.id}
              aria-controls="horizon-panel"
              className={`horizon-tab ${horizon === item.id ? 'selected' : ''}`}
              id={`horizon-tab-${item.id}`}
              key={item.id}
              onClick={() => setHorizon(item.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              ref={(element) => { tabRefs.current[index] = element; }}
              role="tab"
              tabIndex={horizon === item.id ? 0 : -1}
              type="button"
            >
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid horizon-content">
        <section
          aria-labelledby={`horizon-tab-${horizon}`}
          className="panel horizon-status"
          id="horizon-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{selectedHorizon.label.toUpperCase()} ANALYSIS</p>
              <h2>{selectedHorizon.detail}</h2>
            </div>
            {availableSeries && !historyError && (fxHistory.length || historyLoading)
              ? <span className="source-pill"><span className={`status-dot ${historyLoading ? 'offline' : ''}`} />{historyLoading ? 'Loading reference history' : 'Frankfurter / ECB'}</span>
              : <span className="source-pill unavailable-pill"><AlertTriangle size={13} />{availableSeries ? 'History unavailable' : 'Feed not connected'}</span>}
          </div>
          <p aria-live="polite" className="horizon-explanation">{getAvailability(horizon, periodData, historyLoading, historyError, fxData)}</p>

          {horizon === 'daily' && fxData && (
            <div className="fx-grid horizon-fx-grid">
              {CURRENCIES.map(({ code, name }) => (
                <article className="fx-tile" key={code}>
                  <span>{code}</span>
                  <strong>{fxData.rates[code]?.toLocaleString(undefined, { maximumFractionDigits: 4 }) ?? 'No data'}</strong>
                  <small>{name}</small>
                  <small>per 1 USD</small>
                  <em>Reference rate · {fxData.date}</em>
                </article>
              ))}
            </div>
          )}
          {horizon === 'daily' && fxError && !fxData && <div className="error-banner"><AlertTriangle size={15} />{fxError}</div>}

          {availableSeries && (
            <section className="fx-history-panel" aria-label={`${selectedHorizon.label} FX reference history`}>
              <div className="fx-history-controls">
                <label htmlFor="fx-history-currency">Currency per USD</label>
                <select
                  id="fx-history-currency"
                  aria-label="FX history currency"
                  onChange={(event) => setCurrency(event.target.value)}
                  value={currency}
                >
                  {CURRENCIES.map(({ code, name }) => <option key={code} value={code}>{code} · {name}</option>)}
                </select>
                <span>Last 12 months · {selectedHorizon.label.toLowerCase()} period end</span>
              </div>
              {historyLoading ? (
                <div className="empty-chart" role="status">Loading observed reference rates…</div>
              ) : historyError ? (
                <div className="fx-history-error" role="alert"><AlertTriangle size={15} />{historyError}</div>
              ) : selectedRates.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={selectedRates} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#e9eef5" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#8290a4', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={28} />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: '#8290a4', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [`${Number(value).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${currency} per USD`, 'Reference rate']} />
                    <Line type="monotone" dataKey="rate" name={`${currency} per USD`} stroke="#2784ef" strokeWidth={2} dot={false} activeDot={{ r: 4 }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-chart">No historical FX observations are available for this period.</div>
              )}
            </section>
          )}

          {!availableSeries && (
            <div className="resolution-notice">
              <Radio size={17} />
              <div>
                <strong>{selectedHorizon.label} data is not connected</strong>
                <p>Connect a licensed, appropriately governed intraday data provider to enable this horizon. Daily FX rates are not downsampled or interpolated into {selectedHorizon.label.toLowerCase()} observations.</p>
              </div>
            </div>
          )}
        </section>

        <section className="panel resolution-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SOURCE COVERAGE</p>
              <h2>What is available now</h2>
            </div>
            <TrendingUp size={18} className="panel-icon" />
          </div>
          <div className="resolution-row">
            <span>Macro &amp; banking series</span>
            <strong>{indicatorData.filter((item) => item.observations?.length).length} series · annual</strong>
          </div>
          <div className="resolution-row">
            <span>Historical chart coverage</span>
            <strong>{observedYears} annual periods</strong>
          </div>
          <div className="resolution-row">
            <span>FX reference history</span>
            <strong>{historyLoading ? 'Loading' : historyError ? 'Unavailable' : `${fxHistory.length} daily observations`}</strong>
          </div>
          <div className="resolution-row">
            <span>Hourly / minute streams</span>
            <strong>Not connected</strong>
          </div>
          <p className="source-disclaimer">Sources: World Bank Open Data and Frankfurter / ECB reference rates. Publication cadence and reporting periods vary; neither feed provides a real-time market or security-event stream.</p>
        </section>
      </div>

      <section className="panel annual-context-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">LONG-RUN CONTEXT · ANNUAL ONLY</p>
            <h2>Reported macro &amp; banking indicators</h2>
          </div>
          <span className="source-pill"><Clock3 size={13} /> World Bank Open Data</span>
        </div>
        {chartData.length ? (
          <div className="chart-area">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="annualGdpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2784ef" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2784ef" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e9eef5" strokeDasharray="3 5" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#8290a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8290a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]} />
                <Area type="monotone" dataKey="gdpGrowth" name="GDP growth" stroke="#2784ef" strokeWidth={2} fill="url(#annualGdpFill)" connectNulls />
                <Area type="monotone" dataKey="inflation" name="Inflation" stroke="#f29e4c" strokeWidth={2} fill="transparent" connectNulls />
                <Area type="monotone" dataKey="npl" name="Bank NPLs" stroke="#8a6be8" strokeWidth={2} fill="transparent" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <span><i className="legend-blue" /> GDP growth</span>
              <span><i className="legend-orange" /> Inflation</span>
              <span><i className="legend-violet" /> Bank NPLs</span>
              <span className="legend-unit">Annual %</span>
            </div>
          </div>
        ) : <div className="empty-chart">Annual history will appear when source observations are available.</div>}
        <div className="table-footnote">The chart shows reported annual observations only. It is structural context and does not imply monthly, weekly, daily, hourly or per-minute coverage.</div>
      </section>
    </section>
  );
}

export default TimeAnalysis;
