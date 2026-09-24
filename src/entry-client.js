import { createApp } from './app';
import { readThemeCookie } from './store/theme';

const { app, router, store } = createApp();

if (window.__INITIAL_STATE__) store.replaceState(window.__INITIAL_STATE__);

const savedTheme = readThemeCookie(document.cookie);
if (savedTheme) store.commit('theme/setTheme', savedTheme);

router.onReady(() => app.$mount('#app'));
