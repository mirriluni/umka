// Прогресс ребёнка хранится в браузере (localStorage).
// Когда появится сервер, достаточно заменить load/save на запросы к API.
import { LESSONS, ROOMS, lessonsOf } from './data/lessons.js';

const KEY = 'umka.progress.v1';

const fresh = () => ({ childName: '', lessons: {}, days: {}, createdAt: Date.now() });

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh();
    const data = JSON.parse(raw);
    return { ...fresh(), ...data, lessons: data.lessons || {}, days: data.days || {} };
  } catch {
    return fresh();
  }
}

let state = load();

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* приватный режим: работаем без сохранения */ }
}

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export function starsFor(correct, total) {
  const r = total ? correct / total : 0;
  if (r >= 0.99) return 3;
  if (r >= 0.7) return 2;
  if (r >= 0.4) return 1;
  return 0;
}

export const store = {
  get childName() { return state.childName; },
  setChildName(name) { state.childName = name.trim().slice(0, 24); save(); },

  lesson(id) { return state.lessons[id] || null; },
  stars(id) { return state.lessons[id]?.stars || 0; },
  passed(id) { return this.stars(id) > 0; },

  isUnlocked(id) {
    const l = LESSONS.find((x) => x.id === id);
    if (!l) return false;
    const list = lessonsOf(l.room);
    const i = list.findIndex((x) => x.id === id);
    return i <= 0 || this.passed(list[i - 1].id);
  },
  blocker(id) {
    const l = LESSONS.find((x) => x.id === id);
    const list = lessonsOf(l.room);
    const i = list.findIndex((x) => x.id === id);
    return i > 0 ? list[i - 1] : null;
  },

  saveResult(id, { correct, total, mistakes }) {
    const prev = state.lessons[id] || { stars: 0, best: 0, attempts: 0 };
    const stars = starsFor(correct, total);
    const badgesBefore = this.badges().filter((b) => b.earned).map((b) => b.id);
    state.lessons[id] = {
      ...prev,
      stars: Math.max(prev.stars, stars),
      best: Math.max(prev.best || 0, correct),
      total,
      attempts: (prev.attempts || 0) + 1,
      last: { correct, total, stars, mistakes, at: Date.now() },
      firstPassedAt: prev.firstPassedAt || (stars > 0 ? Date.now() : null),
    };
    save();
    const newBadges = this.badges().filter((b) => b.earned && !badgesBefore.includes(b.id));
    return { stars, newBadges };
  },

  addTime(seconds) {
    if (!seconds || seconds < 1) return;
    const d = today();
    state.days[d] = (state.days[d] || 0) + Math.round(seconds);
    save();
  },
  days() { return state.days; },

  totals() {
    const ls = Object.values(state.lessons);
    return {
      passed: LESSONS.filter((l) => this.passed(l.id)).length,
      stars: LESSONS.reduce((s, l) => s + this.stars(l.id), 0),
      maxStars: LESSONS.length * 3,
      attempts: ls.reduce((s, x) => s + (x.attempts || 0), 0),
      seconds: Object.values(state.days).reduce((s, x) => s + x, 0),
    };
  },

  roomProgress(roomId) {
    const list = lessonsOf(roomId);
    return { done: list.filter((l) => this.passed(l.id)).length, total: list.length };
  },

  nextLesson() {
    return LESSONS.find((l) => !this.passed(l.id) && this.isUnlocked(l.id)) || null;
  },

  badges() {
    const t = { passed: LESSONS.filter((l) => this.passed(l.id)).length, stars: LESSONS.reduce((s, l) => s + this.stars(l.id), 0) };
    const list = [
      { id: 'first', title: 'Первые шаги', icon: '🐾', desc: 'Пройди первый урок', earned: t.passed >= 1 },
      ...ROOMS.map((r) => {
        const p = this.roomProgress(r.id);
        return { id: `room-${r.id}`, title: r.badge.title, icon: r.badge.icon, desc: `Пройди все уроки в комнате «${r.title}»`, earned: p.done === p.total };
      }),
      { id: 'stars15', title: 'Звездочёт', icon: '⭐', desc: 'Собери 15 звёзд', earned: t.stars >= 15 },
      { id: 'all', title: 'Друг Умки', icon: '🐻‍❄️', desc: 'Пройди все уроки', earned: t.passed === LESSONS.length },
    ];
    return list;
  },

  mistakes() {
    const out = [];
    for (const l of LESSONS) {
      const last = state.lessons[l.id]?.last;
      if (!last || !last.mistakes?.length) continue;
      for (const qi of last.mistakes) {
        const q = l.test[qi];
        if (q) out.push({ lesson: l, q, at: last.at });
      }
    }
    return out.sort((a, b) => b.at - a.at);
  },

  recent() {
    return LESSONS.filter((l) => state.lessons[l.id]?.last)
      .map((l) => ({ lesson: l, data: state.lessons[l.id] }))
      .sort((a, b) => b.data.last.at - a.data.last.at);
  },

  reset() { state = fresh(); save(); },
};
