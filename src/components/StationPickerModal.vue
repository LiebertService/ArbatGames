<template>
  <!-- transfer=false: окно остаётся внутри .theme_* и получает стили темы -->
  <Modal
    :value="!!game"
    :title="game ? $t('merchantStations.picker.title', { game: game.title }) : ''"
    :transfer="false"
    class-name="station-picker"
    width="560"
    footer-hide
    @on-visible-change="(visible) => !visible && $emit('close')"
  >
    <template v-if="game">
      <router-link v-if="autoStation" :to="stationRoute(autoStation)" class="picker__auto">
        <span class="picker__auto-title">{{ $t('merchantStations.picker.anyFree') }}</span>
        <span class="picker__auto-sub">{{ $t('merchantStations.picker.autoPicked', { station: autoStation.title }) }}</span>
      </router-link>
      <Alert v-else type="warning" show-icon>{{ $t('merchantStations.picker.allBusy') }}</Alert>

      <ul class="picker__list">
        <li v-for="s in options" :key="s.uuid">
          <component
            :is="s.state === 'free' ? 'router-link' : 'div'"
            :to="s.state === 'free' ? stationRoute(s) : null"
            class="picker__station"
            :class="`picker__station_${s.state}`"
          >
            <span class="picker__station-title">{{ s.title }}</span>
            <Tag class="picker__state" :color="s.state === 'free' ? 'success' : 'warning'">
              {{ $t(`merchantStations.state.${s.state}`) }}
            </Tag>
            <span class="picker__station-meta">
              <template v-if="hardware[s.uuid] && hardware[s.uuid].gpu">{{ hardware[s.uuid].gpu }}</template>
              <template v-if="s.city"> · {{ s.city }}</template>
            </span>
          </component>
        </li>
      </ul>
    </template>
  </Modal>
</template>

<script>
import { mapState } from 'vuex';
import { compareStations, pickFreeStation, STATE_FREE } from '@/utils/station';

// «Где играть в X»: автоподбор свободной станции или выбор из наших станций с этой игрой.
// Выбор ведёт на нашу страницу станции с отфильтрованной игрой (?game=<productId>).
export default {
  name: 'StationPickerModal',
  props: {
    game: { type: Object, default: null }, // элемент merchantGames(): productId, title, stationIds
    merchantId: { type: String, required: true },
  },
  computed: {
    ...mapState('merchantStations', ['stations', 'hardware']),
    withGame() {
      return this.game ? this.stations.filter((s) => s.productList.includes(this.game.productId)) : [];
    },
    autoStation() {
      return this.game ? pickFreeStation(this.stations, this.game.productId) : null;
    },
    // Свободные первыми, внутри — по номеру станции.
    options() {
      return [...this.withGame].sort((a, b) => (b.state === STATE_FREE) - (a.state === STATE_FREE) || compareStations(a, b));
    },
  },
  methods: {
    stationRoute(station) {
      return {
        name: 'merchant-station',
        params: { merchantId: this.merchantId, stationId: station.uuid },
        query: { game: this.game.productId },
      };
    },
  },
};
</script>

<style scoped>
.picker__auto {
  display: block;
  padding: 12px 16px;
  text-align: center;
  color: #fff;
  background: #0c6;
  border-radius: 5px;
}
.picker__auto:hover { background: rgba(0, 210, 75, 0.85); color: #fff; }
.picker__auto-title { display: block; font-size: 20px; font-weight: 700; text-transform: uppercase; }
.picker__auto-sub { display: block; font-size: 12px; }
.picker__list { list-style: none; margin: 16px 0 0; padding: 0; max-height: 50vh; overflow-y: auto; }
.picker__station {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  padding: 10px 12px;
  color: inherit;
  border-bottom: 1px solid #e8eaec;
}
.picker__station_free { cursor: pointer; }
.picker__station_free:hover { background: #f3f3f3; }
.picker__station_busy,
.picker__station_other { opacity: 0.55; cursor: not-allowed; }
.picker__station-title { font-weight: 600; color: #464c5b; }
.picker__station_free .picker__station-title { color: #19be6b; }
.picker__state { margin: 0; }
.picker__station-meta { flex-basis: 100%; font-size: 12px; }

/* theme_foxexeDark: строки как .station на drova.io/games/<игра> */
.theme_foxexeDark .picker__station { border-bottom-color: #333; }
.theme_foxexeDark .picker__station_free:hover { background: #222d38; }
.theme_foxexeDark .picker__station-title { color: #f90; }
.theme_foxexeDark .picker__station_free .picker__station-title { color: #0c6; }
.theme_foxexeDark .picker__station-meta { color: #ccc; }
.theme_foxexeDark .picker__state { border-radius: 3px; font-weight: 600; }
</style>

<style>
/* Корень окна iView рендерит сам — стили без scoped (как у окна станции). */
.theme_foxexeDark .station-picker .ivu-modal-content { color: #fff; background: #1e1e1e; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.8); }
.theme_foxexeDark .station-picker .ivu-modal-header { border-bottom-color: #333; }
.theme_foxexeDark .station-picker .ivu-modal-header-inner { color: #fff; }
.theme_foxexeDark .station-picker .ivu-modal-close .ivu-icon-ios-close { color: #ccc; }
</style>
