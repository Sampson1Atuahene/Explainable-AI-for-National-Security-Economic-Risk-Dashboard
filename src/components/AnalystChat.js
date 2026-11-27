import React, { useState } from 'react';
import { ArrowUp, Bot, HelpCircle, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'What is driving the current screening signal?',
  'What should I know about the data quality?',
  'Do you have hourly or per-minute data?',
];

function formatIndicator(indicator) {
  if (!indicator?.latest) return `${indicator?.name || 'Indicator'}: no reported observation available`;
  const unit = indicator.unit === '%' ? '%' : ` ${indicator.unit}`;
  return `${indicator.name}: ${indicator.latest.value.toFixed(indicator.decimals)}${unit} (${indicator.latest.year})`;
}

function getLocalAnswer(question, context) {
  const normalized = question.toLowerCase();
  const observations = context.indicators.filter((indicator) => indicator.latest);
  const signalText = context.score === null
    ? 'A screening score is unavailable because there is not enough indicator coverage.'
    : `The weighted screening signal is ${context.score.toFixed(1)} / 10 (${context.tone}).`;

  if (/driver|explain|why|signal|risk/.test(normalized)) {
    const drivers = context.drivers.slice(0, 3);
    const details = drivers.length
      ? ` Top contributors are ${drivers.map((driver) => `${driver.name} (${driver.contribution.toFixed(1)} points; ${driver.year} observation)`).join(', ')}.`
      : ' No weighted risk drivers are currently available.';
    return `${context.geography}: ${signalText}${details} Contributions describe the configured index, not causation or a validated forecast.`;
  }
  if (/gdp|growth|inflation|unemployment|npl|bank|credit|debt|reserve/.test(normalized)) {
    const matches = observations.filter((indicator) =>
      normalized.split(/\W+/).some((term) => term.length > 3 && indicator.name.toLowerCase().includes(term)),
    );
    const selected = matches.length ? matches.slice(0, 4) : observations.slice(0, 4);
    return `${context.geography} — latest available public observations: ${selected.map(formatIndicator).join('; ') || 'none available'}. ${signalText} Reporting years vary by series.`;
  }
  if (/minute|hour|weekly|monthly|daily|frequency|real.?time|stream/.test(normalized)) {
    return `The connected macro and banking indicators are annual. A daily FX reference snapshot ${context.fxDate ? `is available as of ${context.fxDate}` : 'may be available when the FX feed responds'}, but there is no historical daily, weekly, monthly, hourly or per-minute stream connected. No high-frequency readings are simulated.`;
  }
  if (/quality|source|fresh|coverage|data/.test(normalized)) {
    const lastYear = observations.map((indicator) => Number(indicator.latest.year)).filter(Number.isFinite);
    const period = lastYear.length ? `${Math.min(...lastYear)}–${Math.max(...lastYear)}` : 'no reporting period available';
    return `${observations.length} of ${context.indicators.length} configured indicators have a latest observation for ${context.geography}. Reported years span ${period}; World Bank series are generally annual and may lag current conditions. ${context.fxDate ? `Daily FX reference snapshot: ${context.fxDate}.` : 'FX reference data is currently unavailable.'}`;
  }
  return `I can summarize the loaded public indicators for ${context.geography}. ${signalText} Try asking about the screening drivers, GDP, inflation, banking indicators, source coverage, or the available time horizons.`;
}

function AnalystChat({ context }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello. I can explain the loaded public data for ${context.geography}. Ask about the screening signal, indicator observations, data quality or time horizons.`,
    },
  ]);
  const [question, setQuestion] = useState('');
  const [pending, setPending] = useState(false);
  const [provider, setProvider] = useState('local');
  const [notice, setNotice] = useState('');

  const sendMessage = async (value) => {
    const text = value.trim();
    if (!text || pending) return;

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setQuestion('');
    setPending(true);
    setNotice('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.slice(-10),
          context,
        }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || `OpenAI service unavailable (${response.status})`);
      }
      const result = await response.json();
      if (typeof result.reply !== 'string' || !result.reply.trim()) {
        throw new Error('The OpenAI service returned an empty answer.');
      }
      setProvider('openai');
      setMessages((current) => [...current, { role: 'assistant', content: result.reply }]);
    } catch (error) {
      setProvider('local');
      setNotice(`Free local analyst mode: ${error.message}`);
      setMessages((current) => [...current, { role: 'assistant', content: getLocalAnswer(text, context) }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="assistant-page" aria-label="AI analyst">
      <div className="assistant-intro">
        <div className="assistant-avatar"><Bot size={23} /></div>
        <div>
          <p className="eyebrow">ASK YOUR ANALYST</p>
          <h2>Economic risk, explained</h2>
          <p>Ask questions about the selected geography and the public observations currently loaded into the dashboard.</p>
        </div>
        <span className={`assistant-provider ${provider}`}><span className="status-dot" />{provider === 'openai' ? 'OpenAI connected' : 'Free local mode'}</span>
      </div>

      <div className="assistant-notice">
        <HelpCircle size={16} />
        <span>Local answers are free and based on transparent dashboard rules. OpenAI API access is optional and may incur usage charges; its key must stay on the server, never in the browser.</span>
      </div>
      {notice && <div className="assistant-fallback" role="status">{notice}</div>}

      <div className="chat-panel panel">
        <div className="chat-messages" aria-live="polite">
          {messages.map((message, index) => (
            <article className={`chat-message ${message.role}`} key={`${index}-${message.role}`}>
              <span className="chat-message-icon">{message.role === 'assistant' ? <Sparkles size={14} /> : 'You'}</span>
              <p>{message.content}</p>
            </article>
          ))}
          {pending && <div className="chat-pending"><span className="status-dot" /> Reviewing the available evidence…</div>}
        </div>

        <div className="chat-suggestions" aria-label="Suggested questions">
          {SUGGESTIONS.map((suggestion) => (
            <button disabled={pending} key={suggestion} onClick={() => sendMessage(suggestion)} type="button">{suggestion}</button>
          ))}
        </div>
        <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); sendMessage(question); }}>
          <label className="sr-only" htmlFor="analyst-question">Ask a question about the dashboard</label>
          <input
            autoComplete="off"
            id="analyst-question"
            maxLength={1000}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about the data, risk drivers or reporting cadence…"
            value={question}
          />
          <button aria-label="Send question" disabled={pending || !question.trim()} type="submit"><ArrowUp size={17} /></button>
        </form>
        <p className="chat-disclaimer">Decision support only. Public data may be delayed or incomplete; answers are not investment, legal or security advice. Do not enter sensitive or classified information.</p>
      </div>
    </section>
  );
}

export default AnalystChat;
