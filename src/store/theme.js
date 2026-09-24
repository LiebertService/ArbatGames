// Тема как у drova.io: класс `theme_<name>` на корневом layout, выбор хранится в cookie `drova_theme`.
// Внутри drova.io этот модуль не нужен — там тему держит auth.usermeta.theme.
export const THEMES = ['foxexeDark', 'dvLight'];
export const DEFAULT_THEME = 'foxexeDark'; // тема drova.io по умолчанию
const COOKIE = 'drova_theme';

export function readThemeCookie(cookieString) {
  const m = String(cookieString || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  const value = m && decodeURIComponent(m[1]);
  return THEMES.includes(value) ? value : null;
}

export default {
  namespaced: true,
  state: () => ({ current: DEFAULT_THEME }),
  mutations: {
    setTheme(state, theme) {
      if (!THEMES.includes(theme)) return;
      state.current = theme;
      if (typeof document !== 'undefined') {
        document.cookie = `${COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=31536000; SameSite=Lax`;
      }
    },
  },
};
