import { getLesson, getRoom, lessonsOf } from '../data/lessons.js';
import { store } from '../store.js';
import { umka } from '../umka.js';
import { esc, starsHtml, confetti } from '../ui.js';

export function resultPage(id) {
  const l = getLesson(id);
  if (!l) return { redirect: '#/lessons' };
  let r = null;
  try { r = JSON.parse(sessionStorage.getItem('umka.lastResult') || 'null'); } catch {}
  const saved = store.lesson(id);
  if (!r || r.id !== id) {
    if (!saved?.last) return { redirect: `#/lesson/${id}` };
    r = { id, ...saved.last, newBadges: [] };
  }
  const stars = Math.max(0, Math.min(3, (() => { const x = r.correct / r.total; return x >= 0.99 ? 3 : x >= 0.7 ? 2 : x >= 0.4 ? 1 : 0; })()));
  const passed = stars > 0;
  const room = getRoom(l.room);
  const list = lessonsOf(l.room);
  const nextInRoom = list[list.findIndex((x) => x.id === id) + 1];
  const next = nextInRoom && store.isUnlocked(nextInRoom.id) ? nextInRoom : store.nextLesson();
  const badges = store.badges().filter((b) => r.newBadges?.includes(b.id));
  const name = store.childName;

  const title = !passed ? 'Почти получилось!' : stars === 3 ? `Ура! ${name ? esc(name) + ', ты' : 'Ты'} справился!` : 'Хороший результат!';

  const html = `
  <section class="wrap result-wrap">
    <div class="card result-card">
      <div class="result-top">
        ${umka({ pose: passed ? 'cheer' : 'idle', mood: passed ? 'happy' : 'sad', size: 150, cls: passed ? 'jump' : '' })}
        ${badges.map((b) => `<div class="medal" title="${esc(b.title)}"><span>${b.icon}</span></div>`).join('')}
      </div>
      <h1>${title}</h1>
      <div class="big-stars">${starsHtml(stars, 3, 54)}</div>
      <p class="muted strong">${r.correct} из ${r.total} верно${badges.length ? ` · новый значок ${badges.map((b) => `<b class="gold">«${esc(b.title)}»</b>`).join(', ')}` : ''}</p>
      ${!passed ? '<p>Чтобы урок засчитался, нужна хотя бы одна звезда. Повтори шаги урока и попробуй ещё раз, у тебя получится!</p>' : ''}

      <div class="room-progress">
        ${['kitchen', 'living', 'workshop'].map((rid) => {
          const rr = getRoom(rid); const p = store.roomProgress(rid);
          return `<div class="rp"><span class="thumb" style="background-image:url(${rr.img})"></span><span class="grow"><b>${rr.title} · ${p.done}/${p.total}</b><span class="bar"><i style="width:${(p.done / p.total) * 100}%"></i></span></span></div>`;
        }).join('')}
      </div>

      ${passed ? `<div class="learned"><b>Что ты теперь умеешь</b><ul class="checks inline">${l.skills.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>` : ''}

      ${r.mistakes?.length ? `<details class="review"><summary>Разобрать ошибки (${r.mistakes.length})</summary>
        <ul>${r.mistakes.map((qi) => { const q = l.test[qi]; return q ? `<li><b>${esc(q.q)}</b><span>${esc(q.explain)}</span></li>` : ''; }).join('')}</ul></details>` : ''}

      <div class="btn-row center">
        <a class="btn ghost" href="#/lesson/${id}/test">Пройти тест ещё раз</a>
        ${!passed ? `<a class="btn" href="#/lesson/${id}/step/1">Повторить урок</a>` : next ? `<a class="btn" href="#/lesson/${next.id}">Следующий урок: ${esc(next.title)} →</a>` : '<a class="btn" href="#/results">Мои успехи →</a>'}
      </div>
      <a class="link small" href="#/parents">Показать родителям</a>
    </div>
  </section>`;

  return {
    html,
    title: 'Результат',
    cls: 'page-result',
    mount(root) {
      if (passed) confetti(root.querySelector('.result-wrap'));
      try { sessionStorage.removeItem('umka.lastResult'); } catch {}
    },
  };
}
