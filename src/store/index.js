import Vue from 'vue';
import Vuex from 'vuex';
import merchantStations from './merchantStations';

Vue.use(Vuex);

export function createStore() {
  return new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    modules: { merchantStations },
  });
}
