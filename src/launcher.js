import { DROVA_SITE } from '@/config';

// Запуск игры на станции. Для запуска drova.io создаёт сессию от имени вошедшего игрока (X-Auth-Token),
// поэтому по-настоящему запускать может только сам drova.io. Внутри drova.io приложение регистрирует
// реализацию через setLauncher — вызов их Player.tryToStart (см. README, «Встраивание в drova.io»).
let impl = null;

export function setLauncher(fn) {
  impl = fn;
}

export function hasNativeLauncher() {
  return typeof impl === 'function';
}

// inBrowser: false — через приложение Drova, true — в веб-клиенте drova.io/inbrowser.
// Возвращает true, если игра запущена; false — открыта страница станции на drova.io.
export function launchGame({ stationId, productId, inBrowser = false }) {
  if (hasNativeLauncher()) {
    impl({ stationId, productId, inBrowser });
    return true;
  }
  window.open(`${DROVA_SITE}/stations/${stationId}`, '_blank', 'noopener');
  return false;
}
