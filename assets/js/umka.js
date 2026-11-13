// Умка в стиле прошлогодних стикеров. Временная векторная версия:
// когда Полина нарисует финальные позы, их можно подставить картинками (см. README).
//
// umka({ pose, mood, size, cls })
//   pose: 'wave' | 'point' | 'cheer' | 'idle'
//   mood: 'smile' | 'happy' | 'sad' | 'wow'

const N = '#1c2338';
let uid = 0;

const arm = (x, y, a) =>
  `<rect x="-16" y="-4" width="32" height="66" rx="16" transform="translate(${x},${y}) rotate(${a})"/>`;

const FEET = '<ellipse cx="90" cy="258" rx="28" ry="17"/><ellipse cx="150" cy="258" rx="28" ry="17"/>';
const BODY = '<ellipse cx="120" cy="205" rx="64" ry="58"/>';
const EARS = '<circle cx="54" cy="48" r="26"/><circle cx="186" cy="48" r="26"/>';
const HEAD = '<ellipse cx="120" cy="100" rx="86" ry="70"/>';

const ARMS = {
  wave: arm(72, 180, 150) + arm(170, 182, -22),
  point: arm(70, 188, 95) + arm(170, 182, -22),
  cheer: arm(72, 180, 150) + arm(168, 180, -150),
  idle: arm(72, 182, 22) + arm(168, 182, -22),
};

function face(mood, id) {
  const p = [];
  p.push(`<g clip-path="url(#h${id})"><ellipse cx="120" cy="196" rx="100" ry="42" fill="#e3eaf6"/></g>`);
  p.push(`<g clip-path="url(#b${id})"><ellipse cx="206" cy="225" rx="52" ry="80" fill="#e3eaf6"/><ellipse cx="120" cy="214" rx="30" ry="26" fill="#f3f6fb"/></g>`);
  p.push('<ellipse cx="52" cy="44" rx="12" ry="11" fill="#c9d4e8"/><ellipse cx="188" cy="44" rx="12" ry="11" fill="#c9d4e8"/>');
  p.push('<path d="M98 36 q3 -18 13 -8 q3 -18 13 -5 q6 -15 11 5 z" fill="#fff"/>');
  p.push(`<path d="M96 34 q4 -16 14 -6 q3 -18 13 -5 q6 -15 12 6" fill="none" stroke="${N}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
  if (mood === 'happy') {
    p.push(`<path d="M74 104 q16 -20 32 0 M134 104 q16 -20 32 0" fill="none" stroke="${N}" stroke-width="6" stroke-linecap="round"/>`);
  } else {
    const ry = mood === 'wow' ? 22 : 20;
    p.push(`<ellipse cx="90" cy="100" rx="16" ry="${ry}" fill="${N}"/><ellipse cx="150" cy="100" rx="16" ry="${ry}" fill="${N}"/>`);
    p.push('<circle cx="84" cy="91" r="7" fill="#fff"/><circle cx="144" cy="91" r="7" fill="#fff"/><circle cx="95" cy="109" r="3" fill="#fff"/><circle cx="155" cy="109" r="3" fill="#fff"/>');
    const brows = mood === 'sad'
      ? 'M76 68 q12 4 22 -6 M142 62 q10 10 22 6'
      : mood === 'wow' ? 'M74 66 q12 -10 24 -4 M142 62 q12 -6 24 4' : 'M74 72 q12 -8 24 -2 M142 70 q12 -6 24 2';
    p.push(`<path d="${brows}" fill="none" stroke="${N}" stroke-width="4.5" stroke-linecap="round"/>`);
  }
  p.push('<ellipse cx="70" cy="128" rx="15" ry="9" fill="#f9b2c1"/><ellipse cx="170" cy="128" rx="15" ry="9" fill="#f9b2c1"/>');
  p.push(`<path d="M108 118 q12 -7 24 0 q-1 10 -12 14 q-11 -4 -12 -14z" fill="${N}"/><ellipse cx="116" cy="119" rx="4" ry="2.4" fill="#5d6a8a"/>`);
  if (mood === 'happy') {
    p.push(`<path d="M106 138 q14 16 28 0 q-14 6 -28 0z" fill="${N}"/><path d="M113 143 q7 5 14 0" fill="none" stroke="#f47c93" stroke-width="4" stroke-linecap="round"/>`);
  } else if (mood === 'sad') {
    p.push(`<path d="M110 142 q10 -8 20 0" fill="none" stroke="${N}" stroke-width="4.5" stroke-linecap="round"/>`);
  } else if (mood === 'wow') {
    p.push(`<ellipse cx="120" cy="142" rx="7" ry="8" fill="${N}"/>`);
  } else {
    p.push(`<path d="M110 138 q10 9 20 0" fill="none" stroke="${N}" stroke-width="4.5" stroke-linecap="round"/>`);
  }
  return p.join('');
}

export function umka({ pose = 'wave', mood = 'smile', size = 220, cls = '', label = 'Умка' } = {}) {
  const id = `u${++uid}`;
  const arms = ARMS[pose] || ARMS.wave;
  const sil = FEET + BODY + arms + EARS + HEAD;
  const vb = pose === 'point' ? '-30 0 270 290' : '0 0 240 290';
  const w = pose === 'point' ? 270 : 240;
  const h = Math.round((size * 290) / w);
  return `<svg class="umka ${cls}" viewBox="${vb}" width="${size}" height="${h}" role="img" aria-label="${label}">
  <defs>
    <clipPath id="h${id}">${HEAD}</clipPath><clipPath id="b${id}">${BODY}</clipPath>
    <filter id="s${id}" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="${N}" flood-opacity=".22"/></filter>
    <g id="g${id}">${sil}</g>
  </defs>
  <use href="#g${id}" fill="#fff" stroke="#fff" stroke-width="22" stroke-linejoin="round" filter="url(#s${id})"/>
  <use href="#g${id}" fill="#fff" stroke="${N}" stroke-width="6" stroke-linejoin="round"/>
  ${face(mood, id)}
  <g fill="#fff" stroke="${N}" stroke-width="6">${arms}</g>
</svg>`;
}
