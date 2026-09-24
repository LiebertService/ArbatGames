<template>
  <div class="merchant-stations">
    <header class="merchant-stations__header">
      <div>
        <h1 class="merchant-stations__title">{{ $t('merchantStations.title', { name: merchant.name }) }}</h1>
        <p class="merchant-stations__summary">
          {{ $t('merchantStations.summary', counts) }}
          <span v-if="merchant.city"> · {{ merchant.city }}</span>
        </p>
        <p v-if="merchant.links.length" class="merchant-stations__links">
          <a v-for="link in merchant.links" :key="link.url" :href="link.url" target="_blank" rel="noopener">{{ link.title }}</a>
        </p>
      </div>
      <div class="merchant-stations__refresh">
        <span v-if="updatedAt">{{ $t('merchantStations.updated', { time: updatedTime }) }}</span>
        <Button icon="md-refresh" :loading="loading" @click="refresh">{{ $t('merchantStations.refresh') }}</Button>
      </div>
    </header>

    <div class="merchant-stations__filters">
      <RadioGroup v-model="stateFilter" type="button">
        <Radio label="all">{{ $t('merchantStations.filters.all') }} ({{ counts.total }})</Radio>
        <Radio label="free">{{ $t('merchantStations.filters.free') }} ({{ counts.free }})</Radio>
        <Radio label="busy">{{ $t('merchantStations.filters.busy') }} ({{ counts.busy }})</Radio>
      </RadioGroup>
      <Select v-model="gpuFilter" class="merchant-stations__gpu" :placeholder="$t('merchantStations.filters.gpu')" clearable>
        <Option v-for="gpu in gpus" :key="gpu" :value="gpu">{{ gpu }}</Option>
      </Select>
      <Input
        v-model="gameQuery"
        class="merchant-stations__game"
        prefix="ios-search"
        clearable
        :placeholder="`${$t('merchantStations.filters.game')}: ${$t('merchantStations.gameSearchPlaceholder')}`"
        @on-focus="loadCatalog"
      />
    </div>

    <Alert v-if="error" type="error" show-icon>{{ $t('merchantStations.error', { error }) }}</Alert>

    <Spin v-if="loading && !stations.length" size="large" class="merchant-stations__spin" />
    <p v-else-if="!stations.length && !error" class="merchant-stations__empty">{{ $t('merchantStations.noStations') }}</p>
    <p v-else-if="!filtered.length" class="merchant-stations__empty">{{ $t('merchantStations.empty') }}</p>

    <Row :gutter="16" type="flex">
      <Col v-for="station in filtered" :key="station.uuid" :xs="24" :sm="12" :md="8" :lg="6" class="merchant-stations__col">
        <StationCard
          :station="station"
          :hardware="hardware[station.uuid]"
          :product="products[station.productId]"
          @details="selected = $event"
        />
      </Col>
    </Row>

    <StationDetailsModal
      :station="selected"
      :hardware="selected ? hardware[selected.uuid] : null"
      @close="selected = null"
    />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import StationCard from '@/components/StationCard.vue';
import StationDetailsModal from '@/components/StationDetailsModal.vue';
import { MERCHANTS, REFRESH_INTERVAL } from '@/config';

const NS = 'merchantStations';

export default {
  name: 'MerchantStations',
  components: { StationCard, StationDetailsModal },
  props: {
    merchantId: { type: String, required: true },
  },
  data: () => ({
    stateFilter: 'all',
    gpuFilter: '',
    gameQuery: '',
    selected: null,
    timer: null,
  }),
  metaInfo() {
    const name = this.merchant.name;
    return {
      title: this.$t('merchantStations.metaTitle', { name }),
      meta: [
        { vmid: 'description', name: 'description', content: this.$t('merchantStations.metaDescription', { name, count: this.counts.total }) },
      ],
    };
  },
  computed: {
    ...mapState(NS, ['stations', 'hardware', 'products', 'catalog', 'loading', 'error', 'updatedAt']),
    ...mapGetters(NS, ['counts', 'gpus']),
    merchant() {
      return { name: 'мерчанта', city: null, links: [], ...MERCHANTS[this.merchantId] };
    },
    updatedTime() {
      return new Date(this.updatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    },
    // productId игр, чьё название совпало с поиском; null — фильтр не активен.
    matchedProducts() {
      const q = this.gameQuery.trim().toLowerCase();
      if (q.length < 2 || !this.catalog) return null;
      return new Set(Object.keys(this.catalog).filter((id) => this.catalog[id].title.toLowerCase().includes(q)));
    },
    filtered() {
      return this.stations.filter((s) => {
        if (this.stateFilter !== 'all' && s.state !== this.stateFilter) return false;
        const hw = this.hardware[s.uuid];
        if (this.gpuFilter && (!hw || hw.gpu !== this.gpuFilter)) return false;
        if (this.matchedProducts && !s.productList.some((id) => this.matchedProducts.has(id))) return false;
        return true;
      });
    },
  },
  watch: {
    merchantId() { this.load(); },
  },
  // SSR: данные попадают в __INITIAL_STATE__, клиент не грузит их повторно.
  serverPrefetch() {
    return this.load();
  },
  mounted() {
    const s = this.$store.state[NS];
    if (s.merchantId !== this.merchantId || !s.updatedAt) this.load();
    this.timer = setInterval(this.onTick, REFRESH_INTERVAL);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    load() {
      return this.$store.dispatch(`${NS}/load`, this.merchantId);
    },
    async refresh() {
      await this.$store.dispatch(`${NS}/refresh`);
      this.$store.dispatch(`${NS}/loadHardware`);
      this.$store.dispatch(`${NS}/loadCurrentProducts`);
    },
    onTick() {
      if (document.visibilityState === 'visible' && !this.loading) this.refresh();
    },
    loadCatalog() {
      this.$store.dispatch(`${NS}/loadCatalog`);
    },
  },
};
</script>

<style scoped>
.merchant-stations {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 16px 48px;
}
.merchant-stations__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
}
.merchant-stations__title { margin: 0; font-size: 28px; font-weight: 700; color: #464c5b; }
.merchant-stations__summary { margin: 4px 0 0; }
.merchant-stations__links { margin: 4px 0 0; display: flex; gap: 12px; }
.merchant-stations__refresh { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.merchant-stations__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
}
.merchant-stations__gpu { width: 220px; }
.merchant-stations__game { flex: 1 1 260px; max-width: 420px; }
.merchant-stations__col { margin-bottom: 16px; }
.merchant-stations__spin { margin: 60px auto; }
.merchant-stations__empty { margin: 40px 0; text-align: center; }
</style>
