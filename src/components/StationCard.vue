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
        <Tag v-if="station.freeTrial" color="cyan">{{ $t('merchantStations.freeTrial') }}</Tag>
      </div>

      <div class="station-card__actions">
        <Button type="primary" :to="playUrl" target="_blank" :disabled="station.state !== 'free'">
          {{ $t('merchantStations.play') }}
        </Button>
        <Button @click="$emit('details', station)">{{ $t('merchantStations.details') }}</Button>
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
</style>
