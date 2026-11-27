import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertTriangle, Clock3, HelpCircle, Radio, TrendingUp } from 'lucide-react';

const HORIZONS = [
  { id: 'monthly', label: 'Monthly', detail: 'Economic indicators' },
  { id: 'weekly', label: 'Weekly', detail: 'Market & operations' },
  { id: 'daily', label: 'Daily', detail: 'FX reference rates' },
  { id: 'hourly', label: 'Hourly', detail: 'Market & event pulse' },
  { id: 'per-minute', label: 'Per minute', detail: 'Live signal monitor' },
];

const CURRENCIES = ['EUR', 'GBP', 'JPY', 'CHF', 'CNY'];

function getAvailability(horizon, fxData) {
  if (horizon === 'daily') {
    return fxData
      ? `A daily FX reference snapshot is available for ${fxData.date}. Historical daily rates are not stored here.`
      : 'The daily FX reference feed is unavailable. No historical daily sequence is connected.';
  }
  if (horizon === 'monthly') return 'No monthly macroeconomic series are connected. World Bank indicators below are published annually.';
  if (horizon === 'weekly') return 'No weekly market or operational history is connected. Annual public indicators are not downsampled into weekly readings.';
  if (horizon === 'hourly') return 'No hourly market, payments or event feed is connected. There are no hourly observations to analyze.';
  return 'No live market or event stream is connected. Per-minute observations are unavailable and are not simulated.';
}

function TimeAnalysis({ chartData, indicatorData, fxData, fxError, locationName }) {
  const [horizon, setHorizon] = React.useState('monthly');
  const selectedHorizon = HORIZONS.find((item) => item.id === horizon);
  const observedYears = new Set(chartData.map((item) => item.year)).size;

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
          {HORIZONS.map((item) => (
            <button
              aria-selected={horizon === item.id}
              className={`horizon-tab ${horizon === item.id ? 'selected' : ''}`}
              key={item.id}
              onClick={() => setHorizon(item.id)}
              role="tab"
              type="button"
            >
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </button>
          ))}
        </div>
      </div>

      <div className="content-grid horizon-content">
        <section className="panel horizon-status" role="tabpanel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{selectedHorizon.label.toUpperCase()} ANALYSIS</p>
              <h2>{selectedHorizon.detail}</h2>
            </div>
            {horizon === 'daily' && fxData ? <span className="source-pill"><span className="status-dot" /> Snapshot available</span> : <span className="source-pill unavailable-pill"><AlertTriangle size={13} /> Feed not connected</span>}
          </div>
          <p className="horizon-explanation">{getAvailability(horizon, fxData)}</p>

          {horizon === 'daily' && fxData && (
            <div className="fx-grid horizon-fx-grid">
              {CURRENCIES.map((code) => (
                <article className="fx-tile" key={code}>
                  <span>{code}</span>
                  <strong>{fxData.rates[code]?.toLocaleString(undefined, { maximumFractionDigits: 4 }) ?? 'No data'}</strong>
                  <small>per 1 USD</small>
                  <em>Reference rate · {fxData.date}</em>
                </article>
              ))}
            </div>
          )}
          {horizon === 'daily' && fxError && !fxData && <div className="error-banner"><AlertTriangle size={15} />{fxError}</div>}

          {horizon !== 'daily' && (
            <div className="resolution-notice">
              {horizon === 'per-minute' || horizon === 'hourly' ? <Radio size={17} /> : <HelpCircle size={17} />}
              <div>
                <strong>No {selectedHorizon.label.toLowerCase()} data source is configured</strong>
                <p>Connect a licensed, appropriately governed data provider to enable this horizon. The dashboard will not invent or interpolate observations.</p>
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
            <span>FX reference snapshot</span>
            <strong>{fxData ? `Daily · ${fxData.date}` : 'Unavailable'}</strong>
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
