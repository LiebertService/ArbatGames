import axios from 'axios';
import { DROVA_API } from '@/config';

const http = axios.create({ baseURL: DROVA_API, timeout: 20000 });

// Все опубликованные онлайн-станции drova.io (no-auth). Тело {} обязательно.
export function fetchPublicServers() {
  return http.post('/server-manager/servers/public/web', {}).then((r) => r.data);
}

// CPU / GPU / RAM станции (no-auth).
export function fetchHardware(serverId) {
  return http.get(`/server-manager/hardware/list/${serverId}`).then((r) => r.data);
}

// Одна игра каталога (no-auth, ~2 КБ).
export function fetchProduct(productId) {
  return http.get(`/server-manager/product/get2/${productId}`).then((r) => r.data);
}

// Полный каталог игр (no-auth, ~1.7 МБ) — грузим только по требованию.
export function fetchCatalog() {
  return http.get('/product-manager/product/listfull2').then((r) => r.data);
}

// Самые популярные игры drova.io за неделю: упорядоченный массив productId (no-auth).
export function fetchPopularGames() {
  return http.get('/accounting/statistics/most_popular_games').then((r) => r.data);
}
