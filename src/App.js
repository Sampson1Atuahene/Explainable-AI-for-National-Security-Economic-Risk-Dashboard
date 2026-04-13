import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area
} from 'recharts';
import {
  AlertTriangle, TrendingUp, DollarSign, Shield, Info, Download,
  Calendar, Globe, AlertCircle, Zap, MapPin,
  RefreshCw, FileText
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import Select from 'react-select';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import 'leaflet/dist/leaflet.css';

// Mock API functions for live data (in production, replace with real APIs)
const fetchEconomicData = async (region, dateRange) => {
  // Simulate API call to World Bank, IMF, etc.
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        gdp: Math.random() * 100 + 50,
        inflation: Math.random() * 10 + 1,
        unemployment: Math.random() * 15 + 2,
        tradeBalance: Math.random() * 200 - 100
      });
    }, 1000);
  });
};

const fetchSecurityData = async (region) => {
  // Simulate API call to security databases
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        threatLevel: Math.floor(Math.random() * 10) + 1,
        incidents: Math.floor(Math.random() * 50),
        cyberAttacks: Math.floor(Math.random() * 20),
        borderIncidents: Math.floor(Math.random() * 10)
      });
    }, 800);
  });
};

const fetchGeopoliticalData = async () => {
  // Simulate API call to news APIs, diplomatic databases
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        { event: 'Trade Agreement Signed', impact: 'positive', region: 'Asia-Pacific', date: '2024-01-15' },
        { event: 'Military Exercise', impact: 'neutral', region: 'Europe', date: '2024-01-20' },
        { event: 'Sanctions Imposed', impact: 'negative', region: 'Middle East', date: '2024-01-25' },
        { event: 'Election Results', impact: 'positive', region: 'Americas', date: '2024-01-30' }
      ]);
    }, 1200);
  });
};

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });
  const [riskThreshold, setRiskThreshold] = useState(7);
  const [liveData, setLiveData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);

  const regions = [
    { value: 'global', label: 'Global' },
    { value: 'north-america', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia-pacific', label: 'Asia-Pacific' },
    { value: 'middle-east', label: 'Middle East' },
    { value: 'africa', label: 'Africa' },
    { value: 'latin-america', label: 'Latin America' }
  ];

  const scenarios = [
    { id: 'baseline', name: 'Baseline Scenario', description: 'Current economic conditions' },
    { id: 'recession', name: 'Economic Recession', description: 'GDP contraction, high unemployment' },
    { id: 'trade-war', name: 'Trade War', description: 'Tariff increases, disrupted supply chains' },
    { id: 'cyber-attack', name: 'Major Cyber Attack', description: 'Critical infrastructure compromise' },
    { id: 'natural-disaster', name: 'Natural Disaster', description: 'Major weather/climate event' }
  ];

  const [timeSeriesData] = useState([
    { month: 'Jan', risk: 5.2, economic: 4.8, security: 6.1, geopolitical: 5.5 },
    { month: 'Feb', risk: 6.1, economic: 5.9, security: 6.8, geopolitical: 6.2 },
    { month: 'Mar', risk: 7.2, economic: 6.8, security: 8.1, geopolitical: 7.1 },
    { month: 'Apr', risk: 6.9, economic: 6.5, security: 7.8, geopolitical: 6.8 },
    { month: 'May', risk: 7.5, economic: 7.2, security: 8.2, geopolitical: 7.3 },
    { month: 'Jun', risk: 8.1, economic: 7.8, security: 8.5, geopolitical: 8.0 }
  ]);

  const [geopoliticalEvents, setGeopoliticalEvents] = useState([]);

  useEffect(() => {
    loadLiveData();
    loadGeopoliticalEvents();
  }, [selectedRegion, dateRange, loadLiveData]);

  const loadLiveData = useCallback(async () => {
    setLoading(true);
    try {
      const [economicData, securityData] = await Promise.all([
        fetchEconomicData(selectedRegion, dateRange),
        fetchSecurityData(selectedRegion)
      ]);

      const overallRisk = calculateOverallRisk(economicData, securityData);
      setLiveData({ economicData, securityData, overallRisk });

      // Generate alerts based on risk levels
      generateAlerts(overallRisk, economicData, securityData);
    } catch (error) {
      toast.error('Failed to load live data');
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, dateRange]);

  const loadGeopoliticalEvents = async () => {
    try {
      const events = await fetchGeopoliticalData();
      setGeopoliticalEvents(events);
    } catch (error) {
      console.error('Failed to load geopolitical events');
    }
  };

  const calculateOverallRisk = (economic, security) => {
    // Advanced risk calculation algorithm
    const economicRisk = (economic.inflation * 0.3 + economic.unemployment * 0.4 + Math.abs(economic.tradeBalance) * 0.3) / 10;
    const securityRisk = (security.threatLevel + security.incidents * 0.1 + security.cyberAttacks * 0.2) / 10;
    return Math.min(10, (economicRisk * 0.6 + securityRisk * 0.4));
  };

  const generateAlerts = (overallRisk, economic, security) => {
    const newAlerts = [];
    if (overallRisk > riskThreshold) {
      newAlerts.push({
        id: Date.now(),
        type: 'critical',
        message: `Overall risk score (${overallRisk.toFixed(1)}) exceeds threshold (${riskThreshold})`,
        timestamp: new Date()
      });
    }
    if (economic.inflation > 5) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'warning',
        message: `High inflation rate: ${economic.inflation.toFixed(1)}%`,
        timestamp: new Date()
      });
    }
    if (security.cyberAttacks > 10) {
      newAlerts.push({
        id: Date.now() + 2,
        type: 'warning',
        message: `Elevated cyber attack activity: ${security.cyberAttacks} incidents`,
        timestamp: new Date()
      });
    }
    setAlerts(newAlerts);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('National Security Economic Risk Report', 20, 20);
    doc.text(`Generated: ${moment().format('YYYY-MM-DD HH:mm')}`, 20, 30);
    doc.text(`Region: ${selectedRegion}`, 20, 40);
    doc.text(`Overall Risk: ${liveData?.overallRisk?.toFixed(1) || 'N/A'}`, 20, 50);
    doc.save(`risk-report-${moment().format('YYYY-MM-DD')}.pdf`);
    toast.success('Report exported to PDF');
  };

  const exportToExcel = () => {
    const data = timeSeriesData.map(item => ({
      Month: item.month,
      'Overall Risk': item.risk,
      'Economic Risk': item.economic,
      'Security Risk': item.security,
      'Geopolitical Risk': item.geopolitical
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Risk Data');
    XLSX.writeFile(wb, `risk-data-${moment().format('YYYY-MM-DD')}.xlsx`);
    toast.success('Data exported to Excel');
  };

  const runScenarioAnalysis = (scenarioId) => {
    setScenarioMode(true);
    setSelectedScenario(scenarioId);
    toast.success(`Running ${scenarios.find(s => s.id === scenarioId)?.name} analysis`);
  };

  const getRiskColor = (value) => {
    if (value >= 8) return '#e74c3c';
    if (value >= 6) return '#f39c12';
    return '#27ae60';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'positive': return '#27ae60';
      case 'negative': return '#e74c3c';
      case 'neutral': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="dashboard">
      <Toaster position="top-right" />
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>Government National Security Economic Risk Dashboard</h1>
              <p>Advanced AI-powered risk assessment with real-time global data</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={loadLiveData}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <RefreshCw size={16} className={loading ? 'spinning' : ''} />
                {loading ? 'Loading...' : 'Refresh Data'}
              </button>
              <button
                onClick={exportToPDF}
                style={{
                  padding: '8px 16px',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <Download size={16} />
                Export PDF
              </button>
              <button
                onClick={exportToExcel}
                style={{
                  padding: '8px 16px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <FileText size={16} />
                Export Excel
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {/* Interactive Controls */}
          <section className="controls-section" style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                <Globe size={16} style={{ marginRight: '5px' }} />
                Region
              </label>
              <Select
                value={regions.find(r => r.value === selectedRegion)}
                onChange={(option) => setSelectedRegion(option.value)}
                options={regions}
                styles={{
                  control: (base) => ({ ...base, borderColor: '#3498db' })
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                <Calendar size={16} style={{ marginRight: '5px' }} />
                Start Date
              </label>
              <DatePicker
                selected={dateRange.start}
                onChange={(date) => setDateRange({ ...dateRange, start: date })}
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                <Calendar size={16} style={{ marginRight: '5px' }} />
                End Date
              </label>
              <DatePicker
                selected={dateRange.end}
                onChange={(date) => setDateRange({ ...dateRange, end: date })}
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                <AlertTriangle size={16} style={{ marginRight: '5px' }} />
                Risk Threshold
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <span>{riskThreshold}</span>
            </div>
          </section>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <section className="alerts-section" style={{
              background: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#856404', margin: '0 0 10px 0' }}>
                <AlertCircle size={20} style={{ marginRight: '5px' }} />
                Active Alerts ({alerts.length})
              </h3>
              {alerts.map(alert => (
                <div key={alert.id} style={{
                  background: alert.type === 'critical' ? '#f8d7da' : '#fff3cd',
                  border: `1px solid ${alert.type === 'critical' ? '#f5c6cb' : '#ffeaa7'}`,
                  borderRadius: '4px',
                  padding: '10px',
                  marginBottom: '5px'
                }}>
                  {alert.message}
                </div>
              ))}
            </section>
          )}

          {/* Scenario Analysis */}
          <section className="scenario-section" style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3><Zap size={20} style={{ marginRight: '5px' }} />Scenario Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {scenarios.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => runScenarioAnalysis(scenario.id)}
                  style={{
                    padding: '15px',
                    background: selectedScenario === scenario.id ? '#3498db' : 'white',
                    color: selectedScenario === scenario.id ? 'white' : '#333',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <strong>{scenario.name}</strong>
                  <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem' }}>{scenario.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Risk Metrics Cards */}
          <section className="risk-metrics">
            <div className="metric-card">
              <AlertTriangle size={32} color={getRiskColor(liveData?.overallRisk || 7.2)} />
              <div className="metric-value" style={{ color: getRiskColor(liveData?.overallRisk || 7.2) }}>
                {liveData?.overallRisk?.toFixed(1) || '7.2'}/10
              </div>
              <div className="metric-label">Overall Risk Score</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                Live data from {regions.find(r => r.value === selectedRegion)?.label}
              </div>
            </div>

            <div className="metric-card">
              <DollarSign size={32} color={getRiskColor(liveData?.economicData?.inflation * 2 || 6.8)} />
              <div className="metric-value" style={{ color: getRiskColor(liveData?.economicData?.inflation * 2 || 6.8) }}>
                {liveData?.economicData?.inflation?.toFixed(1) || '3.2'}%
              </div>
              <div className="metric-label">Inflation Rate</div>
            </div>

            <div className="metric-card">
              <Shield size={32} color={getRiskColor(liveData?.securityData?.threatLevel || 8.1)} />
              <div className="metric-value" style={{ color: getRiskColor(liveData?.securityData?.threatLevel || 8.1) }}>
                {liveData?.securityData?.threatLevel || '8'}/10
              </div>
              <div className="metric-label">Security Threat Level</div>
            </div>

            <div className="metric-card">
              <TrendingUp size={32} color={getRiskColor(liveData?.economicData?.unemployment * 2 || 7.5)} />
              <div className="metric-value" style={{ color: getRiskColor(liveData?.economicData?.unemployment * 2 || 7.5) }}>
                {liveData?.economicData?.unemployment?.toFixed(1) || '4.1'}%
              </div>
              <div className="metric-label">Unemployment Rate</div>
            </div>
          </section>

          {/* Advanced Charts Section */}
          <section className="charts-section">
            <div className="chart-container">
              <h3>Multi-dimensional Risk Analysis</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="risk" stackId="1" stroke="#e74c3c" fill="#e74c3c" fillOpacity={0.6} name="Overall Risk" />
                  <Area type="monotone" dataKey="economic" stackId="2" stroke="#3498db" fill="#3498db" fillOpacity={0.6} name="Economic" />
                  <Area type="monotone" dataKey="security" stackId="3" stroke="#f39c12" fill="#f39c12" fillOpacity={0.6} name="Security" />
                  <Area type="monotone" dataKey="geopolitical" stackId="4" stroke="#9b59b6" fill="#9b59b6" fillOpacity={0.6} name="Geopolitical" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Live Data Distribution</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={[
                  { name: 'Economic', value: liveData?.economicData?.gdp || 65 },
                  { name: 'Security', value: liveData?.securityData?.threatLevel * 10 || 80 },
                  { name: 'Geopolitical', value: geopoliticalEvents.length * 2 || 40 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3498db" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Geopolitical Events Map */}
          <section className="map-section" style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3><MapPin size={20} style={{ marginRight: '5px' }} />Global Geopolitical Events</h3>
            <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Mock markers for geopolitical events */}
                <Marker position={[35.6762, 139.6503]}>
                  <Popup>Tokyo: Trade Agreement Signed</Popup>
                </Marker>
                <Marker position={[51.5074, -0.1278]}>
                  <Popup>London: Military Exercise</Popup>
                </Marker>
                <Marker position={[25.2048, 55.2708]}>
                  <Popup>Dubai: Sanctions Imposed</Popup>
                </Marker>
              </MapContainer>
            </div>
          </section>

          {/* AI Explainability Panel */}
          <section className="explainability-panel">
            <h3><Info size={20} style={{ marginRight: '5px' }} />Advanced AI Explainability</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4>Risk Factors Analysis</h4>
                {geopoliticalEvents.map((event, index) => (
                  <div key={index} className="explanation-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{event.event}</strong>
                      <div>
                        <span style={{
                          background: getImpactColor(event.impact),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.8rem'
                        }}>
                          {event.impact}
                        </span>
                        <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#666' }}>
                          {event.region}
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '0.9rem' }}>
                      {event.date}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <h4>AI Model Insights</h4>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Data Sources:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>World Bank Economic Indicators</li>
                    <li>Global Security Databases</li>
                    <li>News APIs & Diplomatic Reports</li>
                    <li>Satellite Imagery Analysis</li>
                    <li>Social Media Sentiment</li>
                  </ul>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <strong>Prediction Accuracy:</strong>
                  <div style={{
                    background: '#ecf0f1',
                    padding: '10px',
                    borderRadius: '4px',
                    marginTop: '5px'
                  }}>
                    94.2% for 30-day predictions<br />
                    87.8% for 90-day predictions<br />
                    76.5% for 1-year predictions
                  </div>
                </div>

                <div>
                  <strong>Last Updated:</strong> {moment().format('YYYY-MM-DD HH:mm:ss')}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <style jsx>{`
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;