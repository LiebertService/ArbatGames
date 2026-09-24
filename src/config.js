// Публичные эндпоинты drova.io, которые не требуют авторизации.
export const DROVA_API = 'https://services.drova.io';
export const DROVA_SITE = 'https://drova.io';
export const DROVA_FILES = 'https://files.drova.io';

// Мерчант по умолчанию (user_id владельца станций).
export const DEFAULT_MERCHANT_ID = '8416fbb1-fb11-472e-914d-b4b06e823d33';

// Витрина мерчанта: то, чего нет в публичном API.
export const MERCHANTS = {
  '8416fbb1-fb11-472e-914d-b4b06e823d33': {
    name: 'ARBAT GAMES',
    city: 'Москва',
    links: [{ title: 'Telegram', url: 'https://t.me/ArbatGames' }],
  },
};

// Как часто обновлять статусы станций (мс). Ответ public/web ~1 МБ, чаще не нужно.
export const REFRESH_INTERVAL = 60 * 1000;
