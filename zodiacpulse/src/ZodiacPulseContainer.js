import React, { useState } from 'react';
import './ZodiacPulseContainer.css';

// PUBLIC_INTERFACE
/**
 * ZodiacPulseContainer: Main container for ZodiacPulse with the following features:
 *  - User input for birth date and day (today/tomorrow/yesterday)
 *  - Detects zodiac sign via getZodiacSign based on birth month & date
 *  - On submit, POSTs to Aztro API, receives and displays horoscope data
 *  - Mystic/dark responsive UI with star background, fade-in animation, and styled result split L/R
 *  - Accessibility and themed visuals including zodiac icon, mood emoji, lucky color, etc.
 */
function ZodiacPulseContainer() {
  const [birthDate, setBirthDate] = useState('');
  const [day, setDay] = useState('today');
  const [zodiac, setZodiac] = useState('');
  const [fetching, setFetching] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showCard, setShowCard] = useState(false);

  // Zodiac metadata: sign, emoji, icons, date ranges, traits/facts
  const zodiacMeta = [
    { name: 'aries', emoji: '♈️', icon: 'https://img.icons8.com/color/96/aries.png', range: 'Mar 21 - Apr 19', trait: 'Bold trailblazer. Confident, direct.' },
    { name: 'taurus', emoji: '♉️', icon: 'https://img.icons8.com/color/96/taurus.png', range: 'Apr 20 - May 20', trait: 'Reliable, earthy. Loves comfort.' },
    { name: 'gemini', emoji: '♊️', icon: 'https://img.icons8.com/color/96/gemini.png', range: 'May 21 - Jun 20', trait: 'Curious, witty communicator.' },
    { name: 'cancer', emoji: '♋️', icon: 'https://img.icons8.com/color/96/cancer.png', range: 'Jun 21 - Jul 22', trait: 'Nurturing, intuitive, lunar.' },
    { name: 'leo', emoji: '♌️', icon: 'https://img.icons8.com/color/96/leo.png', range: 'Jul 23 - Aug 22', trait: 'Radiant, proud, heart-centered.' },
    { name: 'virgo', emoji: '♍️', icon: 'https://img.icons8.com/color/96/virgo.png', range: 'Aug 23 - Sep 22', trait: 'Analytical, precise, helpful.' },
    { name: 'libra', emoji: '♎️', icon: 'https://img.icons8.com/color/96/libra.png', range: 'Sep 23 - Oct 22', trait: 'Charming, harmonizer, social.' },
    { name: 'scorpio', emoji: '♏️', icon: 'https://img.icons8.com/color/96/scorpio.png', range: 'Oct 23 - Nov 21', trait: 'Intense, deep, magnetic.' },
    { name: 'sagittarius', emoji: '♐️', icon: 'https://img.icons8.com/color/96/sagittarius.png', range: 'Nov 22 - Dec 21', trait: 'Adventurous, optimistic, free.' },
    { name: 'capricorn', emoji: '♑️', icon: 'https://img.icons8.com/color/96/capricorn.png', range: 'Dec 22 - Jan 19', trait: 'Ambitious, disciplined, wise.' },
    { name: 'aquarius', emoji: '♒️', icon: 'https://img.icons8.com/color/96/aquarius.png', range: 'Jan 20 - Feb 18', trait: 'Inventive, quirky, vision-driven.' },
    { name: 'pisces', emoji: '♓️', icon: 'https://img.icons8.com/color/96/pisces.png', range: 'Feb 19 - Mar 20', trait: 'Dreamy, empathetic, artistic.' }
  ];

  // Mood emoji map for fun feel
  const moodEmojis = {
    happy: '😊', sad: '😢', excited: '🤩', calm: '😌', adventurous: '🌟', cheerful: '😃',
    reflective: '🤔', powerful: '💪', loving: '❤️', practical: '🛠', relaxed: '😎',
    '': '🌠'
  };

  // PUBLIC_INTERFACE
  function getZodiacSign(month, day) {
    // Month: 1-based (1-12), day: 1-based
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'pisces';
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
    return '';
  }

  // PUBLIC_INTERFACE
  async function fetchHoroscope(sign, dayVal) {
    // Posts to Aztro API; no API key required, returns JSON
    setFetching(true);
    setError('');
    setShowCard(false);
    try {
      const response = await fetch(`https://aztro.sameerkumar.website/?sign=${sign}&day=${dayVal}`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      setResult(data);
      setShowCard(true); // Animate card display
    } catch (err) {
      setError('Unable to fetch horoscope. Please try again.');
    } finally {
      setFetching(false);
    }
  }

  function handleDateChange(e) {
    setBirthDate(e.target.value);
    setResult(null);
    setShowCard(false);
    setError('');
    if (e.target.value) {
      const [y, m, d] = e.target.value.split('-').map(Number);
      const sign = getZodiacSign(m, d);
      setZodiac(sign);
    } else {
      setZodiac('');
    }
  }

  function handleDayChange(e) {
    setDay(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    if (!birthDate || !zodiac) {
      setError('Please enter a valid birth date.');
      return;
    }
    fetchHoroscope(zodiac, day);
  }

  // Get meta for this sign
  const selectedMeta = zodiacMeta.find(z => z.name === zodiac);

  // API Response fields: date_range, current_date, description, color, mood, compatibility, lucky_number, lucky_time
  function renderHoroscope() {
    if (!result || !selectedMeta) return null;
    // Use mood emoji if mapped, fallback to sparkle
    const moodStr = String(result.mood || '').toLowerCase();
    const moodEmoji = moodEmojis[moodStr] || '✨';
    const luckyColor = result.color || '#F4D35E';
    // Fade in animation class
    const fadeClass = showCard ? 'zp-fade-in' : '';
    return (
      <div className={`zp-horoscope-card ${fadeClass}`} tabIndex={0} aria-live="polite">
        {/* Left: Zodiac, Mood, Lucky number/color, date, fact */}
        <div className="zp-horoscope-l">
          <img
            src={selectedMeta.icon}
            alt={`${selectedMeta.name} symbol`}
            className="zp-zodiac-icon"
            draggable={false}
            style={{ filter: 'drop-shadow(0 0 12px #F4D35E60)' }}
            width={72} height={72}
          />
          <div className="zp-zodiac-name-row">
            <span className="zp-zodiac-emoji" aria-label={selectedMeta.name + ' sign'}>{selectedMeta.emoji}</span>
            <span className="zp-zodiac-name">{capitalize(selectedMeta.name)}</span>
          </div>

          <div className="zp-horo-list">
            <span title="Mood" className="zp-horo-mood">
              <span aria-label={`${result.mood || 'mood'}`}>{moodEmoji}</span> {capitalize(result.mood)}
            </span>
            <span>
              <b>Lucky #: </b>
              <span className="zp-horo-num">{result.lucky_number}</span>
            </span>
            <span>
              <b>Lucky Color: </b>
              <span
                className="zp-horo-color"
                style={{
                  background: luckyColor,
                  color: '#181818',
                  border: '1.2px solid #2223',
                  textShadow: '0 0 7px #fafafa70',
                }}
                aria-label={`Lucky color: ${luckyColor}`}
              >
                {result.color}
              </span>
            </span>
            <span>
              <b>Compatibility: </b>
              <span className="zp-horo-compat">{result.compatibility}</span>
            </span>
            <span>
              <b>Date: </b>
              <span className="zp-horo-date">{result.current_date}</span>
            </span>
          </div>
          <span className="zp-zodiac-daterange">{selectedMeta.range}</span>
          <div className="zp-zodiac-fact" title="Zodiac Trait/Fact">🌙 {selectedMeta.trait}</div>
        </div>
        {/* Right: Horoscope text, summary */}
        <div className="zp-horoscope-r">
          <div className="zp-horoscope-desc">
            {result.description}
          </div>
          <div className="zp-horoscope-tidbit">
            <b>Lucky Time: </b>
            <span>{result.lucky_time}</span>
          </div>
        </div>
      </div>
    );
  }

  // Utility: capitalize first letter
  function capitalize(str) {
    return str && (str[0].toUpperCase() + str.slice(1));
  }

  return (
    <div className="zodiacpulse-bg">
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Quicksand:wght@400;700&family=Orbitron:wght@700&display=swap"
        rel="stylesheet"
      />
      <div className="zodiacpulse-container-card" role="main">
        {/* Header */}
        <header className="zodiacpulse-header">
          <span className="zodiacpulse-logo" aria-label="Zodiac stars">{'✦'}</span>
          <h1 style={{ fontFamily: "'Cinzel', serif", letterSpacing: '1.5px' }}>ZodiacPulse</h1>
          <div className="zodiacpulse-tagline">
            Unlock your daily horoscope and zodiac wisdom
          </div>
        </header>
        {/* User Input */}
        <form className="zodiacpulse-input" onSubmit={handleSubmit}>
          <input
            type="date"
            className="zodiacpulse-date-input"
            placeholder="Enter your birthdate"
            aria-label="Birthdate"
            value={birthDate}
            onChange={handleDateChange}
            required
            max={new Date().toISOString().slice(0, 10)}
            tabIndex={0}
            style={{ fontFamily: "'Quicksand', Arial, sans-serif" }}
          />
          <select
            className="zodiacpulse-date-input"
            value={day}
            onChange={handleDayChange}
            aria-label="Select day"
            required
            tabIndex={0}
            style={{ width: 120 }}
          >
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="yesterday">Yesterday</option>
          </select>
          <button
            className="zodiacpulse-action-btn"
            style={{
              background: zodiac ? 'var(--zp-accent)' : 'var(--zp-secondary)',
              cursor: zodiac && !fetching ? 'pointer' : 'not-allowed',
              boxShadow: zodiac ? '0 0 7px #F4D35Eaa' : 'none',
              outline: 'none'
            }}
            disabled={!zodiac || fetching}
            type="submit"
            tabIndex={0}
            aria-label={fetching ? 'Loading' : (zodiac ? `Reveal your sign` : 'Enter birth date to enable')}
          >
            {fetching ? (
              <span className="zp-btn-loading" aria-label="Loading...">
                <span className="zp-spinner" />
                Loading...
              </span>
            ) : (
              zodiac ? `✨ Reveal My ${capitalize(zodiac)} Horoscope` : 'Reveal My Sign'
            )}
          </button>
        </form>
        {/* Horoscope Result */}
        <section className="zodiacpulse-horoscope" aria-live="polite">
          {error ?
            <div className="zodiacpulse-horoscope-placeholder" style={{ color: '#f582ae', fontWeight: 500 }}>
              <span role="img" aria-label="error" style={{ fontSize: 30 }}>⚠️</span> {error}
            </div>
            : (showCard && result) ? renderHoroscope()
            :
            <div className="zodiacpulse-horoscope-placeholder">
              <span role="img" aria-label="Constellation" style={{ fontSize: 28 }}>✨</span>
              <div style={{ marginTop: 2 }}>
                {zodiac ?
                  <>
                    <span>Your sign is <b style={{ color: '#F4D35E' }}>{capitalize(zodiac)}</b>!</span><br />
                    Ready? Click the button for insight {selectedMeta && selectedMeta.emoji}
                  </>
                  : <>Please select your birth date<br />(Your mystical horoscope appears here)</>
                }
              </div>
            </div>
          }
        </section>
      </div>
      <style>
        {`
        /* Fade-in animation for result card */
        .zp-fade-in {
          animation: zpFadeIn 1.1s cubic-bezier(.27,.5,.18,1.15);
        }
        @keyframes zpFadeIn {
          from { opacity: 0; transform: translateY(44px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }
        /* Horoscope result flex */
        .zp-horoscope-card {
          margin-top: 0.7rem;
          background: rgba(25,28,43,0.87);
          display: flex;
          flex-direction: row;
          border-radius: 15px;
          box-shadow: 0 6px 28px 0 #0d1b2a55;
          border: 1.2px solid var(--zp-border);
          min-width: 0;
          min-height: 170px;
          max-width: 789px;
          width: 97vw;
          padding: 0;
          font-family: 'Quicksand', Arial, sans-serif;
          overflow: hidden;
          color: var(--zp-text);
        }
        .zp-horoscope-l {
          flex: 1.22;
          background: linear-gradient(117deg, #1d253d 48%, #192040 97%);
          padding: 1.12rem 1.5rem 0.8rem 1.3rem;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-start;
          border-right: 1px solid rgba(97,110,127,0.11);
          min-width: 180px;
        }
        .zp-horoscope-r {
          flex: 1.72;
          padding: 1.09rem 1.2rem 1.1rem 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-width: 160px;
        }
        .zp-zodiac-icon {
          width: 72px;
          height: 72px;
          margin-bottom: 0.15em;
          user-select: none;
        }
        .zp-zodiac-name-row {
          display: flex;
          align-items: center;
          margin-bottom: 0.22em;
          gap: 0.21em;
        }
        .zp-zodiac-emoji {
          font-size: 1.7rem;
          margin-right: 0.28em;
        }
        .zp-zodiac-name {
          font-family: 'Orbitron', 'Cinzel', sans-serif;
          font-weight: 700;
          letter-spacing: 1px;
          font-size: 1.31rem;
          color: #ffe480da;
          text-shadow: 0 1px 7px #f4d35e3b;
        }
        .zp-horo-list {
          display: flex;
          flex-direction: column;
          gap: 0.09em;
          margin-bottom: .19em;
          margin-top: .23em;
        }
        .zp-horo-mood { font-size: 1.07em; margin-bottom: 2px; }
        .zp-horo-num {
          font-weight: 700;
          font-size: 1.05em;
          background: #fff2;
          padding: 2.4px 7px;
          border-radius: 5px;
          margin-right: 2px;
        }
        .zp-horo-color {
          margin-left: 0.12em;
          font-weight: 600;
          font-size: 0.97em;
          padding: 2.5px 10px 3px 10px;
          border-radius: 6px;
          display: inline-block;
          min-width: 44px;
        }
        .zp-horo-compat, .zp-horo-date { font-size: 0.99em; }
        .zp-zodiac-daterange {
          margin-top: 0.15em;
          color: #f5dd9099;
          font-size: 0.92em;
          font-weight: 500;
          letter-spacing: 0.7px;
        }
        .zp-zodiac-fact {
          font-size: 0.98em;
          color: #a8e9e1e2;
          margin-top: .17em;
        }
        .zp-horoscope-desc {
          font-size: 1.12em;
          font-family: 'Quicksand', Arial, sans-serif;
          margin-bottom: 0.6em;
          color: #fff9;
          letter-spacing: 0.1px;
        }
        .zp-horoscope-tidbit {
          padding: 8px 7px 3.5px 7px;
          background: linear-gradient(98deg, #f4d35e56, transparent 60%);
          border-radius: 7px;
          margin-top: auto;
          font-size: 0.97em;
          letter-spacing: 0.01em;
        }
        /* Spinner for button while loading */
        .zp-btn-loading { display: flex; align-items: center; gap: 6px; }
        .zp-spinner {
          box-sizing: border-box;
          width: 19px; height: 19px; border: 2.3px solid #F4D35E88;
          border-top: 2.3px solid #f4d35e; border-radius: 50%;
          margin-right: 3px;
          animation: zpSpin 1.15s linear infinite;
          display: inline-block;
        }
        @keyframes zpSpin { 100% { transform: rotate(360deg); } }
        @media (max-width: 800px) {
          .zp-horoscope-card { flex-direction: column; }
          .zp-horoscope-l { border-right: none; border-bottom: 1px solid rgba(97,110,127,0.09); align-items: center; }
          .zp-horoscope-r { padding-top: 0.6em; min-width: 60px; }
          .zp-zodiac-icon { margin-bottom: 0; }
        }
        @media (max-width: 540px) {
          .zp-horoscope-card {
            padding: 0;
            font-size: 1em;
          }
          .zp-horoscope-l, .zp-horoscope-r {
            padding: 1em 0.5em 0.7em 0.5em;
          }
        }
        `}
      </style>
    </div>
  );
}

export default ZodiacPulseContainer;
