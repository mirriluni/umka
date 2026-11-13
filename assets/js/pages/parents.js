import { LESSONS, getRoom } from '../data/lessons.js';
import { store, today } from '../store.js';
import { CONFIG } from '../config.js';
import { umka } from '../umka.js';
import { esc, starsHtml, fmtMinutes, $, refresh, toast } from '../ui.js';

const GATE_KEY = 'umka.parentOk';
const DAY = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

function gateHtml(a, b) {
  return `
  <section class="wrap gate">
    <div class="card gate-card">
      ${umka({ pose: 'idle', mood: 'wow', size: 130 })}
      <h1>Раздел для взрослых</h1>
      <p>Чтобы войти, реши пример. Это защита от случайного входа ребёнка.</p>
      <form id="gateForm" class="field-row center">
        <label for="gateAns" class="gate-q">${a} × ${b} =</label>
        <input id="gateAns" inputmode="numeric" autocomplete="off" maxlength="3" required>
        <button class="btn small" type="submit">Войти</button>
      </form>
      <a class="link small" href="#/">← На главную</a>
    </div>
  </section>`;
}

function chart() {
  const days = store.days();
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    arr.push({ label: DAY[d.getDay()], min: Math.round((days[key] || 0) / 60), today: key === today() });
  }
  const max = Math.max(10, ...arr.map((x) => x.min));
  return `<div class="chart" role="img" aria-label="Минуты на уроках за последние 7 дней">
    ${arr.map((x) => `<div class="col ${x.today ? 'today' : ''}"><span class="v">${x.min || ''}</span><i style="height:${Math.max(3, (x.min / max) * 100)}%"></i><small>${x.label}</small></div>`).join('')}
  </div>`;
}

const FAQ = [
  ['С какого возраста подходят уроки?', 'Уроки рассчитаны на детей 6–10 лет. У каждого урока указан возраст и сложность. Уроки с плитой, кипятком и инструментами проходят только вместе со взрослым.'],
  ['Нужна ли регистрация?', 'Нет. Прогресс хранится в браузере на этом устройстве. Если очистить данные браузера или открыть сайт на другом устройстве, прогресс начнётся заново.'],
  ['Почему некоторые уроки закрыты?', 'В каждой комнате уроки идут от простого к сложному. Следующий урок открывается, когда пройден предыдущий хотя бы на одну звезду.'],
  ['Как считаются звёзды?', 'Все ответы верные с первого раза — 3 звезды, от 70% — 2 звезды, от 40% — 1 звезда. Тест можно проходить сколько угодно раз, сохраняется лучший результат.'],
  ['Кто составляет уроки?', 'Уроки готовят методисты проекта, учителя начальных классов. Мы опираемся на правила бытовой безопасности для детей.'],
];

export function parentsPage() {
  let ok = !CONFIG.parentGate;
  try { ok = ok || sessionStorage.getItem(GATE_KEY) === '1'; } catch {}

  if (!ok) {
    const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
    return {
      html: gateHtml(a, b),
      title: 'Родителям',
      mount(root) {
        $('#gateAns', root).focus();
        $('#gateForm', root).addEventListener('submit', (e) => {
          e.preventDefault();
          if (Number($('#gateAns', root).value) === a * b) {
            try { sessionStorage.setItem(GATE_KEY, '1'); } catch {}
            refresh();
          } else { toast('Неверно, попробуйте ещё раз'); $('#gateAns', root).value = ''; }
        });
      },
    };
  }

  const t = store.totals();
  const name = store.childName;
  const recent = store.recent();
  const mistakes = store.mistakes();
  const passedLessons = LESSONS.filter((l) => store.passed(l.id));

  const html = `
  <section class="wrap page-head">
    <span class="eyebrow">Для родителей</span>
    <h1>${name ? `Успехи: ${esc(name)}` : 'Успехи ребёнка'}</h1>
    <p class="lead">Здесь видно, какие уроки пройдены, сколько времени ребёнок занимался и что стоит повторить вместе дома.</p>
  </section>

  <section class="wrap stats3">
    <div class="card stat"><small>Уроков пройдено</small><b>${t.passed}<span> из ${LESSONS.length}</span></b></div>
    <div class="card stat"><small>Звёзд собрано</small><b>${t.stars} <span class="star on">★</span></b></div>
    <div class="card stat"><small>Время на уроках</small><b>${fmtMinutes(t.seconds)}</b></div>
  </section>

  <section class="wrap parents-grid">
    <div class="card pad">
      <h2>Последние уроки</h2>
      ${recent.length ? `<ul class="recent">${recent.slice(0, 8).map(({ lesson, data }) => `
        <li><span class="ico">${lesson.icon}</span><span class="grow"><b>${esc(lesson.title)}</b><small>${getRoom(lesson.room).title} · попыток: ${data.attempts}</small></span>${starsHtml(data.stars, 3, 16)}<span class="tag ${data.last.correct === data.last.total ? 'okt' : data.stars ? 'new' : 'warn'}">${data.last.correct} из ${data.last.total}</span></li>`).join('')}</ul>`
        : '<p class="muted">Пока ни одного теста. Предложите ребёнку начать с урока «Бутерброд» или «Порядок в комнате»: они самые простые.</p>'}
      <h3 class="mt">Минут на уроках по дням</h3>
      ${chart()}
    </div>

    <div class="card pad warm">
      <h2>Что повторить вместе</h2>
      ${mistakes.length ? `<ul class="repeat">${mistakes.slice(0, 5).map((m) => `<li><b>${m.lesson.icon} ${esc(m.lesson.title)}:</b> ${esc(m.q.q)}<span>${esc(m.q.explain)}</span></li>`).join('')}</ul>`
        : '<p>Ошибок в последних тестах нет. Отлично!</p>'}
      ${passedLessons.length ? `<h3 class="mt">Задание на дом</h3><p>${esc(passedLessons[passedLessons.length - 1].parentTip)}</p>` : ''}
      <h3 class="mt">Правило недели</h3>
      <p>Ручка сковородки всегда смотрит внутрь плиты, а вилку из розетки вынимаем за корпус. Проверьте вместе, как это устроено у вас дома.</p>
    </div>
  </section>

  <section class="wrap block">
    <h2>Все уроки</h2>
    <div class="table-wrap card">
      <table class="tbl">
        <thead><tr><th>Урок</th><th>Комната</th><th>Со взрослым</th><th>Звёзды</th><th>Попыток</th></tr></thead>
        <tbody>${LESSONS.map((l) => { const d = store.lesson(l.id); return `<tr><td>${l.icon} ${esc(l.title)}</td><td>${getRoom(l.room).title}</td><td>${l.adult ? 'да' : 'нет'}</td><td>${starsHtml(d?.stars || 0, 3, 15)}</td><td>${d?.attempts || 0}</td></tr>`; }).join('')}</tbody>
      </table>
    </div>
  </section>

  <section class="wrap block parents-grid">
    <div class="card pad">
      <h2>Как мы говорим о безопасности</h2>
      <ul class="checks">
        <li>Не пугаем, а объясняем: у каждого правила есть причина.</li>
        <li>Чётко отделяем «можно самому» от «только со взрослым».</li>
        <li>Плита, духовка, кипяток, острые ножи и ремонт техники — всегда со взрослым.</li>
        <li>Учим не бояться звать на помощь: сказать о проблеме — это правильно.</li>
      </ul>
    </div>
    <div class="card pad">
      <h2>Частые вопросы</h2>
      <div class="faq">${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="wrap block">
    <div class="card pad settings">
      <h2>Настройки</h2>
      <form id="nameSet" class="field-row">
        <label for="nameInp">Имя ребёнка</label>
        <input id="nameInp" maxlength="24" value="${esc(name)}" placeholder="Имя">
        <button class="btn small" type="submit">Сохранить</button>
      </form>
      <div class="danger-zone">
        <div><b>Сбросить прогресс</b><small>Удалит звёзды, значки и историю на этом устройстве.</small></div>
        <button class="btn ghost small" id="resetBtn">Сбросить</button>
        <div class="confirm" id="resetConfirm" hidden>Точно удалить весь прогресс? Это нельзя отменить.
          <button class="btn small red" id="resetYes">Да, удалить</button><button class="btn ghost small" id="resetNo">Отмена</button></div>
      </div>
      <p class="muted small">Вопросы и предложения: <span class="sel">${esc(CONFIG.contactEmail)}</span></p>
    </div>
  </section>`;

  return {
    html,
    title: 'Родителям',
    mount(root) {
      $('#nameSet', root).addEventListener('submit', (e) => {
        e.preventDefault();
        store.setChildName($('#nameInp', root).value);
        toast('Имя сохранено'); refresh();
      });
      const conf = $('#resetConfirm', root);
      $('#resetBtn', root).addEventListener('click', () => { conf.hidden = false; });
      $('#resetNo', root).addEventListener('click', () => { conf.hidden = true; });
      $('#resetYes', root).addEventListener('click', () => { store.reset(); toast('Прогресс сброшен'); refresh(); });
    },
  };
}
