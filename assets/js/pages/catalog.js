import { ROOMS, lessonsOf, TIPS, getRoom } from '../data/lessons.js';
import { store } from '../store.js';
import { umka } from '../umka.js';
import { esc, starsHtml, levelLabel, toast, $$ } from '../ui.js';

function lessonCard(l) {
  const unlocked = store.isUnlocked(l.id);
  const st = store.stars(l.id);
  const data = store.lesson(l.id);
  let status;
  if (!unlocked) status = '<span class="tag lock">🔒 закрыт</span>';
  else if (st > 0) status = starsHtml(st, 3, 18);
  else if (data?.attempts) status = '<span class="tag warn">попробуй ещё</span>';
  else status = '<span class="tag new">новый</span>';
  const href = unlocked ? `#/lesson/${l.id}` : '#';
  return `<a class="card lesson-card ${unlocked ? '' : 'locked'}" href="${href}" data-id="${l.id}" ${unlocked ? '' : 'aria-disabled="true"'}>
    <span class="lc-ico">${l.icon}</span>
    <span class="lc-main">
      <b>${esc(l.title)}</b>
      <small>${esc(l.short)}</small>
      <span class="lc-meta"><span>⏱ ${l.minutes} мин</span><span>${l.age}</span><span>${levelLabel(l.level)}</span>${l.adult ? '<span class="adult-mark sm">🙋 со взрослым</span>' : ''}</span>
    </span>
    <span class="lc-status">${status}</span>
  </a>`;
}

export function catalogPage(roomId) {
  const room = roomId ? getRoom(roomId) : null;
  if (roomId && !room) return { redirect: '#/lessons' };
  const rooms = room ? [room] : ROOMS;
  const tip = TIPS[(new Date().getDate() + 3) % TIPS.length];

  const html = `
  <section class="wrap page-head">
    <h1>Куда пойдём сегодня?</h1>
    <p class="lead">Выбери комнату. Уроки в каждой комнате открываются по очереди.</p>
    <div class="tabs" role="tablist">
      <a href="#/lessons" class="${!room ? 'on' : ''}">Все комнаты</a>
      ${ROOMS.map((r) => `<a href="#/lessons/${r.id}" class="${room?.id === r.id ? 'on' : ''}">${r.icon} ${r.title}</a>`).join('')}
    </div>
  </section>

  ${rooms.map((r) => {
    const p = store.roomProgress(r.id);
    return `<section class="wrap room-section">
      <div class="room-banner" style="background-image:url(${r.img})">
        <div class="room-banner-in">
          <h2>${r.icon} ${r.title}</h2>
          <p>${esc(r.about)}</p>
          <div class="bar light"><i style="width:${(p.done / p.total) * 100}%"></i></div>
          <small>Пройдено ${p.done} из ${p.total} · значок «${r.badge.title}» ${r.badge.icon}</small>
        </div>
      </div>
      <div class="lesson-grid">${lessonsOf(r.id).map(lessonCard).join('')}</div>
    </section>`;
  }).join('')}

  <section class="wrap block">
    <div class="card tip-card">
      ${umka({ pose: 'point', mood: 'smile', size: 120 })}
      <div><b>Совет дня от Умки</b><p>${esc(tip)}</p></div>
    </div>
  </section>`;

  return {
    html,
    title: room ? room.title : 'Уроки',
    mount(root) {
      $$('.lesson-card.locked', root).forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        const b = store.blocker(a.dataset.id);
        toast(b ? `Сначала пройди урок «${b.title}»` : 'Этот урок пока закрыт');
      }));
    },
  };
}
