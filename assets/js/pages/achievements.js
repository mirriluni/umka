import { ROOMS, lessonsOf } from '../data/lessons.js';
import { store } from '../store.js';
import { umka } from '../umka.js';
import { esc, starsHtml, plural, $, refresh, toast } from '../ui.js';

export function achievementsPage() {
  const t = store.totals();
  const name = store.childName;
  const badges = store.badges();
  const earned = badges.filter((b) => b.earned).length;

  const html = `
  <section class="wrap page-head with-umka">
    <div>
      <h1>${name ? `Успехи: ${esc(name)}` : 'Мои успехи'}</h1>
      <p class="lead">${t.passed ? `Ты прошёл ${t.passed} ${plural(t.passed, 'урок', 'урока', 'уроков')} и собрал ${t.stars} ${plural(t.stars, 'звезду', 'звезды', 'звёзд')}. Так держать!` : 'Здесь будут твои звёзды и значки. Пройди первый урок!'}</p>
      ${!name ? `<form class="field-row" id="nameForm2"><input id="childName2" maxlength="24" placeholder="Как тебя зовут?" aria-label="Имя"><button class="btn small" type="submit">Сохранить</button></form>` : ''}
    </div>
    ${umka({ pose: t.passed ? 'cheer' : 'wave', mood: t.passed ? 'happy' : 'smile', size: 170 })}
  </section>

  <section class="wrap stats3">
    <div class="card stat"><small>Уроков пройдено</small><b>${t.passed}<span> из ${store.totals().maxStars / 3}</span></b></div>
    <div class="card stat"><small>Звёзд собрано</small><b>${t.stars} <span class="star on">★</span><span> из ${t.maxStars}</span></b></div>
    <div class="card stat"><small>Значков</small><b>${earned}<span> из ${badges.length}</span></b></div>
  </section>

  <section class="wrap block">
    <h2>Значки</h2>
    <div class="badges">
      ${badges.map((b) => `<div class="card badge ${b.earned ? 'on' : ''}"><span class="medal ${b.earned ? '' : 'off'}"><span>${b.earned ? b.icon : '🔒'}</span></span><b>${esc(b.title)}</b><small>${esc(b.desc)}</small></div>`).join('')}
    </div>
  </section>

  <section class="wrap block">
    <h2>Уроки по комнатам</h2>
    <div class="rooms-progress">
      ${ROOMS.map((r) => {
        const p = store.roomProgress(r.id);
        return `<div class="card rp-card">
          <div class="rp-head"><span class="thumb" style="background-image:url(${r.img})"></span><span class="grow"><b>${r.icon} ${r.title}</b><span class="bar"><i style="width:${(p.done / p.total) * 100}%"></i></span></span><span class="muted">${p.done}/${p.total}</span></div>
          <ul class="rp-list">${lessonsOf(r.id).map((l) => {
            const st = store.stars(l.id);
            const un = store.isUnlocked(l.id);
            return `<li><a href="${un ? `#/lesson/${l.id}` : `#/lessons/${r.id}`}">${l.icon} ${esc(l.title)}</a>${un ? starsHtml(st, 3, 16) : '<span class="muted">🔒</span>'}</li>`;
          }).join('')}</ul>
        </div>`;
      }).join('')}
    </div>
  </section>`;

  return {
    html,
    title: 'Мои успехи',
    mount(root) {
      const f = $('#nameForm2', root);
      if (f) f.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = $('#childName2', f).value.trim();
        if (!v) return toast('Напиши своё имя');
        store.setChildName(v); refresh();
      });
    },
  };
}
