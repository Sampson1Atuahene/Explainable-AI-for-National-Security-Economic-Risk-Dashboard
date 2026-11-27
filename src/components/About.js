import React from 'react';
import { BookOpen, Code2, Mail, UserRound } from 'lucide-react';

const REPOSITORY_URL = 'https://github.com/Sampson1Atuahene/Explainable-AI-for-National-Security-Economic-Risk-Dashboard';
const CHANGELOG_URL = `${REPOSITORY_URL}/blob/main/CHANGELOG.md`;

function About() {
  return (
    <section className="about-page" aria-label="About this project">
      <article className="panel about-profile">
        <div className="about-avatar"><UserRound size={22} /></div>
        <div>
          <p className="eyebrow">PROJECT AUTHOR</p>
          <h2>Dr. Sampson Atuahene</h2>
          <p className="about-role">Founder · Mercyhurst University</p>
          <p className="about-bio">Dr. Sampson Agyapong Atuahene researches explainable artificial intelligence and quantitative methods for detecting systemic financial risk and evaluating macroeconomic policy. He holds a Ph.D. in Management Science and Engineering from Jiangsu University. Before his academic career, he worked as a bank branch manager, which shapes his focus on risk tools that analysts and supervisors can trace back to the evidence.</p>
          <div className="about-contact-links">
            <a className="about-contact" href="mailto:samxin8@gmail.com"><Mail size={15} /> samxin8@gmail.com</a>
            <a className="about-contact" href="mailto:samxin8@gmail.com?subject=ATLAS%20feedback%20or%20request%20access">Feedback / request access</a>
          </div>
        </div>
      </article>

      <div className="content-grid about-grid">
        <article className="panel about-card">
          <div className="methodology-icon"><BookOpen size={18} /></div>
          <p className="eyebrow">RESEARCH BASIS</p>
          <h3>Related work</h3>
          <p>Research paper titles and public links have not yet been provided. Add verified citations here before describing individual papers as evidence for the prototype.</p>
        </article>

        <article className="panel about-card">
          <div className="methodology-icon"><Code2 size={18} /></div>
          <p className="eyebrow">VERSION &amp; CITATION</p>
          <h3>Version 1.0.0 · pre-release</h3>
          <p>Public release date and DOI are pending. Suggested citation:</p>
          <blockquote>Atuahene, S. (n.d.). <em>ATLAS: Explainable AI for Systemic Financial Risk</em> (v1.0.0, pre-release). GitHub. DOI pending.</blockquote>
          <p><a href={REPOSITORY_URL} rel="noreferrer" target="_blank">View source code on GitHub</a></p>
          <p><a href={CHANGELOG_URL} rel="noreferrer" target="_blank">View project changelog</a></p>
          <p>No open-source license has been selected yet. Reuse permissions are therefore not granted by this page.</p>
        </article>
      </div>

      <article className="panel about-card">
        <p className="eyebrow">CHANGELOG</p>
        <h3>Version 1.0.0 · pre-release</h3>
        <p>Initial public-source screening prototype. Public release date is pending; this build is not a validated U.S. bank early-warning model.</p>
      </article>
    </section>
  );
}

export default About;
