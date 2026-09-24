<template>
  <div class="station-page">
    <router-link class="station-page__back" :to="{ name: 'merchant-stations', params: { merchantId } }">
      <Icon type="ios-arrow-back" /> {{ $t('merchantStations.backToList') }}
    </router-link>

    <Spin v-if="!station && loading" size="large" class="station-page__spin" />
    <Alert v-else-if="error" type="error" show-icon>{{ $t('merchantStations.error', { error }) }}</Alert>
    <p v-else-if="!station" class="station-page__empty">{{ $t('merchantStations.stationNotFound') }}</p>

    <template v-else>
      <header class="station-page__header" :class="`station-page__header_${station.state}`">
        <div>
          <h1 class="station-page__title">{{ station.title }}</h1>
          <div class="station-page__tags">
            <Tag class="station-page__state" :color="stateColor">{{ $t(`merchantStations.state.${station.state}`) }}</Tag>
            <Tag v-if="station.freeTrial" color="cyan" class="station-page__trial">{{ $t('merchantStations.freeTrial') }}</Tag>
            <span class="station-page__uuid">{{ station.uuid }}</span>
          </div>
        </div>
        <Button :to="drovaUrl" target="_blank" icon="md-open">{{ $t('merchantStations.openOnDrova') }}</Button>
      </header>

      <div class="station-page__info" :class="{ 'station-page__info_single': !descriptionHtml }">
        <!-- HTML мерчанта прошёл sanitizeDescription: только p/br/b/i/a[http(s)] -->
        <div v-if="descriptionHtml" class="station-page__panel">
          <div
            class="station-page__description"
            :class="{ 'station-page__description_collapsed': !descriptionOpen }"
            v-html="descriptionHtml"
          />
          <a class="station-page__more" href="#" @click.prevent="descriptionOpen = !descriptionOpen">
            {{ $t(descriptionOpen ? 'merchantStations.collapse' : 'merchantStations.expand') }}
          </a>
        </div>
        <dl class="station-page__panel station-page__hw">
          <template v-if="stationHardware && stationHardware.gpu"><dt>{{ $t('merchantStations.hw.gpu') }}</dt><dd>{{ stationHardware.gpu }} / {{ stationHardware.gpuRam }}</dd></template>
          <template v-if="stationHardware && stationHardware.ram"><dt>{{ $t('merchantStations.hw.ram') }}</dt><dd>{{ stationHardware.ram }}</dd></template>
          <template v-if="stationHardware && stationHardware.cpu"><dt>{{ $t('merchantStations.hw.cpu') }}</dt><dd>{{ stationHardware.cpu }}</dd></template>
          <template v-if="station.city"><dt>{{ $t('merchantStations.city') }}</dt><dd>{{ station.city }}</dd></template>
          <template v-if="currentGame">
            <dt>{{ $t(station.state === 'busy' ? 'merchantStations.nowPlaying' : 'merchantStations.lastPlayed') }}</dt>
            <dd>{{ currentGame.title }}</dd>
          </template>
        </dl>
      </div>

      <Alert v-if="!nativeLaunch" type="info" show-icon class="station-page__notice">
        {{ $t('merchantStations.launchOnDrovaNotice') }}
      </Alert>
      <Alert v-if="station.state !== 'free'" type="warning" show-icon class="station-page__notice">
        {{ $t('merchantStations.stationBusyNotice') }}
      </Alert>

      <div class="station-page__filters">
        <Input v-model="query" :placeholder="$t('merchantStations.filters.gameName')" clearable class="station-page__filter" />
        <Select v-model="license" :placeholder="$t('merchantStations.filters.license')" clearable class="station-page__filter">
          <Option v-for="l in licenses" :key="l" :value="l">{{ $t(`merchantStations.license.${l}`) }}</Option>
        </Select>
        <Select v-model="account" :placeholder="$t('merchantStations.filters.account')" clearable filterable class="station-page__filter">
          <Option v-for="a in accounts" :key="a" :value="a">{{ a }}</Option>
        </Select>
      </div>

      <Spin v-if="!catalog" size="large" class="station-page__spin">{{ $t('merchantStations.loadingCatalog') }}</Spin>
      <template v-else>
        <p class="station-page__count">{{ $t('merchantStations.gamesShown', { shown: games.length, total: stationGames.length }) }}</p>
        <div class="station-page__games">
          <GameCard
            v-for="game in games"
            :key="game.productId"
            :game="game"
            :disabled="station.state !== 'free'"
            @play="play(game, $event)"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import GameCard from '@/components/GameCard.vue';
import { DROVA_SITE, REFRESH_INTERVAL } from '@/config';
import { launchGame, hasNativeLauncher } from '@/launcher';
import { sanitizeDescription } from '@/utils/station';

const NS = 'merchantStations';
const STATE_COLORS = { free: 'success', busy: 'warning', other: 'default' };
// В каталоге встречается опечатка «Require» — считаем её «Required».
const normLicense = (l) => (l === 'Require' ? 'Required' : l);

export default {
  name: 'StationPage',
  components: { GameCard },
  props: {
    merchantId: { type: String, required: true },
    stationId: { type: String, required: true },
  },
  data: () => ({ query: '', license: '', account: '', timer: null, nativeLaunch: false, descriptionOpen: false }),
  metaInfo() {
    return { title: this.station ? `${this.station.title} — drova.io` : this.$t('merchantStations.library') };
  },
  computed: {
    ...mapState(NS, ['stations', 'hardware', 'products', 'catalog', 'loading', 'error']),
    station() { return this.stations.find((s) => s.uuid === this.stationId) || null; },
    stationHardware() { return this.hardware[this.stationId] || null; },
    stateColor() { return STATE_COLORS[this.station.state]; },
    drovaUrl() { return `${DROVA_SITE}/stations/${this.stationId}`; },
    descriptionHtml() { return sanitizeDescription(this.station.description); },
    currentGame() {
      const id = this.station.productId;
      return (this.catalog && this.catalog[id]) || this.products[id] || null;
    },
    stationGames() {
      if (!this.catalog) return [];
      return this.station.productList
        .map((productId) => (this.catalog[productId] ? { productId, ...this.catalog[productId] } : null))
        .filter(Boolean)
        .sort((a, b) => a.title.localeCompare(b.title));
    },
    licenses() { return [...new Set(this.stationGames.map((g) => normLicense(g.licenseType)).filter(Boolean))].sort(); },
    accounts() { return [...new Set(this.stationGames.map((g) => g.requiredAccount).filter(Boolean))].sort(); },
    games() {
      const q = this.query.trim().toLowerCase();
      return this.stationGames.filter((g) => (!q || g.title.toLowerCase().includes(q))
        && (!this.license || normLicense(g.licenseType) === this.license)
        && (!this.account || g.requiredAccount === this.account));
    },
  },
  serverPrefetch() {
    return this.load();
  },
  mounted() {
    this.nativeLaunch = hasNativeLauncher();
    const s = this.$store.state[NS];
    if (s.merchantId !== this.merchantId || !s.updatedAt) this.load();
    this.$store.dispatch(`${NS}/loadCatalog`);
    this.timer = setInterval(() => {
      if (document.visibilityState === 'visible' && !this.loading) this.$store.dispatch(`${NS}/refresh`);
    }, REFRESH_INTERVAL);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    load() {
      return this.$store.dispatch(`${NS}/load`, this.merchantId);
    },
    play(game, { inBrowser }) {
      const launched = launchGame({ stationId: this.stationId, productId: game.productId, inBrowser });
      if (!launched) this.$Message.info({ content: this.$t('merchantStations.openedOnDrova', { game: game.title }), duration: 5 });
    },
  },
};
</script>

<style scoped>
.station-page { max-width: 1280px; margin: 0 auto; padding: 24px 16px 48px; }
.station-page__back { display: inline-flex; align-items: center; gap: 4px; margin-bottom: 16px; }
.station-page__spin { margin: 60px auto; }
.station-page__empty { margin: 40px 0; text-align: center; }
.station-page__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.station-page__title { margin: 0 0 6px; font-size: 26px; font-weight: 700; color: #464c5b; }
.station-page__tags { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.station-page__uuid { font-size: 11px; margin-left: 8px; opacity: 0.7; }
.station-page__info {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 16px;
  margin-bottom: 16px;
}
.station-page__info_single { grid-template-columns: 1fr; }
@media (max-width: 767px) { .station-page__info { grid-template-columns: 1fr; } }
.station-page__panel { margin: 0; padding: 16px; border-radius: 5px; background: #f8f8f9; }
.station-page__description { font-size: 14px; overflow-wrap: anywhere; }
.station-page__description_collapsed {
  max-height: 150px;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(#000 60%, transparent);
  mask-image: linear-gradient(#000 60%, transparent);
}
.station-page__more { display: inline-block; margin-top: 6px; font-size: 13px; }
.station-page__description >>> p { margin: 0 0 6px; }
.station-page__hw { align-self: start; display: grid; grid-template-columns: max-content 1fr; gap: 6px 16px; }
.station-page__hw dt { font-size: 12px; }
.station-page__hw dd { margin: 0; font-weight: 600; color: #464c5b; }
.station-page__notice { margin-bottom: 12px; }
.station-page__filters { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
.station-page__filter { flex: 1 1 220px; }
.station-page__count { font-size: 13px; margin: 0 0 8px; }
.station-page__games {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

/* ===== theme_foxexeDark: как /stations/:id на drova.io ===== */
.theme_foxexeDark .station-page__back { color: #007bff; }
.theme_foxexeDark .station-page__header { padding: 10px; background: rgba(0, 0, 0, 0.8); border-radius: 5px; }
.theme_foxexeDark .station-page__title { color: #fff; }
.theme_foxexeDark .station-page__header_free .station-page__title { color: #0c6; }
.theme_foxexeDark .station-page__header_busy .station-page__title { color: #f90; }
.theme_foxexeDark .station-page__state { border-radius: 3px; font-weight: 600; }
.theme_foxexeDark .station-page__trial { background: #0c6 !important; border-color: #0c6 !important; font-weight: 600; }
.theme_foxexeDark .station-page__trial >>> .ivu-tag-text { color: #fff !important; }
.theme_foxexeDark .station-page__panel { color: #fff; background: rgba(0, 0, 0, 0.8); }
.theme_foxexeDark .station-page__description >>> a,
.theme_foxexeDark .station-page__more { color: #007bff; }
.theme_foxexeDark .station-page__hw dt { color: #ccc; }
.theme_foxexeDark .station-page__hw dd { color: #fff; }
.theme_foxexeDark .station-page__filters { padding: 10px; background: #333; border-radius: 5px; }
.theme_foxexeDark .station-page__count,
.theme_foxexeDark .station-page__empty { color: #ccc; }
.theme_foxexeDark .station-page__games { grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 10px; }
</style>
