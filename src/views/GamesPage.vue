<template>
  <div class="games-page">
    <MerchantHeader :merchant-id="merchantId" />

    <div class="games-page__filters">
      <Input v-model="query" :placeholder="$t('merchantStations.filters.gameName')" prefix="ios-search" clearable class="games-page__filter" />
      <Select v-model="license" :placeholder="$t('merchantStations.filters.license')" clearable class="games-page__filter">
        <Option v-for="l in licenses" :key="l" :value="l">{{ $t(`merchantStations.license.${l}`) }}</Option>
      </Select>
      <Select v-model="account" :placeholder="$t('merchantStations.filters.account')" clearable filterable class="games-page__filter">
        <Option v-for="a in accounts" :key="a" :value="a">{{ a }}</Option>
      </Select>
      <label class="games-page__switch">
        <i-switch v-model="onlyFree" size="small" />
        {{ $t('merchantStations.filters.onlyFree') }}
      </label>
    </div>

    <Alert v-if="error" type="error" show-icon>{{ $t('merchantStations.error', { error }) }}</Alert>

    <Spin v-if="!catalog || (loading && !stations.length)" size="large" class="games-page__spin">
      {{ $t('merchantStations.loadingCatalog') }}
    </Spin>
    <template v-else>
      <h2 class="games-page__heading">{{ $t('merchantStations.gamesHeading') }}</h2>
      <p class="games-page__count">{{ $t('merchantStations.gamesShown', { shown: filtered.length, total: games.length }) }}</p>
      <p v-if="!filtered.length" class="games-page__empty">{{ $t('merchantStations.noGames') }}</p>
      <div class="games-page__grid">
        <GameCard
          v-for="game in filtered"
          :key="game.productId"
          :game="game"
          :meta="$t('merchantStations.gameAvailability', { total: game.stationIds.length, free: game.freeCount })"
          selectable
          @select="picked = game"
        />
      </div>
    </template>

    <StationPickerModal :game="picked" :merchant-id="merchantId" @close="picked = null" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import GameCard from '@/components/GameCard.vue';
import MerchantHeader from '@/components/MerchantHeader.vue';
import StationPickerModal from '@/components/StationPickerModal.vue';
import { merchantInfo, REFRESH_INTERVAL } from '@/config';
import { normalizeLicense } from '@/utils/station';

const NS = 'merchantStations';

// Аналог drova.io/games, но только с играми станций мерчанта.
export default {
  name: 'GamesPage',
  components: { GameCard, MerchantHeader, StationPickerModal },
  props: {
    merchantId: { type: String, required: true },
  },
  data: () => ({ query: '', license: '', account: '', onlyFree: false, picked: null, timer: null }),
  metaInfo() {
    const { name } = merchantInfo(this.merchantId);
    return { title: this.$t('merchantStations.gamesMetaTitle', { name }) };
  },
  computed: {
    ...mapState(NS, ['stations', 'catalog', 'loading', 'error']),
    ...mapGetters(NS, ['games']),
    licenses() { return [...new Set(this.games.map((g) => normalizeLicense(g.licenseType)).filter(Boolean))].sort(); },
    accounts() { return [...new Set(this.games.map((g) => g.requiredAccount).filter(Boolean))].sort(); },
    filtered() {
      const q = this.query.trim().toLowerCase();
      return this.games.filter((g) => (!q || g.title.toLowerCase().includes(q))
        && (!this.license || normalizeLicense(g.licenseType) === this.license)
        && (!this.account || g.requiredAccount === this.account)
        && (!this.onlyFree || g.freeCount > 0));
    },
  },
  serverPrefetch() {
    return Promise.all([this.load(), this.$store.dispatch(`${NS}/loadCatalog`), this.$store.dispatch(`${NS}/loadPopular`)]);
  },
  mounted() {
    const s = this.$store.state[NS];
    if (s.merchantId !== this.merchantId || !s.updatedAt) this.load();
    this.$store.dispatch(`${NS}/loadCatalog`);
    this.$store.dispatch(`${NS}/loadPopular`);
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
  },
};
</script>

<style scoped>
.games-page { max-width: 1280px; margin: 0 auto; padding: 24px 16px 48px; }
.games-page__filters { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 12px; }
.games-page__filter { flex: 1 1 220px; }
.games-page__switch { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; cursor: pointer; }
.games-page__spin { margin: 60px auto; }
.games-page__heading { margin: 16px 0 4px; font-size: 22px; font-weight: 700; text-align: center; color: #464c5b; }
.games-page__count { margin: 0 0 12px; font-size: 13px; text-align: center; }
.games-page__empty { margin: 40px 0; text-align: center; }
.games-page__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

/* theme_foxexeDark: как drova.io/games */
.theme_foxexeDark .games-page__filters { padding: 10px; background: #333; border-radius: 5px; }
.theme_foxexeDark .games-page__switch { color: #fff; }
.theme_foxexeDark .games-page__heading { color: #fff; }
.theme_foxexeDark .games-page__count,
.theme_foxexeDark .games-page__empty { color: #ccc; }
.theme_foxexeDark .games-page__grid { grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 10px; }
</style>
