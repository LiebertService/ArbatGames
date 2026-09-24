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
- статус «Свободна / Занята»; у занятой — скриншот текущей игры, у свободной (как на drova.io) — плашка с иконкой;
- железо: видеокарта, процессор, ОЗУ;
- фильтры по статусу, видеокарте и **игре** («на каких станциях есть Cyberpunk»);
- страница станции `/merchants/<id>/stations/<stationId>` («Игры и описание»): описание мерчанта (HTML очищается,
  остаются только абзацы, жирный текст и http(s)-ссылки), железо и **каталог игр как на drova.io** с фильтрами
  «Игра / Лицензия / Учётная запись»; Play в центре карточки — запуск через приложение Drova, иконка слева внизу — в веб-клиенте;
- кнопка «Играть» и клик по карточке свободной станции открывают `https://drova.io/stations/{uuid}`;
- автообновление статусов раз в минуту, только пока вкладка видна;
- темы drova.io: `foxexeDark` (тёмная, по умолчанию) и `dvLight` (светлая), см. ниже.

## Темы

Как на drova.io: корневой layout получает класс `app-layout theme_<тема>`, а компоненты содержат базовые (светлые)
стили и переопределения под `.theme_foxexeDark`. Цвета сняты с `index.min.css` drova.io: гексагональный фон,
панели `rgba(0,0,0,.85)`, фильтры `#333`, рамка станции 5px `#0c6` (свободна) или `#f90` (занята), модальные окна `#1e1e1e`.
Выбор хранится в cookie `drova_theme`, как на drova.io. Внутри drova.io класс темы и переключатель уже есть,
поэтому модуль `src/store/theme.js` и `ThemeSwitcher.vue` там не нужны.

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

## Запуск игр

drova.io запускает игру от имени вошедшего игрока: `POST /session-manager/sessions` с `X-Auth-Token`, затем будит
приложение Drova (`start-….tl.drova.io:40109` / протокол `drova:`) или открывает веб-клиент `/inbrowser/?sessionId&serverId&token`.
Токен есть только на drova.io, поэтому страница вызывает запуск через `src/launcher.js`:

- **внутри drova.io** регистрируется их `Player` — игра запускается прямо с нашей страницы (см. п. 6 ниже);
- **на отдельном сайте** (GitHub Pages, VPS) клик по игре открывает станцию на drova.io и показывает подсказку.

## Встраивание в drova.io

1. Скопировать `src/api/drova.js`, `src/utils/`, `src/store/merchantStations.js`, `src/components/` (кроме `ThemeSwitcher.vue`), `src/views/MerchantStations.vue` (убрать из шаблона `<ThemeSwitcher />`).
2. Зарегистрировать Vuex-модуль: `store.registerModule('merchantStations', merchantStations)` (или в `modules`).
3. Добавить маршрут из `merchantRoutes` (`src/router.js`) в роутер drova.io.
4. Слить `src/i18n/ru.js` и `en.js` в сообщения vue-i18n (ключ `merchantStations`).
5. SSR: страница грузит данные в `serverPrefetch`, клиент берёт их из `__INITIAL_STATE__` и повторно не запрашивает.
   View UI у drova.io подключён глобально, поэтому в `src/app.js` он нужен только для автономного запуска.
6. Запуск игр: в layout, где есть `<Player ref="player" />` (как на странице станции drova.io), зарегистрировать launcher:

   ```js
   import { setLauncher } from '@/launcher';

   mounted() {
     // Те же аргументы, что у tryToStart на странице станции drova.io; последний — запуск в браузере.
     setLauncher(({ stationId, productId, inBrowser }) => this.$refs.player.tryToStart(
       this.xauthtoken, this.user.drovauser_id, productId, stationId,
       this.trialMode, this.usergeo, undefined, undefined, undefined, inBrowser,
     ));
   },
   ```

## Публикация на GitHub Pages

Workflow `.github/workflows/pages.yml` на каждый пуш в `main` запускает тесты, собирает страницу с
`BASE_URL=/<имя репозитория>/` и публикует её на Pages.

Один раз включить: **Settings → Pages → Build and deployment → Source: GitHub Actions**, затем
**Actions → Deploy to GitHub Pages → Run workflow** (или любой пуш в `main`).

Адрес: https://liebertservice.github.io/ArbatGames/
