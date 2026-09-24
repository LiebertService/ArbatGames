<template>
  <div class="merchant-stations">
    <header class="merchant-stations__header">
      <div>
        <h1 class="merchant-stations__title">{{ $t('merchantStations.title', { name: merchant.name }) }}</h1>
        <p v-if="merchant.city" class="merchant-stations__summary">{{ merchant.city }}</p>
        <p v-if="merchant.links.length" class="merchant-stations__links">
          <a v-for="link in merchant.links" :key="link.url" :href="link.url" target="_blank" rel="noopener">{{ link.title }}</a>
        </p>
      </div>
      <div class="merchant-stations__refresh">
        <span v-if="updatedAt">{{ $t('merchantStations.updated', { time: updatedTime }) }}</span>
        <Button icon="md-refresh" :loading="loading" @click="refresh">{{ $t('merchantStations.refresh') }}</Button>
        <ThemeSwitcher />
      </div>
    </header>

    <div class="merchant-stations__filters">
      <!-- Статус — в адресе (?status=all|busy, без параметра — свободные): кнопки = обычные ссылки -->
      <div class="ivu-btn-group ivu-btn-group-default merchant-stations__status">
        <!-- router-link, а не <Button :to>: у кнопки View UI нет href, ссылку не скопировать -->
        <router-link
          v-for="status in statuses"
          :key="status"
          :to="statusRoute(status)"
          :class="['ivu-btn', stateFilter === status ? 'ivu-btn-primary' : 'ivu-btn-default']"
          replace
        >
          {{ $t(`merchantStations.filters.${status}`) }} ({{ counts[status === 'all' ? 'total' : status] }})
        </router-link>
      </div>
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
    <p v-else-if="!filtered.length && stateFilter === 'free' && !counts.free" class="merchant-stations__empty">
      {{ $t('merchantStations.allBusy') }}
      <router-link :to="statusRoute('all')">{{ $t('merchantStations.showAll') }}</router-link>
    </p>
    <p v-else-if="!filtered.length" class="merchant-stations__empty">{{ $t('merchantStations.empty') }}</p>

    <div v-if="filtered.length" class="merchant-stations__content">
      <Row :gutter="16" type="flex">
        <Col v-for="station in filtered" :key="station.uuid" :xs="24" :sm="12" :md="8" :lg="6" class="merchant-stations__col">
          <StationCard
            :station="station"
            :hardware="hardware[station.uuid]"
            :product="products[station.productId]"
          />
        </Col>
      </Row>
    </div>

  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import StationCard from '@/components/StationCard.vue';
import ThemeSwitcher from '@/components/ThemeSwitcher.vue';
import { MERCHANTS, REFRESH_INTERVAL } from '@/config';

const NS = 'merchantStations';
const STATUSES = ['free', 'all', 'busy'];
const DEFAULT_STATUS = 'free';

export default {
  name: 'MerchantStations',
  components: { StationCard, ThemeSwitcher },
  props: {
    merchantId: { type: String, required: true },
  },
  data: () => ({
    statuses: STATUSES,
    gpuFilter: '',
    gameQuery: '',
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
    stateFilter() {
      const { status } = this.$route.query;
      return STATUSES.includes(status) ? status : DEFAULT_STATUS;
    },
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
    statusRoute(status) {
      const query = { ...this.$route.query, status: status === DEFAULT_STATUS ? undefined : status };
      return { name: 'merchant-stations', params: { merchantId: this.merchantId }, query };
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
.merchant-stations__refresh { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font-size: 13px; }
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

/* ===== theme_foxexeDark: панели как у /stations на drova.io ===== */
.theme_foxexeDark .merchant-stations__title { color: #fff; }
.theme_foxexeDark .merchant-stations__summary,
.theme_foxexeDark .merchant-stations__refresh,
.theme_foxexeDark .merchant-stations__empty { color: #ccc; }
.theme_foxexeDark .merchant-stations__links a { color: #007bff; }
.theme_foxexeDark .merchant-stations__filters {
  padding: 5px;
  background: #333;
  border-radius: 5px;
}
.theme_foxexeDark .merchant-stations__content {
  padding: 8px 8px 0;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 5px;
}
</style>
