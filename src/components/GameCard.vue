<template>
  <!-- Разметка и классы повторяют .gameList__item-thumb со страницы станции drova.io -->
  <!-- selectable: каталог «Игры» — клик открывает выбор станции; иначе — запуск на текущей станции -->
  <div
    class="game-card"
    :class="{ 'game-card_disabled': disabled, 'game-card_selectable': selectable }"
    :title="game.title"
    :role="selectable ? 'button' : null"
    :tabindex="selectable ? 0 : null"
    @click="selectable && $emit('select')"
    @keydown.enter="selectable && $emit('select')"
  >
    <!-- img + loading=lazy: в каталоге сотни карточек, обложки грузятся по мере прокрутки -->
    <img class="game-card__image" :src="game.cardPicture" alt="" loading="lazy" decoding="async">
    <div class="game-card__title">
      <Icon v-if="game.useDefaultDesktop" type="ios-desktop" :title="$t('merchantStations.game.desktop')" />
      <span>{{ game.title }}</span>
    </div>
    <div v-if="game.requiredAccount || meta" class="game-card__badges">
      <div v-if="game.requiredAccount">{{ game.requiredAccount }}</div>
      <div v-if="meta" class="game-card__meta">{{ meta }}</div>
    </div>

    <div v-if="selectable" class="game-card__play-label">{{ $t('merchantStations.play') }}</div>

    <!-- Клик по карточке / Play в центре — приложение Drova; иконка слева внизу — веб-клиент -->
    <div
      v-else-if="!disabled"
      class="game-card__start"
      role="button"
      tabindex="0"
      :aria-label="$t('merchantStations.game.playApp', { game: game.title })"
      @click.stop.prevent="$emit('play', { inBrowser: false })"
      @keydown.enter.prevent="$emit('play', { inBrowser: false })"
    >
      <!-- play-circle как в SVG-наборе drova.io (в шрифте View UI такой иконки нет) -->
      <svg class="game-card__ico game-card__ico_app" viewBox="0 0 512 512" aria-hidden="true">
        <circle cx="256" cy="256" r="208" fill="currentColor" />
        <path d="M216 344V168l136 88z" fill="#fff" />
      </svg>
      <span
        class="game-card__ico game-card__ico_browser"
        role="button"
        tabindex="0"
        :title="$t('merchantStations.game.playBrowser')"
        :aria-label="$t('merchantStations.game.playBrowser')"
        @click.stop.prevent="$emit('play', { inBrowser: true })"
        @keydown.enter.stop.prevent="$emit('play', { inBrowser: true })"
      ><Icon type="md-browsers" /></span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameCard',
  props: {
    game: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    selectable: { type: Boolean, default: false },
    meta: { type: String, default: '' }, // строка под бейджем аккаунта: «на 5 станциях · свободно 2»
  },
};
</script>

<style scoped>
/* Светлая тема (dvLight): .page_station .gameList__item-* */
.game-card {
  position: relative;
  overflow: hidden;
  border-radius: 5px;
  cursor: pointer;
  background: #e3e8ee;
}
.game-card_disabled { cursor: default; }
.game-card__image {
  display: block;
  width: 100%;
  aspect-ratio: 3 / 2;
  object-fit: cover;
}
.game-card__title {
  position: absolute;
  top: 0;
  left: 0;
  max-width: calc(100% - 20px);
  padding: 5px 10px;
  color: #fff;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 4px 0 5px 0;
}
.game-card__badges {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 5px 15px;
  color: #fff;
  font-weight: 600;
  background: rgba(0, 0, 0, 0.8);
  border-top-left-radius: 5px;
}
.game-card__start {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0c6;
  opacity: 0;
  transition: opacity 0.2s;
}
.game-card:hover .game-card__start,
.game-card__start:focus-visible,
.game-card__start:focus-within { opacity: 1; }
.game-card__ico { color: #f30; line-height: 1; }
.game-card__ico_app { width: 72px; height: 72px; }
.game-card__ico_browser {
  position: absolute;
  left: 16px;
  bottom: 16px;
  font-size: 56px;
  border-radius: 8px;
  transition: transform 0.15s;
}
.game-card__ico_browser:hover { transform: scale(1.1); }
.game-card__ico_app,
.game-card__ico_browser { filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.5)); }

.game-card_selectable:focus-visible { outline: 2px solid #2d8cf0; outline-offset: 2px; }
.game-card__meta { font-size: 12px; font-weight: 400; }
/* «ИГРАТЬ» при наведении, как .catalog .gameList__item-start на drova.io/games */
.game-card__play-label {
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 2px 24px;
  font-size: 28px;
  font-weight: 600;
  text-transform: uppercase;
  color: #fff;
  background: #0c6;
  border-top-left-radius: 5px;
  opacity: 0;
  transition: opacity 0.2s;
}
.game-card_selectable:hover .game-card__play-label,
.game-card_selectable:focus-visible .game-card__play-label { opacity: 1; }

/* ===== theme_foxexeDark: .theme_foxexeDark .gameList__item-* ===== */
.theme_foxexeDark .game-card {
  color: #eee;
  border-radius: 0;
  background: #000;
  box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.1);
}
.theme_foxexeDark .game-card__image {
  aspect-ratio: auto;
  height: 190px;
  box-shadow: inset 0 0 10px 2px #000;
}
.theme_foxexeDark .game-card__title {
  right: 0;
  max-width: none;
  text-align: center;
  border-radius: 0;
}
.theme_foxexeDark .game-card__badges { right: auto; left: 0; border-radius: 0 5px 0 0; }
.theme_foxexeDark .game-card__play-label {
  border-radius: 0;
  background: rgba(0, 210, 75, 0.85);
  text-shadow: 1px 1px 2px #000;
}
.theme_foxexeDark .game-card_selectable:hover { box-shadow: inset 0 0 0 3px rgba(0, 210, 75, 0.85); }
.theme_foxexeDark .game-card__start {
  background: rgba(0, 210, 75, 0.85);
  box-shadow: inset 0 0 10px 10px rgba(0, 255, 0, 0.5);
}
</style>
