import Vue from 'vue';
import VueMeta from 'vue-meta';
import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';
import App from './App.vue';
import { createRouter } from './router';
import { createStore } from './store';
import { createI18n } from './i18n';

Vue.use(VueMeta);
Vue.use(ViewUI);

// Фабрика в стиле SSR drova.io: новый экземпляр на каждый запрос.
export function createApp() {
  const router = createRouter();
  const store = createStore();
  const i18n = createI18n();
  const app = new Vue({ router, store, i18n, render: (h) => h(App) });
  return { app, router, store };
}
