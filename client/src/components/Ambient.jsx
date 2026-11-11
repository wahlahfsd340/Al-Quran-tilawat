import { useMemo } from 'react';

function Lantern({ side }) {
  return (
    <svg className={`lantern ${side}`} viewBox="0 0 60 150" aria-hidden="true">
      <line x1="30" y1="0" x2="30" y2="40" stroke="#d9b25f" strokeWidth="2" />
      <path d="M22 40h16l4 8H18z" fill="#d9b25f" />
      <path d="M18 48h24l6 40-18 18-18-18z" fill="#f3dc9a" fillOpacity="0.9" stroke="#d9b25f" strokeWidth="2" />
      <path d="M30 48v58M18 48l12 58M42 48l-12 58" stroke="#a9812e" strokeWidth="1.5" fill="none" />
      <circle cx="30" cy="76" r="9" fill="#fff6d6" className="flame" />
      <path d="M26 106h8l-2 10h-4z" fill="#d9b25f" />
      <circle cx="30" cy="122" r="5" fill="#d9b25f" />
    </svg>
  );
}

export default function Ambient() {
  const stars = useMemo(
    () => Array.from({ length: 70 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 2.2,
      delay: Math.random() * 6,
      dur: 2.5 + Math.random() * 4,
    })),
    []
  );
  return (
    <div className="ambient" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        />
      ))}
      <svg className="moon" viewBox="0 0 100 100">
        <defs>
          <mask id="cres">
            <rect width="100" height="100" fill="white" />
            <circle cx="62" cy="42" r="34" fill="black" />
          </mask>
        </defs>
        <circle cx="48" cy="50" r="38" fill="#f3dc9a" mask="url(#cres)" />
      </svg>
      <Lantern side="left" />
      <Lantern side="right" />
    </div>
  );
}
