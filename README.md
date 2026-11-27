# Explainable AI for Systemic Financial Risk

ATLAS is a **public macro-financial screening prototype** focused on systemic
financial risk, macroeconomic policy, and financial stability in the United
States. It is an initial step toward the U.S. bank early-warning model proposed
in the author's plan; it is not that model.

## What is implemented

- Risk overview and historical analysis of public World Bank macro-financial
  indicators, with the United States selected by default.
- A transparent, weighted screening index; no policy forecasting or stress
  scenario model is currently implemented.
- Daily USD exchange-rate reference data from the Frankfurter API.
- Indicator export to Excel and a dated PDF brief.
- A methodology page describing sources, calculations, and limitations.

World Bank and Frankfurter requests are made directly by the browser. The app
does not require a private API key or a server-side proxy.

## Important limitations

This prototype uses country-level indicators, generally reported annually. It
does not ingest U.S. bank Call Reports or FDIC failure data, identify individual
banks, predict bank failures, calculate SHAP values, or report validated
out-of-sample performance. Its scores and scenarios are exploratory screening
outputs—not forecasts, credit ratings, regulatory assessments, or investment
advice. Missing observations are shown as unavailable rather than imputed.

The proposed bank early-warning module, policy forecasting scenarios, formal
model validation, and external research publication are future work and are
not represented as implemented features.

## Run locally

Requirements: Node.js 18+ and npm.

The public deployment is available at
[ATLAS on GitHub Pages](https://sampson1atuahene.github.io/Explainable-AI-for-National-Security-Economic-Risk-Dashboard/).
The repository is currently hosted at
[github.com/Sampson1Atuahene](https://github.com/Sampson1Atuahene/Explainable-AI-for-National-Security-Economic-Risk-Dashboard).

```bash
npm install
npm start
```

Create a production build with:

```bash
npm run build
```

Run the focused World Bank request test with:

```bash
npm test -- --watchAll=false src/utils/worldBank.test.js
```

The production build is static and can be deployed to GitHub Pages or another
static host. Live source availability depends on the public data providers and
the browser's network access.

## Data sources

- [World Bank Indicators API](https://api.worldbank.org/) — country-level
  macroeconomic and financial series. Series codes and latest observation
  periods appear in the indicator monitor.
- [Frankfurter API](https://www.frankfurter.app/) — daily reference exchange
  rates based on European Central Bank data.

## Project direction

The next major research step is a separate U.S. bank early-warning module using
quarterly FFIEC Call Report data and a clearly defined stress outcome. Any
future model should be documented and tested on later, held-out periods before
being presented as predictive. Until then, this repository describes only the
public-data screening prototype.

## Author

**Dr. Sampson Atuahene**, Founder, Mercyhurst University
Contact: [samxin8@gmail.com](mailto:samxin8@gmail.com)

Dr. Sampson Agyapong Atuahene researches explainable artificial intelligence
and quantitative methods for detecting systemic financial risk and evaluating
macroeconomic policy. He holds a Ph.D. in Management Science and Engineering
from Jiangsu University. Before his academic career, he worked as a bank branch
manager, shaping his focus on risk tools that analysts and supervisors can
trace back to the evidence.

Research paper titles and links, collaborator acknowledgements, release date,
and DOI have not yet been provided or confirmed. No collaborators are named.

## License and citation

No license or DOI has been provided for this repository yet. Do not treat the
code as having an open-source license until one is added. A citable release
should be created after author details, release date, and archival DOI are
confirmed.
