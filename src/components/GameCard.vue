<template>
  <!-- Разметка и классы повторяют .gameList__item-thumb со страницы станции drova.io -->
  <div class="game-card" :class="{ 'game-card_disabled': disabled }" :title="game.title">
    <div class="game-card__image" :style="{ backgroundImage: `url(&quot;${game.cardPicture}&quot;)` }" />
    <div class="game-card__title">
      <Icon v-if="game.useDefaultDesktop" type="ios-desktop" :title="$t('merchantStations.game.desktop')" />
      <span>{{ game.title }}</span>
    </div>
    <div v-if="game.requiredAccount" class="game-card__badges">{{ game.requiredAccount }}</div>

    <!-- Клик по карточке / Play в центре — приложение Drova; иконка слева внизу — веб-клиент -->
    <div
      v-if="!disabled"
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
  width: 100%;
  padding-top: 66.667%;
  background: center / cover no-repeat;
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

/* ===== theme_foxexeDark: .theme_foxexeDark .gameList__item-* ===== */
.theme_foxexeDark .game-card {
  color: #eee;
  border-radius: 0;
  background: #000;
  box-shadow: 0 0 5px 2px rgba(0, 0, 0, 0.1);
}
.theme_foxexeDark .game-card__image {
  padding-top: 0;
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
.theme_foxexeDark .game-card__start {
  background: rgba(0, 210, 75, 0.85);
  box-shadow: inset 0 0 10px 10px rgba(0, 255, 0, 0.5);
}
</style>
