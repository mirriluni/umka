// Общие помощники интерфейса
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function starsHtml(n, max = 3, size = 20) {
  let out = '';
  for (let i = 0; i < max; i++) out += `<span class="star ${i < n ? 'on' : ''}" style="--s:${size}px" aria-hidden="true">★</span>`;
  return `<span class="stars" aria-label="${n} из ${max} звёзд">${out}</span>`;
}

let toastTimer;
export function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.hidden = false;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.classList.remove('show'); setTimeout(() => (el.hidden = true), 250); }, 2600);
}

export function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

export function fmtMinutes(sec) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} мин`;
  return `${Math.floor(m / 60)} ч ${m % 60} мин`;
}

// Перерисовать текущую страницу
export const refresh = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

export const levelLabel = (n) => ['', 'легко', 'средне', 'посложнее'][n] || '';

export function shuffle(arr, seed = Math.random()) {
  const a = [...arr];
  let s = Math.floor(seed * 233280) || 7;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function confetti(container, count = 80) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cols = ['#2f7ff0', '#ffc531', '#2fb47a', '#ff7a8a', '#9b7bff'];
  const box = document.createElement('div');
  box.className = 'confetti';
  for (let i = 0; i < count; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = cols[i % cols.length];
    p.style.animationDelay = Math.random() * 0.6 + 's';
    p.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
    p.style.setProperty('--r', Math.random() * 720 - 360 + 'deg');
    p.style.setProperty('--x', Math.random() * 160 - 80 + 'px');
    box.appendChild(p);
  }
  container.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}
