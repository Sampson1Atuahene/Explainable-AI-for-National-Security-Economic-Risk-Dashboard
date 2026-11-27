# ATLAS: Explainable AI for Systemic Financial Risk

ATLAS is a **public macro-financial screening prototype** focused on explainable
analysis of systemic financial risk, macroeconomic policy, and financial
stability in the United States. It is an initial step toward the U.S. bank
early-warning research described in the author's plan; it is **not a bank
early-warning model**.

| Project information | |
| --- | --- |
| Status | Public prototype · pre-release |
| Default geography | United States |
| Main data | World Bank Indicators API; Frankfurter / ECB daily FX reference |
| Interface | Risk overview, Time analysis, Methodology, About |
| Deployment | [GitHub Pages](https://sampson1atuahene.github.io/Explainable-AI-for-National-Security-Economic-Risk-Dashboard/) |
| Source | [GitHub repository](https://github.com/Sampson1Atuahene/Explainable-AI-for-National-Security-Economic-Risk-Dashboard) |

## What the app currently does

- Opens on the United States and lets users select other countries or World
  Bank regional aggregates.
- Retrieves public World Bank macroeconomic and financial indicator series
  directly in the browser.
- Displays latest available observations, historical annual series, source
  codes, source periods, coverage, and a transparent weighted screening index.
- Shows the contribution of scored inputs to that index. These are
  **rule-based index contributions**, not SHAP values or causal explanations.
- Displays a daily USD exchange-rate reference snapshot for ten currencies.
- Exports the indicator data to Excel and a dated PDF screening brief.
- Includes indicator series codes, periods, units, category, and geography in
  the Excel export; the PDF includes author, generation date, source, coverage,
  screening method, and caveats.
- Provides Methodology and About pages, a data dictionary, and a downloadable
  methodology PDF.
- Shows unavailable observations as “No data” rather than imputing a value.

World Bank and Frankfurter requests are made directly by the browser. The
deployed frontend does not depend on a private API key, application server, or
API proxy. Availability depends on the public provider, the user's network,
and the browser allowing the cross-origin request. Data requests are refreshed
when the app loads, on the user's refresh action, and periodically while it is
open.

## Pages and user interface

### Risk overview

The overview combines the selected geography's indicator coverage, weighted
screening signal, data sources, banking/macro indicator table, historical
series, and an explanation of the largest weighted contributions. The table
puts banking measures first: nonperforming loans, capital adequacy, private
credit, and lending rates.

The overview chart plots annual GDP growth, inflation, and bank NPL
observations. The latest-value cards and indicator table also include lending
rates, capital, private credit, reserves, public debt, unemployment, and the
current account.

The optional state/province field is only a display context: it does not filter
or produce state-level observations. The underlying World Bank series remain
for the selected country or region.

The screening signal is a descriptive heuristic. It is not a probability of
crisis, a bank solvency assessment, a credit rating, a forecast, or an
investment recommendation.

### Time analysis

This page displays the annual World Bank history and the current daily FX
reference snapshot. Tabs for monthly, weekly, hourly, and per-minute analysis
explain that those data streams are not connected; the app does not fabricate
or interpolate high-frequency observations. Daily FX is a current reference
snapshot, not a stored historical FX time series.

### Methodology

The Methodology page describes the data sources, scoring rules, limitations,
and current validation status. Its data dictionary lists variable names,
units, World Bank indicator codes, frequencies, and whether a variable enters
the screening score. Use **Download methodology PDF** for a dated copy of this
documentation.

### About

The About page provides author information and contact details, a feedback /
request-access email link, the current pre-release citation, and project
changelog link. Paper links, DOI, release date, and an open-source license
remain pending confirmation.

## Data dictionary

World Bank values are country or regional aggregate observations. The app
requests observations for the years 2010–2026, keeps non-null numeric values,
and uses the most recent available observation for each indicator. Different
series can have different latest reporting years. The table displays each
observation's period; the app does not align series to a common reporting
period or fill missing years.

| Display name | World Bank series | Unit | Score transform (bounded 0–10) | Weight |
| --- | --- | --- | --- | ---: |
| Bank NPLs | `FB.AST.NPER.ZS` | % of gross loans | `clamp(value)` | 20% |
| Capital adequacy | `FB.BNK.CAPA.ZS` | % of risk-weighted assets | `clamp((15 - value) × 0.7)` | 10% |
| Private credit | `FS.AST.PRVT.GD.ZS` | % of GDP | Context only; not scored | — |
| Lending rate | `FR.INR.LEND` | % | Context only; not scored | — |
| GDP growth | `NY.GDP.MKTP.KD.ZG` | % annual real growth | `clamp((2 - value) × 1.5)` | 19% |
| Inflation | `FP.CPI.TOTL.ZG` | % annual change | `clamp(abs(value))` | 16% |
| Unemployment | `SL.UEM.TOTL.ZS` | % of labor force | `clamp((value / 15) × 10)` | 10% |
| Current account | `BN.CAB.XOKA.GD.ZS` | % of GDP | `clamp(max(0, -value))` | 10% |
| FX reserves | `FI.RES.TOTL.CD` | Current USD | Context only; not scored | — |
| Public debt | `GC.DOD.TOTL.GD.ZS` | % of GDP | `clamp((value / 120) × 10)` | 15% |

`clamp(x)` limits a value to the interval from 0 to 10. Only indicators with a
latest observation, a scoring transform, and a weight enter the index. When a
scored observation is missing, its weight is excluded and the remaining
available weights are renormalized:

```text
screening score = sum(risk score × configured weight) / sum(available weights)
```

The indicator weights sum to 100% when all seven scored observations are
available. Context-only measures are still displayed, but do not influence
the index. This screening formula and its weights are heuristic choices; they
have not been estimated or validated against a bank stress outcome.

The dashboard's indicator-coverage count includes all configured indicators
with a latest observation, including context-only measures. Its display label
uses simple coverage thresholds (at least 8 available = “Strong”, at least 6 =
“Moderate”, otherwise “Limited”). These labels represent data coverage only,
not model confidence, calibration, or predictive performance.

### FX reference data

The app requests rates from Frankfurter's v1 latest endpoint using USD as the
base currency. It displays EUR, GBP, JPY, CHF, CAD, AUD, CNY, INR, BRL, and ZAR
per USD. Frankfurter provides reference rates based on European Central Bank
data. They are indicative rates, not transaction prices, and this prototype
does not store an FX history.

### Source links

- [World Bank Indicators API](https://api.worldbank.org/) — country and
  aggregate series are requested using the codes in the data dictionary.
- [Frankfurter API](https://api.frankfurter.dev/) — FX reference-rate endpoint.
- [European Central Bank](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html) —
  reference-rate background and publication context.

## What is not implemented

The following are planned research work, not existing capabilities:

- Quarterly FFIEC Call Report ingestion for individual U.S. banks.
- FDIC failed-bank outcomes, deposit-outflow stress labels, or a bank lookup.
- Logistic regression, gradient-boosted models, time-aware validation, or
  bank-specific risk scores.
- A Silicon Valley Bank, Signature Bank, or First Republic Bank early-warning
  back-test.
- SHAP attribution, explanation-stability testing, AUC, lead-time, or
  false-alert evaluation.
- FRED / ALFRED data, VAR or machine-learning macroeconomic forecasts,
  uncertainty bands, or Federal Reserve benchmark-based policy scenarios.
- Research-paper links, DOI archival record, confirmed collaborators, or
  third-party visitor analytics.

The earlier fixed scenario adjustments were removed rather than presented as
empirically grounded stress scenarios. In the Methodology page, the validation
status and future work are stated explicitly. A “confidence” or coverage
indicator in the dashboard describes **data availability only**, not
statistical confidence or model performance.

## Responsible use and limitations

- The prototype is for exploration and research discussion only.
- National or regional values must not be interpreted as the condition of a
  particular bank, borrower, portfolio, or financial institution.
- World Bank data are generally annual, can be revised, and may lag current
  conditions. Source periods can differ across indicators.
- The displayed transformations and heuristic weights are transparent but
  are not calibrated, back-tested, or independently validated.
- Missing values are not imputed. Low coverage should constrain interpretation.
- FX values are reference rates, not executable or real-time market quotes.
- The app has no authentication or private backend. Do not enter sensitive,
  personal, confidential, or classified information.
- Model-risk references, including Federal Reserve SR 11-7, are included as
  governance context; this prototype does not claim SR 11-7 compliance.

## Run locally

### Requirements

- Node.js 18 or later
- npm
- Network access to the World Bank and Frankfurter APIs to load live data

### Install and start

```bash
git clone https://github.com/Sampson1Atuahene/Explainable-AI-for-National-Security-Economic-Risk-Dashboard.git
cd Explainable-AI-for-National-Security-Economic-Risk-Dashboard
npm ci
npm start
```

The React development server opens the application at
[http://localhost:3000](http://localhost:3000). No `.env` file or API key is
required for the currently implemented public-data feeds.

### Test and build

Run the complete test suite:

```bash
npm test -- --watchAll=false
```

Run only the World Bank fetch utility tests:

```bash
npm test -- --watchAll=false src/utils/worldBank.test.js
```

Create an optimized static production build:

```bash
npm run build
```

The generated site is written to `build/`. The build uses relative asset URLs,
which supports project-site paths such as GitHub Pages. Serve the contents of
`build/` with any static-file host; data requests still go from the visitor's
browser to the public provider APIs.

## Deployment

The GitHub Actions workflow at `.github/workflows/pages.yml` runs on pushes to
`main` and on manual dispatch. It installs the locked npm dependencies, builds
the React app, and deploys the `build/` directory to GitHub Pages.

- [Open the deployed app](https://sampson1atuahene.github.io/Explainable-AI-for-National-Security-Economic-Risk-Dashboard/)
- [View deployment workflow runs](https://github.com/Sampson1Atuahene/Explainable-AI-for-National-Security-Economic-Risk-Dashboard/actions/workflows/pages.yml)

After changing repository settings or its name, verify the Pages URL in the
repository's **Settings → Pages** and update these links if GitHub does not
redirect the old project URL.

## Project structure

```text
public/
  index.html                Browser metadata and React mount template
src/
  App.js                    Dashboard, API loading, scoring, and exports
  components/
    About.js                Author, citation, contact, and project status
    Methodology.js          Methodology, data dictionary, and PDF download
    TimeAnalysis.js         Reporting-horizon availability and annual charts
  config/
    geography.js            World Bank regions and country filtering
  utils/
    worldBank.js            World Bank fetch helper
    worldBank.test.js       Direct-fetch behavior tests
.github/workflows/
  pages.yml                 Static build and GitHub Pages deployment
CHANGELOG.md                Release notes and pre-release status
README.md                   Project overview and usage documentation
```

## Author and contact

**Dr. Sampson Atuahene** · Founder · Mercyhurst University

[samxin8@gmail.com](mailto:samxin8@gmail.com)

Dr. Sampson Agyapong Atuahene researches explainable artificial intelligence
and quantitative methods for detecting systemic financial risk and evaluating
macroeconomic policy. He holds a Ph.D. in Management Science and Engineering
from Jiangsu University. Before his academic career, he worked as a bank branch
manager, shaping his focus on risk tools that analysts and supervisors can
trace back to the evidence.

For feedback or an access request, email
[samxin8@gmail.com](mailto:samxin8@gmail.com?subject=ATLAS%20feedback%20or%20request%20access).
The link opens the user's email client; it is not a hosted form and does not
send usage analytics.

No collaborators are named because permission to list them has not been
confirmed. Research paper citations and public links are pending.

## Version, citation, and license

**Version 1.0.0 · pre-release.** A public release date and DOI have not been
assigned. The suggested citation, pending a dated archival release, is:

> Atuahene, S. (n.d.). *ATLAS: Explainable AI for Systemic Financial Risk*
> (v1.0.0, pre-release). GitHub. DOI pending.

No open-source license has been selected or added. Until a license is provided,
do not assume that this repository grants permission to reuse, modify, or
redistribute its code.

See [CHANGELOG.md](./CHANGELOG.md) for the current pre-release notes.
