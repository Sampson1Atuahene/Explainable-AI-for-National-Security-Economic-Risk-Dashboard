# ATLAS: National Economic Resilience Intelligence

ATLAS is an explainable macro-financial and bank-operations intelligence platform for assessing national economic resilience. It combines public World Bank indicators, daily FX reference data, transparent screening rules, stress scenarios, and auditable exports in a professional decision-support workflow.

## 🚀 Key Features

### Interactive Government Tools
- **Real-time Data Controls**: Filter by region, date range, and risk thresholds
- **Scenario Analysis**: Run complex "what-if" scenarios (Recession, Trade War, Cyber Attacks, Natural Disasters)
- **Automated Alerts**: Intelligent notifications for risk threshold breaches
- **Interactive Map**: Global geopolitical event visualization

### Advanced Data Integration
- **Live Global Data**: Real-time economic indicators from World Bank, IMF
- **Security Intelligence**: Live threat data from global security databases
- **News & Diplomatic Feeds**: Real-time geopolitical event monitoring
- **Satellite & Social Media**: Advanced data sources for comprehensive analysis

### Powerful Export & Reporting
- **PDF Reports**: Professional risk assessment reports with executive summaries
- **Excel Data Export**: Raw data export for further analysis
- **Custom Date Ranges**: Historical data analysis capabilities
- **Multi-format Support**: CSV, JSON, and custom report formats

### AI-Powered Features
- **Explainable AI**: Transparent risk factor analysis with confidence scores
- **Predictive Analytics**: 30-day, 90-day, and 1-year risk predictions
- **Multi-dimensional Risk Modeling**: Economic, security, and geopolitical factors
- **Adaptive Algorithms**: Self-learning models that improve with new data

## 🛠️ Technology Stack

### Frontend Framework
- **React 18**: Modern React with hooks and concurrent features
- **React Router**: Client-side routing for multi-page applications

### Data Visualization
- **Recharts**: Interactive charts and graphs
- **Leaflet Maps**: Global interactive mapping
- **D3.js Integration**: Advanced data visualization

### UI/UX Components
- **React Select**: Advanced dropdown components
- **React DatePicker**: Date range selection
- **React Hot Toast**: Modern notification system
- **Lucide Icons**: Consistent iconography

### Data Management
- **Axios**: HTTP client for API integrations
- **React Table**: Advanced data table functionality
- **Moment.js**: Date/time manipulation

### Export Capabilities
- **jsPDF**: PDF document generation
- **XLSX**: Excel file creation and manipulation
- **Custom Report Builders**: Template-based report generation

## 📊 Data Sources

### Economic Indicators
- World Bank Development Indicators
- International Monetary Fund (IMF) Data
- National Central Banks
- Stock Market Indices
- Currency Exchange Rates

### Security Intelligence
- Global Security Databases
- Intelligence Community Feeds
- Border Security Reports
- Cyber Threat Intelligence
- Military Intelligence Briefs

### Geopolitical Data
- News API Aggregations
- Diplomatic Communications
- Satellite Imagery Analysis
- Social Media Sentiment
- International Relations Databases

## 🎯 Use Cases

### Government Officials
- **Policy Makers**: Data-driven decision making for economic policies
- **Security Agencies**: Real-time threat assessment and response planning
- **Economic Advisors**: Comprehensive market analysis and forecasting
- **Crisis Management**: Rapid assessment during economic or security crises

### Advanced Features
- **Scenario Planning**: Test policy impacts before implementation
- **Risk Mitigation**: Identify and prioritize risk reduction strategies
- **International Coordination**: Share insights with allied nations
- **Crisis Response**: Rapid deployment during emergencies

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Government security clearance (for production deployment)

### Installation

1. **Clone the repository**:
```bash
git clone https://github.com/Sampson1Atuahene/Explainable-AI-for-National-Security-Economic-Risk-Dashboard.git
cd Explainable-AI-for-National-Security-Economic-Risk-Dashboard
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment variables**:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. **Start the development server**:
```bash
npm start
```

5. **Access the dashboard**:
   - Open [http://localhost:3000](http://localhost:3000)
   - No sign-in is configured in this public-data prototype.

### Open with the VS Code Live Server extension

Live Server is a static file server and cannot compile the React source in `public/index.html`. Build the app first, then open the compiled page:

1. In VS Code, run **Tasks: Run Task** → **Prepare ATLAS for Live Server** (or run `npm run build` in the terminal).
2. In the Explorer, right-click `build/index.html` and select **Open with Live Server**.

Do not open `public/index.html` with Live Server; it is a build template and will display a blank page. The build uses relative asset paths so it also works when served at `/build/`.

## Application pages and assistant

The dashboard includes a risk overview, a multi-horizon analysis page, and an analyst chat. Monthly, weekly, daily, hourly, and per-minute horizons are selectable. Connected economic indicators are annual; the FX feed provides a daily reference snapshot, not historical daily prices. The app marks unsupported frequencies as unavailable rather than generating synthetic readings. Hourly and per-minute analysis requires a separately connected data provider.

The analyst works in free local mode without API credentials, answering from the dashboard's currently loaded public data. To enable OpenAI responses during development:

1. Set `OPENAI_API_KEY` in the environment of the server process. Do not prefix it with `REACT_APP_` or put it in browser code.
2. Start the chat proxy in one terminal with `npm run server`.
3. Start the React app in another terminal with `npm start`.

OpenAI API access is optional and may incur usage charges; it is not a free ChatGPT subscription. In production, deploy the chat proxy behind an appropriately secured server-side route and manage the key through a secret manager.

### Production Deployment

1. **Build the application**:
```bash
npm run build
```

2. **Deploy to secure government infrastructure**:
```bash
# Follow your organization's deployment procedures
# Ensure HTTPS and proper security measures
```

## 🔧 Configuration

### API Integration
Configure data sources in `src/config/api.js`:
```javascript
export const API_CONFIG = {
  worldBank: {
    baseURL: 'https://api.worldbank.org/v2',
    apiKey: process.env.REACT_APP_WORLDBANK_API_KEY
  },
  securityDB: {
    baseURL: 'https://secure.gov/api/v1',
    token: process.env.REACT_APP_SECURITY_TOKEN
  }
};
```

### Security Settings
Configure security parameters in `src/config/security.js`:
```javascript
export const SECURITY_CONFIG = {
  riskThresholds: {
    critical: 8.5,
    high: 7.0,
    medium: 5.0,
    low: 3.0
  },
  classification: 'TOP_SECRET'
};
```

## 📈 Dashboard Sections

### 1. Interactive Controls Panel
- Region selection (Global, North America, Europe, Asia-Pacific, etc.)
- Date range picker for historical analysis
- Risk threshold slider for alert customization
- Real-time data refresh controls

### 2. Risk Assessment Dashboard
- Overall risk score with live updates
- Economic indicators (GDP, inflation, unemployment)
- Security threat levels
- Geopolitical risk factors

### 3. Advanced Analytics
- Multi-dimensional risk analysis charts
- Trend analysis with historical data
- Predictive modeling visualizations
- Comparative regional analysis

### 4. Scenario Analysis Engine
- Pre-built scenarios (Recession, Trade War, Cyber Attack, Natural Disaster)
- Custom scenario creation
- Impact assessment and probability modeling
- Mitigation strategy recommendations

### 5. Global Intelligence Map
- Interactive world map with geopolitical events
- Real-time event markers
- Regional risk heatmaps
- Crisis zone identification

### 6. AI Explainability Center
- Risk factor weight analysis
- Model confidence scores
- Data source transparency
- Prediction accuracy metrics

### 7. Alert Management System
- Real-time alert notifications
- Customizable alert thresholds
- Alert history and trends
- Automated escalation procedures

## 📊 Export Capabilities

### PDF Reports
- Executive summaries
- Detailed risk analysis
- Chart exports
- Classified document formatting

### Excel Data Exports
- Raw time-series data
- Risk factor breakdowns
- Scenario analysis results
- Custom data queries

### API Integration
- RESTful API endpoints
- Real-time data streaming
- Third-party system integration
- Automated report distribution

## 🔒 Security Features

### Data Protection
- End-to-end encryption
- Secure API communications
- Data classification handling
- Audit trail logging

### Access Control
- Role-based permissions
- Multi-factor authentication
- Session management
- Secure logout procedures

### Compliance
- Government security standards
- Data retention policies
- Privacy regulations compliance
- Regular security audits

## 🤝 Contributing

### Development Guidelines
1. Follow government security protocols
2. Implement comprehensive testing
3. Document all API integrations
4. Maintain audit trails

### Code Standards
- ESLint configuration for React
- Prettier code formatting
- TypeScript for type safety (planned)
- Comprehensive unit and integration tests

## 📝 License

This project is developed for government use under classified licensing terms. Access restricted to authorized personnel only.

## 🙏 Acknowledgments

- **Data Providers**: World Bank, IMF, Intelligence Community
- **Technology Partners**: React, OpenStreetMap, Various API providers
- **Security Consultants**: Government cybersecurity experts
- **Domain Experts**: Economic and security analysts

## 📞 Support

For technical support or security concerns:
- **Internal Helpdesk**: gov-support@agency.gov
- **Security Team**: security@agency.gov
- **Development Team**: dev-team@agency.gov

---

**Classification Level**: TOP SECRET // NOFORN
**Document Version**: 2.1
**Last Updated**: April 13, 2026
- Icons provided by Lucide
