import Vue from 'vue';
import * as api from '@/api/drova';
import {
  merchantStations, merchantGames, summarizeHardware, STATE_FREE, STATE_BUSY,
} from '@/utils/station';

// Vuex-модуль (namespaced) — подключается в стор drova.io как `merchantStations`.
export default {
  namespaced: true,

  state: () => ({
    merchantId: null,
    stations: [],
    hardware: {}, // uuid -> { cpu, gpu, gpuRam, ram }
    products: {}, // productId -> { title, cardPicture }
    catalog: null, // полный каталог, грузится по требованию
    catalogLoading: false,
    popular: [], // productId по популярности на drova.io
    loading: false,
    error: null,
    updatedAt: null,
  }),

  getters: {
    counts: (state) => ({
      total: state.stations.length,
      free: state.stations.filter((s) => s.state === STATE_FREE).length,
      busy: state.stations.filter((s) => s.state === STATE_BUSY).length,
    }),
    gpus: (state) => [...new Set(Object.values(state.hardware).map((h) => h && h.gpu).filter(Boolean))].sort(),
    // Игры мерчанта (как drova.io/games): только с его станций, популярные первыми.
    games: (state) => merchantGames(state.stations, state.catalog, state.popular),
  },

  mutations: {
    setMerchant(state, merchantId) {
      if (state.merchantId !== merchantId) {
        state.merchantId = merchantId;
        state.stations = [];
        state.hardware = {};
        state.updatedAt = null;
      }
    },
    setLoading(state, v) { state.loading = v; },
    setError(state, e) { state.error = e; },
    setStations(state, stations) {
      state.stations = stations;
      state.updatedAt = Date.now();
    },
    setHardware(state, { uuid, hardware }) { Vue.set(state.hardware, uuid, hardware); },
    setProduct(state, { productId, product }) { Vue.set(state.products, productId, product); },
    setCatalog(state, catalog) { state.catalog = catalog; },
    setCatalogLoading(state, v) { state.catalogLoading = v; },
    setPopular(state, ids) { state.popular = Object.freeze(ids); },
  },

  actions: {
    // Основная загрузка страницы: станции + железо + названия текущих игр. Вызывается и на SSR.
    async load({ commit, dispatch }, merchantId) {
      commit('setMerchant', merchantId);
      await dispatch('refresh');
      await Promise.all([dispatch('loadHardware'), dispatch('loadCurrentProducts')]);
    },

    // Лёгкое обновление статусов (поллинг).
    async refresh({ state, commit }) {
      commit('setLoading', true);
      try {
        const servers = await api.fetchPublicServers();
        commit('setStations', merchantStations(servers, state.merchantId));
        commit('setError', null);
      } catch (e) {
        commit('setError', e.message || String(e));
      } finally {
        commit('setLoading', false);
      }
    },

    async loadHardware({ state, commit }) {
      const missing = state.stations.filter((s) => !(s.uuid in state.hardware));
      await Promise.all(missing.map(({ uuid }) => api.fetchHardware(uuid)
        .then((hw) => commit('setHardware', { uuid, hardware: summarizeHardware(hw) }))
        .catch(() => commit('setHardware', { uuid, hardware: null }))));
    },

    async loadCurrentProducts({ state, commit }) {
      const ids = [...new Set(state.stations.map((s) => s.productId).filter((id) => id && !(id in state.products)))];
      await Promise.all(ids.map((productId) => api.fetchProduct(productId)
        .then((p) => commit('setProduct', { productId, product: { title: p.displayName || p.title, cardPicture: p.cardPicture } }))
        .catch(() => commit('setProduct', { productId, product: null }))));
    },

    async loadPopular({ state, commit }) {
      if (state.popular.length) return;
      try {
        commit('setPopular', await api.fetchPopularGames());
      } catch (e) {
        // не критично: без популярности сортируем по алфавиту
      }
    },

    async loadCatalog({ state, commit }) {
      if (state.catalog || state.catalogLoading) return;
      commit('setCatalogLoading', true);
      try {
        const list = await api.fetchCatalog();
        const map = {};
        list.forEach((p) => {
          map[p.productId] = {
            title: p.displayName || p.title,
            cardPicture: p.cardPicture,
            ageGroup: p.ageGroup,
            requiredAccount: p.requiredAccount || null,
            licenseType: p.licenseType || null,
            useDefaultDesktop: !!p.useDefaultDesktop,
            // для страницы игры
            pagePicture: p.pagePicture || null,
            descriptionRu: p.descriptionRu || null,
            descriptionEn: p.descriptionEn || null,
            publisher: p.publisher || null,
            developer: p.developer || null,
            metacriticScore: p.metacriticScore || null,
            inShopUrl: p.inShopUrl || null,
          };
        });
        commit('setCatalog', Object.freeze(map));
      } finally {
        commit('setCatalogLoading', false);
      }
    },
  },
};
