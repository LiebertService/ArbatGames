<template>
  <Card class="station-card" :class="`station-card_${station.state}`" :padding="0" dis-hover>
    <div class="station-card__image" :style="imageStyle">
      <Tag class="station-card__state" :color="stateColor">{{ $t(`merchantStations.state.${station.state}`) }}</Tag>
      <span v-if="station.number != null" class="station-card__number">#{{ station.number }}</span>
    </div>

    <div class="station-card__body">
      <h3 class="station-card__title" :title="station.name">{{ station.title }}</h3>

      <ul v-if="hardware" class="station-card__hw">
        <li v-if="hardware.gpu"><Icon type="md-desktop" /> {{ hardware.gpu }}<span v-if="hardware.gpuRam"> · {{ hardware.gpuRam }}</span></li>
        <li v-if="hardware.cpu"><Icon type="md-speedometer" /> {{ hardware.cpu }}</li>
        <li v-if="hardware.ram"><Icon type="md-albums" /> {{ $t('merchantStations.hw.ram') }} {{ hardware.ram }}</li>
      </ul>

      <p v-if="product" class="station-card__game">
        {{ $t(station.state === 'busy' ? 'merchantStations.playing' : 'merchantStations.lastGame', { game: product.title }) }}
      </p>

      <div class="station-card__meta">
        <span><Icon type="md-game-controller-b" /> {{ $t('merchantStations.games', { n: station.productList.length }) }}</span>
        <span v-if="station.city"><Icon type="md-pin" /> {{ station.city }}</span>
        <Tag v-if="station.freeTrial" color="cyan" class="station-card__trial">{{ $t('merchantStations.freeTrial') }}</Tag>
      </div>

      <div class="station-card__actions">
        <Button type="primary" class="station-card__play" :to="playUrl" target="_blank" :disabled="station.state !== 'free'">
          {{ $t('merchantStations.play') }}
        </Button>
        <Button class="station-card__more" @click="$emit('details', station)">{{ $t('merchantStations.details') }}</Button>
      </div>
    </div>
  </Card>
</template>

<script>
import { DROVA_SITE } from '@/config';
import { productPicture } from '@/utils/station';

const STATE_COLORS = { free: 'success', busy: 'warning', other: 'default' };

export default {
  name: 'StationCard',
  props: {
    station: { type: Object, required: true },
    hardware: { type: Object, default: null },
    product: { type: Object, default: null },
  },
  computed: {
    stateColor() { return STATE_COLORS[this.station.state]; },
    playUrl() { return `${DROVA_SITE}/stations/${this.station.uuid}`; },
    imageStyle() {
      const url = (this.product && this.product.cardPicture) || productPicture(this.station.productId);
      return url ? { backgroundImage: `url("${url}")` } : null;
    },
  },
};
</script>

<style scoped>
.station-card {
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}
.station-card__image {
  position: relative;
  height: 140px;
  background: #464c5b center / cover no-repeat;
}
.station-card_busy .station-card__image { filter: saturate(0.6); }
.station-card__state { position: absolute; top: 10px; left: 10px; margin: 0; }
.station-card__number {
  position: absolute;
  right: 10px;
  bottom: 8px;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
}
.station-card__body { padding: 14px 16px 16px; }
.station-card__title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  color: #464c5b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.station-card__hw { list-style: none; margin: 0 0 8px; padding: 0; font-size: 13px; }
.station-card__hw li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.station-card__game { font-size: 13px; margin: 0 0 8px; color: #464c5b; }
.station-card__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  font-size: 13px;
  margin-bottom: 12px;
}
.station-card__actions { display: flex; gap: 8px; }

/* ===== theme_foxexeDark: карточка как .station на drova.io/stations ===== */
.theme_foxexeDark .station-card {
  --state: #0c6;
  color: #fff;
  background: #000;
  border: 5px solid var(--state);
  border-radius: 0;
  transition: background-color 0.2s;
}
.theme_foxexeDark .station-card_busy { --state: #f90; }
.theme_foxexeDark .station-card_other { --state: #c3cbd6; }
.theme_foxexeDark .station-card:hover { background-color: #222d38; }
.theme_foxexeDark .station-card__state,
.theme_foxexeDark .station-card__trial {
  background: var(--state) !important;
  border-color: var(--state) !important;
  border-radius: 3px;
  font-weight: 600;
}
.theme_foxexeDark .station-card__trial { --state: #0c6; }
.theme_foxexeDark .station-card__trial >>> .ivu-tag-text { color: #fff !important; } /* iView: .ivu-tag-cyan .ivu-tag-text !important */
.theme_foxexeDark .station-card__title { color: var(--state); }
.theme_foxexeDark .station-card__hw { color: #ddd; }
.theme_foxexeDark .station-card__game { color: #fff; }
.theme_foxexeDark .station-card__meta { color: #ccc; }
.theme_foxexeDark .station-card__play:not([disabled]) {
  color: #fff;
  background: #0c6;
  border-color: #0c6;
}
.theme_foxexeDark .station-card__play:not([disabled]):hover {
  background: rgba(0, 210, 75, 0.85);
  border-color: rgba(0, 210, 75, 0.85);
}
.theme_foxexeDark .station-card__play[disabled] {
  color: #777;
  background: #333;
  border-color: #333;
}
.theme_foxexeDark .station-card__more {
  color: #fff;
  background: #434856;
  border-color: #434856;
}
.theme_foxexeDark .station-card__more:hover { background: #565c6c; border-color: #565c6c; }
</style>
