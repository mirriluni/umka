import { CONFIG } from '../config.js';
import { umka } from '../umka.js';
import { esc, $, toast } from '../ui.js';

// Команда проекта. Добавьте сюда участников, если состав изменится.
const TEAM = [
  { name: 'Полина Гололобова', role: 'Руководитель проекта, художник', text: 'Придумала и рисует Умку, фоны комнат и всю визуальную часть проекта.', color: '#62d6a8', init: 'ПГ' },
  { name: 'Алина Нигматуллина', role: 'Методист', text: 'Учитель начальных классов. Составляет уроки и задания, следит, чтобы всё было понятно детям.', color: '#ffb35c', init: 'АН' },
  { name: 'Маргарита Бровина', role: 'Методист', text: 'Учитель начальных классов. Отвечает за то, как проходит урок, придумывает задания и ответы к тестам.', color: '#ff8aa6', init: 'МБ' },
  { name: 'Богдан Глущенко', role: 'Программист', text: 'Делает сайт: уроки, тесты, прогресс и раздел для родителей.', color: '#9aa8ff', init: 'БГ' },
];

export function aboutPage() {
  const html = `
  <section class="wrap page-head with-umka">
    <div>
      <span class="eyebrow">О проекте</span>
      <h1>«В гостях у Умки»</h1>
      <p class="lead">Онлайн-уроки для жизни: учим детей 6–10 лет помогать дома, готовить простую еду и обращаться с техникой. Пошагово, в игре и с правилами безопасности.</p>
    </div>
    ${umka({ pose: 'wave', mood: 'smile', size: 170 })}
  </section>

  <section class="wrap block about-grid">
    <div class="card pad">
      <h2>Зачем это нужно</h2>
      <p>Пожарить яичницу, пропылесосить комнату, понять, что делать со сломанным миксером. Такому не учат в школе, а у родителей не всегда есть время спокойно объяснить.</p>
      <p>Мы рассказываем ребёнку, как сделать дело по шагам, и сразу объясняем, что можно, что нельзя и когда позвать взрослого. Ребёнок становится самостоятельнее, а родителям — немного легче.</p>
    </div>
    <div class="card pad">
      <h2>Как это работает</h2>
      <ol class="flow">
        <li><b>Урок.</b> Умка рассказывает, что понадобится, и объясняет правила.</li>
        <li><b>Шаги.</b> Ребёнок повторяет действие по картинкам.</li>
        <li><b>Тест-игра.</b> Выбрать ответ, расставить шаги, найти опасность на картинке.</li>
        <li><b>Награды и отчёт.</b> Звёзды и значки ребёнку, понятный прогресс родителю.</li>
      </ol>
    </div>
  </section>

  <section class="wrap block">
    <div class="card pad history">
      <h2>История проекта</h2>
      <p>В прошлом году эта же команда сделала проект «Учимся с Умкой» — помощника для младших школьников по школьным предметам. В этом году Умка переехал из школы домой: теперь он учит не математике, а жизни.</p>
    </div>
  </section>

  <section class="wrap block">
    <h2>Команда</h2>
    <div class="team">
      ${TEAM.map((m) => `<div class="card member"><span class="avatar" style="background:${m.color}">${m.init}</span><b>${esc(m.name)}</b><small>${esc(m.role)}</small><p>${esc(m.text)}</p></div>`).join('')}
    </div>
  </section>

  <section class="wrap block">
    <div class="card pad contact">
      <div>
        <h2>Напишите нам</h2>
        <p>Есть идея для нового урока или вопрос? Напишите, мы ответим. Почта команды: <span class="sel">${esc(CONFIG.contactEmail)}</span></p>
      </div>
      <form id="contactForm" class="contact-form">
        <label for="cName">Как к вам обращаться</label>
        <input id="cName" required maxlength="60" autocomplete="name">
        <label for="cMsg">Сообщение</label>
        <textarea id="cMsg" required rows="4" maxlength="1500" placeholder="Например: сделайте урок про стиральную машину"></textarea>
        <button class="btn" type="submit">Открыть письмо</button>
        <small class="muted">Откроется ваша почтовая программа с готовым письмом.</small>
      </form>
    </div>
  </section>`;

  return {
    html,
    title: 'О проекте',
    mount(root) {
      $('#contactForm', root).addEventListener('submit', (e) => {
        e.preventDefault();
        const name = $('#cName', root).value.trim();
        const msg = $('#cMsg', root).value.trim();
        const subject = encodeURIComponent('Сайт «В гостях у Умки»');
        const body = encodeURIComponent(`${msg}\n\n${name}`);
        location.href = `mailto:${CONFIG.contactEmail}?subject=${subject}&body=${body}`;
        toast('Если почта не открылась, напишите на адрес выше');
      });
    },
  };
}
