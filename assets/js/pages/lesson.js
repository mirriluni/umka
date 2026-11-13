import { getLesson, getRoom } from '../data/lessons.js';
import { store } from '../store.js';
import { umka } from '../umka.js';
import { esc, levelLabel } from '../ui.js';

function picture(room, focus, caption) {
  const z = focus?.zoom || 1;
  const x = focus?.x ?? 50, y = focus?.y ?? 50;
  return `<figure class="pic">
    <span class="pic-img" style="background-image:url(${room.img});transform-origin:${x}% ${y}%;transform:scale(${z})"></span>
    ${focus ? `<span class="ring" style="left:${x}%;top:${y}%"></span>` : ''}
    ${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}
  </figure>`;
}

function dots(n, cur) {
  let s = '';
  for (let i = 1; i <= n; i++) s += `<i class="${i < cur ? 'done' : i === cur ? 'cur' : ''}"></i>`;
  return `<span class="dots" aria-hidden="true">${s}</span>`;
}

export function lessonPage(id, step) {
  const l = getLesson(id);
  if (!l) return { redirect: '#/lessons' };
  if (!store.isUnlocked(id)) return { redirect: '#/lessons/' + l.room };
  const room = getRoom(l.room);
  const total = l.steps.length;
  if (step > total) return { redirect: `#/lesson/${id}/step/${total}` };

  const crumbs = `<nav class="crumbs" aria-label="Навигация"><a href="#/lessons">Уроки</a> › <a href="#/lessons/${room.id}">${room.title}</a> › <b>${esc(l.title)}</b></nav>`;

  let body, bubble, pose = 'point', mood = 'smile';
  if (step === 0) {
    body = `
      <div class="lesson-intro">
        ${picture(room, null, room.title)}
        <div class="li-text">
          <h1>${l.icon} ${esc(l.title)}</h1>
          <div class="lc-meta big"><span>⏱ ${l.minutes} мин</span><span>${l.age}</span><span>${levelLabel(l.level)}</span>${l.adult ? '<span class="adult-mark sm">🙋 нужен взрослый рядом</span>' : ''}</div>
          <h3>Что понадобится</h3>
          <div class="need">${l.need.map((n) => `<span class="tag soft">${esc(n)}</span>`).join('')}</div>
          <h3>Правила безопасности</h3>
          <ul class="rules">${l.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
          <h3>Чему научимся</h3>
          <ul class="checks">${l.skills.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
          <div class="btn-row end"><a class="btn" href="#/lesson/${id}/step/1">Начинаем! →</a></div>
        </div>
      </div>`;
    bubble = esc(l.intro);
    pose = 'wave';
  } else {
    const s = l.steps[step - 1];
    const last = step === total;
    body = `
      <div class="lesson-step">
        <div class="ls-left">
          ${picture(room, s.focus, s.focus ? 'Смотри сюда' : '')}
          <div class="rule-pair">
            <div class="can"><b>✓ Можно</b><span>${esc(s.can)}</span></div>
            <div class="cant"><b>✕ Нельзя</b><span>${esc(s.cant)}</span></div>
          </div>
        </div>
        <div class="ls-text">
          <div class="ls-top"><span>Шаг ${step} из ${total}</span>${dots(total, step)}</div>
          <h1>${esc(s.title)}</h1>
          <p class="ls-p">${esc(s.text)}</p>
          <div class="rule-pair m">
            <div class="can"><b>✓ Можно</b><span>${esc(s.can)}</span></div>
            <div class="cant"><b>✕ Нельзя</b><span>${esc(s.cant)}</span></div>
          </div>
          ${s.adult ? '<div class="adult-bar">🙋 На этом шаге позови взрослого</div>' : ''}
          <div class="btn-row split">
            <a class="btn ghost" href="#/lesson/${id}/step/${step - 1}">← Назад</a>
            ${last ? `<a class="btn green" href="#/lesson/${id}/test">Я всё понял! К тесту →</a>` : `<a class="btn" href="#/lesson/${id}/step/${step + 1}">Дальше →</a>`}
          </div>
        </div>
      </div>`;
    bubble = s.adult ? 'Здесь нужен взрослый. Позови маму или папу!' : last ? 'Молодец! Осталось проверить себя в тесте.' : ['Не спеши, я рядом!', 'У тебя отлично получается!', 'Смотри на картинку, я показал, где это.', 'Помни про правила «можно» и «нельзя».'][step % 4];
    if (s.adult) mood = 'wow';
  }

  const html = `
  <div class="lesson-bg" style="background-image:url(${room.img})" aria-hidden="true"></div>
  <section class="wrap lesson-wrap">
    ${crumbs}
    <div class="lesson-layout">
      <div class="card lesson-card-main">${body}</div>
      <aside class="lesson-umka" aria-label="Подсказка Умки">
        <div class="bubble">${bubble}</div>
        ${umka({ pose, mood, size: 220, cls: step === 0 ? 'bob' : '' })}
      </aside>
    </div>
  </section>`;

  return {
    html,
    title: l.title,
    timed: true,
    cls: 'page-lesson',
    mount() {
      const onKey = (e) => {
        if (e.target.closest('input,textarea')) return;
        if (e.key === 'ArrowRight' && step < total) location.hash = `#/lesson/${id}/step/${step + 1}`;
        if (e.key === 'ArrowLeft' && step > 0) location.hash = `#/lesson/${id}/step/${step - 1}`;
      };
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    },
  };
}
