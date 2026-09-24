import Vue from 'vue';
import Router from 'vue-router';
import { DEFAULT_MERCHANT_ID } from '@/config';

Vue.use(Router);

// В drova.io достаточно добавить маршрут `merchants/:merchantId` в существующий роутер.
export const merchantRoutes = [
  {
    path: '/merchants/:merchantId',
    name: 'merchant-stations',
    component: () => import(/* webpackChunkName: "merchant-stations" */ '@/views/MerchantStations.vue'),
    props: true,
  },
];

export function createRouter() {
  return new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
      { path: '/', redirect: `/merchants/${DEFAULT_MERCHANT_ID}` },
      ...merchantRoutes,
      { path: '*', redirect: '/' },
    ],
    scrollBehavior: () => ({ x: 0, y: 0 }),
  });
}
