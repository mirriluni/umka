import { ROOMS, lessonsOf, TIPS } from '../data/lessons.js';
import { store } from '../store.js';
import { umka } from '../umka.js';
import { esc, $, refresh, toast } from '../ui.js';

export function homePage() {
  const name = store.childName;
  const next = store.nextLesson();
  const t = store.totals();
  const tip = TIPS[new Date().getDate() % TIPS.length];

  const hello = name ? `Привет, ${esc(name)}!` : 'Заходи в гости<br>к <span class="accent">Умке!</span>';
  const startHref = next ? `#/lesson/${next.id}` : '#/lessons';

  const html = `
  <section class="hero">
    <div class="hero-bg" aria-hidden="true" style="background-image:url(assets/img/gostinaya.webp)"></div>
    <div class="wrap hero-in">
      <div class="hero-text">
        <span class="chip">❄ Уроки для жизни · 6–10 лет</span>
        <h1>${hello}</h1>
        <p class="lead">${name ? 'Чему научимся сегодня? Готовим, убираемся и дружим с техникой.' : 'Научимся готовить, убираться и дружить с техникой. По шагам и безопасно.'}</p>
        <div class="btn-row">
          <a class="btn" href="${startHref}">${t.passed ? 'Продолжить' : 'Начать урок'} →</a>
          <a class="btn ghost" href="#/parents">Я родитель</a>
        </div>
        ${next && t.passed ? `<a class="continue card" href="#/lesson/${next.id}"><span class="ico">${next.icon}</span><span><small>Следующий урок</small><b>${esc(next.title)}</b></span><span class="go">→</span></a>` : ''}
      </div>
      <div class="hero-umka">
        <div class="bubble">${name ? `Рад тебя видеть, ${esc(name)}!` : 'Привет! Я Умка.'}<small>${esc(tip)}</small></div>
        ${umka({ pose: 'wave', mood: 'smile', size: 260, cls: 'bob' })}
      </div>
    </div>
    <div class="wrap room-chips">
      ${ROOMS.map((r) => {
        const p = store.roomProgress(r.id);
        return `<a class="room-chip card" href="#/lessons/${r.id}"><span class="thumb" style="background-image:url(${r.img})"></span><span><b>${r.title}</b><small>${p.done} из ${p.total} уроков</small></span></a>`;
      }).join('')}
    </div>
  </section>

  ${!name ? `
  <section class="wrap">
    <form class="card name-card" id="nameForm">
      ${umka({ pose: 'idle', mood: 'wow', size: 90 })}
      <div class="grow">
        <label for="childName"><b>Как тебя зовут?</b> Умка будет обращаться к тебе по имени.</label>
        <div class="field-row">
          <input id="childName" name="childName" maxlength="24" placeholder="Например, Маша" autocomplete="off">
          <button class="btn small" type="submit">Познакомиться</button>
        </div>
      </div>
    </form>
  </section>` : ''}

  <section class="wrap block">
    <h2>Как проходит урок</h2>
    <div class="steps4">
      ${[
        ['📖', 'Узнаём', 'Умка рассказывает, что будем делать и что понадобится.'],
        ['🛡️', 'Правила', 'Что можно, что нельзя и когда позвать взрослого.'],
        ['👣', 'Делаем', 'Повторяем шаги по картинкам, по одному за раз.'],
        ['⭐', 'Проверяем', 'Игра-тест, звёзды и значки за успехи.'],
      ].map(([i, h, p], k) => `<div class="card step4"><span class="num">${k + 1}</span><span class="ico">${i}</span><h3>${h}</h3><p>${p}</p></div>`).join('')}
    </div>
  </section>

  <section class="wrap block">
    <div class="head-row"><h2>Комнаты Умки</h2><a class="link" href="#/lessons">Все уроки →</a></div>
    <div class="rooms3">
      ${ROOMS.map((r) => {
        const p = store.roomProgress(r.id);
        const list = lessonsOf(r.id);
        return `<a class="card room-card" href="#/lessons/${r.id}">
          <span class="room-img" style="background-image:url(${r.img})"><span class="tag light">${r.icon} ${r.title}</span><span class="tag dark">${p.done} из ${p.total}</span></span>
          <span class="bar"><i style="width:${(p.done / p.total) * 100}%"></i></span>
          <span class="room-body"><span class="muted">${esc(r.about)}</span><span class="mini-list">${list.map((l) => `<span>${l.icon} ${esc(l.title)}</span>`).join('')}</span></span>
        </a>`;
      }).join('')}
    </div>
  </section>

  <section class="wrap block">
    <div class="card safety">
      <div class="grow">
        <h2>Безопасность прежде всего</h2>
        <p>В каждом уроке есть правила «можно» и «нельзя». Там, где опасно, Умка ставит знак <span class="adult-mark">🙋 позови взрослого</span>. Острые ножи, духовка, кипяток и ремонт техники — всегда только вместе со взрослым.</p>
        <div class="rule-pair"><div class="can">✓ <b>Можно</b> брать сковородку прихваткой</div><div class="cant">✕ <b>Нельзя</b> трогать розетку мокрыми руками</div></div>
      </div>
      ${umka({ pose: 'point', mood: 'smile', size: 200 })}
    </div>
  </section>

  <section class="wrap block">
    <div class="card parents-teaser">
      <div>
        <h2>Родителям</h2>
        <p>Видно, какие уроки пройдены, где ребёнок ошибся и что стоит повторить вместе дома. Без регистрации: прогресс хранится на этом устройстве.</p>
      </div>
      <a class="btn ghost" href="#/parents">Открыть раздел →</a>
    </div>
  </section>`;

  return {
    html,
    cls: 'page-home',
    mount(root) {
      const f = $('#nameForm', root);
      if (f) f.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = $('#childName', f).value.trim();
        if (!v) { toast('Напиши своё имя'); return; }
        store.setChildName(v);
        toast(`Приятно познакомиться, ${v}!`);
        refresh();
      });
    },
  };
}
