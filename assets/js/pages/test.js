import { getLesson, getRoom } from '../data/lessons.js';
import { store } from '../store.js';
import { umka } from '../umka.js';
import { esc, $, $$, shuffle } from '../ui.js';

const PRAISE = ['Верно!', 'Точно!', 'Молодец!', 'Так держать!', 'Супер!'];
const OOPS = ['Не совсем.', 'Ой, не так.', 'Почти!'];

export function testPage(id) {
  const l = getLesson(id);
  if (!l) return { redirect: '#/lessons' };
  if (!store.isUnlocked(id)) return { redirect: '#/lessons/' + l.room };

  const html = `
  <div class="lesson-bg blur" style="background-image:url(${getRoom(l.room).img})" aria-hidden="true"></div>
  <section class="wrap lesson-wrap">
    <nav class="crumbs" aria-label="Навигация"><a href="#/lessons">Уроки</a> › <a href="#/lesson/${id}">${esc(l.title)}</a> › <b>Тест</b></nav>
    <div class="lesson-layout">
      <div class="card test-card" id="qBox" aria-live="polite"></div>
      <aside class="lesson-umka">
        <div class="bubble" id="uBubble">Проверим, что ты запомнил? Не бойся ошибиться, я подскажу!</div>
        <div id="uPic">${umka({ pose: 'wave', mood: 'smile', size: 220 })}</div>
      </aside>
    </div>
  </section>`;

  return {
    html,
    title: `Тест: ${l.title}`,
    timed: true,
    cls: 'page-lesson',
    mount(root) {
      const box = $('#qBox', root);
      const bubble = $('#uBubble', root);
      const pic = $('#uPic', root);
      const total = l.test.length;
      let qi = 0, correct = 0;
      const mistakes = [];

      const say = (text, pose, mood, anim) => {
        bubble.innerHTML = text;
        pic.innerHTML = umka({ pose, mood, size: 220, cls: anim || '' });
      };

      const head = () => {
        let bars = '';
        for (let i = 0; i < total; i++) bars += `<i class="${i < qi ? (mistakes.includes(i) ? 'bad' : 'ok') : i === qi ? 'cur' : ''}"></i>`;
        return `<div class="q-top"><span>Проверим себя · ${esc(l.title)}</span><span>Вопрос ${qi + 1} из ${total}</span></div><div class="q-bars">${bars}</div>`;
      };

      const finish = (ok, q) => {
        if (ok) correct++; else mistakes.push(qi);
        const fb = $('.feedback', box);
        fb.className = `feedback ${ok ? 'ok' : 'bad'}`;
        fb.innerHTML = `<div><b>${ok ? PRAISE[qi % PRAISE.length] : OOPS[qi % OOPS.length]}</b> ${esc(q.explain || '')}</div>
          <button class="btn ${ok ? 'green' : ''}" id="nextQ">${qi + 1 < total ? 'Следующий вопрос →' : 'Узнать результат →'}</button>`;
        fb.hidden = false;
        say(ok ? `${PRAISE[qi % PRAISE.length]} +1 <span class="star on">★</span>` : 'Ничего страшного! Прочитай подсказку, и в следующий раз получится.', ok ? 'cheer' : 'idle', ok ? 'happy' : 'sad', ok ? 'jump' : 'shake');
        const nb = $('#nextQ', box);
        nb.focus();
        nb.addEventListener('click', () => {
          qi++;
          if (qi < total) render();
          else {
            const res = store.saveResult(id, { correct, total, mistakes });
            try { sessionStorage.setItem('umka.lastResult', JSON.stringify({ id, correct, total, mistakes, newBadges: res.newBadges.map((b) => b.id) })); } catch {}
            location.hash = `#/lesson/${id}/result`;
          }
        });
      };

      function renderChoice(q) {
        const opts = q.type === 'truefalse'
          ? [{ t: 'Правда 👍', v: true }, { t: 'Неправда 👎', v: false }]
          : shuffle(q.options.map((t, i) => ({ t, v: i })));
        const right = q.type === 'truefalse' ? q.answer : q.answer;
        box.innerHTML = `${head()}<h1 class="q">${esc(q.q)}</h1>
          <div class="answers ${q.type === 'truefalse' ? 'two' : ''}">${opts.map((o, i) => `<button class="answer" data-v="${o.v}"><span class="letter">${q.type === 'truefalse' ? '' : 'АБВГД'[i]}</span>${esc(o.t)}</button>`).join('')}</div>
          <div class="feedback" hidden></div>`;
        $$('.answer', box).forEach((b) => b.addEventListener('click', () => {
          const v = q.type === 'truefalse' ? b.dataset.v === 'true' : Number(b.dataset.v);
          const ok = v === right;
          $$('.answer', box).forEach((x) => {
            x.disabled = true;
            const xv = q.type === 'truefalse' ? x.dataset.v === 'true' : Number(x.dataset.v);
            if (xv === right) x.classList.add('right');
          });
          if (!ok) b.classList.add('wrong');
          finish(ok, q);
        }));
      }

      function renderOrder(q) {
        let pool = shuffle(q.items.map((t, i) => ({ t, i })));
        if (pool.every((p, k) => p.i === k)) pool = [...pool].reverse();
        const picked = [];
        box.innerHTML = `${head()}<h1 class="q">${esc(q.q)}</h1>
          <p class="muted">Нажимай на шаги по очереди: что делаем сначала, что потом. Нажми на шаг ещё раз, чтобы убрать его.</p>
          <ol class="order-slots" id="slots"></ol>
          <div class="order-pool" id="pool"></div>
          <div class="btn-row split"><button class="btn ghost" id="resetO">Сбросить</button><button class="btn" id="checkO" disabled>Проверить</button></div>
          <div class="feedback" hidden></div>`;
        const slots = $('#slots', box), poolEl = $('#pool', box), check = $('#checkO', box);
        const draw = () => {
          slots.innerHTML = q.items.map((_, k) => picked[k]
            ? `<li><button class="chip-btn placed" data-k="${k}">${esc(picked[k].t)}</button></li>`
            : `<li class="empty"><span>${k + 1}</span></li>`).join('');
          poolEl.innerHTML = pool.map((p, k) => `<button class="chip-btn" data-p="${k}">${esc(p.t)}</button>`).join('');
          check.disabled = picked.length !== q.items.length;
          $$('[data-p]', poolEl).forEach((b) => b.addEventListener('click', () => { picked.push(pool.splice(Number(b.dataset.p), 1)[0]); draw(); }));
          $$('[data-k]', slots).forEach((b) => b.addEventListener('click', () => { pool.push(picked.splice(Number(b.dataset.k), 1)[0]); draw(); }));
        };
        draw();
        $('#resetO', box).addEventListener('click', () => { pool.push(...picked.splice(0)); draw(); });
        check.addEventListener('click', () => {
          const ok = picked.every((p, k) => p.i === k);
          slots.innerHTML = picked.map((p, k) => `<li><span class="chip-btn ${p.i === k ? 'right' : 'wrong'}">${esc(p.t)}</span></li>`).join('');
          if (!ok) slots.insertAdjacentHTML('afterend', `<div class="right-order"><b>Правильно так:</b> ${q.items.map((t, k) => `${k + 1}. ${esc(t)}`).join(' → ')}</div>`);
          poolEl.remove(); $('#resetO', box).remove(); check.remove();
          finish(ok, q);
        });
      }

      function renderFind(q) {
        const room = getRoom(q.room);
        const need = q.spots.filter((s) => s.ok).length;
        let found = 0, miss = false;
        box.innerHTML = `${head()}<h1 class="q">${esc(q.q)}</h1>
          <p class="muted">Нажимай на кружочки на картинке. ${need > 1 ? `Нужно найти: ${need}.` : ''} <span id="foundC"></span></p>
          <div class="find-pic">
            <span class="pic-img" style="background-image:url(${room.img})"></span>
            ${q.spots.map((s, k) => `<button class="spot" data-k="${k}" style="left:${s.x}%;top:${s.y}%" aria-label="Пятно ${k + 1}"><span>?</span></button>`).join('')}
          </div>
          <div class="feedback" hidden></div>`;
        const counter = $('#foundC', box);
        $$('.spot', box).forEach((b) => b.addEventListener('click', () => {
          const s = q.spots[Number(b.dataset.k)];
          b.disabled = true;
          b.innerHTML = `<span>${s.ok ? '✓' : '✕'}</span><em>${esc(s.label)}</em>`;
          b.classList.add(s.ok ? 'right' : 'wrong');
          if (s.ok) {
            found++;
            counter.textContent = need > 1 ? `Найдено ${found} из ${need}` : '';
            if (found === need) {
              $$('.spot:not(:disabled)', box).forEach((x) => (x.disabled = true));
              finish(!miss, q);
            } else say('Есть! Ищи дальше.', 'point', 'smile');
          } else {
            miss = true;
            say(`«${esc(s.label)}» тут ни при чём. Попробуй ещё!`, 'idle', 'wow', 'shake');
          }
        }));
      }

      function render() {
        const q = l.test[qi];
        say(qi === 0 ? 'Проверим, что ты запомнил? Не бойся ошибиться, я подскажу!' : 'Следующий вопрос. Читай внимательно!', 'wave', 'smile');
        if (q.type === 'order') renderOrder(q);
        else if (q.type === 'find') renderFind(q);
        else renderChoice(q);
        box.scrollIntoView({ block: 'nearest' });
      }

      render();
    },
  };
}
