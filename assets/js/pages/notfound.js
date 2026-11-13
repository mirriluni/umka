import { umka } from '../umka.js';

export function notFoundPage() {
  return {
    title: 'Страница не найдена',
    html: `<section class="wrap gate"><div class="card gate-card">
      ${umka({ pose: 'idle', mood: 'sad', size: 140 })}
      <h1>Ой, такой комнаты нет</h1>
      <p>Кажется, Умка потерял эту страницу. Вернёмся домой?</p>
      <div class="btn-row center"><a class="btn" href="#/">На главную</a><a class="btn ghost" href="#/lessons">К урокам</a></div>
    </div></section>`,
  };
}
