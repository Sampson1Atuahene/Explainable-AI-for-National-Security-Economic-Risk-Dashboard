import React from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  Database,
  FileCheck2,
  Scale,
  ShieldCheck,
} from 'lucide-react';

function Methodology({ geography, coverage, indicatorCount, lastRefreshed }) {
  const coverageRate = indicatorCount ? Math.round((coverage / indicatorCount) * 100) : 0;

  return (
    <section className="methodology-page" aria-label="Methodology and governance">
      <div className="methodology-hero panel">
        <div>
          <p className="eyebrow">MODEL GOVERNANCE</p>
          <h2>Transparent by design</h2>
          <p>ATLAS is a public-source decision-support system. Every displayed score is derived from visible inputs and documented rules; it is not a prediction, credit rating or regulatory determination.</p>
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
          <p>Stress cases apply fixed, visible adjustments to reported observations. They are illustrative counterfactuals and must not be interpreted as probabilistic forecasts.</p>
          <ul>
            <li>Scenario basis shown beside every result</li>
            <li>Baseline comparison retained</li>
            <li>Qualitative cyber stress is never fabricated as data</li>
          </ul>
        </article>

        <article className="panel methodology-card">
          <div className="methodology-icon"><ShieldCheck size={18} /></div>
          <p className="eyebrow">4 · RESPONSIBLE USE</p>
          <h3>Human-led interpretation</h3>
          <p>Use ATLAS to frame review questions, compare jurisdictions and organize evidence. Institution-specific exposures, policy limits and legal requirements require domain expertise.</p>
          <div className="responsibility-note"><AlertTriangle size={15} /> Do not enter sensitive or classified information into the analyst chat.</div>
        </article>
      </div>

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
