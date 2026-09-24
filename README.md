# Станции мерчанта на drova.io

Персональная страница со всеми станциями мерчанта для агрегатора облачного гейминга [drova.io](https://drova.io).
Написана на стеке drova.io, чтобы её можно было встроить в их SPA без новых зависимостей:

| | drova.io (из бандлов) | здесь |
|---|---|---|
| Vue | 2.7.16 | ~2.7.16 |
| Vuex | 3.6.2 | ^3.6.2 |
| Vue Router | 3.5.4 | ^3.6.5 |
| vue-meta (SSR) | 2.4.0 | ^2.4.0 |
| vue-i18n | 8.15.3 | ^8.28 |
| UI | View UI (iView) 4.x | view-design ^4.7 |
| HTTP | axios | axios |
| Сборка | webpack | webpack 5 + vue-loader 15 |

## Что на странице

- все опубликованные онлайн-станции мерчанта (по умолчанию ARBAT GAMES, `user_id` `8416fbb1-fb11-472e-914d-b4b06e823d33`);
- статус «Свободна / Занята», текущая или последняя игра с обложкой;
- железо: видеокарта, процессор, ОЗУ;
- фильтры по статусу, видеокарте и **игре** («на каких станциях есть Cyberpunk»);
- окно станции: описание мерчанта (HTML очищается, остаются только абзацы, жирный текст и http(s)-ссылки) и полная библиотека игр с поиском;
- кнопка «Играть» ведёт на `https://drova.io/stations/{uuid}`;
- автообновление статусов раз в минуту, только пока вкладка видна.

## Данные: только публичный API, без токенов

| Эндпоинт `https://services.drova.io` | Зачем |
|---|---|
| `POST /server-manager/servers/public/web` (тело `{}`) | все станции drova.io, фильтруем по `user_id` |
| `GET /server-manager/hardware/list/{server_id}` | CPU / GPU / RAM |
| `GET /server-manager/product/get2/{product_id}` | название текущей игры |
| `GET /product-manager/product/listfull2` | каталог игр (~1.7 МБ, только по требованию) |

CORS у `services.drova.io` открыт (`Access-Control-Allow-Origin: *`). Неопубликованные и офлайн-станции публичный список не отдаёт.

## Запуск

```bash
npm install
npm run dev     # http://localhost:8080 → /merchants/<merchant_id>
npm run build   # dist/
npm test        # юнит-тесты src/utils (node --test)
```

Другой мерчант: `/merchants/<user_id>`. Название и ссылки витрины задаются в `src/config.js` → `MERCHANTS`.

## Встраивание в drova.io

1. Скопировать `src/api/drova.js`, `src/utils/`, `src/store/merchantStations.js`, `src/components/`, `src/views/MerchantStations.vue`.
2. Зарегистрировать Vuex-модуль: `store.registerModule('merchantStations', merchantStations)` (или в `modules`).
3. Добавить маршрут из `merchantRoutes` (`src/router.js`) в роутер drova.io.
4. Слить `src/i18n/ru.js` и `en.js` в сообщения vue-i18n (ключ `merchantStations`).
5. SSR: страница грузит данные в `serverPrefetch`, клиент берёт их из `__INITIAL_STATE__` и повторно не запрашивает.
   View UI у drova.io подключён глобально, поэтому в `src/app.js` он нужен только для автономного запуска.

## Публикация на GitHub Pages

Workflow `.github/workflows/pages.yml` на каждый пуш в `main` запускает тесты, собирает страницу с
`BASE_URL=/<имя репозитория>/` и публикует её на Pages.

Один раз включить: **Settings → Pages → Build and deployment → Source: GitHub Actions**, затем
**Actions → Deploy to GitHub Pages → Run workflow** (или любой пуш в `main`).

Адрес: https://liebertservice.github.io/ArbatGames/
