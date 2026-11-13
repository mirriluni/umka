import { store } from './store.js';
import { esc } from './ui.js';
import { homePage } from './pages/home.js';
import { catalogPage } from './pages/catalog.js';
import { lessonPage } from './pages/lesson.js';
import { testPage } from './pages/test.js';
import { resultPage } from './pages/result.js';
import { achievementsPage } from './pages/achievements.js';
import { parentsPage } from './pages/parents.js';
import { aboutPage } from './pages/about.js';
import { notFoundPage } from './pages/notfound.js';
import { CONFIG } from './config.js';

// ------------------------------------------------------------ маршруты
// #/                       главная
// #/lessons[/room]         каталог уроков
// #/lesson/:id[/step/:n]   урок (n = 0 — вступление)
// #/lesson/:id/test        тест
// #/lesson/:id/result      результат теста
// #/results                мои успехи
// #/parents                для родителей
// #/about                  о проекте
const routes = [
  [/^\/?$/, () => homePage()],
  [/^\/lessons(?:\/([\w-]+))?$/, (m) => catalogPage(m[1])],
  [/^\/lesson\/([\w-]+)(?:\/step\/(\d+))?$/, (m) => lessonPage(m[1], Number(m[2] || 0))],
  [/^\/lesson\/([\w-]+)\/test$/, (m) => testPage(m[1])],
  [/^\/lesson\/([\w-]+)\/result$/, (m) => resultPage(m[1])],
  [/^\/results$/, () => achievementsPage()],
  [/^\/parents$/, () => parentsPage()],
  [/^\/about$/, () => aboutPage()],
];

const NAV = [
  { href: '#/', key: 'home', label: 'Главная' },
  { href: '#/lessons', key: 'lessons', label: 'Уроки' },
  { href: '#/results', key: 'results', label: 'Мои успехи' },
  { href: '#/parents', key: 'parents', label: 'Родителям' },
  { href: '#/about', key: 'about', label: 'О проекте' },
];

function section(path) {
  if (path.startsWith('/lesson')) return 'lessons';
  if (path.startsWith('/results')) return 'results';
  if (path.startsWith('/parents')) return 'parents';
  if (path.startsWith('/about')) return 'about';
  return path === '/' || path === '' ? 'home' : '';
}

function renderHeader(active) {
  const t = store.totals();
  const name = store.childName;
  document.getElementById('header').innerHTML = `
  <div class="nav-bar">
    <a class="logo" href="#/" aria-label="На главную">
      <img src="assets/img/favicon.svg" width="42" height="42" alt="">
      <span>В гостях <b>у Умки</b></span>
    </a>
    <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="navLinks" aria-label="Меню">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav-links" id="navLinks" aria-label="Главное меню">
      ${NAV.map((n) => `<a href="${n.href}" class="${n.key === active ? 'on' : ''}" ${n.key === active ? 'aria-current="page"' : ''}>${n.label}</a>`).join('')}
    </nav>
    <a class="pill" href="#/results" title="Мои звёзды"><span class="star on" aria-hidden="true">★</span>${t.stars}</a>
    <a class="ava" href="#/results" title="${name ? esc(name) : 'Мой профиль'}">${name ? esc(name[0].toUpperCase()) : '🐾'}</a>
  </div>`;
  const btn = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

function renderFooter() {
  document.getElementById('footer').innerHTML = `
  <div class="wrap footer-in">
    <div>
      <div class="logo small"><img src="assets/img/favicon.svg" width="30" height="30" alt=""><span>В гостях <b>у Умки</b></span></div>
      <p class="muted">Уроки для жизни для детей 6–10 лет. Учимся помогать дома по шагам и безопасно.</p>
    </div>
    <nav class="footer-links" aria-label="Ссылки в подвале">
      <a href="#/lessons">Уроки</a><a href="#/results">Мои успехи</a><a href="#/parents">Родителям</a><a href="#/about">О проекте</a>
    </nav>
    <div class="muted small">
      <div>Почта команды: <span class="sel">${esc(CONFIG.contactEmail)}</span></div>
      <div>© ${new Date().getFullYear()} Команда проекта «В гостях у Умки»</div>
    </div>
  </div>`;
}

// ---------------------------------------------------- учёт времени в уроках
let timer = null;
function stopTimer() {
  if (!timer) return;
  clearInterval(timer.int);
  document.removeEventListener('visibilitychange', timer.vis);
  if (!document.hidden) store.addTime((Date.now() - timer.since) / 1000);
  timer = null;
}
function startTimer() {
  stopTimer();
  const t = { since: Date.now() };
  t.flush = () => { if (!document.hidden) store.addTime((Date.now() - t.since) / 1000); t.since = Date.now(); };
  t.vis = () => { if (document.hidden) { store.addTime((Date.now() - t.since) / 1000); } t.since = Date.now(); };
  t.int = setInterval(t.flush, 15000);
  document.addEventListener('visibilitychange', t.vis);
  timer = t;
}

// ---------------------------------------------------------------- роутер
let cleanup = null;
function router() {
  const path = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
  if (cleanup) { try { cleanup(); } catch {} cleanup = null; }
  stopTimer();

  let page = null;
  for (const [re, fn] of routes) {
    const m = path.match(re);
    if (m) { page = fn(m); break; }
  }
  if (!page) page = notFoundPage();
  if (page.redirect) { location.replace(page.redirect); return; }

  renderHeader(section(path));
  const main = document.getElementById('main');
  main.className = page.cls || '';
  main.innerHTML = page.html;
  document.title = page.title ? `${page.title} · В гостях у Умки` : 'В гостях у Умки';
  if (page.mount) cleanup = page.mount(main) || null;
  if (page.timed) startTimer();
  if (!page.keepScroll) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  main.focus({ preventScroll: true });
}

window.addEventListener('hashchange', router);
window.addEventListener('beforeunload', stopTimer);
renderFooter();
router();

// Перерисовать текущую страницу (после изменения прогресса)
export const rerender = () => router();
