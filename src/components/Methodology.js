import React from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Database,
  Download,
  FileCheck2,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import jsPDF from 'jspdf';

function Methodology({ geography, coverage, indicatorCount, indicators, lastRefreshed }) {
  const coverageRate = indicatorCount ? Math.round((coverage / indicatorCount) * 100) : 0;
  const downloadMethodology = () => {
    const document = new jsPDF();
    document.setProperties({
      title: 'ATLAS Methodology and Data Dictionary',
      author: 'Dr. Sampson Atuahene',
      subject: 'Public macro-financial screening prototype',
    });
    let y = 20;
    const addText = (text, fontSize = 10) => {
      document.setFontSize(fontSize);
      const lines = document.splitTextToSize(text, 178);
      const height = lines.length * 5 + 2;
      if (y + height > 275) {
        document.addPage();
        y = 20;
      }
      document.text(lines, 16, y);
      y += height;
    };

    addText('ATLAS Methodology and Data Dictionary', 18);
    addText('Prepared by Dr. Sampson Atuahene, Founder, Mercyhurst University');
    addText(`Generated: ${new Date().toLocaleString()}`);
    addText('Purpose: public macro-financial screening prototype; not a bank-level early-warning model, forecast, credit rating, or regulatory assessment.');
    addText('Screening method: indicators with defined rules are mapped to a 0-10 scale, then combined using the configured weights. Available weights are renormalized when observations are missing.');
    addText('Data dictionary:');
    indicators.forEach((indicator) => {
      addText(`${indicator.name} (${indicator.unit}); source: World Bank Open Data; frequency: annual; series: ${indicator.code}; risk weight: ${indicator.weight ? `${(indicator.weight * 100).toFixed(0)}%` : 'context only'}.`);
    });
    addText('FX reference rates: Frankfurter / European Central Bank; daily; USD base; no World Bank series code.');
    addText('Model status: no learned logistic-regression or gradient-boosted model has been trained. No held-out AUC, lead-time, false-alert rate, or bank-level score is available. The visible driver contributions are weighted-index contributions, not SHAP values.');
    addText('Model risk: this prototype does not claim compliance with Federal Reserve SR 11-7. It documents inputs and limitations, but independent validation, outcomes analysis, and ongoing monitoring for a bank model have not been performed.');
    addText('Explainability research: the specific BIS paper citation has not yet been provided. No claim of alignment with that paper is made.');
    document.save(`atlas-methodology-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <section className="methodology-page" aria-label="Methodology and governance">
      <div className="methodology-hero panel">
        <div>
          <p className="eyebrow">MODEL GOVERNANCE</p>
          <h2>Transparent by design</h2>
          <p>ATLAS is a public macro-financial screening prototype and the first step toward a proposed U.S. bank early-warning model. Every displayed score is derived from visible inputs and documented rules; it is not a bank-level prediction, credit rating or regulatory determination.</p>
        </div>
        <div className="governance-status">
          <BadgeCheck size={22} />
          <div><strong>Public-source mode</strong><span>Classification-neutral · auditable</span></div>
        </div>
      </div>

      <div className="methodology-grid">
        <article className="panel methodology-card">
          <div className="methodology-icon"><Database size={18} /></div>
          <p className="eyebrow">1 · DATA LINEAGE</p>
          <h3>Public observations</h3>
          <p>Macro and banking values come from World Bank Open Data. The FX feed uses Frankfurter reference rates based on European Central Bank data.</p>
          <ul>
            <li>Latest non-null reported annual value per indicator</li>
            <li>Reporting periods preserved without synthetic backfill</li>
            <li>Country and region aggregates clearly distinguished</li>
          </ul>
        </article>

        <article className="panel methodology-card">
          <div className="methodology-icon"><Scale size={18} /></div>
          <p className="eyebrow">2 · SCREENING METHOD</p>
          <h3>Weighted public indicators</h3>
          <p>Available indicators are normalized to a 0–10 risk scale. Available weights are renormalized, so missing observations do not receive an artificial value.</p>
          <div className="formula-block">Score = Sum(normalized risk × weight) / Sum(available weight)</div>
        </article>

        <article className="panel methodology-card">
          <div className="methodology-icon"><FileCheck2 size={18} /></div>
          <p className="eyebrow">3 · SCENARIO DESIGN</p>
          <h3>Transparent assumptions</h3>
          <p>No policy forecasting module or benchmark stress scenarios are implemented. The previous fixed adjustment controls were removed rather than presented as validated stress paths. Future work is to compare VAR and machine-learning forecasts on FRED/ALFRED data under published Federal Reserve scenarios.</p>
          <ul>
            <li>No scenario outputs or uncertainty bands are currently produced</li>
            <li>FRED and ALFRED series are not yet connected</li>
            <li>Benchmark scenarios require source citation and versioning</li>
          </ul>
        </article>

        <article className="panel methodology-card">
          <div className="methodology-icon"><ShieldCheck size={18} /></div>
          <p className="eyebrow">4 · RESPONSIBLE USE</p>
          <h3>Human-led interpretation</h3>
          <p>Use ATLAS to frame review questions, compare jurisdictions and organize evidence. Institution-specific exposures, policy limits and legal requirements require domain expertise.</p>
          <div className="responsibility-note"><AlertTriangle size={15} /> This prototype has no institution-level data or validated bank early-warning model. Do not use its country-level indicators for institution-specific decisions.</div>
        </article>
      </div>

      <section className="panel data-dictionary">
        <div className="panel-heading">
          <div><p className="eyebrow">DATA DICTIONARY</p><h2>Variables and sources</h2></div>
          <button className="button button-outline" onClick={downloadMethodology} type="button"><Download size={14} /> Download methodology PDF</button>
        </div>
        <div className="table-scroll">
          <table>
            <thead><tr><th>VARIABLE</th><th>SOURCE</th><th>FREQUENCY</th><th>UNIT</th><th>SERIES CODE</th><th>SCREENING WEIGHT</th></tr></thead>
            <tbody>
              {indicators.map((indicator) => (
                <tr key={indicator.key}>
                  <td><strong>{indicator.name}</strong><small>{indicator.description}</small></td>
                  <td>World Bank</td>
                  <td>Annual</td>
                  <td>{indicator.unit}</td>
                  <td>{indicator.code}</td>
                  <td>{indicator.weight ? `${(indicator.weight * 100).toFixed(0)}%` : 'Context only'}</td>
                </tr>
              ))}
              <tr><td><strong>FX reference rates</strong><small>USD-based currency reference rates</small></td><td>Frankfurter / ECB</td><td>Daily</td><td>Currency per USD</td><td>Not applicable</td><td>Not scored</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel model-status-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">MODEL DOCUMENTATION</p><h2>Current validation status</h2></div>
          <span className="source-pill unavailable-pill"><AlertTriangle size={13} /> Rule-based screen only</span>
        </div>
        <p>This prototype has no training period because no learned model is implemented. Logistic regression, gradient boosting, bank-failure back-tests, held-out AUC, lead-time, false-alert rates, SHAP explanations, and explanation-stability checks are not available. The current explanation is the weighted contribution of each visible indicator to the screening index.</p>
        <p>Federal Reserve <a href="https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm" rel="noreferrer" target="_blank">SR 11-7</a> is a reference for model-risk governance, not a certification this prototype has achieved. Independent validation and ongoing monitoring would be prerequisites for any future bank early-warning model. The exact BIS explainability paper citation remains to be supplied.</p>
      </section>

      <section className="panel assurance-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">CURRENT SESSION ASSURANCE</p><h2>Data-quality disclosure</h2></div>
          <span className="source-pill"><span className="status-dot" /> {coverageRate}% coverage</span>
        </div>
        <div className="assurance-grid">
          <div><span>Geographic scope</span><strong>{geography}</strong></div>
          <div><span>Indicator coverage</span><strong>{coverage} of {indicatorCount}</strong></div>
          <div><span>Last retrieved</span><strong>{lastRefreshed?.toLocaleString() || 'Not available'}</strong></div>
          <div><span>Validation status</span><strong>{coverageRate >= 70 ? 'Moderate to strong' : 'Limited'}</strong></div>
        </div>
      </section>
    </section>
  );
}

export default Methodology;
