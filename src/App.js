import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  ChevronDown,
  HelpCircle,
  Clock3,
  Download,
  Globe2,
  Landmark,
  MapPin,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import AnalystChat from './components/AnalystChat';
import Methodology from './components/Methodology';
import TimeAnalysis from './components/TimeAnalysis';
import { getCountryOptions, REGIONS } from './config/geography';
import { fetchWorldBank } from './utils/worldBank';

const API_BASE = '/api/worldbank/v2';
const FX_API = '/api/fx/v1/latest?from=USD&to=EUR,GBP,JPY,CHF,CAD,AUD,CNY,INR,BRL,ZAR';
const FX_CURRENCIES = [
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British pound' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'CHF', name: 'Swiss franc' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'CNY', name: 'Chinese yuan' },
  { code: 'INR', name: 'Indian rupee' },
  { code: 'BRL', name: 'Brazilian real' },
  { code: 'ZAR', name: 'South African rand' },
];

const INDICATORS = [
  {
    key: 'gdpGrowth',
    name: 'GDP growth',
    code: 'NY.GDP.MKTP.KD.ZG',
    unit: '%',
    decimals: 1,
    category: 'Macro',
    description: 'Annual real GDP growth',
    risk: (value) => clamp((2 - value) * 1.5),
    weight: 0.19,
  },
  {
    key: 'inflation',
    name: 'Inflation',
    code: 'FP.CPI.TOTL.ZG',
    unit: '%',
    decimals: 1,
    category: 'Macro',
    description: 'Consumer prices, annual change',
    risk: (value) => clamp(Math.abs(value)),
    weight: 0.16,
  },
  {
    key: 'unemployment',
    name: 'Unemployment',
    code: 'SL.UEM.TOTL.ZS',
    unit: '%',
    decimals: 1,
    category: 'Macro',
    description: 'Unemployment, modeled ILO estimate',
    risk: (value) => clamp((value / 15) * 10),
    weight: 0.1,
  },
  {
    key: 'currentAccount',
    name: 'Current account',
    code: 'BN.CAB.XOKA.GD.ZS',
    unit: '% GDP',
    decimals: 1,
    category: 'External',
    description: 'Current account balance as a share of GDP',
    risk: (value) => clamp(Math.max(0, -value)),
    weight: 0.1,
  },
  {
    key: 'lendingRate',
    name: 'Lending rate',
    code: 'FR.INR.LEND',
    unit: '%',
    decimals: 1,
    category: 'Rates',
    description: 'Bank lending rate',
  },
  {
    key: 'npl',
    name: 'Bank NPLs',
    code: 'FB.AST.NPER.ZS',
    unit: '%',
    decimals: 1,
    category: 'Banking',
    description: 'Nonperforming loans as a share of gross loans',
    risk: (value) => clamp(value),
    weight: 0.2,
  },
  {
    key: 'capitalAdequacy',
    name: 'Capital adequacy',
    code: 'FB.BNK.CAPA.ZS',
    unit: '%',
    decimals: 1,
    category: 'Banking',
    description: 'Regulatory capital to risk-weighted assets',
    risk: (value) => clamp((15 - value) * 0.7),
    weight: 0.1,
  },
  {
    key: 'privateCredit',
    name: 'Private credit',
    code: 'FS.AST.PRVT.GD.ZS',
    unit: '% GDP',
    decimals: 1,
    category: 'Banking',
    description: 'Domestic credit to the private sector',
  },
  {
    key: 'reserves',
    name: 'FX reserves',
    code: 'FI.RES.TOTL.CD',
    unit: 'USD',
    decimals: 0,
    category: 'External',
    description: 'Total reserves, including gold',
  },
  {
    key: 'governmentDebt',
    name: 'Public debt',
    code: 'GC.DOD.TOTL.GD.ZS',
    unit: '% GDP',
    decimals: 1,
    category: 'Sovereign',
    description: 'Central government debt as a share of GDP',
    risk: (value) => clamp((value / 120) * 10),
    weight: 0.15,
  },
];

const SCENARIOS = [
  { id: 'baseline', name: 'Baseline', description: 'Use reported observations without adjustments.' },
  { id: 'recession', name: 'Recession', description: 'GDP −3pp; unemployment +2pp; NPLs +1pp.' },
  { id: 'trade', name: 'Trade disruption', description: 'Inflation +1.5pp; current account −2pp of GDP.' },
  { id: 'cyber', name: 'Cyber outage', description: 'Operational stress; macro indicators remain unchanged.' },
  { id: 'disaster', name: 'Severe weather', description: 'GDP −1pp; inflation and unemployment +0.5pp.' },
];

const clamp = (value) => Math.max(0, Math.min(10, value));

async function fetchCountries(signal) {
  const response = await fetchWorldBank(`${API_BASE}/country?format=json&per_page=400`, signal);
  if (!response.ok) throw new Error(`Country directory request failed (${response.status})`);
  const payload = await response.json();
  if (!Array.isArray(payload?.[1])) throw new Error('Country directory response was invalid');

  return payload[1]
    .filter((country) => country.region?.value && country.region.value !== 'Aggregates')
    .map((country) => ({
      code: country.id,
      name: country.name,
      region: country.region.value.trim(),
      regionCode: country.region.id,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function fetchIndicator(indicator, locationCode, signal) {
  const url = `${API_BASE}/country/${locationCode}/indicator/${indicator.code}?format=json&per_page=30&date=2010:2026`;
  const response = await fetchWorldBank(url, signal);
  if (!response.ok) throw new Error(`${indicator.name} request failed (${response.status})`);
  const payload = await response.json();
  if (!Array.isArray(payload?.[1])) throw new Error(`${indicator.name} response was invalid`);

  const observations = payload[1]
    .filter((point) => point.value !== null && Number.isFinite(Number(point.value)))
    .map((point) => ({ year: point.date, value: Number(point.value) }))
    .sort((left, right) => Number(left.year) - Number(right.year));

  return {
    ...indicator,
    observations,
    latest: observations[observations.length - 1] || null,
    sourceUpdated: payload[0]?.lastupdated || null,
  };
}

function getScreeningSignal(indicators) {
  const scored = indicators
    .filter((indicator) => indicator.latest && indicator.risk && indicator.weight)
    .map((indicator) => ({
      ...indicator,
      riskValue: indicator.risk(indicator.latest.value),
    }));

  const availableWeight = scored.reduce((sum, indicator) => sum + indicator.weight, 0);
  if (!availableWeight) return { score: null, drivers: [], coverage: 0 };

  const score =
    scored.reduce((sum, indicator) => sum + indicator.riskValue * indicator.weight, 0) /
    availableWeight;
  const drivers = scored
    .map((indicator) => ({
      name: indicator.name,
      score: indicator.riskValue,
      contribution: (indicator.riskValue * indicator.weight) / availableWeight,
      year: indicator.latest.year,
    }))
    .sort((left, right) => right.contribution - left.contribution);

  return { score, drivers, coverage: scored.length };
}

function formatValue(indicator, value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (indicator.key === 'reserves') {
    const trillions = value / 1e12;
    if (Math.abs(trillions) >= 1) return `$${trillions.toFixed(2)}T`;
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  return `${value.toFixed(indicator.decimals)}${indicator.unit === '%' ? '%' : ` ${indicator.unit}`}`;
}

function getRiskTone(score) {
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function App() {
  const [activePage, setActivePage] = useState(() => {
    const initialPage = window.location.hash.slice(1);
    return ['analysis', 'assistant', 'methodology'].includes(initialPage) ? initialPage : 'overview';
  });
  const [countries, setCountries] = useState([]);
  const [countryError, setCountryError] = useState('');
  const [regionCode, setRegionCode] = useState('WLD');
  const [countryCode, setCountryCode] = useState('');
  const [subnationalName, setSubnationalName] = useState('');
  const [indicatorData, setIndicatorData] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [failedIndicators, setFailedIndicators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [historyYears, setHistoryYears] = useState(10);
  const [selectedScenario, setSelectedScenario] = useState('baseline');
  const [refreshCount, setRefreshCount] = useState(0);
  const [fxData, setFxData] = useState(null);
  const [fxError, setFxError] = useState('');
  const [fxLoading, setFxLoading] = useState(true);

  useEffect(() => {
    const handleHashChange = () => {
      const page = window.location.hash.slice(1);
      setActivePage(['analysis', 'assistant', 'methodology'].includes(page) ? page : 'overview');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToPage = (page) => {
    setActivePage(page);
    if (window.location.hash !== `#${page}`) window.location.hash = page;
  };

  const selectedCountry = countries.find((country) => country.code === countryCode);
  const selectedRegion = REGIONS.find((region) => region.code === regionCode) || REGIONS[0];
  const locationCode = selectedCountry?.code || regionCode;
  const locationName = selectedCountry?.name || selectedRegion.name;
  const geographyName = subnationalName.trim() && selectedCountry
    ? `${subnationalName.trim()}, ${selectedCountry.name}`
    : locationName;

  useEffect(() => {
    const controller = new AbortController();
    fetchCountries(controller.signal)
      .then(setCountries)
      .catch((error) => {
        if (error.name !== 'AbortError') setCountryError(error.message);
      });
    return () => controller.abort();
  }, []);

  const loadData = useCallback(async (signal) => {
    setLoading(true);
    setLoadError('');

    const results = await Promise.allSettled(
      INDICATORS.map((indicator) => fetchIndicator(indicator, locationCode, signal)),
    );
    if (signal.aborted) return;

    const successful = results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => result.value);
    const failed = results
      .map((result, index) => (result.status === 'rejected' ? INDICATORS[index].name : null))
      .filter(Boolean);

    setIndicatorData(successful);
    setFailedIndicators(failed);
    setLastRefreshed(new Date());
    if (successful.length === 0) {
      const reason = results.find((result) => result.status === 'rejected')?.reason;
      setLoadError(reason?.message || 'No indicator data could be loaded.');
    }
    setLoading(false);
  }, [locationCode]);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    const intervalId = window.setInterval(() => loadData(controller.signal), 15 * 60 * 1000);
    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [loadData, refreshCount]);

  useEffect(() => {
    const controller = new AbortController();
    const refreshRates = async () => {
      setFxLoading(true);
      setFxError('');
      try {
        const response = await fetch(FX_API, { signal: controller.signal });
        if (!response.ok) throw new Error(`FX reference request failed (${response.status})`);
        const data = await response.json();
        if (!data.date || !data.rates || FX_CURRENCIES.some(({ code }) => !Number.isFinite(data.rates[code]))) {
          throw new Error('FX reference response was incomplete');
        }
        if (!controller.signal.aborted) setFxData(data);
      } catch (error) {
        if (error.name !== 'AbortError' && !controller.signal.aborted) setFxError(error.message);
      } finally {
        if (!controller.signal.aborted) setFxLoading(false);
      }
    };

    refreshRates();
    const intervalId = window.setInterval(refreshRates, 15 * 60 * 1000);
    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [refreshCount]);

  const scenarioIndicators = useMemo(() => {
    const adjustments = {
      recession: { gdpGrowth: -3, unemployment: 2, npl: 1 },
      trade: { inflation: 1.5, currentAccount: -2 },
      disaster: { gdpGrowth: -1, inflation: 0.5, unemployment: 0.5 },
    }[selectedScenario] || {};

    return indicatorData.map((indicator) => {
      const delta = adjustments[indicator.key];
      if (!delta || !indicator.latest) return indicator;
      return {
        ...indicator,
        latest: { ...indicator.latest, value: indicator.latest.value + delta },
      };
    });
  }, [indicatorData, selectedScenario]);

  const signal = useMemo(() => getScreeningSignal(scenarioIndicators), [scenarioIndicators]);
  const baselineSignal = useMemo(() => getScreeningSignal(indicatorData), [indicatorData]);
  const availableIndicators = useMemo(
    () => INDICATORS.map((indicator) => indicatorData.find((item) => item.key === indicator.key) || indicator),
    [indicatorData],
  );
  const coverage = availableIndicators.filter((indicator) => indicator.latest).length;
  const confidence = coverage >= 8
    ? { label: 'Strong', detail: 'Broad indicator coverage', tone: 'strong' }
    : coverage >= 6
      ? { label: 'Moderate', detail: 'Several principal indicators available', tone: 'moderate' }
      : { label: 'Limited', detail: 'Interpretation should be constrained', tone: 'limited' };
  const executiveBrief = useMemo(() => {
    if (signal.score === null) {
      return `The available public record is insufficient to produce a defensible screening signal for ${geographyName}. Focus on source gaps and obtain institution-specific or licensed data before operational use.`;
    }
    const topDriver = signal.drivers[0];
    const driverText = topDriver
      ? `The largest modeled contribution is ${topDriver.name.toLowerCase()} (${topDriver.contribution.toFixed(1)} points).`
      : '';
    return `${geographyName} is at a ${getRiskTone(signal.score)} macro-financial screening level (${signal.score.toFixed(1)} / 10) with ${coverage} of ${INDICATORS.length} indicators available. ${driverText} This is a transparent public-source screen, not a forecast or assessment of institutional solvency.`;
  }, [coverage, geographyName, signal]);
  const analystContext = useMemo(() => ({
    geography: geographyName,
    score: signal.score,
    tone: signal.score === null ? 'unavailable' : getRiskTone(signal.score),
    drivers: signal.drivers,
    indicators: availableIndicators.map((indicator) => ({
      name: indicator.name,
      latest: indicator.latest,
      unit: indicator.unit,
      decimals: indicator.decimals,
    })),
    fxDate: fxData?.date || null,
  }), [availableIndicators, fxData, geographyName, signal]);
  const chartData = useMemo(() => {
    const seriesByYear = new Map();
    indicatorData
      .filter((indicator) => ['gdpGrowth', 'inflation', 'npl'].includes(indicator.key))
      .forEach((indicator) => {
        indicator.observations.forEach((point) => {
          if (Number(point.year) < new Date().getFullYear() - historyYears) return;
          const row = seriesByYear.get(point.year) || { year: point.year };
          row[indicator.key] = point.value;
          seriesByYear.set(point.year, row);
        });
      });
    return [...seriesByYear.values()].sort((left, right) => Number(left.year) - Number(right.year));
  }, [historyYears, indicatorData]);

  const countryOptions = getCountryOptions(countries, regionCode);
  const activeScenario = SCENARIOS.find((scenario) => scenario.id === selectedScenario);
  const sourceStatus = loadError
    ? 'SOURCE ERROR'
    : loading && !coverage
      ? 'CONNECTING'
      : loading
        ? 'UPDATING'
        : coverage
          ? 'SOURCE AVAILABLE'
          : 'SOURCE IDLE';

  const chooseRegion = (event) => {
    setRegionCode(event.target.value);
    setCountryCode('');
    setSubnationalName('');
  };

  const chooseCountry = (event) => {
    const nextCountry = countries.find((country) => country.code === event.target.value);
    setCountryCode(nextCountry?.code || '');
    setSubnationalName('');
    if (nextCountry) {
      const matchingRegion = REGIONS.find((region) => region.code === nextCountry.regionCode);
      if (matchingRegion) setRegionCode(matchingRegion.code);
    }
  };

  const exportRows = useMemo(() => availableIndicators.map((indicator) => ({
    Indicator: indicator.name,
    Value: indicator.latest?.value ?? '',
    Unit: indicator.unit,
    Period: indicator.latest?.year ?? '',
    Category: indicator.category,
    'World Bank indicator code': indicator.code,
    'Geographic scope': geographyName,
  })), [availableIndicators, geographyName]);

  const exportToExcel = () => {
    if (!coverage) {
      toast.error('There is no indicator data to export.');
      return;
    }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(exportRows), 'Indicators');
    XLSX.writeFile(workbook, `risk-brief-${locationCode}-${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success('Indicator brief exported.');
  };

  const exportToPDF = () => {
    if (!coverage) {
      toast.error('There is no indicator data to export.');
      return;
    }
    const document = new jsPDF();
    document.setFontSize(18);
    document.text('ATLAS National Economic Resilience Brief', 16, 20);
    document.setFontSize(10);
    document.text(`Geography: ${geographyName}`, 16, 29);
    document.text(`Source: World Bank Open Data · retrieved ${lastRefreshed?.toLocaleString() || '—'}`, 16, 36);
    document.text(`Coverage: ${coverage} of ${INDICATORS.length} indicators · confidence: ${confidence.label}`, 16, 43);
    document.text(`Screening signal: ${signal.score === null ? 'Insufficient data' : `${signal.score.toFixed(1)} / 10`}`, 16, 50);
    const briefLines = document.splitTextToSize(executiveBrief, 178);
    document.text(briefLines, 16, 58);
    let y = 58 + briefLines.length * 5 + 8;
    document.text('Method and caveats:', 16, y);
    y += 7;
    document.text(document.splitTextToSize('Available indicators are normalized to 0–10 and weighted; weights are renormalized across available observations. This is decision support, not a forecast, credit rating or regulatory assessment.', 178), 16, y);
    y += 25;
    availableIndicators.forEach((indicator) => {
      const text = `${indicator.name}: ${indicator.latest ? `${formatValue(indicator, indicator.latest.value)} (${indicator.latest.year})` : 'Not available'}`;
      document.text(text, 16, y);
      y += 7;
      if (y > 275) {
        document.addPage();
        y = 20;
      }
    });
    document.save(`risk-brief-${locationCode}-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('Indicator brief exported.');
  };

  const operationalSignals = useMemo(() => {
    const getValue = (key) => indicatorData.find((indicator) => indicator.key === key)?.latest?.value;
    const flags = [];
    if (getValue('gdpGrowth') <= 0) flags.push({ level: 'high', title: 'Growth contraction', detail: 'GDP growth is at or below zero; review borrower and sector concentration.' });
    if (getValue('inflation') >= 7) flags.push({ level: 'medium', title: 'Elevated inflation', detail: 'Reassess pricing, real income assumptions and local-currency exposures.' });
    if (getValue('npl') >= 8) flags.push({ level: 'high', title: 'Asset-quality watch', detail: 'Reported NPL ratio is elevated; review portfolio migration and provisioning.' });
    if (getValue('capitalAdequacy') > 0 && getValue('capitalAdequacy') < 12) flags.push({ level: 'high', title: 'Capital buffer watch', detail: 'Reported capital adequacy is below 12%; validate against local requirements.' });
    if (getValue('currentAccount') <= -5) flags.push({ level: 'medium', title: 'External funding watch', detail: 'Current-account deficit may increase external funding and FX sensitivity.' });
    return flags;
  }, [indicatorData]);

  return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => navigateToPage('overview')} aria-label="ATLAS economic resilience home">
          <span className="brand-mark"><Landmark size={20} /></span>
          <span><strong>ATLAS</strong><small>ECONOMIC RESILIENCE</small></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <button aria-current={activePage === 'overview' ? 'page' : undefined} className={`nav-link ${activePage === 'overview' ? 'active' : ''}`} onClick={() => navigateToPage('overview')} type="button"><Activity size={17} /> Risk overview</button>
        <button aria-current={activePage === 'analysis' ? 'page' : undefined} className={`nav-link ${activePage === 'analysis' ? 'active' : ''}`} onClick={() => navigateToPage('analysis')} type="button"><TrendingUp size={17} /> Time analysis</button>
        <button aria-current={activePage === 'assistant' ? 'page' : undefined} className={`nav-link ${activePage === 'assistant' ? 'active' : ''}`} onClick={() => navigateToPage('assistant')} type="button"><Sparkles size={17} /> AI analyst</button>
        <button aria-current={activePage === 'methodology' ? 'page' : undefined} className={`nav-link ${activePage === 'methodology' ? 'active' : ''}`} onClick={() => navigateToPage('methodology')} type="button"><Shield size={17} /> Methodology</button>
        <div className="sidebar-bottom">
          <div className="source-status"><span className="status-dot" /> Public data sources</div>
          <p>Decision support only. Not a credit rating, investment recommendation or substitute for bank policy.</p>
        </div>
      </aside>

      <main className="main-content" id="overview">
        <header className="topbar">
          <div className="breadcrumb"><span>Risk intelligence</span><span className="crumb-separator">/</span><strong>{geographyName}</strong></div>
          <div className="topbar-actions">
            <div className={`live-badge ${loadError ? 'unavailable' : ''}`}><span className="status-dot" /> {sourceStatus}</div>
            <button className="button button-outline" onClick={exportToExcel}><Download size={15} /> Export</button>
            <button className="button button-primary" onClick={() => setRefreshCount((count) => count + 1)} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spinning' : ''} /> {loading ? 'Updating' : 'Refresh'}
            </button>
          </div>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">NATIONAL ECONOMIC RESILIENCE MONITOR</p>
            <h1>{activePage === 'analysis'
              ? 'Time horizon analysis'
              : activePage === 'assistant'
                ? 'AI analyst'
                : activePage === 'methodology'
                  ? 'Methodology & governance'
                  : 'Executive risk overview'}</h1>
            <p className="page-subtitle">{activePage === 'analysis'
              ? 'Explore available reporting horizons without mistaking annual observations for live signals.'
              : activePage === 'assistant'
                ? 'Ask questions about the selected geography and the data currently available.'
                : activePage === 'methodology'
                  ? 'Review data lineage, model design, limitations and responsible-use controls.'
                : 'Explainable country, regional and bank-operations intelligence.'}</p>
          </div>
          <div className="updated-label"><Clock3 size={15} />{lastRefreshed ? `Retrieved ${lastRefreshed.toLocaleTimeString()}` : 'Connecting to source'}</div>
        </section>

        <section className="filter-bar" aria-label="Geography filters">
          <div className="filter-intro"><Globe2 size={18} /><div><strong>Geographic lens</strong><small>Drill from a World Bank region to a country.</small></div></div>
          <label className="filter-control">
            <span>CONTINENT / REGION</span>
            <div className="select-wrap">
              <select value={regionCode} onChange={chooseRegion} aria-label="Continent or region">
                {REGIONS.map((region) => <option key={region.code} value={region.code}>{region.name}</option>)}
              </select>
              <ChevronDown size={15} />
            </div>
          </label>
          <label className="filter-control country-filter">
            <span>COUNTRY</span>
            <div className="select-wrap search-select">
              <Search size={15} />
              <select value={countryCode} onChange={chooseCountry} aria-label="Country">
                <option value="">All countries (select any region)</option>
                {countryOptions.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
              </select>
              <ChevronDown size={15} />
            </div>
            {countryError && <small className="error-hint">{countryError}</small>}
          </label>
          <label className={`filter-control subnational-filter ${selectedCountry ? '' : 'disabled'}`}>
            <span>STATE / PROVINCE <em>OPTIONAL</em></span>
            <input
              type="text"
              placeholder={selectedCountry ? 'Enter a state, province or territory' : 'Select a country first'}
              value={subnationalName}
              onChange={(event) => setSubnationalName(event.target.value)}
              disabled={!selectedCountry}
              aria-label="State or province"
            />
          </label>
        </section>

        {!selectedCountry && (
          <div className="scope-note"><MapPin size={15} /> Region-level World Bank aggregate: <strong>{selectedRegion.shortName}</strong>. Select a country to drill down.</div>
        )}
        {selectedCountry && (
          <div className="scope-note"><HelpCircle size={15} /> {subnationalName.trim()
            ? <span>Subnational area selected: <strong>{subnationalName.trim()}</strong>. The indicators below remain country-level; this public source does not provide comparable state/province series.</span>
            : <span>Country-level indicators for <strong>{selectedCountry.name}</strong>. Add a state or province for your workspace context; public-source data remains national.</span>}
        </div>
        )}

        {activePage === 'overview' && (
          <section className="executive-brief" aria-label="Executive assessment">
            <div className="executive-icon"><ShieldCheck size={20} /></div>
            <div className="executive-copy">
              <p className="eyebrow">EXECUTIVE ASSESSMENT</p>
              <p>{executiveBrief}</p>
            </div>
            <div className={`confidence-block ${confidence.tone}`}>
              <span>DATA CONFIDENCE</span>
              <strong>{confidence.label}</strong>
              <small>{confidence.detail}</small>
            </div>
          </section>
        )}

        {loadError && <div className="error-banner"><AlertTriangle size={17} />{loadError}<button onClick={() => setRefreshCount((count) => count + 1)}>Retry</button></div>}
        {!!failedIndicators.length && !loadError && (
          <div className="partial-banner">
            <HelpCircle size={16} /> {failedIndicators.length} indicator source{failedIndicators.length > 1 ? 's' : ''} could not be reached. Available values are shown; unavailable observations are not imputed.
          </div>
        )}

        {activePage === 'overview' && (
          <>
        <section className="summary-grid" aria-label="Risk summary">
          <article className={`signal-card ${signal.score === null ? '' : getRiskTone(signal.score)}`}>
            <div className="card-topline"><span>MACRO-FINANCIAL SCREENING SIGNAL</span><ShieldCheck size={18} /></div>
            <div className="signal-number">{loading && !coverage ? '—' : signal.score === null ? 'N/A' : signal.score.toFixed(1)}<small>{signal.score === null ? '' : '/ 10'}</small></div>
            <div className="signal-foot">{signal.score === null ? 'Insufficient indicator coverage' : `${getRiskTone(signal.score).toUpperCase()} · transparent weighted index`}</div>
            <div className="signal-progress"><span style={{ width: `${signal.score === null ? 0 : signal.score * 10}%` }} /></div>
          </article>
          <article className="summary-card">
            <div className="card-topline">DATA COVERAGE <HelpCircle size={16} /></div>
            <div className="summary-value">{coverage}<small> / {INDICATORS.length}</small></div>
            <div className="summary-foot">Indicators with a latest observation</div>
            <div className="mini-caption">Coverage varies by region and reporting period.</div>
          </article>
          <article className="summary-card">
            <div className="card-topline">LATEST GDP GROWTH <TrendingUp size={16} /></div>
            <div className="summary-value">{formatValue(availableIndicators.find((indicator) => indicator.key === 'gdpGrowth'), availableIndicators.find((indicator) => indicator.key === 'gdpGrowth')?.latest?.value)} </div>
            <div className="summary-foot">Annual real GDP · {availableIndicators.find((indicator) => indicator.key === 'gdpGrowth')?.latest?.year || 'no observation'}</div>
            <div className="mini-caption">World Bank national accounts series.</div>
          </article>
          <article className="summary-card">
            <div className="card-topline">LATEST BANK NPL RATIO <Building2 size={16} /></div>
            <div className="summary-value">{formatValue(availableIndicators.find((indicator) => indicator.key === 'npl'), availableIndicators.find((indicator) => indicator.key === 'npl')?.latest?.value)}</div>
            <div className="summary-foot">Nonperforming loans · {availableIndicators.find((indicator) => indicator.key === 'npl')?.latest?.year || 'no observation'}</div>
            <div className="mini-caption">Latest reported country-level series.</div>
          </article>
        </section>

        <div className="content-grid">
          <section className="panel chart-panel" id="indicators">
            <div className="panel-heading">
              <div><p className="eyebrow">HISTORICAL SERIES</p><h2>Macro & banking indicators</h2></div>
              <label className="compact-select"><span className="sr-only">Chart history</span><select value={historyYears} onChange={(event) => setHistoryYears(Number(event.target.value))}><option value={5}>5 years</option><option value={10}>10 years</option><option value={15}>15 years</option></select><ChevronDown size={14} /></label>
            </div>
            {chartData.length ? (
              <div className="chart-area">
                <ResponsiveContainer width="100%" height={270}>
                  <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gdpFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2784ef" stopOpacity={0.2} /><stop offset="95%" stopColor="#2784ef" stopOpacity={0} /></linearGradient>
                      <linearGradient id="inflationFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f29e4c" stopOpacity={0.14} /><stop offset="95%" stopColor="#f29e4c" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e9eef5" strokeDasharray="3 5" vertical={false} />
                    <XAxis dataKey="year" tick={{ fill: '#8290a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#8290a4', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]} contentStyle={{ borderRadius: 8, border: '1px solid #e8edf4', boxShadow: '0 8px 24px #172a4614' }} />
                    <Area type="monotone" dataKey="gdpGrowth" name="GDP growth" stroke="#2784ef" strokeWidth={2.2} fill="url(#gdpFill)" connectNulls />
                    <Area type="monotone" dataKey="inflation" name="Inflation" stroke="#f29e4c" strokeWidth={2} fill="url(#inflationFill)" connectNulls />
                    <Area type="monotone" dataKey="npl" name="Bank NPLs" stroke="#8a6be8" strokeWidth={2} fill="transparent" connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="chart-legend"><span><i className="legend-blue" /> GDP growth</span><span><i className="legend-orange" /> Inflation</span><span><i className="legend-violet" /> Bank NPLs</span><span className="legend-unit">Annual %</span></div>
              </div>
            ) : <div className="empty-chart">{loading ? 'Loading historical observations…' : 'No historical series available for this geography.'}</div>}
          </section>

          <section className="panel explain-panel" id="explainability">
            <div className="panel-heading">
              <div><p className="eyebrow">EXPLAINABLE ANALYTICS</p><h2>What is driving the signal?</h2></div>
              <span className="xai-chip"><Sparkles size={13} /> XAI</span>
            </div>
            <p className="panel-description">Weighted contribution to the screening index. Higher contribution means greater influence—not causation.</p>
            {signal.drivers.length ? (
              <div className="driver-list">
                {signal.drivers.slice(0, 5).map((driver) => (
                  <div className="driver-row" key={driver.name}>
                    <div className="driver-label"><span>{driver.name}</span><strong>{driver.contribution.toFixed(1)} pts</strong></div>
                    <div className="driver-track"><span style={{ width: `${Math.min(100, driver.contribution * 10)}%` }} /></div>
                    <div className="driver-meta">Input score {driver.score.toFixed(1)} / 10 · observation {driver.year}</div>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state">{loading ? 'Calculating contributions…' : 'Not enough data to calculate contributions.'}</div>}
            <div className="method-note"><HelpCircle size={15} /><span><strong>Method:</strong> weighted, normalized macro-financial indicators. Weights are renormalized over available data. This screening index is not a validated credit rating or predictive model.</span></div>
          </section>
        </div>

        <section className="panel table-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">SOURCE OBSERVATIONS</p><h2>Indicator monitor</h2></div>
            <span className="source-pill"><span className="status-dot" /> World Bank Open Data</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>INDICATOR</th><th>CATEGORY</th><th>LATEST VALUE</th><th>PERIOD</th><th>RISK INPUT</th><th>SOURCE SERIES</th></tr></thead>
              <tbody>
                {availableIndicators.map((indicator) => {
                  const riskValue = indicator.latest && indicator.risk ? indicator.risk(indicator.latest.value) : null;
                  return (
                    <tr key={indicator.key}>
                      <td><strong>{indicator.name}</strong><small>{indicator.description}</small></td>
                      <td><span className="category-tag">{indicator.category}</span></td>
                      <td className="value-cell">{indicator.latest ? formatValue(indicator, indicator.latest.value) : <span className="muted">Unavailable</span>}</td>
                      <td>{indicator.latest?.year || '—'}</td>
                      <td>{riskValue === null ? <span className="muted">Context only</span> : <span className={`risk-dot-label ${getRiskTone(riskValue)}`}><i />{riskValue.toFixed(1)} / 10</span>}</td>
                      <td><a href={`https://api.worldbank.org/v2/country/${locationCode}/indicator/${indicator.code}?format=json`} target="_blank" rel="noreferrer">{indicator.code}</a></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-footnote">Values are the latest non-null annual observation returned for each series; reporting periods can differ. The World Bank does not provide comparable state/province values for all indicators.</div>
        </section>

        <section className="panel fx-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">TREASURY REFERENCE</p><h2>Daily FX reference rates</h2></div>
            <span className="source-pill"><span className={`status-dot ${fxError ? 'offline' : ''}`} />{fxData ? `As of ${fxData.date}` : fxLoading ? 'Updating rates' : 'Rates unavailable'}</span>
          </div>
          {fxData ? (
            <div className="fx-grid">
              {FX_CURRENCIES.map(({ code, name }) => (
                <article className="fx-tile" key={code}>
                  <span>{code}</span>
                  <strong>{fxData.rates[code].toLocaleString(undefined, { maximumFractionDigits: 4 })}</strong>
                  <small>{name}</small>
                  <em>per 1 USD</em>
                </article>
              ))}
            </div>
          ) : (
            <div className={`fx-empty ${fxError ? 'error-text' : ''}`}>
              {fxError || (fxLoading ? 'Loading reference rates…' : 'No FX reference rates are available.')}
            </div>
          )}
          <div className="table-footnote">Source: Frankfurter API / European Central Bank reference rates. Indicative daily rates—not streaming, executable or suitable for transaction pricing. {fxError && fxData ? `Latest refresh failed: ${fxError}` : ''}</div>
        </section>

        <div className="content-grid lower-grid">
          <section className="panel operations-panel" id="operations">
            <div className="panel-heading">
              <div><p className="eyebrow">BANK OPERATIONS LENS</p><h2>Portfolio watchlist</h2></div>
              <Building2 size={18} className="panel-icon" />
            </div>
            <p className="panel-description">Country-level context for credit, treasury and operational-risk teams. Validate against institution-specific exposure and policy.</p>
            {operationalSignals.length ? (
              <div className="watchlist">
                {operationalSignals.map((item) => (
                  <div className={`watch-item ${item.level}`} key={item.title}>
                    <span className="watch-icon">{item.level === 'high' ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}</span>
                    <div><strong>{item.title}</strong><p>{item.detail}</p></div>
                    <span className="watch-level">{item.level}</span>
                  </div>
                ))}
              </div>
            ) : <div className="clear-state"><ShieldCheck size={18} /><span>{loading ? 'Reviewing available observations…' : coverage ? 'No configured watchlist thresholds triggered by available indicators.' : 'No observations available to evaluate.'}</span></div>}
            <div className="operations-foot"><HelpCircle size={14} /> Watchlist thresholds are transparent screening rules, not regulatory limits.</div>
          </section>

          <section className="panel source-panel" id="scenarios">
            <div className="panel-heading">
              <div><p className="eyebrow">SOURCE & FRESHNESS</p><h2>Data quality</h2></div>
              <Clock3 size={18} className="panel-icon" />
            </div>
            <div className="source-row"><span>Provider</span><strong>World Bank Open Data</strong></div>
            <div className="source-row"><span>Geography</span><strong>{geographyName}</strong></div>
            <div className="source-row"><span>Observations available</span><strong>{coverage} of {INDICATORS.length}</strong></div>
            <div className="source-row"><span>Last retrieved</span><strong>{lastRefreshed?.toLocaleString() || '—'}</strong></div>
            <div className="source-disclaimer">Public indicators are generally annual and may lag current market conditions. This page does not stream prices, FX rates, payments, sanctions or institution-level data.</div>
            <button className="text-button" onClick={exportToPDF}><Download size={14} /> Download risk brief <span>PDF</span></button>
          </section>
        </div>

        <section className="panel scenario-panel">
          <div className="panel-heading">
            <div><p className="eyebrow">WHAT-IF ANALYSIS</p><h2>Transparent stress scenarios</h2></div>
          </div>
          <div className="scenario-layout">
            <div className="scenario-options">
              {SCENARIOS.map((scenario) => (
                <button className={`scenario-option ${selectedScenario === scenario.id ? 'selected' : ''}`} key={scenario.id} onClick={() => setSelectedScenario(scenario.id)}>
                  <span className="radio-mark" /><span><strong>{scenario.name}</strong><small>{scenario.description}</small></span>
                </button>
              ))}
            </div>
            <div className="scenario-result">
              <span className="eyebrow">ADJUSTED SCREENING SIGNAL</span>
              <strong>{signal.score === null ? 'N/A' : `${signal.score.toFixed(1)} / 10`}</strong>
              <p>{activeScenario?.name} · Baseline {baselineSignal.score === null ? 'N/A' : `${baselineSignal.score.toFixed(1)} / 10`}</p>
              {selectedScenario === 'cyber' && <small>Cyber scenario is qualitative only; macro-financial indicators are unchanged because no cyber dataset is connected.</small>}
              <small>Scenario deltas are illustrative assumptions applied to reported values; they are not forecasts.</small>
            </div>
          </div>
        </section>

        <footer className="app-footer">
          <span><Landmark size={14} /> ATLAS ECONOMIC RESILIENCE INTELLIGENCE</span>
          <span>Public-source decision support · Not investment advice or a regulatory assessment</span>
        </footer>
          </>
        )}
        {activePage === 'analysis' && (
          <TimeAnalysis
            chartData={chartData}
            fxData={fxData}
            fxError={fxError}
            indicatorData={availableIndicators}
            locationName={geographyName}
          />
        )}
        {activePage === 'assistant' && <AnalystChat context={analystContext} />}
        {activePage === 'methodology' && (
          <Methodology
            geography={geographyName}
            coverage={coverage}
            indicatorCount={INDICATORS.length}
            lastRefreshed={lastRefreshed}
          />
        )}
      </main>
    </div>
  );
}

export default App;
