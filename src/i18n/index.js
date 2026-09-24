import Vue from 'vue';
import VueI18n from 'vue-i18n';
import ru from './ru';
import en from './en';

Vue.use(VueI18n);

export function createI18n(locale = 'ru') {
  return new VueI18n({ locale, fallbackLocale: 'ru', messages: { ru, en } });
}
